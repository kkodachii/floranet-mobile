// app/_layout.jsx
import { Stack } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { ThemeProvider, useTheme } from "../Theme/ThemeProvider";

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
      <Stack
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
      <AppLayout />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
