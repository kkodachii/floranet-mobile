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

const PaymentDetails = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  // Mock payment details data
  const paymentDetails = {
    transactionId: "TXN-2025-001234",
    date: "July 15, 2025",
    time: "10:32 AM",
    amount: "₱300.00",
    method: "GCash",
    status: "Completed",
    residentName: "Juan Dela Cruz",
    residentId: "RZ1023",
    description: "Monthly Association Fee - July 2025",
  };

  const DetailRow = ({ icon, label, value, color = "#4A90E2" }) => (
    <View style={styles.detailRow}>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.detailContent}>
        <Text style={[styles.detailLabel, { color: colors.text, opacity: 0.7 }]}>
          {label}
        </Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>
          {value}
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
      <StatusBar
        backgroundColor={statusBarBackground}
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />

      <View style={styles.container}>
        <Header title="Payment Details" />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Payment Information</Text>
            <Text style={[styles.pageSubtitle, { color: colors.text, opacity: 0.7 }]}>
              Detailed view of your payment transaction
            </Text>
          </View>

          {/* Payment Status Card */}
          <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
            <View style={styles.statusHeader}>
              <Ionicons name="checkmark-circle" size={32} color="#50C878" />
              <Text style={[styles.statusText, { color: colors.text }]}>Payment Successful</Text>
            </View>
            <Text style={[styles.amount, { color: colors.text }]}>
              {paymentDetails.amount}
            </Text>
            <Text style={[styles.transactionId, { color: colors.text, opacity: 0.7 }]}>
              {paymentDetails.transactionId}
            </Text>
          </View>

          {/* Payment Details Card */}
          <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={24} color="#4A90E2" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Transaction Details</Text>
            </View>
            
            <DetailRow 
              icon="calendar" 
              label="Date" 
              value={paymentDetails.date} 
              color="#4A90E2"
            />
            <DetailRow 
              icon="time" 
              label="Time" 
              value={paymentDetails.time} 
              color="#50C878"
            />
            <DetailRow 
              icon="card" 
              label="Payment Method" 
              value={paymentDetails.method} 
              color="#FF6B35"
            />
            <DetailRow 
              icon="checkmark-circle" 
              label="Status" 
              value={paymentDetails.status} 
              color="#50C878"
            />
          </View>

          {/* Resident Information Card */}
          <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="person" size={24} color="#50C878" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Resident Information</Text>
            </View>
            
            <DetailRow 
              icon="person" 
              label="Name" 
              value={paymentDetails.residentName} 
              color="#4A90E2"
            />
            <DetailRow 
              icon="id-card" 
              label="Resident ID" 
              value={paymentDetails.residentId} 
              color="#FF6B35"
            />
            <DetailRow 
              icon="information-circle" 
              label="Description" 
              value={paymentDetails.description} 
              color="#50C878"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="download" size={20} color="#4A90E2" />
              <Text style={[styles.actionButtonText, { color: "#4A90E2" }]}>
                Download Receipt
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share" size={20} color="#50C878" />
              <Text style={[styles.actionButtonText, { color: "#50C878" }]}>
                Share Receipt
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#4A90E2" />
              <Text style={[styles.infoTitle, { color: colors.text }]}>Payment Information</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.text, opacity: 0.7 }]}>
              This payment has been successfully processed and recorded. You can download or share the receipt for your records. Keep this transaction ID for future reference.
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

export default PaymentDetails;

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
  statusCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  transactionId: {
    fontSize: 14,
  },
  detailsCard: {
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
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
});
