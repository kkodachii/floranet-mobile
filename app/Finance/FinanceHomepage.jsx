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
  const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
  const textColor = colors.text;

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
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header />
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.month}>{paymentData.month} Payment</Text>
            <Text style={styles.dueDate}>Due at: {paymentData.dueDate}</Text>
          </View>

          <Text style={[styles.amount, { color: textColor }]}>
            ₱{paymentData.amount.toFixed(2)}
          </Text>

          <TouchableOpacity
            style={styles.payButton}
            onPress={() => router.push("/Finance/Pay")}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>

          <View style={styles.extraButtonsContainer}>
            <TouchableOpacity
              style={[styles.extraButton, { borderColor: textColor }]}
            >
              <Text style={[styles.extraButtonText, { color: textColor }]}>
                Link GCash
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.extraButton, { borderColor: textColor }]}
            >
              <Text style={[styles.extraButtonText, { color: textColor }]}>
                Pay via GCash
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[styles.historySection, { backgroundColor: cardBackground }]}
        >
          <Text style={styles.historyTitle}>Recent Payments</Text>

          <View style={styles.historyItem}>
            <Text style={[styles.historyDate, { color: textColor }]}>
              July 2025
            </Text>
            <Text style={[styles.historyAmount, { color: textColor }]}>
              ₱300.00
            </Text>
          </View>

          <View style={styles.historyItem}>
            <Text style={[styles.historyDate, { color: textColor }]}>
              June 2025
            </Text>
            <Text style={[styles.historyAmount, { color: textColor }]}>
              ₱500.00
            </Text>
          </View>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => router.push("/Finance/PaymentHistory")}
          >
            <Ionicons name="time" size={18} color={textColor} />
            <Text style={[styles, { color: textColor }]}>
              Expand Full History
            </Text>
          </TouchableOpacity>
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
    </SafeAreaView>
  );
};

export default FinanceHomepage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  card: {
    marginTop: 65,
    marginHorizontal: 25,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  month: {
    fontSize: 15,
    fontWeight: "600",
    color: "#28942c",
  },
  dueDate: {
    fontSize: 15,
    color: "#888",
  },
  amount: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 16,
  },
  payButton: {
    flexDirection: "center",
    alignItems: "center",
    backgroundColor: "#28942c",
    paddingVertical: 10,
    paddingHorizontal: 60,
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
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28942c",
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
  extraButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
    gap: 10,
  },
  extraButton: {
    flex: 1,
    backgroundColor: "ffff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2f3b4c",
  },
  extraButtonText: {
    color: "#2f3b4c",
    fontWeight: "600",
    fontSize: 14,
  },
});
