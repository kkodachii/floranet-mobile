import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Header = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>
        <Text style={{ color: isDarkMode ? "#ffffff" : "#2f3b4c" }}>Flora</Text>
        <Text style={{ color: "#28942c" }}>Net</Text>
      </Text>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => console.log("Notification pressed")}
      >
        <Ionicons
          name="notifications-outline"
          size={28}
          color={isDarkMode ? "#ffffff" : "#888"}
        />
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
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
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
