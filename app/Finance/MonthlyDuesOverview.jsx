import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { financeService } from "../../services/api";

const MonthlyDuesOverview = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const [monthsData, setMonthsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  useEffect(() => {
    loadMonthsData();
  }, [selectedYear]);

  const loadMonthsData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('Loading months data for year:', selectedYear);

      const response = await financeService.getAllMonthsStatus({ year: selectedYear });
      
      console.log('Months data response:', response);
      
      if (response?.success && response?.data) {
        setMonthsData(response.data);
      } else {
        setError('Failed to load months data');
        setMonthsData(null);
      }
    } catch (err) {
      console.error('Error loading months data:', err);
      setError('Failed to load months data');
      setMonthsData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadMonthsData(true);
  };

  const changeYear = (direction) => {
    if (direction === 'next') {
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedYear(prev => prev - 1);
    }
  };

  const getMonthStatusIcon = (monthData) => {
    if (!monthData.street) {
      return { name: "remove-circle", color: "#9ca3af" }; // No due set
    }
    if (monthData.is_paid) {
      return { name: "checkmark-circle", color: "#50C878" }; // Paid
    }
    return { name: "time", color: "#FF6B35" }; // Pending
  };

  const getMonthStatusText = (monthData) => {
    if (!monthData.street) {
      return "No Due Set";
    }
    if (monthData.is_paid) {
      return "Paid";
    }
    return "Pending";
  };

  const MonthCard = ({ monthData, index }) => {
    const statusIcon = getMonthStatusIcon(monthData);
    const statusText = getMonthStatusText(monthData);

    return (
      <View style={[styles.monthCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
        <View style={styles.monthHeader}>
          <View style={styles.monthInfo}>
            <Text style={[styles.monthName, { color: colors.text }]}>
              {monthData.month_name}
            </Text>
            <Text style={[styles.monthYear, { color: colors.text, opacity: 0.6 }]}>
              {monthData.year}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <Ionicons name={statusIcon.name} size={20} color={statusIcon.color} />
            <Text style={[styles.statusText, { color: statusIcon.color }]}>
              {statusText}
            </Text>
          </View>
        </View>
        
        {monthData.street && (
          <>
            <View style={styles.amountContainer}>
              <Text style={[styles.amount, { color: colors.text }]}>
                ₱{parseFloat(monthData.amount || 0).toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons name="location" size={16} color="#4A90E2" />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {monthData.street}
                </Text>
              </View>
              
              {monthData.collection_reason && (
                <View style={styles.detailRow}>
                  <Ionicons name="information-circle" size={16} color="#FF6B35" />
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    {monthData.collection_reason}
                  </Text>
                </View>
              )}
              
              {monthData.is_paid && monthData.payment_method && (
                <View style={styles.detailRow}>
                  <Ionicons name="card" size={16} color="#50C878" />
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    {monthData.payment_method}
                  </Text>
                </View>
              )}
              
              {monthData.is_paid && monthData.payment_date && (
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#9B59B6" />
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    Paid: {new Date(monthData.payment_date).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
        
        {!monthData.street && (
          <View style={styles.noDueContainer}>
            <Text style={[styles.noDueText, { color: colors.text, opacity: 0.6 }]}>
              No monthly due set for this month
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={styles.container}>
          <Header title="Monthly Dues Overview" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading monthly dues...</Text>
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
        <Header title="Monthly Dues Overview" />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.headerSection}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Monthly Dues</Text>
            <Text style={[styles.pageSubtitle, { color: colors.text, opacity: 0.7 }]}>
              View all months and their payment status
            </Text>
          </View>

          {/* Year Selector */}
          <View style={styles.yearSelector}>
            <TouchableOpacity 
              style={[styles.yearButton, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}
              onPress={() => changeYear('prev')}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.yearDisplay}>
              <Text style={[styles.yearText, { color: colors.text }]}>{selectedYear}</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.yearButton, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}
              onPress={() => changeYear('next')}
            >
              <Ionicons name="chevron-forward" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Summary Stats */}
          {monthsData?.summary && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Ionicons name="calendar" size={24} color="#4A90E2" />
                  <Text style={[styles.summaryNumber, { color: colors.text }]}>
                    {monthsData.summary.total_dues}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.text, opacity: 0.7 }]}>
                    Total Dues
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#50C878" />
                  <Text style={[styles.summaryNumber, { color: colors.text }]}>
                    {monthsData.summary.paid_dues}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.text, opacity: 0.7 }]}>
                    Paid
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Ionicons name="time" size={24} color="#FF6B35" />
                  <Text style={[styles.summaryNumber, { color: colors.text }]}>
                    {monthsData.summary.pending_dues}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.text, opacity: 0.7 }]}>
                    Pending
                  </Text>
                </View>
              </View>
              
              <View style={styles.amountSummary}>
                <Text style={[styles.amountSummaryLabel, { color: colors.text, opacity: 0.7 }]}>
                  Total Amount: ₱{parseFloat(monthsData.summary.total_amount || 0).toFixed(2)}
                </Text>
                <Text style={[styles.amountSummaryLabel, { color: colors.text, opacity: 0.7 }]}>
                  Paid: ₱{parseFloat(monthsData.summary.paid_amount || 0).toFixed(2)}
                </Text>
                <Text style={[styles.amountSummaryLabel, { color: colors.text, opacity: 0.7 }]}>
                  Pending: ₱{parseFloat(monthsData.summary.pending_amount || 0).toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {error ? (
            <View style={[styles.errorCard, { 
              backgroundColor: theme === "light" ? "rgba(255, 107, 53, 0.1)" : "rgba(255, 107, 53, 0.15)",
              borderColor: theme === "light" ? "rgba(255, 107, 53, 0.3)" : "rgba(255, 107, 53, 0.4)",
              borderWidth: 1
            }]}>
              <Ionicons name="alert-circle" size={48} color="#FF6B35" />
              <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadMonthsData()}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : monthsData?.months ? (
            <View style={styles.monthsContainer}>
              {monthsData.months.map((monthData, index) => (
                <MonthCard key={index} monthData={monthData} index={index} />
              ))}
            </View>
          ) : (
            <View style={[styles.noDataCard, { 
              backgroundColor: theme === "light" ? "#f8f9fa" : "#2a3441",
              borderColor: theme === "light" ? "#e9ecef" : "#3a4451",
              borderWidth: 1
            }]}>
              <Ionicons name="calendar-outline" size={64} color={colors.text} style={{ opacity: 0.5 }} />
              <Text style={[styles.noDataText, { color: colors.text }]}>No data available</Text>
              <Text style={[styles.noDataSubtext, { color: colors.text, opacity: 0.7 }]}>
                No monthly dues found for the selected year
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

export default MonthlyDuesOverview;

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
  yearSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  yearButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  yearDisplay: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  yearText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  summaryCard: {
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  amountSummary: {
    borderTopWidth: 1,
    borderTopColor: "rgba(74, 144, 226, 0.3)",
    paddingTop: 16,
  },
  amountSummaryLabel: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  monthsContainer: {
    gap: 16,
  },
  monthCard: {
    padding: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  monthInfo: {
    flex: 1,
  },
  monthName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  monthYear: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  amountContainer: {
    marginBottom: 16,
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#50C878",
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  noDueContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  noDueText: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
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
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
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
  noDataCard: {
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    marginTop: 20,
  },
  noDataText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
  },
  noDataSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
}); 