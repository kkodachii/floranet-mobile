import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { StatusBar } from "react-native";

const Pay = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [residentId, setResidentId] = useState("");

  const handleSubmit = async () => {
    if (!amount || !name || !residentId) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }

    try {
      const response = await fetch("https://your-api.com/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, name, residentId }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Payment submitted successfully!");
        // Optionally reset fields
        setAmount("");
        setName("");
        setResidentId("");
      } else {
        Alert.alert("Error", data.message || "Something went wrong.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to server.");
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        backgroundColor={statusBarBackground}
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />

      <View style={styles.container}>
        <Header title="Pay" />

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter amount"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Homeowner Name
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter homeowner name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Resident ID
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter resident ID"
              placeholderTextColor="#888"
              value={residentId}
              onChangeText={setResidentId}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.navWrapper,
            {
              paddingBottom: insets.bottom || 16,
              backgroundColor: navBarBackground,
            },
          ]}
        >
          <Navbar />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Pay;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#28942c",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#28942c",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
});
