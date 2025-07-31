import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../Theme/ThemeProvider";

const HeaderBack = ({ title = "Page Title", onBack }) => {
  const { theme, colors } = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const backgroundColor = theme === "light" ? "#ffffff" : "#14181F";
  const textColor = theme === "light" ? "#2f3b4c" : "#ffffff";
  const borderColor = theme === "light" ? "#ccc" : "#333";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, borderBottomColor: borderColor },
      ]}
    >
      <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={28} color={textColor} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <View style={{ width: 28 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  iconButton: {
    padding: 4,
  },
});

export default HeaderBack;