import React from "react";
import { Button } from "react-native";
import { useTheme } from "../Theme/ThemeProvider"; // Adjust if path changes

const ThemeToggle = () => {
  const { toggleTheme, theme } = useTheme();

  return (
    <Button
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
      onPress={toggleTheme}
    />
  );
};

export default ThemeToggle;
