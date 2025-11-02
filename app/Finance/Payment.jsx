import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createCheckoutSession, getCheckoutSession } from "./paymongoUtils";
import { financeService } from "../../services/api";
import { WebView } from 'react-native-webview';

const Payment = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const [amount, setAmount] = useState("0.00");
  const [currentDue, setCurrentDue] = useState(null);
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [statusChecking, setStatusChecking] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'generated' | 'waiting' | 'paid' | 'not_paid' | 'error' | 'loading'
  const [modalMessage, setModalMessage] = useState("");
  const [loadingAmount, setLoadingAmount] = useState(true);
  const [webViewVisible, setWebViewVisible] = useState(false);

  const modalConfigMap = {
    generated: { title: 'Payment Gateway Ready', icon: 'checkmark-circle', color: '#22C55E' },
    waiting: { title: 'Processing Payment', icon: 'hourglass', color: '#F59E0B' },
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


  useEffect(() => {
    loadCurrentDue();
  }, []);

  const loadCurrentDue = async () => {
    try {
      setLoadingAmount(true);
      const response = await financeService.getCurrentMonthDue();
      
      if (response?.success && response?.data) {
        const due = response.data;
        setCurrentDue(due);
        setAmount(due.amount ? due.amount.toString() : "0.00");
      } else {
        // If no current due, try to get any pending payment from all months
        const monthsResponse = await financeService.getAllMonthsStatus();
        if (monthsResponse?.success && monthsResponse?.data?.months) {
          const months = monthsResponse.data.months;
          const firstPending = months.find(month => month.street && !month.is_paid);
          
          if (firstPending) {
            setCurrentDue({
              month: firstPending.month,
              year: firstPending.year,
              amount: firstPending.amount,
              is_paid: false,
              street: firstPending.street,
              collection_reason: firstPending.collection_reason || null,
              created_at: firstPending.collection_date || new Date().toISOString()
            });
            setAmount(firstPending.amount ? firstPending.amount.toString() : "0.00");
          } else {
            setAmount("0.00");
            setCurrentDue(null);
          }
        } else {
          setAmount("0.00");
          setCurrentDue(null);
        }
      }
    } catch (error) {
      console.error('Error loading current due:', error);
      setAmount("0.00");
      setCurrentDue(null);
    } finally {
      setLoadingAmount(false);
    }
  };

  const createPaymentGateway = async () => {
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      showModal('error', 'No payment amount available. Please check if there are any pending dues.');
      return;
    }
    
    if (!currentDue) {
      showModal('error', 'No payment due found. Please check your monthly dues.');
      return;
    }

    setIsLoading(true);
    try {
      const description = 'Monthly Collection';
      
      const metadata = {
        resident_id: currentDue.resident_id || 'unknown',
        street: currentDue.street || 'unknown',
        month: currentDue.month,
        year: currentDue.year,
        collection_reason: currentDue.collection_reason || 'Monthly due'
      };

      // Use different URLs based on environment
      const baseUrl = __DEV__ ? 'http://192.168.254.107:8000' : 'https://api.floranet.online';
      
      const session = await createCheckoutSession(
        parsedAmount, 
        description, 
        metadata,
        `${baseUrl}/payment/success`,
        `${baseUrl}/payment/cancel`
      );
      
      if (!session.success) {
        showModal('error', session.error || 'Failed to create payment gateway');
        setIsLoading(false);
        return;
      }

      setCheckoutSession(session);
      setPaymentStatus('pending');
      showModal('generated', 'Payment gateway is ready. You will be redirected to complete your payment.');
      
    } catch (error) {
      console.error('Error creating payment gateway:', error);
      showModal('error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openPaymentGateway = () => {
    if (!checkoutSession?.checkout_url) {
      showModal('error', 'No payment gateway available. Please create a new payment.');
      return;
    }
    setWebViewVisible(true);
  };

  const handleWebViewNavigationStateChange = (navState) => {
    // Check if user is redirected to success or cancel page
    if (navState.url.includes('/payment/success')) {
      setWebViewVisible(false);
      setPaymentStatus('paid');
      showModal('paid', 'Your payment has been received successfully.');
    } else if (navState.url.includes('/payment/cancel')) {
      setWebViewVisible(false);
      setPaymentStatus('not_paid');
      showModal('not_paid', 'Payment was cancelled. Please try again.');
    }
  };

  const resetPayment = () => {
    setCheckoutSession(null);
    setPaymentStatus(null);
    setWebViewVisible(false);
  };

  const checkPaymentStatus = async () => {
    if (!checkoutSession?.id) return;

    setStatusChecking(true);
    // Show spinner-only modal while checking
    setModalType('loading');
    setModalMessage('');
    setModalVisible(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = await getCheckoutSession(checkoutSession.id);

      if (result.success) {
        const status = result.status;
        if (status === 'succeeded' || status === 'paid') {
          setPaymentStatus('paid');
          setModalType('paid');
          setModalMessage('Your payment has been received.');
        } else if (status === 'pending') {
          setPaymentStatus('pending');
          setModalType('waiting');
          setModalMessage('Payment is pending. Please complete the payment.');
        } else {
          setPaymentStatus('not_paid');
          setModalType('not_paid');
          setModalMessage('Payment was not completed. Please try again.');
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
          <Header title="Payment" />

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerSection}>
              <Text style={[styles.pageTitle, { color: colors.text }]}>Payment</Text>
            </View>

          {/* Amount Card */}
          <View style={[styles.amountCard, { backgroundColor: theme === "light" ? "#ffffff" : "#14181F" }]}> 
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderInfo}>
                <Text style={[styles.amountLabel, { color: colors.text, opacity: 0.7 }]}>
                  {loadingAmount ? 'Loading...' : currentDue ? 'Amount to Pay' : 'No Payment Due'}
                </Text>
                {loadingAmount ? (
                  <ActivityIndicator size="small" color={colors.text} style={{ marginTop: 8 }} />
                ) : (
                  <Text style={[styles.amountLarge, { color: colors.text }]}>
                    ₱{parseFloat(amount).toFixed(2)}
                  </Text>
                )}
              </View>
              <View style={styles.cardHeaderActions}>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={loadCurrentDue}
                  disabled={loadingAmount}
                >
                  <Ionicons 
                    name={loadingAmount ? "refresh" : "refresh-outline"} 
                    size={20} 
                    color={loadingAmount ? "#9CA3AF" : "#4A90E2"} 
                  />
                </TouchableOpacity>
                <View style={styles.cardHeaderIconWrap}>
                  <Ionicons name="cash-outline" size={24} color="#50C878" />
                </View>
              </View>
            </View>

            {currentDue && (
              <View style={styles.dueInfo}>
                <Text style={[styles.dueInfoText, { color: colors.text, opacity: 0.7 }]}>
                  {currentDue.month && currentDue.year && 
                    `Due: ${new Date(currentDue.year, currentDue.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                  }
                </Text>
                <Text style={[styles.dueInfoText, { color: colors.text, opacity: 0.7 }]}>
                  {currentDue.collection_reason && `Reason: ${currentDue.collection_reason}`}
                </Text>
                <Text style={[styles.dueInfoText, { color: colors.text, opacity: 0.7 }]}>
                  {currentDue.street && `Street: ${currentDue.street}`}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { 
                  backgroundColor: currentDue && parseFloat(amount) > 0 ? "#22C55E" : "#9CA3AF",
                  opacity: (!currentDue || parseFloat(amount) <= 0) ? 0.6 : 1
                }
              ]}
              onPress={createPaymentGateway}
              disabled={isLoading || !currentDue || parseFloat(amount) <= 0}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={18} color="#fff" />
                  <Text style={styles.primaryButtonText}>
                    {!currentDue || parseFloat(amount) <= 0 ? 'No Payment Due' : 'Create Payment Gateway'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Gateway Payment Card */}
          {checkoutSession && (
            <View style={[styles.gatewayCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}> 
              <View style={styles.cardHeaderRow}>
                <View style={styles.headerLeft}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name="card-outline" size={20} color="#4A90E2" />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Gateway</Text>
                </View>
              </View>

              <View style={styles.gatewayInfo}>
                <Text style={[styles.gatewayInfoText, { color: colors.text, opacity: 0.8 }]}>
                  Payment gateway is ready. Tap the button below to open the payment page in your browser.
                </Text>
                
                <View style={styles.paymentMethods}>
                  <Text style={[styles.paymentMethodsTitle, { color: colors.text }]}>Accepted Payment Methods:</Text>
                  <View style={styles.paymentMethodsList}>
                    <View style={styles.paymentMethodItem}>
                      <Ionicons name="card" size={16} color="#4A90E2" />
                      <Text style={[styles.paymentMethodText, { color: colors.text }]}>Credit/Debit Card</Text>
                    </View>
                    <View style={styles.paymentMethodItem}>
                      <Ionicons name="phone-portrait" size={16} color="#00D4AA" />
                      <Text style={[styles.paymentMethodText, { color: colors.text }]}>GCash</Text>
                    </View>
                    <View style={styles.paymentMethodItem}>
                      <Ionicons name="car" size={16} color="#00BFA5" />
                      <Text style={[styles.paymentMethodText, { color: colors.text }]}>GrabPay</Text>
                    </View>
                    <View style={styles.paymentMethodItem}>
                      <Ionicons name="wallet" size={16} color="#00BCD4" />
                      <Text style={[styles.paymentMethodText, { color: colors.text }]}>PayMaya</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.gatewayActions}>
                <TouchableOpacity
                  style={[styles.gatewayButton, { backgroundColor: "#4A90E2" }]}
                  onPress={openPaymentGateway}
                >
                  <Ionicons name="open-outline" size={18} color="#fff" />
                  <Text style={styles.gatewayButtonText}>Open Payment Page</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.gatewayButton, { backgroundColor: "#F59E0B" }]}
                  onPress={checkPaymentStatus}
                  disabled={statusChecking}
                >
                  <Ionicons name="refresh-circle" size={18} color="#fff" />
                  <Text style={styles.gatewayButtonText}>Check Status</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}> 
            <View style={styles.infoHeaderRow}>
              <Ionicons name="information-circle" size={24} color="#50C878" />
              <Text style={[styles.infoTitle, { color: colors.text }]}>How it works</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.text, opacity: 0.7 }]}>
              Tap Create Payment Gateway, then complete your payment using your preferred method. After paying, tap Check Status to confirm.
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
                Tap "Create Payment Gateway" button above
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>
                Tap "Open Payment Page" to access the gateway
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>
                Choose your preferred payment method
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>
                Enter your payment details securely
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>5</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>
                Confirm and complete your payment
              </Text>
            </View>
            
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>6</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>
                Tap "Check Status" to verify payment
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

        {/* WebView Modal */}
        <Modal
          visible={webViewVisible}
          animationType="slide"
          onRequestClose={() => setWebViewVisible(false)}
        >
          <SafeAreaView style={styles.webViewContainer}>
            <View style={styles.webViewHeader}>
              <TouchableOpacity
                style={styles.webViewCloseButton}
                onPress={() => setWebViewVisible(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.webViewTitle}>Payment Gateway</Text>
            </View>
            {checkoutSession?.checkout_url && (
              <WebView
                source={{ uri: checkoutSession.checkout_url }}
                style={styles.webView}
                onNavigationStateChange={handleWebViewNavigationStateChange}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.webViewLoading}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                    <Text style={styles.webViewLoadingText}>Loading payment page...</Text>
                  </View>
                )}
              />
            )}
          </SafeAreaView>
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

export default Payment;

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
  gatewayCard: {
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
  cardHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardHeaderIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74,144,226,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74,144,226,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  // Amount typography
  amountLabel: { fontSize: 14 },
  amountLarge: { fontSize: 28, fontWeight: '700', marginTop: 2 },
  
  // Due info
  dueInfo: { marginTop: 12, marginBottom: 16 },
  dueInfoText: { fontSize: 12, marginBottom: 4 },

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

  // Gateway info
  gatewayInfo: { marginBottom: 20 },
  gatewayInfoText: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  paymentMethods: { marginTop: 12 },
  paymentMethodsTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  paymentMethodsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  paymentMethodItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paymentMethodText: { fontSize: 12 },

  // Gateway actions
  gatewayActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  gatewayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    minWidth: 100,
  },
  gatewayButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
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

  // WebView
  webViewContainer: { flex: 1, backgroundColor: '#fff' },
  webViewHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#4A90E2', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    paddingTop: 50
  },
  webViewCloseButton: { marginRight: 12 },
  webViewTitle: { color: '#fff', fontSize: 18, fontWeight: '600', flex: 1 },
  webView: { flex: 1 },
  webViewLoading: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)'
  },
  webViewLoadingText: { marginTop: 12, fontSize: 16, color: '#666' },
}); 