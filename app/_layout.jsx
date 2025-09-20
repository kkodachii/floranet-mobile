// app/_layout.jsx
import { Stack, useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  Vibration,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { ThemeProvider, useTheme } from "../Theme/ThemeProvider";
import { NotificationProvider } from "../services/NotificationContext";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

import { OneSignal, LogLevel } from "react-native-onesignal";
import pusherService from "../services/optimizedPusherService";

//
// ---------------------------
// EXPO NOTIFICATIONS SETUP
// ---------------------------
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function useExpoNotifications() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      Vibration.vibrate(1000);
      Alert.alert("New Expo Alert", notification.request.content.body || "Message!");
    }
  );

  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      Vibration.vibrate(1000);
      Alert.alert(
        "Opened Expo Notification",
        response.notification.request.content.body || "You tapped a message!"
      );
    }
  );

  return () => {
    // ✅ New cleanup method
    notificationListener.remove();
    responseListener.remove();
  };
}, []);

}

//
// ---------------------------
// ONESIGNAL SETUP
// ---------------------------
function useOneSignalNotifications() {
  const router = useRouter();

 useEffect(() => {
  OneSignal.Debug.setLogLevel(LogLevel.Verbose); // remove in prod
  OneSignal.initialize("4df5f254-b383-4ac7-80f4-8b3c1afacb06");

  OneSignal.Notifications.requestPermission(true);
  OneSignal.User.pushSubscription.optIn();

  const openedListener = OneSignal.Notifications.addEventListener("click", (event) => {
    Vibration.vibrate(1000);
    const url = event.notification.additionalData?.url;
    if (url) {
      router.push(url);
    } else {
      Alert.alert("OneSignal Alert", event.notification.body || "You got a message!");
    }
  });

  // Listen for push subscription changes to get OneSignal IDs
  const subscriptionListener = OneSignal.User.pushSubscription.addEventListener("change", (event) => {
    // Get OneSignal user ID and external user ID
    OneSignal.User.getOnesignalId().then((oneSignalUserId) => {
      OneSignal.User.getExternalId().then((externalUserId) => {
        if (oneSignalUserId && externalUserId) {
          // Try to send OneSignal IDs to backend if user is logged in
          sendOneSignalIdsToBackend(externalUserId, oneSignalUserId);
        }
      });
    });
  });

  return () => {
    openedListener.remove();
    subscriptionListener.remove();
  };
}, []);

}

// Function to set OneSignal external user ID and get OneSignal user ID
export const setOneSignalUserId = async (userId) => {
  try {
    if (userId) {
      OneSignal.login(userId.toString());
      
      // Wait longer for OneSignal to initialize and generate user ID
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try to get OneSignal user ID with a few attempts
      let attempts = 0;
      const maxAttempts = 3;
      
      const tryGetOneSignalId = () => {
        attempts++;
        OneSignal.User.getOnesignalId().then((oneSignalUserId) => {
          if (oneSignalUserId) {
            sendOneSignalIdsToBackend(userId.toString(), oneSignalUserId);
          } else if (attempts < maxAttempts) {
            setTimeout(tryGetOneSignalId, 2000);
          }
        }).catch((error) => {
          // Error getting OneSignal user ID
        });
      };
      
      tryGetOneSignalId();
    } else {
      OneSignal.logout();
    }
  } catch (error) {
    // Error setting OneSignal user ID
  }
};

// Function to send OneSignal IDs to backend
const sendOneSignalIdsToBackend = async (externalId, oneSignalUserId) => {
  try {
    const { authService } = await import('../services/api');
    const result = await authService.updateOneSignalIds(externalId, oneSignalUserId);
  } catch (error) {
    if (error.response?.status === 401) {
      // User not authenticated, will retry when user logs in
    } else {
      // Error sending OneSignal IDs to backend
    }
  }
};

// Function to send current OneSignal IDs to backend (for when user is already authenticated)
export const sendCurrentOneSignalIdsToBackend = async () => {
  try {
    // Wait for OneSignal to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    OneSignal.User.getOnesignalId().then((oneSignalUserId) => {
      OneSignal.User.getExternalId().then((externalUserId) => {
        if (oneSignalUserId && externalUserId) {
          sendOneSignalIdsToBackend(externalUserId, oneSignalUserId);
        } else {
          // Try one more time after a delay
          setTimeout(() => {
            OneSignal.User.getOnesignalId().then((retryOneSignalUserId) => {
              OneSignal.User.getExternalId().then((retryExternalUserId) => {
                if (retryOneSignalUserId && retryExternalUserId) {
                  sendOneSignalIdsToBackend(retryExternalUserId, retryOneSignalUserId);
                }
              });
            });
          }, 3000);
        }
      }).catch((error) => {
        // Error getting external user ID
      });
    }).catch((error) => {
      // Error getting OneSignal user ID
    });
  } catch (error) {
    // Error getting current OneSignal IDs
  }
};

// Function to manually force getting and sending OneSignal IDs
export const forceGetOneSignalIds = async () => {
  try {
    // Wait for OneSignal to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    OneSignal.User.getOnesignalId().then((oneSignalUserId) => {
      OneSignal.User.getExternalId().then((externalUserId) => {
        if (oneSignalUserId && externalUserId) {
          sendOneSignalIdsToBackend(externalUserId, oneSignalUserId);
        }
      });
    });
  } catch (error) {
    // Error forcing OneSignal IDs
  }
};

//
// ---------------------------
// MAIN APP LAYOUT
// ---------------------------
function AppLayout() {
  const { colors, theme } = useTheme();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useExpoNotifications(); // Expo push
  useOneSignalNotifications(); // OneSignal push
  
  // Initialize Pusher for real-time messaging
  useEffect(() => {
    pusherService.initialize();
    
    return () => {
      pusherService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(colors.background);
      NavigationBar.setButtonStyleAsync(theme === "dark" ? "light" : "dark");
    }
  }, [theme, colors]);

  // Fake auth check loader
  useEffect(() => {
    (async () => {
      try {
        // placeholder
      } catch (_) {}
      setCheckingAuth(false);
    })();
  }, []);

  if (checkingAuth) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color="#28942c" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        style={theme === "dark" ? "light" : "dark"}
        backgroundColor={colors.background}
      />
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </View>
  );
}

export default function LayoutWrapper() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppLayout />
      </NotificationProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
