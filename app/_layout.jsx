// app/_layout.jsx
import { Stack, useRouter } from "expo-router";
import { View, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { ThemeProvider, useTheme } from "../Theme/ThemeProvider";
import { NotificationProvider } from "../services/NotificationContext";
import { authStorage, setAuthToken } from "../services/api";

function AppLayout() {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(colors.background);
      NavigationBar.setButtonStyleAsync(theme === "dark" ? "light" : "dark");
    }
  }, [theme]);

  useEffect(() => {
    (async () => {
      try {
        const { token } = await authStorage.load();
        if (token) {
          setAuthToken(token);
          router.replace("/MainHomepage");
        }
      } catch (_) {}
      setCheckingAuth(false);
    })();
  }, []);

  if (checkingAuth) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#28942c" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar
        style={theme === "dark" ? "light" : "dark"}
      />
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

// ✅ Wrap AppLayout in ThemeProvider
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
