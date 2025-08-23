import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance } from "react-native";
import * as SecureStore from "expo-secure-store";

const ThemeContext = createContext();
const THEME_KEY = "floranet_theme";

const lightColors = {
  background: "#f6f7f9",
  headbg: "white",
  navbg: "white",
  card: "#f2f2f2",
  text: "#1F2633",
  buttonBackground: "#edf0f2",
};

const darkColors = {
  background: "#27313F",
  headbg: "#14181F",
  navbg: "#14181F",
  card: "#1F2633",
  text: "#f6f7f9",
  buttonBackground: " #1F2633",
};

export const ThemeProvider = ({ children }) => {
  const systemTheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(systemTheme || "light");

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(THEME_KEY);
        if (saved === "light" || saved === "dark") {
          setTheme(saved);
        }
      } catch (_) {}
    })();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      SecureStore.setItemAsync(THEME_KEY, next).catch(() => {});
      return next;
    });
  };

  const colors = theme === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
