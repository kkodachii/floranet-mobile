import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Receipt = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  // Mock receipt data
  const receiptData = {
    receiptNumber: "RCP-2025-001234",
    transactionId: "TXN-2025-001234",
    date: "July 15, 2025",
    time: "10:32 AM",
    amount: "₱300.00",
    method: "GCash",
    status: "Completed",
    residentName: "Juan Dela Cruz",
    residentId: "RZ1023",
    description: "Monthly Association Fee - July 2025",
    adminName: "Maria Santos",
    adminId: "ADM-001",
  };

  const ReceiptRow = ({ label, value, isTotal = false }) => (
    <View style={styles.receiptRow}>
      <Text style={[
        styles.receiptLabel, 
        { color: colors.text, opacity: 0.7 },
        isTotal && { fontWeight: "600", opacity: 1 }
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.receiptValue, 
        { color: colors.text },
        isTotal && { fontWeight: "bold", fontSize: 18 }
      ]}>
        {value}
      </Text>
    </View>
  );

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
        <Header title="Payment Receipt" />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Payment Receipt</Text>
            <Text style={[styles.pageSubtitle, { color: colors.text, opacity: 0.7 }]}>
              Official receipt for your payment transaction
            </Text>
          </View>

          {/* Receipt Header */}
          <View style={[styles.receiptHeader, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Ionicons name="home" size={32} color="#50C878" />
              </View>
              <View style={styles.companyInfo}>
                <Text style={[styles.companyName, { color: colors.text }]}>
                  Floranet Association
                </Text>
                <Text style={[styles.companyAddress, { color: colors.text, opacity: 0.7 }]}>
                  Residential Community
                </Text>
              </View>
            </View>
            
            <View style={styles.receiptInfo}>
              <Text style={[styles.receiptTitle, { color: colors.text }]}>
                OFFICIAL RECEIPT
              </Text>
              <Text style={[styles.receiptNumber, { color: colors.text, opacity: 0.7 }]}>
                {receiptData.receiptNumber}
              </Text>
            </View>
          </View>

          {/* Receipt Details */}
          <View style={[styles.receiptCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="receipt" size={24} color="#4A90E2" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Transaction Details</Text>
            </View>
            
            <ReceiptRow label="Date" value={receiptData.date} />
            <ReceiptRow label="Time" value={receiptData.time} />
            <ReceiptRow label="Transaction ID" value={receiptData.transactionId} />
            <ReceiptRow label="Payment Method" value={receiptData.method} />
            <ReceiptRow label="Status" value={receiptData.status} />
          </View>

          {/* Resident Information */}
          <View style={[styles.receiptCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="person" size={24} color="#50C878" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Resident Information</Text>
            </View>
            
            <ReceiptRow label="Name" value={receiptData.residentName} />
            <ReceiptRow label="Resident ID" value={receiptData.residentId} />
            <ReceiptRow label="Description" value={receiptData.description} />
          </View>

          {/* Payment Amount */}
          <View style={[styles.amountCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.amountHeader}>
              <Ionicons name="cash" size={24} color="#50C878" />
              <Text style={[styles.amountTitle, { color: colors.text }]}>Payment Amount</Text>
            </View>
            
            <ReceiptRow label="Amount" value={receiptData.amount} isTotal={true} />
          </View>

          {/* Admin Information */}
          <View style={[styles.receiptCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#FF6B35" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Processed By</Text>
            </View>
            
            <ReceiptRow label="Admin Name" value={receiptData.adminName} />
            <ReceiptRow label="Admin ID" value={receiptData.adminId} />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="download" size={20} color="#4A90E2" />
              <Text style={[styles.actionButtonText, { color: "#4A90E2" }]}>
                Download PDF
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share" size={20} color="#50C878" />
              <Text style={[styles.actionButtonText, { color: "#50C878" }]}>
                Share Receipt
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={[styles.footerCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
            <Text style={[styles.footerText, { color: colors.text, opacity: 0.7 }]}>
              This is an official receipt from Floranet Association. Please keep this receipt for your records. For any questions, please contact the admin office.
            </Text>
            <Text style={[styles.footerSignature, { color: colors.text, opacity: 0.7 }]}>
              Thank you for your payment!
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

export default Receipt;

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
  receiptHeader: {
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
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(80, 200, 120, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 14,
  },
  receiptInfo: {
    alignItems: "center",
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  receiptNumber: {
    fontSize: 14,
  },
  receiptCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  receiptLabel: {
    fontSize: 14,
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  amountCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  footerCard: {
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
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  footerSignature: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
});
