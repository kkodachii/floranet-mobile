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
import HeaderBack from "../../components/HeaderBack";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";

const residentData = {
  residentName: "Juan Dela Cruz",
  houseNumber: "23",
  street: "Blk B3A",
  contactNumber: "09171234567",
  businessName: "Juan's Barbershop",
  services: ["Haircut", "Shave"],
  posts: [],
};

const reviewsData = {
  averageRating: 4.2,
  totalReviews: 12,
  reviews: [
    {
      id: 1,
      name: "Maria S.",
      rating: 5,
      comment: "Great service, friendly staff!",
      date: "2 days ago",
    },
    {
      id: 2,
      name: "Luis G.",
      rating: 4,
      comment: "My go-to barbershop every month. Highly recommended.",
      date: "1 week ago",
    },
  ],
};

const StarRating = ({ rating }) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {[...Array(5)].map((_, i) => (
        <Ionicons
          key={i}
          name={
            i < Math.floor(rating)
              ? "star"
              : i < rating
              ? "star-half"
              : "star-outline"
          }
          size={16}
          color="#28942c"
          style={{ marginRight: 1 }}
        />
      ))}
    </View>
  );
};

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

  const handlePickProfilePicture = () => {
    console.log("Launch image picker (not implemented)");
  };

  const renderReviewItem = (review) => (
    <View key={review.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{review.name.charAt(0)}</Text>
          </View>
          <View style={styles.reviewerDetails}>
            <Text style={[styles.reviewerName, { color: textColor }]}>
              {review.name}
            </Text>
            <View style={styles.ratingRow}>
              <StarRating rating={review.rating} />
              <Text style={[styles.reviewDate, { color: textColor }]}>
                • {review.date}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={[styles.reviewComment, { color: textColor }]}>
        {review.comment}
      </Text>
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
        <HeaderBack title="Business Profile" onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Cover Photo Section */}
          <View
            style={[
              styles.coverPhotoWrapper,
              { backgroundColor: buttonBackground },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.coverCameraButton,
                { backgroundColor: buttonBackground },
              ]}
              onPress={() => console.log("Change cover photo")}
            >
              <Ionicons name="camera" size={18} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Profile Picture Section */}
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

          {/* Business Name */}
          <Text style={[styles.name, { color: textColor }]}>
            {residentData.businessName}
          </Text>

          {/* Profile Actions */}
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

          {/* Ratings and Reviews (Details Section) */}
          <View
            style={[
              styles.infoContainer,
              { backgroundColor: buttonBackground, marginHorizontal: 0 },
            ]}
          >
            <View style={styles.ratingSummary}>
              <View style={styles.ratingLeft}>
                <Text style={[styles.averageRating, { color: textColor }]}>
                  {reviewsData.averageRating}
                </Text>
                <StarRating rating={reviewsData.averageRating} />
                <Text style={[styles.totalReviews, { color: textColor }]}>
                  Based on {reviewsData.totalReviews} reviews
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.viewAllButton, { borderColor: "#28942c" }]}
                onPress={() => router.push("/Profile/AllReviews")}
              >
                <Text style={[styles.viewAllText, { color: "#28942c" }]}>
                  View All
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#28942c" />
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.reviewsContainer}>
              <Text style={[styles.recentReviewsTitle, { color: textColor }]}>
                Recent Reviews
              </Text>
              {reviewsData.reviews.slice(0, 2).map(renderReviewItem)}

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    borderColor: textColor,
                    alignSelf: "flex-start",
                    marginTop: 10,
                  },
                ]}
                onPress={() => console.log("Reply to Reviews")}
              >
                <Text style={[styles.buttonText, { color: textColor }]}>
                  Reply to Reviews
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Grouped Section with Padding */}
          <View style={styles.sectionWrapper}>
            {/* Services */}
            <Text style={styles.sectionTitle}>Services</Text>
            <View
              style={[
                styles.infoContainer,
                styles.shadowContainer,
                { backgroundColor: cardBackground },
              ]}
            >
              {residentData.services.length > 0 ? (
                <>
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
                </>
              ) : (
                <>
                  <Text style={[styles.subText, { color: textColor }]}>
                    None
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { borderColor: textColor, marginTop: 8 },
                    ]}
                    onPress={() => router.push("/Profile/AddService")}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons
                        name="add-outline"
                        size={16}
                        color={textColor}
                      />
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
                </>
              )}
            </View>

            {/* Manage Posts */}
            <TouchableOpacity
              style={[styles.buttonAlt, { backgroundColor: buttonBackground }]}
              onPress={() => router.push("/Profile/ManagePost")}
            >
              <Text style={[styles.buttonAltText, { color: textColor }]}>
                Manage Posts
              </Text>
            </TouchableOpacity>

            {/* Previous Posts */}
            <Text style={styles.sectionTitle}>Previous Posts</Text>
            <View
              style={[
                styles.infoContainer,
                styles.shadowContainer,
                { backgroundColor: cardBackground },
              ]}
            >
              {residentData.posts.length > 0 ? (
                <Text style={{ color: textColor }}>Posts go here</Text>
              ) : (
                <Text style={[styles.subText, { color: textColor }]}>
                  No posts yet.
                </Text>
              )}
            </View>
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
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.card || "#fff" },
              ]}
            >
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Privacy Settings
              </Text>
              <Text
                style={[styles.modalOption, { color: textColor }]}
                onPress={() => {
                  setHideSensitiveInfo(true);
                  setModalVisible(false);
                }}
              >
                Hide from other users
              </Text>
              <Text
                style={[styles.modalOption, { color: textColor }]}
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
  scrollContainer: { alignItems: "center", paddingBottom: 30 },
  sectionWrapper: { width: "100%", paddingHorizontal: 16 },

  // Cover Photo Styles
  coverPhotoWrapper: {
    width: "100%",
    height: 140,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  coverCameraButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
    alignSelf: "flex-start",
    color: "green",
  },
  infoContainer: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  shadowContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  infoText: { fontSize: 16 },
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
  ratingSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  ratingLeft: { flex: 1 },
  averageRating: { fontSize: 32, fontWeight: "bold", marginBottom: 4 },
  totalReviews: { fontSize: 14 },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  viewAllText: { fontSize: 14, fontWeight: "500", marginRight: 4 },
  divider: { height: 1, width: "100%", marginBottom: 15 },
  reviewsContainer: { width: "100%" },
  recentReviewsTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  reviewItem: { marginBottom: 16 },
  reviewHeader: { marginBottom: 8 },
  reviewerInfo: { flexDirection: "row", alignItems: "center" },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#28942c",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "white", fontWeight: "bold", fontSize: 16 },
  reviewerDetails: { flex: 1 },
  reviewerName: { fontWeight: "600", fontSize: 15, marginBottom: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  reviewDate: { fontSize: 12, marginLeft: 8 },
  reviewComment: { fontSize: 14, lineHeight: 20, marginLeft: 48 },
  buttonAlt: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: "100%",
  },
  buttonAltText: { fontSize: 14, fontWeight: "500" },
});
