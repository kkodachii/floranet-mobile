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
      console.log("📲 Expo Foreground notification:", notification);
      Vibration.vibrate(1000);
      Alert.alert("New Expo Alert", notification.request.content.body || "Message!");
    }
  );

  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log("📲 Expo Notification tapped:", response);
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
    console.log("📩 OneSignal notification clicked:", event);
    Vibration.vibrate(1000);
    const url = event.notification.additionalData?.url;
    if (url) {
      router.push(url);
    } else {
      Alert.alert("OneSignal Alert", event.notification.body || "You got a message!");
    }
  });

  return () => {
    openedListener.remove();
  };
}, []);

}

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
