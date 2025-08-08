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

const PayDirectly = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const [amount, setAmount] = useState("");
  const [gcashNumber, setGcashNumber] = useState("");
  const [mpin, setMpin] = useState("");

  const handlePayViaGCash = async () => {
    if (!amount || !gcashNumber || !mpin) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }

    try {
      const response = await fetch("https://your-api.com/pay-gcash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, gcashNumber, mpin }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Payment processed successfully via GCash!");
        setAmount("");
        setGcashNumber("");
        setMpin("");
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
        <Header title="Pay via GCash" />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>GCash Payment</Text>
            <Text style={[styles.pageSubtitle, { color: colors.text, opacity: 0.7 }]}>
              Make payment directly from your GCash wallet
            </Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.formHeader}>
              <Ionicons name="phone-portrait" size={24} color="#FF6B35" />
              <Text style={[styles.formTitle, { color: colors.text }]}>Payment Details</Text>
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
              <Text style={[styles.label, { color: colors.text }]}>GCash Number</Text>
              <View style={[styles.inputContainer, { borderColor: colors.text, opacity: 0.2 }]}>
                <Ionicons name="phone-portrait" size={20} color="#FF6B35" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter GCash number"
                  placeholderTextColor="#888"
                  keyboardType="phone-pad"
                  value={gcashNumber}
                  onChangeText={setGcashNumber}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>MPIN</Text>
              <View style={[styles.inputContainer, { borderColor: colors.text, opacity: 0.2 }]}>
                <Ionicons name="lock-closed" size={20} color="#E74C3C" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter MPIN"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  secureTextEntry
                  value={mpin}
                  onChangeText={setMpin}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.payButton} onPress={handlePayViaGCash}>
              <Ionicons name="card" size={20} color="#fff" />
              <Text style={styles.payButtonText}>Pay via GCash</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#4A90E2" />
              <Text style={[styles.infoTitle, { color: colors.text }]}>GCash Payment</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.text, opacity: 0.7 }]}>
              Ensure you have sufficient balance in your GCash wallet. The payment will be processed immediately and you will receive a confirmation SMS.
            </Text>
          </View>

          <View style={[styles.securityCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.securityHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#50C878" />
              <Text style={[styles.securityTitle, { color: colors.text }]}>Security</Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="lock-closed" size={16} color="#50C878" />
              <Text style={[styles.securityText, { color: colors.text }]}>
                Your MPIN is encrypted and secure
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="checkmark-circle" size={16} color="#50C878" />
              <Text style={[styles.securityText, { color: colors.text }]}>
                Transaction is verified by GCash
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="receipt" size={16} color="#50C878" />
              <Text style={[styles.securityText, { color: colors.text }]}>
                Instant receipt and confirmation
              </Text>
            </View>
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

export default PayDirectly;

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
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B35",
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
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoCard: {
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
  securityCard: {
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
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  securityText: {
    fontSize: 14,
    marginLeft: 12,
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
});
