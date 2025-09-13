import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { useState, useEffect } from "react";
import { financeService } from "../../services/api";

const FinanceHomepage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [currentDue, setCurrentDue] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [monthsData, setMonthsData] = useState(null);

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all months status, current month due, and recent payments in parallel
      const [monthsResponse, dueResponse, paymentsResponse] = await Promise.all([
        financeService.getAllMonthsStatus(),
        financeService.getCurrentMonthDue(),
        financeService.getPaymentHistory({ page: 1 })
      ]);

      // Prioritize pending payments over paid ones
      if (monthsResponse?.success && monthsResponse?.data?.months) {
        const months = monthsResponse.data.months;
        
        // Store months data for summary display
        setMonthsData(monthsResponse.data);
        
        // Find the first pending payment
        const firstPending = months.find(month => month.street && !month.is_paid);
        
        if (firstPending) {
          // Show the first pending payment
          setCurrentDue({
            month: firstPending.month,
            year: firstPending.year,
            amount: firstPending.amount,
            is_paid: false,
            street: firstPending.street,
            collection_reason: firstPending.collection_reason || null,
            created_at: firstPending.collection_date || new Date().toISOString()
          });
        } else {
          // If no pending, show the current month due or null
          if (dueResponse?.success !== false) {
            setCurrentDue(dueResponse?.data || null);
          } else {
            setCurrentDue(null);
          }
        }
      } else {
        // Fallback to current month due
        setMonthsData(null);
        if (dueResponse?.success !== false) {
          setCurrentDue(dueResponse?.data || null);
        } else {
          setCurrentDue(null);
        }
      }

      if (paymentsResponse?.data && Array.isArray(paymentsResponse.data)) {
        setRecentPayments(paymentsResponse.data.slice(0, 3)); // Show only 3 most recent
      } else {
        setRecentPayments([]);
      }
    } catch (err) {
      console.error('Error loading finance data:', err);
      setError('Failed to load finance data');
      setCurrentDue(null);
      setRecentPayments([]);
      setMonthsData(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFinanceData();
    setRefreshing(false);
  };

  const formatMonth = (month, year) => {
    if (!month || !year) return 'Monthly Due';
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthIndex = parseInt(month) - 1;
    if (monthIndex >= 0 && monthIndex < monthNames.length) {
      return `${monthNames[monthIndex]} ${year}`;
    }
    return 'Monthly Due';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <StatusBar
          backgroundColor={statusBarBackground}
          barStyle={theme === "light" ? "dark-content" : "light-content"}
        />
        <View style={styles.container}>
          <Header />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading finance data...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
        <Header />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4A90E2"]}
              tintColor="#4A90E2"
            />
          }
        >
          <View style={styles.headerSection}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Finance</Text>
          </View>

          {/* Payment Overview Card */}
          <View style={[styles.paymentCard, { backgroundColor: theme === "light" ? "#ffffff" : "#14181F" }]}>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentInfo}>
                <View style={styles.paymentLabelContainer}>
                  <Ionicons 
                    name={currentDue && !currentDue.is_paid ? "alert-circle" : "checkmark-circle"} 
                    size={16} 
                    color={currentDue && !currentDue.is_paid ? "#FF6B35" : "#50C878"} 
                  />
                  <Text style={[styles.paymentLabel, { color: colors.text, opacity: 0.7 }]}>
                    {currentDue && !currentDue.is_paid ? 'Pending Payment' : 'Payment Status'}
                  </Text>
                </View>
                <Text style={[styles.paymentMonth, { color: colors.text }]}>
                  {currentDue ? formatMonth(currentDue.month, currentDue.year) : 'Current Month'}
                </Text>
                {currentDue?.street && (
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={14} color="#4A90E2" />
                    <Text style={[styles.detailText, { color: colors.text, opacity: 0.7 }]}>
                      {currentDue.street}
                    </Text>
                  </View>
                )}
                {currentDue?.collection_reason && (
                  <View style={styles.detailRow}>
                    <Ionicons name="information-circle" size={14} color="#FF6B35" />
                    <Text style={[styles.detailText, { color: colors.text, opacity: 0.8 }]}>
                      {currentDue.collection_reason}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.amountContainer}>
                <Text style={[styles.amount, { color: colors.text }]}>
                  ₱{currentDue?.amount ? parseFloat(currentDue.amount).toFixed(2) : '0.00'}
                </Text>
                {currentDue && (
                  <View style={[styles.statusBadge, { 
                    backgroundColor: currentDue.is_paid ? 'rgba(80, 200, 120, 0.1)' : 'rgba(255, 107, 53, 0.1)',
                    borderColor: currentDue.is_paid ? 'rgba(80, 200, 120, 0.3)' : 'rgba(255, 107, 53, 0.3)',
                    borderWidth: 1
                  }]}>
                    <Ionicons 
                      name={currentDue.is_paid ? "checkmark-circle" : "time"} 
                      size={14} 
                      color={currentDue.is_paid ? "#50C878" : "#FF6B35"} 
                    />
                    <Text style={[styles.statusText, { color: currentDue.is_paid ? "#50C878" : "#FF6B35" }]}>
                      {currentDue.is_paid ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {!currentDue && (
              <View style={[styles.noDueMessage, { 
                backgroundColor: theme === "light" ? "rgba(255, 107, 53, 0.1)" : "rgba(255, 107, 53, 0.15)",
                borderColor: theme === "light" ? "rgba(255, 107, 53, 0.3)" : "rgba(255, 107, 53, 0.4)",
                borderWidth: 1
              }]}>
                <Ionicons name="information-circle" size={24} color="#FF6B35" />
                <Text style={[styles.noDueText, { color: colors.text, opacity: 0.7 }]}>
                  No monthly due has been set for the current month by the admin.
                </Text>
              </View>
            )}
          </View>

          {/* Payment Summary */}
          {monthsData && (
            <View style={[styles.summaryCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
              <View style={styles.summaryHeader}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>Payment Summary</Text>
              </View>
              <View style={styles.summaryStats}>
                <View style={styles.summaryStat}>
                  <Ionicons name="time" size={20} color="#FF6B35" />
                  <Text style={[styles.summaryStatNumber, { color: colors.text }]}>
                    {monthsData.summary?.pending_dues || 0}
                  </Text>
                  <Text style={[styles.summaryStatLabel, { color: colors.text, opacity: 0.7 }]}>
                    Pending
                  </Text>
                </View>
                <View style={styles.summaryStat}>
                  <Ionicons name="checkmark-circle" size={20} color="#50C878" />
                  <Text style={[styles.summaryStatNumber, { color: colors.text }]}>
                    {monthsData.summary?.paid_dues || 0}
                  </Text>
                  <Text style={[styles.summaryStatLabel, { color: colors.text, opacity: 0.7 }]}>
                    Paid
                  </Text>
                </View>
                <View style={styles.summaryStat}>
                  <Ionicons name="cash" size={20} color="#4A90E2" />
                  <Text style={[styles.summaryStatNumber, { color: colors.text }]}>
                    ₱{parseFloat(monthsData.summary?.pending_amount || 0).toFixed(2)}
                  </Text>
                  <Text style={[styles.summaryStatLabel, { color: colors.text, opacity: 0.7 }]}>
                    Pending Amount
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={[styles.quickActionButton, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}
                onPress={() => router.push("/Finance/QRPayment")}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="qr-code" size={24} color="#4A90E2" />
                </View>
                <Text style={[styles.quickActionText, { color: colors.text }]}>
                  Payment
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.quickActionButton, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}
                onPress={() => router.push("/Finance/MonthlyDuesOverview")}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="calendar" size={24} color="#50C878" />
                </View>
                <Text style={[styles.quickActionText, { color: colors.text }]}>
                  All Months
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.quickActionButton, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}
                onPress={() => router.push("/Finance/PaymentHistory")}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="time" size={24} color="#FF6B35" />
                </View>
                <Text style={[styles.quickActionText, { color: colors.text }]}>
                  History
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Payments */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Payments</Text>
              <TouchableOpacity onPress={() => router.push("/Finance/PaymentHistory")}>
                <Text style={[styles.viewAllText, { color: "#4A90E2" }]}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {error ? (
              <View style={[styles.errorCard, { 
                backgroundColor: theme === "light" ? "rgba(255, 107, 53, 0.1)" : "rgba(255, 107, 53, 0.15)",
                borderColor: theme === "light" ? "rgba(255, 107, 53, 0.3)" : "rgba(255, 107, 53, 0.4)",
                borderWidth: 1
              }]}>
                <Ionicons name="alert-circle" size={48} color="#FF6B35" />
                <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadFinanceData}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : recentPayments.length > 0 ? (
              <View style={[styles.recentPaymentsCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
                {recentPayments.map((payment, index) => (
                  <View key={payment?.id || index} style={[styles.recentPaymentItem, index < recentPayments.length - 1 && styles.recentPaymentItemBorder]}>
                    <View style={styles.recentPaymentInfo}>
                      <Text style={[styles.recentPaymentMonth, { color: colors.text }]}>
                        {payment?.monthly_due ? formatMonth(payment.monthly_due.month, payment.monthly_due.year) : 'Monthly Due'}
                      </Text>
                      <Text style={[styles.recentPaymentTime, { color: colors.text, opacity: 0.6 }]}>
                        {formatTime(payment?.paid_at)}
                      </Text>
                      {payment?.monthly_due?.street && (
                        <Text style={[styles.recentPaymentStreet, { color: colors.text, opacity: 0.8 }]}>
                          {payment.monthly_due.street}
                        </Text>
                      )}
                    </View>
                    <View style={styles.recentPaymentAmount}>
                      <Text style={[styles.recentAmount, { color: colors.text }]}>
                        ₱{payment?.amount ? parseFloat(payment.amount).toFixed(2) : '0.00'}
                      </Text>
                      <View style={styles.statusBadge}>
                        <Ionicons name="checkmark-circle" size={12} color="#50C878" />
                        <Text style={styles.statusText}>Paid</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.noPaymentsCard, { 
                backgroundColor: theme === "light" ? "#f8f9fa" : "#2a3441",
                borderColor: theme === "light" ? "#e9ecef" : "#3a4451",
                borderWidth: 1
              }]}>
                <View style={[styles.noPaymentsIconContainer, { 
                  backgroundColor: theme === "light" ? "#e9ecef" : "#3a4451" 
                }]}>
                  <Ionicons name="receipt-outline" size={48} color={theme === "light" ? "#6c757d" : "#9ca3af"} />
                </View>
                <Text style={[styles.noPaymentsText, { color: colors.text }]}>
                  No payments yet
                </Text>
                <Text style={[styles.noPaymentsSubtext, { color: colors.text, opacity: 0.7 }]}>
                  Your payment history will appear here
                </Text>
              </View>
            )}
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#50C878" />
              <Text style={[styles.infoTitle, { color: colors.text }]}>Payment Information</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.text, opacity: 0.7 }]}>
              Make your monthly payments on time to avoid late fees. You can pay using various methods including GCash QR, direct GCash payment, or bank transfer.
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

export default FinanceHomepage;

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
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  paymentCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 30,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  paymentInfo: {
    flex: 1,
    marginRight: 16,
  },
  paymentLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "500",
  },
  paymentMonth: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  amountContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 80,
  },
  amount: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  paymentStatus: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryStat: {
    flex: 1,
    alignItems: "center",
  },
  summaryStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  recentSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  recentPaymentsCard: {
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
  recentPaymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  recentPaymentItemBorder: {
    borderBottomWidth: 0,
  },
  recentPaymentInfo: {
    flex: 1,
  },
  recentPaymentMonth: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  recentPaymentTime: {
    fontSize: 14,
  },
  recentPaymentStreet: {
    fontSize: 12,
    marginTop: 2,
  },
  recentPaymentAmount: {
    alignItems: "flex-end",
  },
  recentAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: "#50C878",
    fontWeight: "500",
    marginLeft: 4,
  },
  noPaymentsCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  noPaymentsText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },
  noPaymentsSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  noPaymentsIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  noDueMessage: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  noDueText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  errorCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4A90E2",
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
