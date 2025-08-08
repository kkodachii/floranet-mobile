import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../Theme/ThemeProvider";
import { StatusBar } from "react-native";

const paymentData = {
  month: "July",
  dueDate: "July 31, 2025",
  amount: 300.0,
};

const FinanceHomepage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

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
        >
          <View style={styles.headerSection}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Finance</Text>
          </View>

          {/* Payment Overview Card */}
          <View style={[styles.paymentCard, { backgroundColor: theme === "light" ? "#ffffff" : "#14181F" }]}>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, { color: colors.text, opacity: 0.7 }]}>
                  Current Payment
                </Text>
                <Text style={[styles.paymentMonth, { color: colors.text }]}>
                  {paymentData.month} 2025
                </Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={[styles.amount, { color: colors.text }]}>
                  ₱{paymentData.amount.toFixed(2)}
                </Text>
                <Text style={[styles.dueDate, { color: colors.text, opacity: 0.6 }]}>
                  Due: {paymentData.dueDate}
                </Text>
              </View>
            </View>
          </View>

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
                  QR Payment
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.quickActionButton, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}
                onPress={() => router.push("/Finance/PaymentHistory")}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="time" size={24} color="#50C878" />
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
            
            <View style={[styles.recentPaymentsCard, { backgroundColor: theme === "light" ? "#ffffff" : colors.card }]}>
              <View style={styles.recentPaymentItem}>
                <View style={styles.recentPaymentInfo}>
                  <Text style={[styles.recentPaymentMonth, { color: colors.text }]}>July 2025</Text>
                  <Text style={[styles.recentPaymentTime, { color: colors.text, opacity: 0.6 }]}>10:32 AM</Text>
                </View>
                <View style={styles.recentPaymentAmount}>
                  <Text style={[styles.recentAmount, { color: colors.text }]}>₱300.00</Text>
                  <View style={styles.statusBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#50C878" />
                    <Text style={styles.statusText}>Paid</Text>
                  </View>
                </View>
              </View>

              <View style={styles.recentPaymentItem}>
                <View style={styles.recentPaymentInfo}>
                  <Text style={[styles.recentPaymentMonth, { color: colors.text }]}>June 2025</Text>
                  <Text style={[styles.recentPaymentTime, { color: colors.text, opacity: 0.6 }]}>2:45 PM</Text>
                </View>
                <View style={styles.recentPaymentAmount}>
                  <Text style={[styles.recentAmount, { color: colors.text }]}>₱500.00</Text>
                  <View style={styles.statusBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#50C878" />
                    <Text style={styles.statusText}>Paid</Text>
                  </View>
                </View>
              </View>
            </View>
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
  },
  paymentLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  paymentMonth: {
    fontSize: 20,
    fontWeight: "600",
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
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
    padding: 20,
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
