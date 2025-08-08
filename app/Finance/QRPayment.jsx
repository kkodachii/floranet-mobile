import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createPaymentIntent, getPaymentIntent, createQrphPaymentMethod, attachPaymentIntent } from "./paymongoUtils";
import QRCode from 'react-native-qrcode-svg';

const QRPayment = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const [amount, setAmount] = useState("300");
  const [qrCodeData, setQrCodeData] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [paymentIntentClientKey, setPaymentIntentClientKey] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [statusChecking, setStatusChecking] = useState(false);

  const generateQRCode = async () => {
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount < 20) {
      Alert.alert("Invalid Amount", "Please enter a valid amount (minimum ₱20.00)");
      return;
    }

    setIsLoading(true);
    try {
      // 1) Create Payment Intent
      const pi = await createPaymentIntent(parsedAmount, `Payment for Floranet - ${parsedAmount} PHP`);
      if (!pi.success) {
        Alert.alert("Error", pi.error || 'Failed to create payment intent');
        setIsLoading(false);
        return;
      }
      setPaymentIntentId(pi.id);
      setPaymentIntentClientKey(pi.clientKey || null);

      // 2) Create a QRPH payment method
      const pm = await createQrphPaymentMethod({
        name: 'Customer',
        email: 'customer@example.com',
        address: {
          line1: '', line2: '', city: '', state: '', postal_code: '', country: ''
        },
        phone: ''
      });
      if (!pm.success) {
        Alert.alert("Error", pm.error || 'Failed to create QR payment method');
        setIsLoading(false);
        return;
      }

      // 3) Attach payment method to the payment intent to get QR display
      const attach = await attachPaymentIntent(pi.id, pm.id, pi.clientKey);
      if (attach.success) {
        setQrCodeData({
          id: pi.id,
          attributes: {
            next_action: attach.data?.attributes?.next_action || null,
            qr_image: attach.qrImage || null,
            qr_data: attach.qrData || null,
          }
        });
        setQrGenerated(true);
        Alert.alert("Success", "QR Code generated successfully!");
        console.log("QR + PI Details:", {
          Payment_Intent_ID: pi.id,
          Client_Key: pi.clientKey,
          QR_Image: !!attach.qrImage,
          QR_Data: !!attach.qrData,
          Sent_Amount: parsedAmount,
        });
      } else {
        Alert.alert("Error", attach.error);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert("Error", "Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetQRCode = () => {
    setQrCodeData(null);
    setQrGenerated(false);
    setPaymentStatus(null);
    setAmount("300"); // Reset amount to a default value
  };

  const checkPaymentStatus = async () => {
    if (!paymentIntentId) return;

    setStatusChecking(true);
    try {
      const result = await getPaymentIntent(paymentIntentId);
      if (result.success) {
        setPaymentStatus(result.status);
        if (result.status === 'succeeded' || result.status === 'paid') {
          Alert.alert("Payment Successful!", "Your payment has been received.");
        }
      } else {
        console.error('Status check error:', result.error);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setStatusChecking(false);
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
        <Header title="QR Payment" />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>PayMongo QR Payment</Text>
            <Text style={[styles.pageSubtitle, { color: colors.text, opacity: 0.7 }]}>
              Generate QR code for instant payment via GCash, PayMaya, and other e-wallets
            </Text>
          </View>

          {/* Payment Amount Input */}
          <View style={[styles.amountCard, { backgroundColor: colors.card }]}>
            <View style={styles.amountHeader}>
              <Ionicons name="cash" size={24} color="#50C878" />
              <Text style={[styles.amountTitle, { color: colors.text }]}>Payment Amount</Text>
            </View>
            <Text style={{ color: colors.text, opacity: 0.7, marginBottom: 8 }}>
              Minimum amount: ₱20.00
            </Text>
            <View style={styles.amountInputContainer}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>₱</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={amount}
                onChangeText={text => {
                  // Allow only numbers and decimal point
                  const sanitized = text.replace(/[^0-9.]/g, '');
                  setAmount(sanitized);
                }}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor={colors.text + '50'}
                editable={true}
              />
            </View>
          </View>

          {/* Generate QR Code Button */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              { backgroundColor: "#22C55E" }
            ]}
            onPress={generateQRCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons 
                  name="qr-code" 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.generateButtonText}>
                  Generate QR Code
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* QR Code Section - only show if generated */}
          {qrGenerated && (
            <View style={[styles.qrCard, { backgroundColor: colors.card }]}>
              <View style={styles.qrHeader}>
                <Ionicons name="qr-code" size={24} color="#4A90E2" />
                <Text style={[styles.qrTitle, { color: colors.text }]}>Scan QR Code</Text>
              </View>
              <View style={styles.qrCodeContainer}>
                {qrCodeData?.attributes?.qr_image ? (
                  <Image
                    source={{ uri: qrCodeData.attributes.qr_image }}
                    style={styles.qrCodeImage}
                    resizeMode="contain"
                  />
                ) : qrCodeData?.attributes?.qr?.image?.uri || qrCodeData?.attributes?.qr?.image?.data_uri ? (
                  <Image 
                    source={{ 
                      uri: qrCodeData.attributes.qr.image.uri || qrCodeData.attributes.qr.image.data_uri 
                    }}
                    style={styles.qrCodeImage}
                    resizeMode="contain"
                  />
                ) : qrCodeData?.attributes?.qr?.data_uri ? (
                  <Image 
                    source={{ uri: qrCodeData.attributes.qr.data_uri }}
                    style={styles.qrCodeImage}
                    resizeMode="contain"
                  />
                ) : qrCodeData?.attributes?.qr?.data ? (
                  <View style={styles.qrCodeGenerated}>
                    <QRCode
                      value={qrCodeData.attributes.qr.data}
                      size={200}
                      color="#000000"
                      backgroundColor="#FFFFFF"
                    />
                    <Text style={[styles.qrCodeText, { color: colors.text, opacity: 0.7, marginTop: 12 }]}>Generated QR Code</Text>
                  </View>
                ) : (
                  <View style={styles.qrCodeFallback}>
                    <Ionicons name="qr-code" size={120} color="#4A90E2" />
                    <Text style={[styles.qrCodeText, { color: colors.text, opacity: 0.7 }]}>QR Code Generated</Text>
                    <Text style={[styles.qrCodeSubtext, { color: colors.text, opacity: 0.5 }]}>QR data available but image not displayed</Text>
                  </View>
                )}
                {qrCodeData?.id && (
                  <View style={styles.qrCodeInfo}>
                    <Text style={[styles.qrCodeId, { color: colors.text, opacity: 0.8 }]}>QR ID: {qrCodeData.id}</Text>
                    <Text style={[styles.qrCodeAmount, { color: colors.text, opacity: 0.8 }]}>Amount: ₱{parseFloat(amount).toFixed(2)}</Text>
                    {qrCodeData?.attributes?.qr?.id && (
                      <Text style={[styles.qrCodeId, { color: colors.text, opacity: 0.8 }]}>QR Code ID: {qrCodeData.attributes.qr.id}</Text>
                    )}
                    {qrCodeData?.attributes?.qr?.data && (
                      <Text style={[styles.qrCodeData, { color: colors.text, opacity: 0.6 }]}>QR Data: {qrCodeData.attributes.qr.data.substring(0, 50)}...</Text>
                    )}
                  </View>
                )}
              </View>
              {/* Check Status Button and Payment Status Display remain unchanged */}
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { backgroundColor: "#50C878" }
                ]}
                onPress={checkPaymentStatus}
                disabled={statusChecking}
              >
                {statusChecking ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="refresh-circle" size={20} color="#fff" />
                    <Text style={styles.generateButtonText}>Check Payment Status</Text>
                  </>
                )}
              </TouchableOpacity>
              {paymentStatus && (
                <View style={styles.statusContainer}>
                  <Text style={[
                    styles.statusText, 
                    { 
                      color: paymentStatus === 'paid' ? '#50C878' : 
                             paymentStatus === 'pending' ? '#FFA500' : '#FF6B6B'
                    }
                  ]}>
                    Status: {paymentStatus.toUpperCase()}
                  </Text>
                </View>
              )}
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
                Open your preferred e-wallet app (GCash, PayMaya, etc.)
              </Text>
            </View>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[styles.instructionText, { color: colors.text }]}>
                Tap "Pay QR" or "Scan QR" and scan the generated QR code
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

          {/* Supported Wallets */}
          <View style={[styles.walletsCard, { backgroundColor: colors.card }]}>
            <View style={styles.walletsHeader}>
              <Ionicons name="wallet" size={24} color="#50C878" />
              <Text style={[styles.walletsTitle, { color: colors.text }]}>Supported Wallets</Text>
            </View>
            
            <View style={styles.walletList}>
              <View style={styles.walletItem}>
                <Text style={[styles.walletName, { color: colors.text }]}>• GCash</Text>
              </View>
              <View style={styles.walletItem}>
                <Text style={[styles.walletName, { color: colors.text }]}>• PayMaya</Text>
              </View>
              <View style={styles.walletItem}>
                <Text style={[styles.walletName, { color: colors.text }]}>• GrabPay</Text>
              </View>
              <View style={styles.walletItem}>
                <Text style={[styles.walletName, { color: colors.text }]}>• Coins.ph</Text>
              </View>
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
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 10,
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
  qrCodeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  qrCodePlaceholder: {
    alignItems: "center",
    padding: 20,
  },
  qrCodeGenerated: {
    alignItems: "center",
    padding: 20,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  qrCodeFallback: {
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
  qrCodeInfo: {
    alignItems: "center",
    marginTop: 12,
  },
  qrCodeId: {
    fontSize: 12,
    marginBottom: 4,
  },
  qrCodeAmount: {
    fontSize: 12,
  },
  qrCodeData: {
    fontSize: 10,
    marginTop: 4,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
  },
  statusContainer: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(80, 200, 120, 0.1)",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  instructionsCard: {
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
  walletsCard: {
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
  walletsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  walletsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  walletList: {
    marginTop: 8,
  },
  walletItem: {
    marginBottom: 8,
  },
  walletName: {
    fontSize: 14,
    fontWeight: "500",
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
}); 