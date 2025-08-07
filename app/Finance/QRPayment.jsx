import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const QRPayment = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const [amount, setAmount] = useState("300");
  const [showQR, setShowQR] = useState(false);

  const handleGenerateQR = () => {
    setShowQR(true);
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
        <Header title="QR Payment" />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>GCash QR Payment</Text>
            <Text style={[styles.pageSubtitle, { color: colors.text, opacity: 0.7 }]}>
              Scan QR code with GCash to complete payment
            </Text>
          </View>

          {/* Payment Amount Input */}
          <View style={[styles.amountCard, { backgroundColor: colors.card }]}>
            <View style={styles.amountHeader}>
              <Ionicons name="cash" size={24} color="#50C878" />
              <Text style={[styles.amountTitle, { color: colors.text }]}>Payment Amount</Text>
            </View>
            
            <View style={styles.amountInputContainer}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>₱</Text>
              <Text style={[styles.amountInput, { color: colors.text }]}>
                {amount}
              </Text>
            </View>
          </View>

          {/* QR Code Section */}
          {!showQR ? (
            <View style={[styles.qrCard, { backgroundColor: colors.card }]}>
              <View style={styles.qrHeader}>
                <Ionicons name="qr-code" size={24} color="#4A90E2" />
                <Text style={[styles.qrTitle, { color: colors.text }]}>Generate QR Code</Text>
              </View>
              
              <Text style={[styles.qrDescription, { color: colors.text, opacity: 0.7 }]}>
                Click the button below to generate a QR code for GCash payment
              </Text>
              
              <TouchableOpacity 
                style={styles.generateButton}
                onPress={handleGenerateQR}
              >
                <Ionicons name="qr-code" size={20} color="#fff" />
                <Text style={styles.generateButtonText}>Generate QR Code</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.qrCard, { backgroundColor: colors.card }]}>
              <View style={styles.qrHeader}>
                <Ionicons name="qr-code" size={24} color="#4A90E2" />
                <Text style={[styles.qrTitle, { color: colors.text }]}>Scan QR Code</Text>
              </View>
              
              <View style={styles.qrCodeContainer}>
                <View style={styles.qrCodePlaceholder}>
                  <Ionicons name="qr-code" size={120} color="#4A90E2" />
                  <Text style={[styles.qrCodeText, { color: colors.text, opacity: 0.7 }]}>
                    QR Code Generated
                  </Text>
                  <Text style={[styles.qrCodeSubtext, { color: colors.text, opacity: 0.5 }]}>
                    Open GCash and scan this QR code
                  </Text>
                </View>
              </View>
              

            </View>
          )}

          {/* Instructions */}
          <View style={[styles.instructionsCard, { backgroundColor: colors.card }]}>
            <View style={styles.instructionsHeader}>
              <Ionicons name="information-circle" size={24} color="#50C878" />
              <Text style={[styles.instructionsTitle, { color: colors.text }]}>How to Pay</Text>
            </View>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={[styles.instructionText, { color: colors.text }]}>
                Generate QR code by clicking the button above
              </Text>
            </View>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[styles.instructionText, { color: colors.text }]}>
                Open GCash app on your phone
              </Text>
            </View>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[styles.instructionText, { color: colors.text }]}>
                Tap "Pay QR" and scan the generated QR code
              </Text>
            </View>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={[styles.instructionText, { color: colors.text }]}>
                Confirm payment and wait for confirmation
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

export default QRPayment;

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
  amountCard: {
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
  amountHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  amountTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: "bold",
    marginRight: 4,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: "bold",
  },
  qrCard: {
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
  qrHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  qrDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  qrCodeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  qrCodePlaceholder: {
    alignItems: "center",
    padding: 20,
  },
  qrCodeText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  qrCodeSubtext: {
    fontSize: 14,
    textAlign: "center",
  },

  instructionsCard: {
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
  instructionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  instructionStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
}); 