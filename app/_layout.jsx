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

// ✅ Handle how Expo Notifications behave
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Hook: listen for OneSignal notification clicks
function useNotificationObserver() {
  const router = useRouter();

  useEffect(() => {
    const openedListener = OneSignal.Notifications.addEventListener(
      "click",
      (event) => {
        console.log("📩 Notification clicked:", event);

        const url = event.notification.additionalData?.url;
        if (url) {
          router.push(url);
        }
      }
    );

    return () => {
      OneSignal.Notifications.removeEventListener("click");
    };
  }, [router]);
}

function AppLayout() {
  const { colors, theme } = useTheme();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const notificationListener = useRef();

  useNotificationObserver();

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(colors.background);
      NavigationBar.setButtonStyleAsync(theme === "dark" ? "light" : "dark");
    }
  }, [theme, colors]);

  // ✅ OneSignal setup
  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose); // remove in production
    OneSignal.initialize("4df5f254-b383-4ac7-80f4-8b3c1afacb06");
    OneSignal.Notifications.requestPermission(true);

    // ✅ Listen for foreground notifications (vibrate + alert)
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📲 Notification received:", notification);

        // Vibrate for 1 second
        Vibration.vibrate(10000);

        // Show in-app alert
        Alert.alert(
          "New Alert",
          notification.request.content.body || "You got a message!"
        );
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
    };
  }, []);

  // Fake auth check loader
  useEffect(() => {
    (async () => {
      try {
        // No persistent token; start at login every time
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
