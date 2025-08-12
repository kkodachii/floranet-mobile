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
import React, { useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import HeaderBack from "../../components/HeaderBack";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Ionicons, Feather } from "@expo/vector-icons";

const CHIP_LABELS = ["Posts", "Business"];

const Chips = ({ selectedChip, onChipPress }) => {
  const { colors, theme } = useTheme();
  const buttonBackground = theme === "light" ? "#e1e5ea" : "#1F2633";
  const textColor = colors.text;

  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 6,
        justifyContent: "flex-start",
      }}
    >
      {CHIP_LABELS.map((label, index) => {
        const isSelected = label === selectedChip;
        return (
          <TouchableOpacity
            key={label}
            onPress={() => onChipPress(label)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? "#28942c" : buttonBackground,
                marginRight: index < CHIP_LABELS.length - 1 ? 8 : 0,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: isSelected ? "#fff" : textColor },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const OtherProfile = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [hideSensitiveInfo, setHideSensitiveInfo] = useState(false);
  const [selectedChip, setSelectedChip] = useState("Posts");

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
    posts: [
      {
        id: 1,
        content: "Just opened my barbershop! Come visit for a fresh cut!",
        timestamp: "2 days ago",
        likes: 15,
        comments: 3,
      },
    ],
  };

  const handleAction = (action) => {
    setModalVisible(false);
    console.log(`${action} clicked`);
  };

  const ActionItem = ({ icon, label, onPress, color }) => (
    <TouchableOpacity
      style={styles.actionItem}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Feather name={icon} size={22} color={color || textColor} />
      <Text style={[styles.actionText, { color: color || textColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const PostCard = ({ post }) => (
    <View style={[styles.postCard, { backgroundColor: cardBackground }]}>
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <Ionicons name="person" size={20} color="#ccc" />
        </View>
        <View style={styles.postHeaderText}>
          <Text style={[styles.postAuthor, { color: textColor }]}>
            {residentData.residentName}
          </Text>
          <Text style={styles.postTimestamp}>{post.timestamp}</Text>
        </View>
      </View>
      <Text style={[styles.postContent, { color: textColor }]}>
        {post.content}
      </Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="heart-outline" size={16} color="gray" />
          <Text style={styles.postActionText}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="chatbubble-outline" size={16} color="gray" />
          <Text style={styles.postActionText}>{post.comments}</Text>
        </TouchableOpacity>
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
        <HeaderBack title="Profile" onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View
            style={[
              styles.coverPhotoWrapper,
              { backgroundColor: buttonBackground },
            ]}
          >
          </View>

          <View style={styles.profileImageContainer}>
            <View style={[styles.profileImage, { backgroundColor: "#e4e6ea" }]}>
              <Ionicons name="person" size={40} color="#bcc0c4" />
            </View>
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
              <Ionicons name="chatbubble-outline" size={14} color={textColor} style={{ marginRight: 6 }} />
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

          <View
            style={[
              styles.infoContainer,
              { backgroundColor: buttonBackground },
            ]}
          >
            <View style={styles.infoHeader}>
              <Text style={styles.sectionTitle}>Details</Text>
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

          <Chips selectedChip={selectedChip} onChipPress={setSelectedChip} />

          {selectedChip === "Business" ? (
            <View style={{ width: "100%", paddingHorizontal: 16 }}>
              <Text style={[styles.sectionTitle, { marginLeft: 0 }]}>
                Business
              </Text>
              {residentData.businessName ? (
                <View
                  style={[
                    styles.vendorContainer,
                    {
                      backgroundColor: cardBackground,
                      marginLeft: 0,
                      marginRight: 0,
                    },
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
                      onPress={() => router.push("/Profile/OtherBusiness")}
                    >
                      <Text style={[styles.buttonText, { color: textColor }]}>
                        View Profile
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={{ alignSelf: "stretch", marginBottom: 20 }}>
                  <Text style={[styles.subText, { color: textColor }]}>
                    None
                  </Text>
                </View>
              )}

              {/* Services Section */}
              <Text style={[styles.sectionTitle, { marginLeft: 0 }]}>
                Services
              </Text>
              {residentData.services.length > 0 ? (
                <View
                  style={[
                    styles.servicesContainer,
                    {
                      backgroundColor: cardBackground,
                      alignSelf: "stretch",
                      marginLeft: 0,
                      marginRight: 0,
                    },
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
                <View style={{ alignSelf: "stretch", marginBottom: 20 }}>
                  <Text style={[styles.subText, { color: textColor }]}>
                    None
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={{ width: "100%", paddingHorizontal: 16 }}>
              {/* Posts Section */}
              <Text style={[styles.sectionTitle, { marginLeft: 0 }]}>
                Posts
              </Text>

              {residentData.posts.length > 0 ? (
                residentData.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <View
                  style={[
                    styles.emptyState,
                    { backgroundColor: buttonBackground },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={48}
                    color="gray"
                  />
                  <Text style={[styles.emptyStateText, { color: textColor }]}>
                    No posts yet
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    Share something with your community!
                  </Text>
                </View>
              )}
            </View>
          )}
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

        {/* Action Modal */}
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
            <View
              style={[styles.sheet, { backgroundColor: colors.background }]}
            >
              <ActionItem
                icon="alert-circle"
                label="Report Profile"
                onPress={() => handleAction("Report Profile")}
              />
              <ActionItem
                icon="slash"
                label="Block User"
                onPress={() => handleAction("Block User")}
              />
              <ActionItem
                icon="share-2"
                label="Share Profile"
                onPress={() => handleAction("Share Profile")}
              />
              <ActionItem
                icon="x"
                label="Cancel"
                color="red"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default OtherProfile;

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
    padding: 15,
    marginBottom: 15,
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
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
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  postCard: {
    width: "100%",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  postHeaderText: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: "600",
  },
  postTimestamp: {
    fontSize: 12,
    color: "gray",
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  postAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  postActionText: {
    fontSize: 12,
    color: "gray",
  },
  emptyState: {
    width: "100%",
    borderRadius: 10,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  servicesContainer: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});