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

const PayLink = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const [gcashNumber, setGcashNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleLinkGCash = async () => {
    if (!gcashNumber || !name || !email) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }

    try {
      const response = await fetch("https://your-api.com/link-gcash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gcashNumber, name, email }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "GCash account linked successfully!");
        setGcashNumber("");
        setName("");
        setEmail("");
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
        <Header title="Link GCash" />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Link GCash Account</Text>
            <Text style={[styles.pageSubtitle, { color: colors.text, opacity: 0.7 }]}>
              Connect your GCash account for easy payments
            </Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.formHeader}>
              <Ionicons name="wallet" size={24} color="#50C878" />
              <Text style={[styles.formTitle, { color: colors.text }]}>GCash Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>GCash Number</Text>
              <View style={[styles.inputContainer, { borderColor: colors.text, opacity: 0.2 }]}>
                <Ionicons name="phone-portrait" size={20} color="#50C878" style={styles.inputIcon} />
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
              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <View style={[styles.inputContainer, { borderColor: colors.text, opacity: 0.2 }]}>
                <Ionicons name="person" size={20} color="#4A90E2" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your full name"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
              <View style={[styles.inputContainer, { borderColor: colors.text, opacity: 0.2 }]}>
                <Ionicons name="mail" size={20} color="#FF6B35" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter email address"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.linkButton} onPress={handleLinkGCash}>
              <Ionicons name="link" size={20} color="#fff" />
              <Text style={styles.linkButtonText}>Link GCash Account</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#4A90E2" />
              <Text style={[styles.infoTitle, { color: colors.text }]}>GCash Linking</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.text, opacity: 0.7 }]}>
              Linking your GCash account allows you to make payments directly from your GCash wallet. Your information is secure and will only be used for payment processing.
            </Text>
          </View>

          <View style={[styles.benefitsCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.benefitsHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#50C878" />
              <Text style={[styles.benefitsTitle, { color: colors.text }]}>Benefits</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="flash" size={16} color="#50C878" />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Instant payment processing
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark" size={16} color="#50C878" />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Secure and encrypted transactions
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="receipt" size={16} color="#50C878" />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Automatic receipt generation
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

export default PayLink;

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
  linkButton: {
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
  linkButtonText: {
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
  benefitsCard: {
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
  benefitsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 12,
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
});
