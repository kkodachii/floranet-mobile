// ThemeProvider.jsx
import React, { createContext, useContext, useState } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext();

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
  buttonBackground: "#3a3a3c",
};

export const ThemeProvider = ({ children }) => {
  const systemTheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(systemTheme || "light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const colors = theme === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
