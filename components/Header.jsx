import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeProvider";

const Header = () => {
  const { theme, colors } = useTheme();

  const isDarkMode = theme === "dark";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.headbg,
          borderBottomColor: isDarkMode ? "#333" : "#ccc",
        },
      ]}
    >
      <Text style={styles.brand}>
        <Text style={{ color: colors.text }}>Flora</Text>
        <Text style={{ color: "#28942c" }}>Net</Text>
      </Text>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => console.log("Notification pressed")}
      >
        <Ionicons name="notifications-outline" size={28} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  brand: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  iconButton: {
    padding: 4,
  },
});

export default Header;
