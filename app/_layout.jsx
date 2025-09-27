// app/_layout.jsx
import { Stack, useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { ThemeProvider, useTheme } from "../Theme/ThemeProvider";
import { NotificationProvider } from "../services/NotificationContext";
import { ScreenProvider, useScreenContext } from "../services/ScreenContext";
import { AuthProvider, useAuth } from "../services/AuthContext";

import { OneSignal, LogLevel } from "react-native-onesignal";
import pusherService from "../services/optimizedPusherService";

//
// ---------------------------
// NOTIFICATION NAVIGATION HANDLER
// ---------------------------
const handleNotificationNavigation = (notification, router) => {
  try {
    console.log("Handling notification navigation:", notification);

    // Handle different notification formats (Expo vs OneSignal)
    let data = null;

    if (notification.request?.content?.data) {
      // Expo notification format
      data = notification.request.content.data;
    } else if (notification.additionalData) {
      // OneSignal notification format
      data = notification.additionalData;
    } else if (notification.data) {
      // Alternative data format
      data = notification.data;
    }

    console.log("Extracted data:", data);

    // Check if it's a chat notification
    if (
      data?.type === "message" ||
      data?.type === "chat" ||
      data?.conversation_id
    ) {
      // Navigate to ChatScreen with the conversation ID
      const conversationId = data.conversation_id || data.conversationId;
      if (conversationId) {
        console.log("Navigating to conversation:", conversationId);
        router.push({
          pathname: "/Chat/ChatScreen",
          params: { conversationId: conversationId.toString() },
        });
        return;
      }
    }

    // Check for direct URL navigation
    const url = data?.url || data?.route;
    if (url) {
      console.log("Navigating to URL:", url);
      router.push(url);
      return;
    }

    // Default fallback - navigate to ChatHomepage
    console.log("Navigating to ChatHomepage (fallback)");
    router.push("/Chat/ChatHomepage");
  } catch (error) {
    console.error("Error handling notification navigation:", error);
    // Fallback to ChatHomepage on error
    router.push("/Chat/ChatHomepage");
  }
};

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

    const openedListener = OneSignal.Notifications.addEventListener(
      "click",
      (event) => {
        // No vibration or alert - navigate to chat
        console.log("OneSignal notification tapped:", event);
        handleNotificationNavigation(event.notification, router);
      }
    );

    // Listen for push subscription changes to get OneSignal IDs
    const subscriptionListener =
      OneSignal.User.pushSubscription.addEventListener("change", (event) => {
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
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Try to get OneSignal user ID with a few attempts
      let attempts = 0;
      const maxAttempts = 3;

      const tryGetOneSignalId = () => {
        attempts++;
        OneSignal.User.getOnesignalId()
          .then((oneSignalUserId) => {
            if (oneSignalUserId) {
              sendOneSignalIdsToBackend(userId.toString(), oneSignalUserId);
            } else if (attempts < maxAttempts) {
              setTimeout(tryGetOneSignalId, 2000);
            }
          })
          .catch((error) => {
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
    const { authService } = await import("../services/api");
    const result = await authService.updateOneSignalIds(
      externalId,
      oneSignalUserId
    );
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
    await new Promise((resolve) => setTimeout(resolve, 1000));

    OneSignal.User.getOnesignalId()
      .then((oneSignalUserId) => {
        OneSignal.User.getExternalId()
          .then((externalUserId) => {
            if (oneSignalUserId && externalUserId) {
              sendOneSignalIdsToBackend(externalUserId, oneSignalUserId);
            } else {
              // Try one more time after a delay
              setTimeout(() => {
                OneSignal.User.getOnesignalId().then((retryOneSignalUserId) => {
                  OneSignal.User.getExternalId().then((retryExternalUserId) => {
                    if (retryOneSignalUserId && retryExternalUserId) {
                      sendOneSignalIdsToBackend(
                        retryExternalUserId,
                        retryOneSignalUserId
                      );
                    }
                  });
                });
              }, 3000);
            }
          })
          .catch((error) => {
            // Error getting external user ID
          });
      })
      .catch((error) => {
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
    await new Promise((resolve) => setTimeout(resolve, 1000));

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
  const { isAuthenticated, isLoading } = useAuth();
  const screenContext = useScreenContext();
  const router = useRouter();

  useOneSignalNotifications(); // OneSignal push

  // Initialize Pusher for real-time messaging
  useEffect(() => {
    pusherService.initialize(screenContext);

    return () => {
      pusherService.disconnect();
    };
  }, []);

  // Update pusher service when screen context changes
  useEffect(() => {
    pusherService.updateScreenContext(screenContext);
  }, [screenContext]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(colors.background);
      NavigationBar.setButtonStyleAsync(theme === "dark" ? "light" : "dark");
    }
  }, [theme, colors]);

  // Handle navigation based on authentication status
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/MainHomepage');
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
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
      <ScreenProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppLayout />
          </NotificationProvider>
        </AuthProvider>
      </ScreenProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
