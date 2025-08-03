import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Alert } from "react-native";
import React from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const EmergencyHomepage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const handleCCTV = () => {
    router.push("/Emergency/CCTV/CCTV");
  };

  const handleFileComplaints = () => {
    // Navigate to complaints page
    Alert.alert("File Complaints", "Complaints form will be opened");
  };

  const handleEmergencyAlert = () => {
    Alert.alert(
      "Emergency Alert",
      "Are you sure you want to send an emergency alert?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Send Alert",
          style: "destructive",
          onPress: () => {
            Alert.alert("Alert Sent", "Emergency alert has been sent to authorities");
          }
        }
      ]
    );
  };

  const EmergencyButton = ({ title, subtitle, icon, onPress, color, iconColor }) => (
    <TouchableOpacity
      style={[
        styles.emergencyButton,
        {
          backgroundColor: color,
          shadowColor: color,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <Ionicons name={icon} size={28} color="#fff" />
      </View>
      <View style={styles.buttonTextContainer}>
        <Text style={styles.buttonTitle}>{title}</Text>
        <Text style={styles.buttonSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#fff" style={styles.arrowIcon} />
    </TouchableOpacity>
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
        <Header />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Emergency Services</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <EmergencyButton
              title="Request CCTV Footage"
              subtitle="Request footage from admin"
              icon="videocam"
              onPress={handleCCTV}
              color="#4A90E2"
              iconColor="#357ABD"
            />

            <EmergencyButton
              title="File Complaints"
              subtitle="Report issues and concerns"
              icon="document-text"
              onPress={handleFileComplaints}
              color="#50C878"
              iconColor="#3A9D5F"
            />

            <EmergencyButton
              title="Emergency Alert"
              subtitle="Send immediate alert to authorities"
              icon="warning"
              onPress={handleEmergencyAlert}
              color="#E74C3C"
              iconColor="#C0392B"
            />
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#4A90E2" />
              <Text style={[styles.infoTitle, { color: colors.text }]}>Emergency Information</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.text, opacity: 0.7 }]}>
              Use these services responsibly. Emergency alerts will be sent to local authorities immediately. CCTV footage requests will be processed by admin.
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

export default EmergencyHomepage;

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
  buttonsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  arrowIcon: {
    opacity: 0.8,
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
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
