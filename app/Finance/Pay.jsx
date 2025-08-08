import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
        <Header title="Make Payment" />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Payment Details</Text>
            <Text style={[styles.pageSubtitle, { color: colors.text, opacity: 0.7 }]}>
              Enter your payment information below
            </Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.formHeader}>
              <Ionicons name="card" size={24} color="#50C878" />
              <Text style={[styles.formTitle, { color: colors.text }]}>Payment Form</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Amount (₱)</Text>
              <View style={[styles.inputContainer, { borderColor: colors.text, opacity: 0.2 }]}>
                <Ionicons name="cash" size={20} color="#50C878" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter amount"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Homeowner Name</Text>
              <View style={[styles.inputContainer, { borderColor: colors.text, opacity: 0.2 }]}>
                <Ionicons name="person" size={20} color="#4A90E2" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter homeowner name"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Resident ID</Text>
              <View style={[styles.inputContainer, { borderColor: colors.text, opacity: 0.2 }]}>
                <Ionicons name="id-card" size={20} color="#FF6B35" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter resident ID"
                  placeholderTextColor="#888"
                  value={residentId}
                  onChangeText={setResidentId}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Payment</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#4A90E2" />
              <Text style={[styles.infoTitle, { color: colors.text }]}>Payment Information</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.text, opacity: 0.7 }]}>
              Please ensure all information is correct before submitting. Payment will be processed immediately and you will receive a confirmation receipt.
            </Text>
          </View>
        </ScrollView>

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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#50C878",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
});
