import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";

import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import CommentSection from "./CommentSection";

const { width: screenWidth } = Dimensions.get("window");

const RatingStars = ({ rating = 4, size = 16 }) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {[...Array(5)].map((_, i) => (
        <Ionicons
          key={i}
          name="star"
          size={size}
          color={i < Math.round(rating) ? "#28942c" : "#ccc"}
        />
      ))}
    </View>
  );
};

const ViewPost = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const params = useLocalSearchParams();

  // Sample post data
  const postData = {
    postId: "0",
    homeownerName: "Juan Dela Cruz",
    residentId: "B3A - L23",
    postTime: "July 31, 2025 at 10:30 AM",
    caption:
      "Join us for our grand opening! Come celebrate with us and enjoy amazing food and entertainment.",
    category: "Event",
    commentCount: 12,
    likes: 45,
    eventDateTime: "Fri, 2 June – 11:00 AM",
    eventLocation: "Clubhouse, Community Area",
  };

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
  const textColor = colors.text;

  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [isCommentSheetVisible, setCommentSheetVisible] = useState(false);
  const [imageLikes, setImageLikes] = useState({ 0: false, 1: false, 2: false });
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Anna Cruz",
      content: "Great event! Looking forward to it.",
      time: "2 hours ago",
      avatar: null,
    },
    {
      id: 2,
      author: "Mark Santos",
      content: "Will there be parking available?",
      time: "1 hour ago",
      avatar: null,
    },
  ]);

  // Sample images
  const postImages = [
    {
      url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop",
      likes: 24,
    },
    {
      url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
      likes: 18,
    },
    {
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
      likes: 31,
    },
  ];

  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setImageModalVisible(true);
  };

  const openCommentSheet = () => setCommentSheetVisible(true);
  const closeCommentSheet = () => setCommentSheetVisible(false);

  const handleCommentAdded = (newComment) => {
    if (!newComment || !newComment.trim()) return;
    const newCommentObj = {
      id: Date.now(),
      author: "You",
      content: newComment.trim(),
      time: "Just now",
      avatar: null,
    };
    setComments((prev) => [...prev, newCommentObj]);
  };

  const toggleImageLike = (imageIndex) => {
    setImageLikes((prev) => ({
      ...prev,
      [imageIndex]: !prev[imageIndex],
    }));
  };

  const renderImageGallery = () => {
    if (postImages.length === 0) return null;

    return (
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        {postImages.map((imageData, index) => {
          const isImageLiked = imageLikes[index];
          return (
            <View key={index} style={styles.imageCardVertical}>
              {/* Photo */}
              <TouchableOpacity
                onPress={() => openImageModal(index)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: imageData.url }}
                  style={styles.postImageVertical}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              {/* Like & Comment buttons */}
              <View style={styles.imageActionsRow}>
                <TouchableOpacity
                  style={styles.imageActionRowItem}
                  onPress={() => toggleImageLike(index)}
                >
                  <Ionicons
                    name={isImageLiked ? "heart" : "heart-outline"}
                    size={22}
                    color={isImageLiked ? "#28942c" : textColor}
                  />
                  <Text style={[styles.imageActionText, { color: textColor }]}>
                    {imageData.likes + (isImageLiked ? 1 : 0)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imageActionRowItem}
                  onPress={openCommentSheet}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={22}
                    color={textColor}
                  />
                  <Text style={[styles.imageActionText, { color: textColor }]}>
                    {comments.length}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    );
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

      <Header />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* Post Header */}
        <View style={[styles.postHeader, { backgroundColor: cardBackground }]}>
          <TouchableOpacity
            style={styles.authorRow}
            onPress={() => router.push("/Profile/OtherProfile")}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color="#ccc" />
              </View>
            </View>
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, { color: textColor }]}>
                {postData.homeownerName}
              </Text>
              <Text style={[styles.postTime, { color: textColor }]}>
                {postData.postTime}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Post Caption */}
        <View
          style={[styles.captionContainer, { backgroundColor: cardBackground }]}
        >
          <Text style={[styles.caption, { color: textColor }]}>
            {postData.caption}
          </Text>
        </View>

        {/* Image Gallery - Vertical */}
        {renderImageGallery()}
      </ScrollView>

      {/* Comments Bottom Sheet */}
      <Modal
        animationType="slide"
        transparent
        visible={isCommentSheetVisible}
        onRequestClose={closeCommentSheet}
      >
        <KeyboardAvoidingView
          style={styles.bottomSheetOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={styles.bottomSheetOverlay}
            activeOpacity={1}
            onPress={closeCommentSheet}
          >
            <TouchableOpacity
              style={[
                styles.commentBottomSheet,
                { backgroundColor: cardBackground },
              ]}
              activeOpacity={1}
            >
              <View style={styles.bottomSheetHeader}>
                <Text style={[styles.bottomSheetTitle, { color: textColor }]}>
                  Comments ({comments.length})
                </Text>
                <TouchableOpacity onPress={closeCommentSheet}>
                  <Ionicons name="close" size={28} color={textColor} />
                </TouchableOpacity>
              </View>

              <CommentSection
                comments={comments}
                onCommentAdd={handleCommentAdded}
                postId={postData.postId}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default ViewPost;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  postHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    marginBottom: 2,
  },
  authorRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  authorInfo: { marginLeft: 12, flex: 1 },
  authorName: { fontSize: 16, fontWeight: "600" },
  postTime: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  captionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 2,
  },
  caption: { fontSize: 16, lineHeight: 24 },
  imageCardVertical: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postImageVertical: { width: "100%", height: 300 },
  imageActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: 12,
    gap: 20,
  },
  imageActionRowItem: { flexDirection: "row", alignItems: "center" },
  imageActionText: { marginLeft: 6, fontSize: 14, fontWeight: "500" },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  commentBottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    paddingTop: 20,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  bottomSheetTitle: { fontSize: 18, fontWeight: "bold" },
});
