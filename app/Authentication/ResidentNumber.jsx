import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../Theme/ThemeProvider";
import { useRouter } from "expo-router";

const ResidentNumberScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();

  const residentNum = "FLO-20250808-001";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.welcomeText, { color: colors.text }]}>
        Welcome to the Floranet Community!
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.text }]}>
          Your Resident Number
        </Text>
        <Text style={[styles.residentNum, { color: colors.text }]}>
          {residentNum}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => router.replace("/Index")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Continue to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResidentNumberScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    width: "90%",
    borderRadius: 12,
    padding: 24,
    marginBottom: 40,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  residentNum: {
    fontSize: 26,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "green",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
