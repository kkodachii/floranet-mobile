import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'generated' | 'waiting' | 'paid' | 'not_paid' | 'error' | 'loading'
  const [modalMessage, setModalMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [qrFullScreenVisible, setQrFullScreenVisible] = useState(false);

  const modalConfigMap = {
    generated: { title: 'QR Generated', icon: 'checkmark-circle', color: '#22C55E' },
    waiting: { title: 'Waiting for Payment', icon: 'hourglass', color: '#F59E0B' },
    paid: { title: 'Payment Successful', icon: 'checkmark-done', color: '#22C55E' },
    not_paid: { title: 'Payment Not Completed', icon: 'close-circle', color: '#EF4444' },
    error: { title: 'Error', icon: 'alert-circle', color: '#EF4444' },
    loading: { title: 'Checking payment status...', icon: null, color: '#4A90E2' },
  };

  const showModal = (type, message = "") => {
    setModalType(type);
    setModalMessage(message);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (!expiresAt) return;
    const intervalId = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0) {
        setIsExpired(true);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [expiresAt]);

  const generateQRCode = async () => {
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      showModal('error', 'Invalid amount configured.');
      return;
    }

    setIsLoading(true);
    try {
      const pi = await createPaymentIntent(parsedAmount, `Payment for Floranet - ${parsedAmount} PHP`);
      if (!pi.success) {
        showModal('error', pi.error || 'Failed to create payment intent');
        setIsLoading(false);
        return;
      }
      setPaymentIntentId(pi.id);
      setPaymentIntentClientKey(pi.clientKey || null);

      const pm = await createQrphPaymentMethod({
        name: 'Customer',
        email: 'customer@example.com',
        address: { line1: '', line2: '', city: '', state: '', postal_code: '', country: '' },
        phone: ''
      });
      if (!pm.success) {
        showModal('error', pm.error || 'Failed to create QR payment method');
        setIsLoading(false);
        return;
      }

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
        setPaymentStatus('pending');
        setIsExpired(false);
        setExpiresAt(Date.now() + 30 * 60 * 1000); // 30 minutes
      } else {
        showModal('error', attach.error || 'Failed to attach payment method');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      showModal('error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetQRCode = () => {
    setQrCodeData(null);
    setQrGenerated(false);
    setPaymentStatus(null);
    setAmount("300");
    setExpiresAt(null);
    setRemainingSeconds(0);
    setIsExpired(false);
  };

  const checkPaymentStatus = async () => {
    if (!paymentIntentId) return;

    setStatusChecking(true);
    // Show spinner-only modal while checking
    setModalType('loading');
    setModalMessage('');
    setModalVisible(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const result = await getPaymentIntent(paymentIntentId);
      if (result.success) {
        const status = result.status;
        if (status === 'succeeded' || status === 'paid') {
          setPaymentStatus('paid');
          setModalType('paid');
          setModalMessage('Your payment has been received.');
        } else {
          setPaymentStatus(prev => prev || 'pending');
          setModalType('waiting');
          setModalMessage('Payment is pending. Please complete the payment in your wallet app.');
        }
      } else {
        console.error('Status check error:', result.error);
        setModalType('error');
        setModalMessage(result.error || 'Unable to check payment status');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setModalType('error');
      setModalMessage('Network error while checking payment status.');
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
            <Text style={[styles.pageTitle, { color: colors.text }]}>QR Payment</Text>
          </View>

          {/* Amount Card */}
          <View style={[styles.amountCard, { backgroundColor: theme === "light" ? "#ffffff" : "#14181F" }]}> 
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderInfo}>
                <Text style={[styles.amountLabel, { color: colors.text, opacity: 0.7 }]}>Amount to Pay</Text>
                <Text style={[styles.amountLarge, { color: colors.text }]}>₱{parseFloat(amount).toFixed(2)}</Text>
              </View>
              <View style={styles.cardHeaderIconWrap}>
                <Ionicons name="cash-outline" size={24} color="#50C878" />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: "#22C55E" }
              ]}
              onPress={generateQRCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="qr-code-outline" size={18} color="#fff" />
                  <Text style={styles.primaryButtonText}>Generate QR Code</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* QR Code Card */}
          {qrGenerated && (
            <View style={[styles.qrCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}> 
              <View style={styles.cardHeaderRow}>
                <View style={styles.headerLeft}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name="qr-code-outline" size={20} color="#4A90E2" />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Scan QR Code</Text>
                </View>
              </View>

              <View style={[styles.qrFrame, { borderColor: theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)', backgroundColor: theme === 'light' ? '#FFFFFF' : '#0F1420' }]}> 

                {/* Pressable QR */}
                <TouchableOpacity activeOpacity={0.9} onPress={() => setQrFullScreenVisible(true)} style={styles.qrTapArea}>
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
                        size={220}
                        color="#000000"
                        backgroundColor="#FFFFFF"
                      />
                    </View>
                  ) : null}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: "#4A90E2", opacity: isExpired ? 0.7 : 1 }
                ]}
                onPress={checkPaymentStatus}
                disabled={statusChecking}
              >
                <Ionicons name="refresh-circle" size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>Check Payment Status</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}> 
            <View style={styles.infoHeaderRow}>
              <Ionicons name="information-circle" size={24} color="#50C878" />
              <Text style={[styles.infoTitle, { color: colors.text }]}>How it works</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.text, opacity: 0.7 }]}>
              Tap Generate QR Code, then scan it with your e-wallet app. After paying, tap Check Payment Status to confirm.
            </Text>
          </View>

          {/* Steps Card */}
          <View style={[styles.stepsCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}> 
            <View style={styles.stepsHeaderRow}>
              <Ionicons name="list" size={24} color="#4A90E2" />
              <Text style={[styles.stepsTitle, { color: colors.text }]}>Steps to Pay</Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>
                Tap "Generate QR Code" button above
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>
                Open your e-wallet app (GCash, PayMaya, etc.)
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>
                Tap "Pay QR" or "Scan QR" in your wallet
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>
                Scan the generated QR code
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>5</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>
                Confirm payment amount and complete transaction
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>6</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>
                Tap "Check Payment Status" to verify payment
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Status Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}> 
              {modalType === 'loading' ? (
                <>
                  <ActivityIndicator size="large" color="#4A90E2" />
                  <Text style={[styles.modalTitle, { color: colors.text, marginTop: 12 }]}>Checking payment status...</Text>
                </>
              ) : (
                <>
                  {!!modalType && (
                    <View style={[styles.modalIconWrapper, { backgroundColor: (modalConfigMap[modalType]?.color || '#4A90E2') + '20' }]}> 
                      <Ionicons name={modalConfigMap[modalType]?.icon || 'information-circle'} size={36} color={modalConfigMap[modalType]?.color || '#4A90E2'} />
                    </View>
                  )}
                  <Text style={[styles.modalTitle, { color: colors.text }]}> 
                    {modalType ? modalConfigMap[modalType]?.title : 'Status'}
                  </Text>
                  {!!modalMessage && (
                    <Text style={[styles.modalMessage, { color: colors.text, opacity: 0.8 }]}> 
                      {modalMessage}
                    </Text>
                  )}
                  <TouchableOpacity style={[styles.modalButton, { backgroundColor: modalConfigMap[modalType]?.color || '#4A90E2' }]} onPress={closeModal}>
                    <Text style={styles.modalButtonText}>OK</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Fullscreen QR Modal */}
        <Modal
          visible={qrFullScreenVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setQrFullScreenVisible(false)}
        >
          <TouchableOpacity style={styles.fullscreenOverlay} activeOpacity={1} onPress={() => setQrFullScreenVisible(false)}>
            <View style={styles.fullscreenCenter}>
              {qrCodeData?.attributes?.qr_image ? (
                <Image
                  source={{ uri: qrCodeData.attributes.qr_image }}
                  style={styles.fullscreenQrImage}
                  resizeMode="contain"
                />
              ) : qrCodeData?.attributes?.qr?.image?.uri || qrCodeData?.attributes?.qr?.image?.data_uri ? (
                <Image 
                  source={{ 
                    uri: qrCodeData.attributes.qr.image.uri || qrCodeData.attributes.qr.image.data_uri 
                  }}
                  style={styles.fullscreenQrImage}
                  resizeMode="contain"
                />
              ) : qrCodeData?.attributes?.qr?.data_uri ? (
                <Image 
                  source={{ uri: qrCodeData.attributes.qr.data_uri }}
                  style={styles.fullscreenQrImage}
                  resizeMode="contain"
                />
              ) : qrCodeData?.attributes?.qr?.data ? (
                <QRCode
                  value={qrCodeData.attributes.qr.data}
                  size={340}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                />
              ) : null}
            </View>
          </TouchableOpacity>
        </Modal>

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
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  headerSection: { marginTop: 20, marginBottom: 16 },
  pageTitle: { fontSize: 32, fontWeight: "bold", marginBottom: 8 },

  // Cards
  amountCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  qrCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Card headers
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardHeaderInfo: { flex: 1 },
  cardHeaderIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74,144,226,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  // Amount typography
  amountLabel: { fontSize: 14 },
  amountLarge: { fontSize: 28, fontWeight: '700', marginTop: 2 },

  // Buttons
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },

  // QR
  // removed waiting/expire pills from UI
  qrFrame: { alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16, alignSelf: 'stretch' },
  qrTapArea: { padding: 8, marginTop: 4 },
  qrCodeGenerated: { alignItems: 'center', paddingVertical: 12 },
  qrCodeImage: { width: 220, height: 220, marginBottom: 0 },
  sectionIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(74,144,226,0.1)', alignItems: 'center', justifyContent: 'center' },

  // Info
  infoCard: { padding: 20, borderRadius: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 20 },
  infoHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  infoText: { fontSize: 14, lineHeight: 20 },

  // Steps
  stepsCard: { padding: 20, borderRadius: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  stepsHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepsTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#4A90E2', justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  stepNumberText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  stepText: { fontSize: 14, lineHeight: 20, flex: 1 },

  // Nav/footer
  navWrapper: { backgroundColor: "#fff" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContainer: { width: '100%', borderRadius: 16, padding: 20, alignItems: 'center' },
  modalIconWrapper: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  modalMessage: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  modalButton: { marginTop: 8, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Fullscreen Overlay
  fullscreenOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullscreenCenter: { width: '100%', paddingHorizontal: 24, alignItems: 'center' },
  fullscreenQrImage: { width: 360, height: 360 },
}); 