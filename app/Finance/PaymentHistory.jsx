import { StyleSheet, Text, View, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { financeService } from "../../services/api";

const PaymentHistory = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalPayments: 0, totalAmount: 0 });

  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('Loading payment history...');

      const response = await financeService.getPaymentHistory({ page: 1 });
      
      console.log('Payment history response:', response);
      
      if (response?.data && Array.isArray(response.data)) {
        console.log('Setting payments:', response.data);
        setPayments(response.data);
        
        // Calculate stats
        const totalAmount = response.data.reduce((sum, payment) => {
          const amount = parseFloat(payment.amount) || 0;
          return sum + amount;
        }, 0);
        
        console.log('Calculated stats:', { totalPayments: response.data.length, totalAmount });
        
        setStats({
          totalPayments: response.data.length,
          totalAmount: totalAmount
        });
      } else {
        console.log('No valid payments data, setting empty arrays');
        setPayments([]);
        setStats({ totalPayments: 0, totalAmount: 0 });
      }
    } catch (err) {
      console.error('Error loading payment history:', err);
      setError('Failed to load payment history');
      setPayments([]);
      setStats({ totalPayments: 0, totalAmount: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadPaymentHistory(true);
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

  const PaymentCard = ({ item, index }) => (
                <View style={[styles.paymentCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={[styles.paymentMonth, { color: colors.text }]}>
            {item?.monthly_due ? formatMonth(item.monthly_due.month, item.monthly_due.year) : 'Monthly Due'}
          </Text>
          <Text style={[styles.paymentTime, { color: colors.text, opacity: 0.6 }]}>
            {formatTime(item?.paid_at)}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#50C878" />
          <Text style={styles.statusText}>Completed</Text>
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person" size={16} color="#4A90E2" />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {item?.resident?.name || 'Resident'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="id-card" size={16} color="#FF6B35" />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {item?.resident?.resident_id || 'N/A'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="card" size={16} color="#9B59B6" />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {item?.method_of_payment || 'Payment Method'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#E67E22" />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {formatDate(item?.paid_at)}
          </Text>
        </View>
        
        {/* Collection Reason */}
        {item?.monthly_due?.street && (
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color="#4A90E2" />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {item.monthly_due.street}
            </Text>
          </View>
        )}
        
        {/* Collection Reason - if available */}
        {item?.monthly_due?.collection_reason && (
          <View style={styles.detailRow}>
            <Ionicons name="information-circle" size={16} color="#FF6B35" />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {item.monthly_due.collection_reason}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: colors.text }]}>
          ₱{item?.amount ? parseFloat(item.amount).toFixed(2) : '0.00'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={styles.container}>
          <Header title="Payment History" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading payment history...</Text>
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
      <View style={styles.container}>
        <Header title="Payment History" />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.headerSection}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Payment Records</Text>
            <Text style={[styles.pageSubtitle, { color: colors.text, opacity: 0.7 }]}>
              View all your payment history
            </Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={24} color="#4A90E2" />
              <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalPayments}</Text>
              <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>Total Payments</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cash" size={24} color="#50C878" />
              <Text style={[styles.statNumber, { color: colors.text }]}>₱{stats.totalAmount.toFixed(2)}</Text>
              <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>Total Amount</Text>
            </View>
          </View>

          {error ? (
            <View style={[styles.errorCard, { 
              backgroundColor: theme === "light" ? "#FFEBE6" : "rgba(255, 107, 53, 0.15)",
              borderColor: theme === "light" ? "rgba(255, 107, 53, 0.3)" : "rgba(255, 107, 53, 0.4)",
              borderWidth: 1
            }]}>
              <Ionicons name="alert-circle" size={48} color="#FF6B35" />
              <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadPaymentHistory()}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : payments.length > 0 ? (
          <View style={styles.historyContainer}>
              {payments.map((item, index) => (
                <PaymentCard key={item.id} item={item} index={index} />
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
                <Ionicons name="receipt-outline" size={64} color={theme === "light" ? "#6c757d" : "#9ca3af"} />
              </View>
              <Text style={[styles.noPaymentsText, { color: colors.text }]}>No payments yet</Text>
              <Text style={[styles.noPaymentsSubtext, { color: colors.text, opacity: 0.7 }]}>
                Your payment history will appear here once you make payments
              </Text>
            </View>
          )}
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

export default PaymentHistory;

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
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: 16,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  historyContainer: {
    gap: 16,
  },
  paymentCard: {
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
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMonth: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  paymentTime: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    color: "#50C878",
    fontWeight: "500",
    marginLeft: 4,
  },
  paymentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#50C878",
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noPaymentsCard: {
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    marginTop: 20,
  },
  noPaymentsText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
  },
  noPaymentsSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
  },
  noPaymentsIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
});
