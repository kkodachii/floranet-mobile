import { StyleSheet, Text, View, SafeAreaView, ScrollView } from "react-native";
import React from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";

const PaymentHistory = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const historyData = [
    {
      month: "July 2025",
      name: "Juan Dela Cruz",
      id: "RZ1023",
      time: "10:32 AM",
      amount: "₱300.00",
      status: "completed",
    },
    {
      month: "June 2025",
      name: "Maria Santos",
      id: "RZ1009",
      time: "2:45 PM",
      amount: "₱500.00",
      status: "completed",
    },
    {
      month: "May 2025",
      name: "Pedro Herrera",
      id: "RZ1007",
      time: "8:15 AM",
      amount: "₱250.00",
      status: "completed",
    },
    {
      month: "April 2025",
      name: "Ana Lopez",
      id: "RZ1011",
      time: "11:50 AM",
      amount: "₱400.00",
      status: "completed",
    },
    {
      month: "March 2025",
      name: "Carlo Reyes",
      id: "RZ1032",
      time: "4:10 PM",
      amount: "₱350.00",
      status: "completed",
    },
    {
      month: "February 2025",
      name: "Ellen Cruz",
      id: "RZ1014",
      time: "6:05 PM",
      amount: "₱320.00",
      status: "completed",
    },
    {
      month: "January 2025",
      name: "Roberto Lim",
      id: "RZ1028",
      time: "9:40 AM",
      amount: "₱280.00",
      status: "completed",
    },
    {
      month: "December 2024",
      name: "Marites Gomez",
      id: "RZ1010",
      time: "12:00 PM",
      amount: "₱310.00",
      status: "completed",
    },
    {
      month: "November 2024",
      name: "Allan Tan",
      id: "RZ1002",
      time: "7:25 AM",
      amount: "₱295.00",
      status: "completed",
    },
    {
      month: "October 2024",
      name: "Kristine Ramos",
      id: "RZ1005",
      time: "3:30 PM",
      amount: "₱330.00",
      status: "completed",
    },
  ];

  const PaymentCard = ({ item, index }) => (
                <View style={[styles.paymentCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={[styles.paymentMonth, { color: colors.text }]}>
            {item.month}
          </Text>
          <Text style={[styles.paymentTime, { color: colors.text, opacity: 0.6 }]}>
            {item.time}
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
            {item.name}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="id-card" size={16} color="#FF6B35" />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {item.id}
          </Text>
        </View>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {item.amount}
        </Text>
      </View>
    </View>
  );

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
              <Text style={[styles.statNumber, { color: colors.text }]}>10</Text>
              <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>Total Payments</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cash" size={24} color="#50C878" />
              <Text style={[styles.statNumber, { color: colors.text }]}>₱3,285</Text>
              <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>Total Amount</Text>
            </View>
          </View>

          <View style={styles.historyContainer}>
            {historyData.map((item, index) => (
              <PaymentCard key={index} item={item} index={index} />
            ))}
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
});
