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

const MainBusiness = () => {
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
          <View style={styles.profileImageWrapper}>
            <View
              style={[
                styles.placeholderImage,
                { borderColor: buttonBackground },
              ]}
            />
            <TouchableOpacity
              style={[
                styles.cameraButton,
                { backgroundColor: buttonBackground },
              ]}
              onPress={handlePickProfilePicture}
            >
              <Ionicons name="camera" size={18} color={textColor} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.name, { color: textColor }]}>
            {residentData.businessName}
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
              onPress={() => router.push("/Settings")}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={14}
                color={textColor}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Ratings and Reviews</Text>

          <View
            style={[styles.infoContainer, { backgroundColor: cardBackground }]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < 4 ? "star" : "star-outline"}
                  size={18}
                  color="#28942c"
                  style={{ marginRight: 2 }}
                />
              ))}
              <Text
                style={[styles.infoText, { color: textColor, marginLeft: 6 }]}
              >
                4.0 (12 reviews)
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { marginBottom: 4 }]}>
                Maria S.:
              </Text>
              <Text style={[styles.infoText, { color: textColor, flex: 1 }]}>
                Great service, friendly staff!
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { marginBottom: 4 }]}>
                Luis G.:
              </Text>
              <Text style={[styles.infoText, { color: textColor, flex: 1 }]}>
                My go-to barbershop every month. Highly recommended.
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { marginBottom: 4 }]}>
                Anne C.:
              </Text>
              <Text style={[styles.infoText, { color: textColor, flex: 1 }]}>
                Quick and clean haircut. Will return!
              </Text>
            </View>
          </View>

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
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { borderColor: textColor, marginTop: 8 },
                ]}
                onPress={() => router.push("/Profile/AddService")}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="add-outline" size={16} color={textColor} />
                  <Text
                    style={[
                      styles.buttonText,
                      { color: textColor, marginLeft: 6 },
                    ]}
                  >
                    Add Service
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: textColor }]}
            onPress={() => router.push("/Profile/ManagePost")}
          >
            <Text style={[styles.buttonText, { color: textColor }]}>
              Manage Posts
            </Text>
          </TouchableOpacity>

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

export default MainBusiness;

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
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 6,
  },
  infoLabel: {
    fontWeight: "600",
    fontSize: 14,
    color: "green",
  },
  infoText: {
    fontSize: 16,
  },
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
  profileImageWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cameraButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
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
});
