import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";

const OtherProfile = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
  const buttonBackground = theme === "light" ? "#e1e5ea" : "#1F2633";
  const textColor = colors.text;

  // 🔹 Lock navigation bar color so it doesn't change when modal opens
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(navBarBackground);
    NavigationBar.setButtonStyleAsync(theme === "light" ? "dark" : "light");
  }, [theme, navBarBackground]);

  const residentData = {
    residentName: "Juan Dela Cruz",
    residentID: "B3A - L23",
    houseNumber: "23",
    street: "Blk B3A",
    contactNumber: "09171234567",
    businessName: "Juan's Barbershop",
    services: ["Haircut", "Shave"],
    posts: [],
  };

  const handleAction = (action) => {
    setModalVisible(false);
    console.log(`${action} clicked`);
  };

  const ActionItem = ({ icon, label, onPress, color }) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.6}>
      <Feather name={icon} size={22} color={color || textColor} />
      <Text style={[styles.actionText, { color: color || textColor }]}>{label}</Text>
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.profileImageWrapper}>
            <View
              style={[
                styles.placeholderImage,
                { borderColor: buttonBackground },
              ]}
            />
          </View>

          <Text style={[styles.name, { color: textColor }]}>
            {residentData.residentName}
          </Text>
          <Text style={[styles.subText, { color: textColor }]}>
            Resident ID: {residentData.residentID}
          </Text>

          <View style={styles.profileActions}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: textColor }]}
              onPress={() => router.push("/Chat/ChatScreen")}
            >
              <Text style={[styles.buttonText, { color: textColor }]}>
                Message
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, { borderColor: textColor }]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={14}
                color={textColor}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Details</Text>

          <View
            style={[styles.infoContainer, { backgroundColor: cardBackground }]}
          >
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>House Number:</Text>
              <Text style={[styles.infoText, { color: textColor }]}>
                {residentData.houseNumber}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Street:</Text>
              <Text style={[styles.infoText, { color: textColor }]}>
                {residentData.street}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contact Number:</Text>
              <Text style={[styles.infoText, { color: textColor }]}>
                {residentData.contactNumber}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Business</Text>

          {residentData.businessName ? (
            <View
              style={[
                styles.vendorContainer,
                { backgroundColor: cardBackground },
              ]}
            >
              <View style={styles.vendorProfileImage} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.vendorName, { color: textColor }]}>
                  {residentData.businessName}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { borderColor: textColor, marginTop: 8 },
                  ]}
                  onPress={() => router.push("/Profile/OtherBusiness")}
                >
                  <Text style={[styles.buttonText, { color: textColor }]}>
                    Visit Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={[styles.subText, { color: textColor }]}>None</Text>
          )}

          <Text style={styles.sectionTitle}>Services</Text>

          {residentData.services.length > 0 ? (
            <View
              style={[
                styles.infoContainer,
                { backgroundColor: cardBackground, alignSelf: "stretch" },
              ]}
            >
              {residentData.services.map((service, index) => (
                <Text
                  key={index}
                  style={[
                    styles.infoText,
                    { color: textColor, marginBottom: 6 },
                  ]}
                >
                  • {service}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={[styles.subText, { color: textColor }]}>None</Text>
          )}

          <Text style={styles.sectionTitle}>Previous Posts</Text>
          <View
            style={[
              styles.infoContainer,
              { backgroundColor: cardBackground, alignSelf: "stretch" },
            ]}
          >
            <Text style={[styles.subText, { color: textColor }]}>
              Posts go here
            </Text>
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPressOut={() => setModalVisible(false)}
          >
            <View style={[styles.sheet, { backgroundColor: colors.background }]}>
              <ActionItem icon="alert-circle" label="Report Profile" onPress={() => handleAction("Report Profile")} />
              <ActionItem icon="slash" label="Block User" onPress={() => handleAction("Block User")} />
              <ActionItem icon="share-2" label="Share Profile" onPress={() => handleAction("Share Profile")} />
              <ActionItem icon="x" label="Cancel" color="red" onPress={() => setModalVisible(false)} />
            </View>
          </TouchableOpacity>
        </Modal>

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

export default OtherProfile;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: "space-between" },
  scrollContainer: { alignItems: "center", padding: 25 },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ccc",
    borderWidth: 2,
  },
  name: { fontSize: 30, fontWeight: "bold", marginBottom: 4 },
  subText: { fontSize: 14, color: "gray", marginBottom: 6 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
    alignSelf: "flex-start",
    color: "green",
  },
  infoContainer: {
    width: "100%",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: "600",
    fontSize: 14,
    color: "green",
    marginRight: 6,
  },
  infoText: {
    fontSize: 16,
  },
  vendorContainer: {
    width: "100%",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  vendorProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#bbb",
  },
  vendorName: { fontSize: 16, fontWeight: "600" },
  navWrapper: { backgroundColor: "#fff" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  profileImageWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  profileActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  iconButton: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 10,
    paddingTop: 8,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  actionText: {
    marginLeft: 14,
    fontSize: 18,
    fontWeight: "500",
  },
});
