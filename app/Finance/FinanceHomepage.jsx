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
import Header from "../../components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const FinanceHomepage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const month = new Date().toLocaleString("default", { month: "long" });

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header />

        {/* Payment Card with Pay Button */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.month}>{month} Payment</Text>
            <Text style={styles.dueDate}>Due at: July 31, 2025</Text>
          </View>

          <Text style={styles.amount}>₱300.00</Text>

          <TouchableOpacity
            style={styles.payButton}
            onPress={() => router.push("/Finance/Pay")}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Recent Payments</Text>

          <View style={styles.historyItem}>
            <Text style={styles.historyDate}>July 2025</Text>
            <Text style={styles.historyAmount}>₱300.00</Text>
          </View>

          <View style={styles.historyItem}>
            <Text style={styles.historyDate}>June 2025</Text>
            <Text style={styles.historyAmount}>₱500.00</Text>
          </View>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => router.push("/Finance/PaymentHistory")}
          >
            <Ionicons name="time" size={18} color="#2f3b4c" />
            <Text style={styles.historyButtonText}>Expand Full History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.navWrapper, { paddingBottom: insets.bottom || 16 }]}>
        <Navbar />
      </View>
    </SafeAreaView>
  );
};

export default FinanceHomepage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f7f9",
  },
  scrollContent: {
    paddingBottom: 16,
  },
  card: {
    marginTop: 65,
    marginHorizontal: 25,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  month: {
    fontSize: 18,
    fontWeight: "600",
    color: "#28942c",
  },
  dueDate: {
    fontSize: 14,
    color: "#888",
  },
  amount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2f3b4c",
    marginBottom: 16,
  },
  payButton: {
    flexDirection: "center",
    alignItems: "center",
    backgroundColor: "#28942c",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  historySection: {
    marginTop: 10,
    marginHorizontal: 25,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2f3b4c",
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  historyDate: {
    fontSize: 14,
    color: "#555",
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2f3b4c",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  historyButtonText: {
    color: "#2f3b4c",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
});
