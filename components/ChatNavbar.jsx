import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useTheme } from "../Theme/ThemeProvider"; // ✅ custom hook for theme

const ChatNavbar = () => {
  const { theme, colors } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.navbg || (isDarkMode ? "#1a1a1a" : "#ffffff"),
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    height: 30,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
});

export default ChatNavbar;
