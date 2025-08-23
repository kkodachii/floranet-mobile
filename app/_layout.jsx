// app/_layout.jsx
import { Stack } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { ThemeProvider, useTheme } from "../Theme/ThemeProvider";
import { NotificationProvider } from "../services/NotificationContext";

// ✅ OneSignal import
import { OneSignal, LogLevel } from "react-native-onesignal";

function AppLayout() {
  const { colors, theme } = useTheme();

  useEffect(() => {
    // ✅ Setup Android navigation bar
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(colors.background);
      NavigationBar.setButtonStyleAsync(theme === "dark" ? "light" : "dark");
    }
  }, [theme, colors]);

  useEffect(() => {
    // ✅ OneSignal initialization
    OneSignal.Debug.setLogLevel(LogLevel.Verbose); // remove in production
    OneSignal.initialize("4df5f254-b383-4ac7-80f4-8b3c1afacb06");

    // ✅ Request notification permissions (iOS only, Android auto-grants)
    OneSignal.Notifications.requestPermission(true);

    // ✅ Foreground notification handler (optional)
    OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {
      console.log("🔔 Notification received in foreground:", event);
      event.getNotification().display(); // auto-display notification
    });

    return () => {
      // Cleanup listeners if needed
      OneSignal.Notifications.removeEventListener("foregroundWillDisplay");
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      />
    </View>
  );
}

// ✅ Wrap AppLayout in Theme + Notification providers
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
