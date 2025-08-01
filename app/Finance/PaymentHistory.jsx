import { StyleSheet, Text, View, SafeAreaView, ScrollView } from "react-native";
import React from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";

const PaymentHistory = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
  const textColor = colors.text;

  const historyData = [
    {
      month: "July 2025",
      name: "Juan Dela Cruz",
      id: "RZ1023",
      time: "10:32 AM",
      amount: "₱300.00",
    },
    {
      month: "June 2025",
      name: "Maria Santos",
      id: "RZ1009",
      time: "2:45 PM",
      amount: "₱500.00",
    },
    {
      month: "May 2025",
      name: "Pedro Herrera",
      id: "RZ1007",
      time: "8:15 AM",
      amount: "₱250.00",
    },
    {
      month: "April 2025",
      name: "Ana Lopez",
      id: "RZ1011",
      time: "11:50 AM",
      amount: "₱400.00",
    },
    {
      month: "March 2025",
      name: "Carlo Reyes",
      id: "RZ1032",
      time: "4:10 PM",
      amount: "₱350.00",
    },
    {
      month: "February 2025",
      name: "Ellen Cruz",
      id: "RZ1014",
      time: "6:05 PM",
      amount: "₱320.00",
    },
    {
      month: "January 2025",
      name: "Roberto Lim",
      id: "RZ1028",
      time: "9:40 AM",
      amount: "₱280.00",
    },
    {
      month: "December 2024",
      name: "Marites Gomez",
      id: "RZ1010",
      time: "12:00 PM",
      amount: "₱310.00",
    },
    {
      month: "November 2024",
      name: "Allan Tan",
      id: "RZ1002",
      time: "7:25 AM",
      amount: "₱295.00",
    },
    {
      month: "October 2024",
      name: "Kristine Ramos",
      id: "RZ1005",
      time: "3:30 PM",
      amount: "₱330.00",
    },
  ];

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <Header title="Payment History" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[styles.historySection, { backgroundColor: cardBackground }]}
        >
          {historyData.map((item, index) => (
            <View
              key={index}
              style={[styles.historyItem, { borderBottomColor: "#28942c" }]}
            >
              <View>
                <Text style={[styles.historyDate, { color: "#28942c" }]}>
                  {item.month}
                </Text>

                <Text style={[styles.historySub, { color: textColor }]}>
                  Homeowner: {item.name}
                </Text>
                <Text style={[styles.historySub, { color: textColor }]}>
                  Resident ID: {item.id}
                </Text>
                <Text style={[styles.historySub, { color: "#888" }]}>
                  Time: {item.time}
                </Text>
              </View>
              <Text style={[styles.historyAmount, { color: colors.text }]}>
                {item.amount}
              </Text>
            </View>
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
    </SafeAreaView>
  );
};

export default PaymentHistory;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  navWrapper: {
  },
  historySection: {
    marginTop: 53,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // aligns text better when there's more lines
    marginBottom: 24, // more space between items
    paddingBottom: 12, // more padding at bottom of each entry
    borderBottomWidth: 0.5,
    borderBottomColor: "#28942c",
  },
  historyDate: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4, // space between month and details
  },

  historySub: {
    fontSize: 14,
    marginBottom: 10, // small gap between each sub line
  },

  historyAmount: {
    fontSize: 16,
    fontWeight: "600",
    alignSelf: "center",
  },
});
