import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const HeaderBack = ({ title = "Page Title", onBack }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
        <Ionicons
          name="arrow-back"
          size={28}
          color={isDarkMode ? "#ffffff" : "#2f3b4c"}
        />
      </TouchableOpacity>
      <Text
        style={[styles.title, { color: isDarkMode ? "#ffffff" : "#2f3b4c" }]}
      >
        {title}
      </Text>
      <View style={{ width: 28 }} /> {/* Spacer to balance the arrow */}
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
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
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
