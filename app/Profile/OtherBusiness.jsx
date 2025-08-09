// MainBusiness.js
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
import { Ionicons, Feather } from "@expo/vector-icons";

// Dummy data
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
          {/* Profile Picture */}
          <View style={styles.profileImageWrapper}>
            <View
              style={[styles.placeholderImage, { borderColor: buttonBackground }]}
            />
          </View>

          {/* Business Name */}
          <Text style={[styles.name, { color: textColor }]}>
            {residentData.businessName}
          </Text>

          {/* Profile Actions */}
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
              <Ionicons name="ellipsis-horizontal" size={14} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Ratings and Reviews */}
          <Text style={styles.sectionTitle}>Ratings and Reviews</Text>

          <View
            style={[styles.infoContainer, { backgroundColor: cardBackground }]}
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
                  Leave a Review
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Services */}
          <Text style={styles.sectionTitle}>Services</Text>

          <View
            style={[
              styles.infoContainer,
              { backgroundColor: cardBackground, alignSelf: "stretch" },
            ]}
          >
            {residentData.services.length > 0 ? (
              <>
                {residentData.services.map((service, index) => (
                  <Text
                    key={index}
                    style={[styles.infoText, { color: textColor, marginBottom: 6 }]}
                  >
                    • {service}
                  </Text>
                ))}
              </>
            ) : (
              <Text style={[styles.subText, { color: textColor }]}>None</Text>
            )}
          </View>

          {/* Previous Posts */}
          <Text style={styles.sectionTitle}>Previous Posts</Text>
          <View
            style={[
              styles.infoContainer,
              { backgroundColor: cardBackground, alignSelf: "stretch" },
            ]}
          >
            {residentData.posts.length > 0 ? (
              <Text style={{ color: textColor }}>Posts go here</Text>
            ) : (
              <Text style={[styles.subText, { color: textColor }]}>No posts yet.</Text>
            )}
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
            <View style={[styles.sheet, { backgroundColor: colors.background }]}>
              <ActionItem
                icon="alert-circle"
                label="Report Business"
                onPress={() => handleAction("Report Profile")}
              />
              <ActionItem
                icon="slash"
                label="Block Business"
                onPress={() => handleAction("Block User")}
              />
              <ActionItem
                icon="share-2"
                label="Share Business Profile"
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
  // New styles for enhanced reviews section
  ratingSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  ratingLeft: {
    flex: 1,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  totalReviews: {
    fontSize: 14,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  divider: {
    height: 1,
    width: "100%",
    marginBottom: 15,
  },
  reviewsContainer: {
    width: "100%",
  },
  recentReviewsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  reviewItem: {
    marginBottom: 16,
  },
  reviewHeader: {
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#28942c",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewDate: {
    fontSize: 12,
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 48,
  },

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
});
