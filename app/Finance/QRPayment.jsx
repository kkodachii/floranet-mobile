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
import { createCheckoutSession, recordPayment } from "./paymongoUtils";
import { financeService, authService } from "../../services/api";
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
    // If payment was successful, reset the gateway state to allow creating a new one
    if (modalType === 'paid') {
      setCheckoutSession(null);
      setPaymentStatus(null);
    }
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
        // Check if the current month's due is already paid
        if (due.is_paid) {
          // If current month is paid, look for the next pending payment
          const monthsResponse = await financeService.getAllMonthsStatus();
          if (monthsResponse?.success && monthsResponse?.data?.months) {
            const months = monthsResponse.data.months;
            const firstPending = months.find(month => month.street && !month.is_paid);
            
            if (firstPending) {
              setCurrentDue({
                id: firstPending.id,
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
        } else {
          // Current month's due is not paid, use it
          setCurrentDue(due);
          setAmount(due.amount ? due.amount.toString() : "0.00");
        }
      } else {
        // If no current due, try to get any pending payment from all months
        const monthsResponse = await financeService.getAllMonthsStatus();
        if (monthsResponse?.success && monthsResponse?.data?.months) {
          const months = monthsResponse.data.months;
          const firstPending = months.find(month => month.street && !month.is_paid);
          
          if (firstPending) {
            setCurrentDue({
              id: firstPending.id,
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
      // Get user profile information for dynamic customer info
      const userProfile = await authService.getProfileCached();
      console.log('User profile for payment:', userProfile);
      
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
        `${baseUrl}/payment/cancel`,
        userProfile // Pass user profile for dynamic customer info
      );
      
      if (!session.success) {
        showModal('error', session.error || 'Failed to create payment gateway');
        setIsLoading(false);
        return;
      }

      setCheckoutSession(session);
      setPaymentStatus('pending');
      
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

  const handleWebViewNavigationStateChange = async (navState) => {
    // Add safety check for navState
    if (!navState || !navState.url) {
      return;
    }
    
    // Check if user is redirected to success or cancel page
    if (navState.url.includes('/payment/success')) {
      setWebViewVisible(false);
      
      // Show success modal immediately since PayMongo confirmed the payment
      setPaymentStatus('paid');
      showModal('paid', 'Your payment has been received and recorded successfully.');
      
      // Reset payment gateway state to allow creating a new one
      setCheckoutSession(null);
      
      // Record the payment in our database in the background
      try {
        console.log('Recording payment with monthly due ID:', currentDue?.id);
        const recordResult = await recordPayment(
          parseFloat(amount),
          currentDue?.id
        );

        if (recordResult.success) {
          console.log('Payment recorded successfully in database');
          // Refresh the current due to get updated status
          setTimeout(() => {
            loadCurrentDue();
          }, 2000);
        } else {
          console.warn('Payment recording failed, but payment was successful:', recordResult.error);
          // Still refresh to get updated status
          setTimeout(() => {
            loadCurrentDue();
          }, 2000);
        }
      } catch (error) {
        console.error('Error recording payment:', error);
        // Still refresh to get updated status
        setTimeout(() => {
          loadCurrentDue();
        }, 2000);
      }
    } else if (navState.url.includes('/payment/cancel')) {
      setWebViewVisible(false);
      setPaymentStatus('not_paid');
      setCheckoutSession(null); // Reset gateway to allow creating a new one
      showModal('not_paid', 'Payment was cancelled. Please try again.');
    }
  };

  const resetPayment = () => {
    setCheckoutSession(null);
    setPaymentStatus(null);
    setWebViewVisible(false);
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
                  backgroundColor: currentDue && parseFloat(amount) > 0 && !checkoutSession ? "#22C55E" : "#9CA3AF",
                  opacity: (!currentDue || parseFloat(amount) <= 0 || checkoutSession) ? 0.6 : 1
                }
              ]}
              onPress={createPaymentGateway}
              disabled={Boolean(isLoading || !currentDue || parseFloat(amount) <= 0 || checkoutSession)}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={18} color="#fff" />
                  <Text style={styles.primaryButtonText}>
                    {!currentDue || parseFloat(amount) <= 0 ? 'No Payment Due' : 
                     checkoutSession ? 'Gateway Created' : 'Create Payment Gateway'}
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

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: "#4A90E2" }]}
                onPress={openPaymentGateway}
              >
                <Ionicons name="open-outline" size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>Open Payment Page</Text>
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
              Tap Create Payment Gateway, then complete your payment using your preferred method. Your payment will be automatically recorded.
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
            
          </View>
        </ScrollView>

        {/* Status Modal */}
        <Modal
          visible={Boolean(modalVisible)}
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
          visible={Boolean(webViewVisible)}
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
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView error: ', nativeEvent);
                }}
                onHttpError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView HTTP error: ', nativeEvent);
                }}
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