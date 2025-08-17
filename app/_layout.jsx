import { useEffect } from "react";
import { Stack } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { ThemeProvider, useTheme } from "../Theme/ThemeProvider";
import { NotificationProvider } from "../services/NotificationContext";
import OneSignal, { LogLevel } from "react-native-onesignal";

function AppLayout() {
  const { colors, theme } = useTheme();

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(colors.background);
      NavigationBar.setButtonStyleAsync(theme === "dark" ? "light" : "dark");
    }
  }, [theme]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        style={theme === "dark" ? "light" : "dark"}
        backgroundColor={colors.background}
      />
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize("4df5f254-b383-4ac7-80f4-8b3c1afacb06");

    // Prompt the user for push notification permissions
    OneSignal.Notifications.requestPermission(true);

    // Optional: listen for notifications
    const listener = OneSignal.Notifications.addEventListener("click", (event) => {
      console.log("Notification clicked:", event);
    });

    return () => {
      OneSignal.Notifications.removeEventListener("click", listener);
    };
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppLayout />
      </NotificationProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
