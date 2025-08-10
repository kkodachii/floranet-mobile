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
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";

const MainProfile = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [hideSensitiveInfo, setHideSensitiveInfo] = useState(false);

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
  const buttonBackground = theme === "light" ? "#e1e5ea" : "#1F2633";
  const textColor = colors.text;

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

  const handlePickProfilePicture = () => {
    console.log("Open camera or gallery to pick profile picture.");
  };

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
          <View
            style={[
              styles.coverPhotoWrapper,
              { backgroundColor: buttonBackground },
            ]}
          />

          <View style={styles.profileImageContainer}>
            <View style={[styles.profileImage, { backgroundColor: "#e4e6ea" }]}>
              <Ionicons name="camera" size={40} color="#bcc0c4" />
            </View>
            <TouchableOpacity
              style={[
                styles.cameraButtonLarge,
                { backgroundColor: buttonBackground },
              ]}
              onPress={handlePickProfilePicture}
            >
              <Ionicons name="camera" size={16} color={textColor} />
            </TouchableOpacity>
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
              onPress={() => router.push("/Profile/EditProfile")}
            >
              <Text style={[styles.buttonText, { color: textColor }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, { borderColor: textColor }]}
              onPress={() => router.push("/Settings/MainSettings")}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={14}
                color={textColor}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.infoContainer,
              { backgroundColor: buttonBackground },
            ]}
          >
            <View style={styles.infoHeader}>
              <Text style={styles.sectionTitle}>Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Ionicons name="eye-outline" size={22} color={textColor} />
              </TouchableOpacity>
            </View>

            {!hideSensitiveInfo ? (
              <>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="home-outline"
                    size={28}
                    color="gray"
                    style={styles.infoIcon}
                  />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>House Number</Text>
                    <Text style={[styles.infoText, { color: textColor }]}>
                      {residentData.houseNumber}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name="location-outline"
                    size={28}
                    color="gray"
                    style={styles.infoIcon}
                  />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Street</Text>
                    <Text style={[styles.infoText, { color: textColor }]}>
                      {residentData.street}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name="call-outline"
                    size={28}
                    color="gray"
                    style={styles.infoIcon}
                  />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Contact Number</Text>
                    <Text style={[styles.infoText, { color: textColor }]}>
                      {residentData.contactNumber}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={{ color: "gray", marginBottom: 10 }}>
                This information is hidden from other users.
              </Text>
            )}
          </View>

          {/* Business Section */}
          <Text style={styles.sectionTitle}>Business</Text>
          {residentData.businessName ? (
            <View
              style={[
                styles.vendorContainer,
                { backgroundColor: cardBackground },
              ]}
            >
              <View style={styles.vendorProfileImage} />
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={[styles.vendorName, { color: textColor }]}>
                  {residentData.businessName}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { borderColor: textColor, marginTop: 8 },
                  ]}
                  onPress={() => router.push("/Profile/MainBusiness")}
                >
                  <Text style={[styles.buttonText, { color: textColor }]}>
                    Open Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ alignSelf: "stretch", marginBottom: 20 }}>
              <Text style={[styles.subText, { color: textColor }]}>None</Text>
            </View>
          )}

          {/* Services Section */}
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
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    borderColor: textColor,
                    alignSelf: "flex-start",
                    marginTop: 10,
                  },
                ]}
                onPress={() => router.push("/Profile/EditServices")}
              >
                <Text style={[styles.buttonText, { color: textColor }]}>
                  Edit Services
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ alignSelf: "stretch", marginBottom: 20 }}>
              <Text style={[styles.subText, { color: textColor }]}>None</Text>
            </View>
          )}

          {/* Posts Section */}
          <Text style={styles.sectionTitle}>Posts</Text>
          <View style={styles.avatarContainer}>
            <View style={styles.placeholder}>
              <Ionicons name="person" size={24} color="#ccc" />
            </View>
            <TouchableOpacity
              style={[styles.inputButton, { borderColor: textColor, flex: 1 }]}
              onPress={() => router.push("/Community/CreatePost")}
            >
              <Text style={[styles.inputButtonText, { color: textColor }]}>
                What's on your mind?
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Nav */}
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

        {/* Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Privacy Settings</Text>
              <Text
                style={styles.modalOption}
                onPress={() => {
                  setHideSensitiveInfo(true);
                  setModalVisible(false);
                }}
              >
                Hide to Other users
              </Text>
              <Text
                style={styles.modalOption}
                onPress={() => {
                  setHideSensitiveInfo(false);
                  setModalVisible(false);
                }}
              >
                Show to other users
              </Text>
              <Text
                style={[styles.modalOption, { color: "red" }]}
                onPress={() => setModalVisible(false)}
              >
                Cancel
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default MainProfile;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: "space-between" },
  scrollContainer: { alignItems: "center", paddingBottom: 30 },

  coverPhotoWrapper: {
    width: "100%",
    height: 140,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  profileImageContainer: {
    position: "relative",
    marginBottom: 12,
    marginTop: -80,
    zIndex: 10,
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#e4e6ea",
    borderWidth: 6,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraButtonLarge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderWidth: 2,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  name: { fontSize: 30, fontWeight: "bold", marginBottom: 4 },
  subText: { fontSize: 14, color: "gray", marginBottom: 6 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "flex-start",
    color: "#28942c",
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
  infoTextContainer: {
    flexDirection: "column",
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    fontWeight: "600",
    fontSize: 14,
    color: "gray",
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
  buttonText: { fontSize: 14, fontWeight: "500" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  modalOption: { fontSize: 16, paddingVertical: 10 },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
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
  avatarContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  placeholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  inputButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  inputButtonText: { fontSize: 14 },
});