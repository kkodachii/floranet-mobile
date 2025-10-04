import React, { useState, useEffect } from "react";
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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { communityService, buildStorageUrl, authService } from "../../services/api";

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

  // Get category color function
  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case "announcement":
        return "#e74c3c"; // Red
      case "events":
        return "#3498db"; // Blue
      case "business":
        return "#f39c12"; // Orange
      case "project":
        return "#27ae60"; // Green
      default:
        return "#95a5a6"; // Light Gray
    }
  };

  // Format time ago function
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "just now";
    
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  // Parse event details from post content
  const parseEventDetails = (content) => {
    if (!content) return { date: null, time: null, location: null, description: content };
    
    const lines = content.split('\n');
    let description = content;
    let date = null;
    let time = null;
    let location = null;
    
    // Look for "Event Details:" section
    const eventDetailsIndex = lines.findIndex(line => line.includes('Event Details:'));
    if (eventDetailsIndex !== -1) {
      // Extract description (everything before "Event Details:")
      description = lines.slice(0, eventDetailsIndex).join('\n').trim();
      
      // Parse event details
      const eventLines = lines.slice(eventDetailsIndex + 1);
      eventLines.forEach(line => {
        if (line.startsWith('Date:')) {
          date = line.replace('Date:', '').trim();
        } else if (line.startsWith('Time:')) {
          time = line.replace('Time:', '').trim();
        } else if (line.startsWith('Location:')) {
          location = line.replace('Location:', '').trim();
        }
      });
    }
    
    return { date, time, location, description };
  };

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#1F2633";
  const textColor = colors.text;
  const borderColor = theme === "light" ? "#e0e0e0" : "#2A2F3A";
  const shadowColor = theme === "light" ? "#000" : "#fff";

  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [isCommentSheetVisible, setCommentSheetVisible] = useState(false);
  const [imageLikes, setImageLikes] = useState({});
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminAccessDeniedModal, setAdminAccessDeniedModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const postId = params.postId;
        
        if (postId) {
          // Always load fresh post data from API to get latest likes/comments
          const response = await communityService.getPost(postId);
          if (response.success) {
            setPostData(response.data);
            // Set like status and count from API response
            setIsLiked(response.data.is_liked || false);
            setLikesCount(response.data.likes_count || 0);
          } else {
            Alert.alert("Error", "Failed to load post");
            router.back();
          }
        } else {
          Alert.alert("Error", "Post ID not found");
          router.back();
        }
      } catch (error) {
        console.error("Error loading post:", error);
        Alert.alert("Error", "Failed to load post");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadPost();
    loadCurrentUser();
  }, [params.postId]);

  // Load current user data
  const loadCurrentUser = async () => {
    try {
      const userData = await authService.getProfileCached();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  // Load comments
  useEffect(() => {
    if (postData?.id) {
      loadComments();
    }
  }, [postData?.id]);

  const loadComments = async () => {
    try {
      const response = await communityService.getComments(postData.id);
      if (response.success) {
        setComments(response.data || []);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setImageModalVisible(true);
  };

  const openCommentSheet = () => setCommentSheetVisible(true);
  const closeCommentSheet = () => setCommentSheetVisible(false);

  const handleCommentAdded = async (newComment) => {
    if (!newComment || !newComment.trim() || !postData?.id) return;
    
    try {
      const response = await communityService.addComment(postData.id, newComment.trim());
      if (response.success) {
        // Reload comments
        await loadComments();
      } else {
        Alert.alert("Error", response.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment. Please try again.");
    }
  };

  const toggleImageLike = (imageIndex) => {
    setImageLikes((prev) => ({
      ...prev,
      [imageIndex]: !prev[imageIndex],
    }));
  };

  const togglePostLike = async () => {
    if (!postData?.id) return;
    
    try {
      const response = await communityService.toggleLike(postData.id);
      if (response.success) {
        setIsLiked(response.data.is_liked);
        setLikesCount(response.data.likes_count);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      Alert.alert("Error", "Failed to update like. Please try again.");
    }
  };


  // Handle profile navigation
  const handleProfilePress = (postUserId, isAdmin = false) => {
    console.log('ViewPost - Profile press - currentUser.id:', currentUser?.id, 'postUserId:', postUserId, 'isAdmin:', isAdmin);
    
    if (currentUser && parseInt(currentUser.id) === parseInt(postUserId)) {
      // Navigate to own profile
      console.log('ViewPost - Navigating to own profile');
      router.push("/Profile/MainProfile");
    } else if (isAdmin) {
      // Show admin access denied modal
      console.log('ViewPost - Admin profile clicked - showing access denied modal');
      setAdminAccessDeniedModal(true);
    } else {
      // Navigate to other user's profile
      console.log('ViewPost - Navigating to other profile for userId:', postUserId);
      router.push({
        pathname: "/Profile/OtherProfile",
        params: { userId: postUserId }
      });
    }
  };

  const renderImageGallery = () => {
    if (!postData?.images || postData.images.length === 0) return null;

    return (
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        {postData.images.map((imagePath, index) => {
          const isImageLiked = imageLikes[index];
          return (
             <View key={index} style={[styles.imageCardVertical, { 
               backgroundColor: cardBackground,
               borderColor: borderColor,
             }]}>
              {/* Photo */}
              <TouchableOpacity
                onPress={() => openImageModal(index)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: buildStorageUrl(imagePath) }}
                  style={styles.postImageVertical}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              {/* Like & Comment buttons */}
              <View style={styles.imageActionsRow}>
                <TouchableOpacity
                  style={styles.imageActionRowItem}
                  onPress={togglePostLike}
                >
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={22}
                    color={isLiked ? "#28942c" : textColor}
                  />
                  <Text style={[styles.imageActionText, { color: textColor }]}>
                    {likesCount}
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
                    {postData?.comments_count || 0}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
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
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>
            Loading post...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!postData) {
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
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>
            Post not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        {/* Post Card */}
        <View style={[
          styles.postCard, 
          { 
            backgroundColor: cardBackground,
            shadowColor: shadowColor,
            borderColor: borderColor,
          }
        ]}>
          {/* Post Header */}
          <TouchableOpacity
            style={styles.postHeaderRow}
            onPress={() => handleProfilePress(postData.user?.id, postData.user?.is_admin)}
          >
            <View style={styles.avatarContainer}>
              {postData.user?.profile_picture ? (
                <Image 
                  source={{ uri: buildStorageUrl(postData.user.profile_picture) }} 
                  style={styles.avatar} 
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#ccc" />
                </View>
              )}
            </View>
            <View style={styles.postInfo}>
              <View style={styles.postHeaderTop}>
                <Text style={[styles.postAuthor, { color: textColor }]}>
                  {postData.user?.is_admin ? 'Administrator' : (postData.user?.name || 'Unknown User')}
                </Text>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(postData.category) }]}>
                  <Text style={styles.categoryText}>{postData.category?.toUpperCase() || "GENERAL"}</Text>
                </View>
              </View>
              <View style={styles.postTimeContainer}>
                <Ionicons name="globe-outline" size={12} color={textColor} style={{ opacity: 0.7 }} />
                <Text style={[styles.postTime, { color: textColor }]}>
                  {formatTimeAgo(postData.published_at)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Post Caption */}
          <Text style={[styles.postCaption, { color: textColor }]}>
            {postData.category?.toLowerCase() === 'events' 
              ? parseEventDetails(postData.content).description 
              : postData.content}
          </Text>

          {/* Event Details for Event Posts */}
          {postData.category?.toLowerCase() === 'events' && (() => {
            const eventDetails = parseEventDetails(postData.content);
            if (eventDetails.date || eventDetails.time || eventDetails.location) {
              return (
                 <View style={[
                   styles.eventDetailsContainer, 
                   { 
                     backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
                     borderColor: borderColor,
                   }
                 ]}>
                  <Text style={[styles.eventDetailsTitle, { color: textColor }]}>
                    Event Details:
                  </Text>
                  
                  {eventDetails.date && (
                    <View style={styles.eventDetailRow}>
                      <Ionicons name="calendar-outline" size={16} color={textColor} />
                      <Text style={[styles.eventDetailText, { color: textColor }]}>
                        {eventDetails.date}
                      </Text>
                    </View>
                  )}
                  
                  {eventDetails.time && (
                    <View style={styles.eventDetailRow}>
                      <Ionicons name="time-outline" size={16} color={textColor} />
                      <Text style={[styles.eventDetailText, { color: textColor }]}>
                        {eventDetails.time}
                      </Text>
                    </View>
                  )}
                  
                  {eventDetails.location && (
                    <View style={styles.eventDetailRow}>
                      <Ionicons name="location-outline" size={16} color={textColor} />
                      <Text style={[styles.eventDetailText, { color: textColor }]}>
                        {eventDetails.location}
                      </Text>
                    </View>
                  )}
                </View>
              );
            }
            return null;
          })()}
        </View>

        {/* Image Gallery - Vertical */}
        {renderImageGallery()}

        {/* Like and Comment buttons for posts without images */}
        {(!postData?.images || postData.images.length === 0) && (
          <View style={[styles.postActions, { backgroundColor: cardBackground, borderColor: borderColor }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={togglePostLike}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color={isLiked ? "#28942c" : textColor}
              />
              <Text style={[styles.actionText, { color: textColor }]}>
                {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={openCommentSheet}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={textColor}
              />
              <Text style={[styles.actionText, { color: textColor }]}>
                {postData?.comments_count || 0} {postData?.comments_count === 1 ? 'Comment' : 'Comments'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* Comments Bottom Sheet */}
      <Modal
        animationType="slide"
        transparent
        visible={isCommentSheetVisible}
        onRequestClose={closeCommentSheet}
      >
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity
            style={styles.bottomSheetOverlay}
            activeOpacity={1}
            onPress={closeCommentSheet}
          />
          <KeyboardAvoidingView
            style={styles.commentBottomSheetContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View
              style={[
                styles.commentBottomSheet,
                { backgroundColor: cardBackground },
              ]}
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
                postId={postData.id}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Admin Access Denied Modal */}
      <Modal
        visible={adminAccessDeniedModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setAdminAccessDeniedModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)' }]}>
          <View style={[
            styles.adminAccessModal, 
            { 
              backgroundColor: colors.cardBackground || (theme === 'light' ? '#ffffff' : '#1F2633'),
              borderColor: colors.border || (theme === 'light' ? '#e0e0e0' : '#2A2F3A'),
              shadowColor: theme === 'light' ? '#000' : '#fff'
            }
          ]}>
            <View style={styles.adminAccessIconContainer}>
              <Ionicons name="shield-checkmark" size={48} color="#e74c3c" />
            </View>
            <Text style={[styles.adminAccessTitle, { color: colors.text || (theme === 'light' ? '#000' : '#fff') }]}>
              Access Restricted
            </Text>
            <Text style={[styles.adminAccessMessage, { color: colors.textSecondary || (theme === 'light' ? '#666' : '#999') }]}>
              You cannot view administrator profiles for security reasons.
            </Text>
            <TouchableOpacity
              style={[styles.adminAccessButton, { backgroundColor: '#28942c' }]}
              onPress={() => setAdminAccessDeniedModal(false)}
            >
              <Text style={styles.adminAccessButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ViewPost;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  postCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  postHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  postInfo: { 
    marginLeft: 12, 
    flex: 1 
  },
  postHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  postAuthor: { 
    fontSize: 16, 
    fontWeight: "600",
    flex: 1,
  },
  postTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  postTime: { 
    fontSize: 12, 
    opacity: 0.7 
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  categoryText: { 
    color: "#ffffff", 
    fontSize: 10, 
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  postCaption: { 
    fontSize: 16, 
    lineHeight: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  eventDetailsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  eventDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  imageCardVertical: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
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
  commentBottomSheetContainer: {
    height: "80%",
  },
  commentBottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  
  // Admin Access Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  adminAccessModal: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  adminAccessIconContainer: {
    marginBottom: 16,
  },
  adminAccessTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  adminAccessMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  adminAccessButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  adminAccessButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  postActions: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});
