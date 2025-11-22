import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import HeaderBack from "../../components/HeaderBack";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import {
  authStorage,
  authService,
  buildStorageUrl,
  communityService,
  vendorService,
} from "../../services/api";
import * as ImagePicker from "expo-image-picker";
import CommentSection from "../Community/CommentSection";
import { useFocusEffect } from "@react-navigation/native";

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

const MainProfile = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [hideSensitiveInfo, setHideSensitiveInfo] = useState(false);
  const [selectedChip, setSelectedChip] = useState("Posts");

  const [user, setUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [currentPostsPage, setCurrentPostsPage] = useState(1);
  const [hasMoreUserPosts, setHasMoreUserPosts] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [likedPosts, setLikedPosts] = useState({});
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editBusinessModalVisible, setEditBusinessModalVisible] =
    useState(false);
  const [becomeVendorModalVisible, setBecomeVendorModalVisible] =
    useState(false);
  const [businessName, setBusinessName] = useState("");
  const [vendorRequestModalVisible, setVendorRequestModalVisible] =
    useState(false);
  const [vendorRequestBusinessName, setVendorRequestBusinessName] =
    useState("");
  const [hasVendorRequest, setHasVendorRequest] = useState(false);
  const [vendorRequestStatus, setVendorRequestStatus] = useState(null);
  const [pendingBusinessName, setPendingBusinessName] = useState("");

  useEffect(() => {
    (async () => {
      const { user: cachedUser } = await authStorage.load();
      if (cachedUser) setUser(cachedUser);
      try {
        // Clear cache and force refresh to get latest user data including vendor info
        await authService.clearProfileCache();
        const fresh = await authService.getProfileCached({ force: true });
        setUser(fresh);
        await authStorage.save({ token: null, user: fresh });

        console.log("User vendor data:", fresh?.vendor);

        // Check vendor request status
        await checkVendorRequestStatus();
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    })();
  }, []);

  // Load user's posts
  const loadUserPosts = async (page = 1, append = false) => {
    if (!user?.id) return;

    try {
      if (page === 1) {
        setLoadingPosts(true);
      } else {
        setLoadingMorePosts(true);
      }

      const response = await communityService.getPosts({
        user_id: user.id,
        page,
        per_page: 20,
      });

      console.log("User Posts API Response:", {
        success: response.success,
        postsCount: response.data?.data?.length || 0,
        pagination: response.data?.links,
        currentPage: page,
        append,
        userId: user.id,
      });

      if (response.success) {
        const postsData = response.data.data || [];
        const paginationData = response.data.links || {};

        if (append) {
          setUserPosts((prev) => [...prev, ...postsData]);
        } else {
          setUserPosts(postsData);
        }

        // Check if there are more posts
        const hasMore = paginationData.next !== null && postsData.length > 0;
        console.log(
          "Has more user posts:",
          hasMore,
          "Next URL:",
          paginationData.next,
          "Posts received:",
          postsData.length
        );
        setHasMoreUserPosts(hasMore);

        // If no posts received and not appending, set hasMoreUserPosts to false
        if (postsData.length === 0 && !append) {
          setHasMoreUserPosts(false);
        }
      }
    } catch (error) {
      console.error("Error loading user posts:", error);
    } finally {
      setLoadingPosts(false);
      setLoadingMorePosts(false);
    }
  };

  // Load posts when user is available
  useEffect(() => {
    if (user?.id) {
      setCurrentPostsPage(1);
      setHasMoreUserPosts(true);
      loadUserPosts(1, false);
    }
  }, [user?.id]);

  // Load more user posts
  const loadMoreUserPosts = async () => {
    console.log("loadMoreUserPosts called:", {
      loadingMorePosts,
      hasMoreUserPosts,
      currentPostsPage,
      userId: user?.id,
    });
    if (!loadingMorePosts && hasMoreUserPosts && user?.id) {
      const nextPage = currentPostsPage + 1;
      console.log("Loading more user posts, next page:", nextPage);
      setCurrentPostsPage(nextPage);
      await loadUserPosts(nextPage, true);
    }
  };

  // Reload posts when screen comes into focus (after posting)
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        setCurrentPostsPage(1);
        setHasMoreUserPosts(true);
        loadUserPosts(1, false);
      }
    }, [user?.id])
  );

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh user data
      await authService.clearProfileCache();
      const freshUser = await authService.getProfileCached({ force: true });
      setUser(freshUser);
      await authStorage.save({ token: null, user: freshUser });

      // Refresh posts
      if (freshUser?.id) {
        setCurrentPostsPage(1);
        setHasMoreUserPosts(true);
        await loadUserPosts(1, false);
      }

      // Check vendor request status
      await checkVendorRequestStatus();
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Initialize like states from posts data
  useEffect(() => {
    if (userPosts.length > 0) {
      const initialLikedStates = {};
      userPosts.forEach((post) => {
        // Initialize with is_liked from API, or default to false
        initialLikedStates[post.id] = post.is_liked || false;
      });
      setLikedPosts(initialLikedStates);
    }
  }, [userPosts]);

  // Handle edit post
  const handleEditPost = (post) => {
    setSelectedPost(post);
    setEditCaption(post.content || "");
    setEditModalVisible(true);
  };

  // Handle update post
  const handleUpdatePost = async () => {
    if (!selectedPost || !editCaption.trim()) return;

    try {
      const response = await communityService.updatePost(selectedPost.id, {
        content: editCaption.trim(),
        type: selectedPost.type,
        category: selectedPost.category,
        visibility: selectedPost.visibility,
      });

      if (response.success) {
        setEditModalVisible(false);
        setSelectedPost(null);
        setEditCaption("");
        setCurrentPostsPage(1);
        setHasMoreUserPosts(true);
        await loadUserPosts(1, false); // Refresh posts
        setSuccessMessage("Post updated successfully!");
        setSuccessModalVisible(true);
      } else {
        Alert.alert("Error", response.message || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      Alert.alert("Error", "Failed to update post. Please try again.");
    }
  };

  // Handle delete post
  const handleDeletePost = (post) => {
    setSelectedPost(post);
    setDeleteModalVisible(true);
  };

  // Confirm delete post
  const confirmDeletePost = async () => {
    if (!selectedPost) return;

    try {
      const response = await communityService.deletePost(selectedPost.id);

      if (response.success) {
        setDeleteModalVisible(false);
        setSelectedPost(null);
        setCurrentPostsPage(1);
        setHasMoreUserPosts(true);
        await loadUserPosts(1, false); // Refresh posts
        setSuccessMessage("Post deleted successfully!");
        setSuccessModalVisible(true);
      } else {
        Alert.alert("Error", response.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      Alert.alert("Error", "Failed to delete post. Please try again.");
    }
  };

  // Handle like toggle
  const handleToggleLike = async (postId) => {
    try {
      const response = await communityService.toggleLike(postId);

      if (response.success) {
        // Update like state
        setLikedPosts((prev) => ({
          ...prev,
          [postId]: response.data.is_liked || false,
        }));
        // Update the post in the posts array
        setUserPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes_count: response.data.likes_count || 0,
                  is_liked: response.data.is_liked || false,
                }
              : post
          )
        );
      } else {
        Alert.alert("Error", response.message || "Failed to update like");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      Alert.alert("Error", "Failed to update like. Please try again.");
    }
  };

  // Handle comment button press
  const handleCommentPress = (post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
    loadComments(post.id);
  };

  // Load comments for a post
  const loadComments = async (postId) => {
    try {
      setLoadingComments(true);
      const response = await communityService.getComments(postId);
      if (response.success) {
        setComments((prev) => ({
          ...prev,
          [postId]: response.data || [],
        }));
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Handle comment added
  const handleCommentAdded = async (newComment) => {
    if (!selectedPost || !newComment || !newComment.trim()) return;

    try {
      const response = await communityService.addComment(
        selectedPost.id,
        newComment.trim()
      );
      if (response.success) {
        // Reload comments for this post
        await loadComments(selectedPost.id);
        // Update comment count in posts array
        setUserPosts((prev) =>
          prev.map((post) =>
            post.id === selectedPost.id
              ? { ...post, comments_count: (post.comments_count || 0) + 1 }
              : post
          )
        );
      } else {
        Alert.alert("Error", response.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment. Please try again.");
    }
  };

  // Handle edit business
  const handleEditBusiness = () => {
    setBusinessName(user?.vendor?.business_name || "");
    setEditBusinessModalVisible(true);
  };

  // Handle update business
  const handleUpdateBusiness = async () => {
    if (!businessName.trim()) {
      Alert.alert("Error", "Business name is required");
      return;
    }

    try {
      const response = await vendorService.updateVendorProfile(
        businessName.trim()
      );
      if (response.success) {
        setEditBusinessModalVisible(false);
        setBusinessName("");
        // Refresh user data
        await authService.clearProfileCache();
        const freshUser = await authService.getProfileCached({ force: true });
        setUser(freshUser);
        await authStorage.save({ token: null, user: freshUser });
        setSuccessMessage("Business name updated successfully!");
        setSuccessModalVisible(true);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to update business name"
        );
      }
    } catch (error) {
      console.error("Error updating business name:", error);
      Alert.alert("Error", "Failed to update business name. Please try again.");
    }
  };

  // Handle become vendor
  const handleBecomeVendor = () => {
    setVendorRequestBusinessName("");
    setVendorRequestModalVisible(true);
  };

  // Check vendor request status
  const checkVendorRequestStatus = async () => {
    try {
      const response = await vendorService.checkVendorRequestStatus();
      console.log("Vendor request status response:", response);
      if (response.success) {
        setHasVendorRequest(response.data.has_request);
        setVendorRequestStatus(response.data.status);
        setPendingBusinessName(response.data.business_name || "");
        console.log("Vendor status set:", {
          hasVendorRequest: response.data.has_request,
          status: response.data.status,
          businessName: response.data.business_name,
        });
      }
    } catch (error) {
      console.error("Error checking vendor request status:", error);
    }
  };

  // Handle vendor request submission
  const handleVendorRequest = async () => {
    if (!vendorRequestBusinessName.trim()) {
      Alert.alert("Error", "Business name is required");
      return;
    }

    try {
      const response = await vendorService.createVendorRequest(
        vendorRequestBusinessName.trim()
      );
      if (response.success) {
        setVendorRequestModalVisible(false);
        setVendorRequestBusinessName("");
        setHasVendorRequest(true);
        setVendorRequestStatus("pending");
        setPendingBusinessName(vendorRequestBusinessName.trim());
        setSuccessMessage(
          "Vendor request submitted successfully! Please wait for admin approval."
        );
        setSuccessModalVisible(true);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to submit vendor request"
        );
      }
    } catch (error) {
      console.error("Error submitting vendor request:", error);
      Alert.alert(
        "Error",
        "Failed to submit vendor request. Please try again."
      );
    }
  };

  const pickAndUploadProfilePicture = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "You need to allow gallery access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      try {
        setIsUploading(true);
        await authService.uploadProfilePicture(result.assets[0].uri);
        const fresh = await authService.getProfileCached({ force: true });
        setUser(fresh);
      } catch (e) {
        Alert.alert("Error", "Failed to upload profile picture.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
  const buttonBackground = theme === "light" ? "#e1e5ea" : "#1F2633";
  const textColor = colors.text;

  const residentData = {
    residentName: user?.name || "",
    residentID: user?.resident_id || "",
    houseNumber: user?.house?.house_number || "",
    street: user?.house?.street || "",
    contactNumber: user?.contact_no || "",
    businessName: user?.vendor?.business_name || "",
    posts: [],
  };

  const handlePickProfilePicture = () => {
    console.log("Open camera or gallery to pick profile picture.");
  };

  const PostCard = ({ post }) => {
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

    return (
      <View style={[styles.postCard, { backgroundColor: cardBackground }]}>
        <View style={styles.postHeader}>
          <View style={styles.postAvatar}>
            {user?.profile_picture ? (
              <Image
                source={{ uri: buildStorageUrl(user.profile_picture) }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={20} color="#ccc" />
            )}
          </View>
          <View style={styles.postHeaderText}>
            <Text style={[styles.postAuthor, { color: textColor }]}>
              {user?.name || "You"}
            </Text>
            <Text style={styles.postTimestamp}>
              {formatTimeAgo(post.published_at)}
            </Text>
          </View>
          <View style={styles.postActions}>
            <TouchableOpacity
              style={styles.actionButtonSmall}
              onPress={() => handleEditPost(post)}
            >
              <Ionicons name="create-outline" size={16} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButtonSmall}
              onPress={() => handleDeletePost(post)}
            >
              <Ionicons name="trash-outline" size={16} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>

        {post.content && (
          <Text style={[styles.postContent, { color: textColor }]}>
            {post.content}
          </Text>
        )}

        {post.images && post.images.length > 0 && (
          <View style={styles.postImageContainer}>
            <Image
              source={{ uri: buildStorageUrl(post.images[0]) }}
              style={styles.postImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.postStats}>
          <TouchableOpacity
            style={styles.postStat}
            onPress={() => handleToggleLike(post.id)}
          >
            <Ionicons
              name={likedPosts[post.id] ? "heart" : "heart-outline"}
              size={16}
              color={likedPosts[post.id] ? "#28942c" : "gray"}
            />
            <Text style={styles.postStatText}>{post.likes_count || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.postStat}
            onPress={() => handleCommentPress(post)}
          >
            <Ionicons name="chatbubble-outline" size={16} color="gray" />
            <Text style={styles.postStatText}>{post.comments_count || 0}</Text>
          </TouchableOpacity>
        </View>
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <HeaderBack title="Profile" onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { flexGrow: 1 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#28942c"]} // Android
              tintColor="#28942c" // iOS
            />
          }
          onEndReached={loadMoreUserPosts}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={true}
        >
          <View
            style={[
              styles.coverPhotoWrapper,
              { backgroundColor: buttonBackground },
            ]}
          ></View>

          <View style={styles.profileImageContainer}>
            <View style={[styles.profileImage, { backgroundColor: "#e4e6ea" }]}>
              {user?.profile_picture ? (
                <Image
                  source={{ uri: buildStorageUrl(user.profile_picture) }}
                  style={{ width: 160, height: 160, borderRadius: 80 }}
                />
              ) : (
                <Ionicons name="camera" size={40} color="#bcc0c4" />
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.cameraButtonLarge,
                { backgroundColor: buttonBackground },
              ]}
              onPress={pickAndUploadProfilePicture}
              disabled={isUploading}
            >
              <Ionicons name="camera" size={16} color={textColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.nameContainer}>
            <Text style={[styles.name, { color: textColor }]}>
              {residentData.residentName || "—"}
            </Text>
          </View>

          <Text style={[styles.subText, { color: textColor }]}>
            Resident ID: {residentData.residentID || "—"}
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
                      {residentData.houseNumber || "—"}
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
                      {residentData.street || "—"}
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
                      {residentData.contactNumber || "—"}
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
              {user?.vendor?.business_name && user?.vendor?.isAccepted ? (
                <View style={{ alignSelf: "stretch", marginBottom: 20 }}>
                  <View style={styles.businessInfoContainer}>
                    <Text style={[styles.businessName, { color: textColor }]}>
                      {user.vendor.business_name}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.editBusinessButton,
                        { backgroundColor: buttonBackground },
                      ]}
                      onPress={handleEditBusiness}
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color={textColor}
                      />
                      <Text
                        style={[
                          styles.editBusinessButtonText,
                          { color: textColor },
                        ]}
                      >
                        Edit
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (hasVendorRequest && vendorRequestStatus === "pending") ||
                (user?.vendor?.business_name && !user?.vendor?.isAccepted) ? (
                <View style={{ alignSelf: "stretch", marginBottom: 20 }}>
                  <View
                    style={[
                      styles.pendingVendorContainer,
                      { backgroundColor: "#f39c12" },
                    ]}
                  >
                    <View style={styles.pendingVendorContent}>
                      <Ionicons
                        name="time-outline"
                        size={20}
                        color="#ffffff"
                        style={styles.pendingIcon}
                      />
                      <View style={styles.pendingTextContainer}>
                        <Text
                          style={[styles.pendingTitle, { color: "#ffffff" }]}
                        >
                          {user?.vendor?.business_name ||
                            pendingBusinessName ||
                            "Business"}{" "}
                          - Pending
                        </Text>
                        <Text
                          style={[styles.pendingSubtitle, { color: "#ffffff" }]}
                        >
                          Your business request is under review. You'll be
                          notified once approved.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={{ alignSelf: "stretch", marginBottom: 20 }}>
                  <Text style={[styles.subText, { color: textColor }]}>
                    No business registered
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.becomeVendorButton,
                      { backgroundColor: "#28942c" },
                    ]}
                    onPress={handleBecomeVendor}
                  >
                    <Text style={styles.becomeVendorButtonText}>
                      Become a Vendor
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={{ width: "100%", paddingHorizontal: 16 }}>
              {/* Posts Section */}
              <Text style={[styles.sectionTitle, { marginLeft: 0 }]}>
                Posts
              </Text>
              <View style={styles.avatarContainer}>
                <View style={styles.placeholder}>
                  {user?.profile_picture ? (
                    <Image
                      source={{ uri: buildStorageUrl(user.profile_picture) }}
                      style={styles.placeholderImage}
                    />
                  ) : (
                    <Ionicons name="person" size={24} color="#ccc" />
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.inputButton,
                    { borderColor: textColor, flex: 1 },
                  ]}
                  onPress={() => router.push("/Community/CreatePost")}
                >
                  <Text style={[styles.inputButtonText, { color: textColor }]}>
                    What's on your mind?
                  </Text>
                </TouchableOpacity>
              </View>

              {loadingPosts ? (
                <View
                  style={[
                    styles.loadingContainer,
                    { backgroundColor: buttonBackground },
                  ]}
                >
                  <Text style={[styles.loadingText, { color: textColor }]}>
                    Loading your posts...
                  </Text>
                </View>
              ) : userPosts.length > 0 ? (
                <>
                  {userPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}

                  {/* Loading more indicator */}
                  {loadingMorePosts && userPosts.length > 0 && (
                    <View style={styles.loadingMoreContainer}>
                      <Text
                        style={[styles.loadingMoreText, { color: textColor }]}
                      >
                        Loading more posts...
                      </Text>
                    </View>
                  )}

                  {/* Load More Button (fallback) */}
                  {hasMoreUserPosts &&
                    !loadingMorePosts &&
                    userPosts.length > 0 && (
                      <TouchableOpacity
                        style={[
                          styles.loadMoreButton,
                          { backgroundColor: buttonBackground },
                        ]}
                        onPress={loadMoreUserPosts}
                      >
                        <Text
                          style={[
                            styles.loadMoreButtonText,
                            { color: textColor },
                          ]}
                        >
                          Load More Posts
                        </Text>
                      </TouchableOpacity>
                    )}

                  {/* End of posts indicator */}
                  {!hasMoreUserPosts && userPosts.length > 0 && (
                    <View style={styles.endOfPostsContainer}>
                      <Text
                        style={[styles.endOfPostsText, { color: textColor }]}
                      >
                        You've reached the end of your posts
                      </Text>
                    </View>
                  )}
                </>
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

        {/* Privacy Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: cardBackground }]}
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
                Hide to Other users
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

        {/* Edit Post Modal */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.editModalContent,
                { backgroundColor: cardBackground },
              ]}
            >
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Edit Post
              </Text>

              {selectedPost?.images && selectedPost.images.length > 0 && (
                <View style={styles.editImageContainer}>
                  <Image
                    source={{ uri: buildStorageUrl(selectedPost.images[0]) }}
                    style={styles.editImage}
                    resizeMode="cover"
                  />
                  <Text style={[styles.editImageNote, { color: textColor }]}>
                    Image cannot be changed
                  </Text>
                </View>
              )}

              <TextInput
                style={[
                  styles.editTextInput,
                  {
                    color: textColor,
                    borderColor: textColor,
                    backgroundColor: buttonBackground,
                  },
                ]}
                placeholder="What's on your mind?"
                placeholderTextColor="#888"
                multiline
                value={editCaption}
                onChangeText={setEditCaption}
                maxLength={5000}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setEditModalVisible(false);
                    setSelectedPost(null);
                    setEditCaption("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdatePost}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={deleteModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.deleteModalContent,
                { backgroundColor: cardBackground },
              ]}
            >
              <Text style={[styles.deleteModalTitle, { color: textColor }]}>
                Delete Post
              </Text>
              <Text style={[styles.deleteModalMessage, { color: textColor }]}>
                Are you sure you want to delete this post? This action cannot be
                undone.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setDeleteModalVisible(false);
                    setSelectedPost(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={confirmDeletePost}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Success Modal */}
        <Modal
          visible={successModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSuccessModalVisible(false)}
        >
          <View
            style={[
              styles.modalOverlay,
              {
                backgroundColor:
                  theme === "light"
                    ? "rgba(0, 0, 0, 0.5)"
                    : "rgba(0, 0, 0, 0.7)",
              },
            ]}
          >
            <View
              style={[
                styles.successModal,
                {
                  backgroundColor:
                    colors.cardBackground ||
                    (theme === "light" ? "#ffffff" : "#1F2633"),
                  borderColor:
                    colors.border ||
                    (theme === "light" ? "#e0e0e0" : "#2A2F3A"),
                  shadowColor: theme === "light" ? "#000" : "#fff",
                },
              ]}
            >
              <Text
                style={[
                  styles.successTitle,
                  {
                    color: colors.text || (theme === "light" ? "#000" : "#fff"),
                  },
                ]}
              >
                Success!
              </Text>
              <Text
                style={[
                  styles.successMessage,
                  {
                    color:
                      colors.textSecondary ||
                      (theme === "light" ? "#666" : "#999"),
                  },
                ]}
              >
                {successMessage}
              </Text>
              <TouchableOpacity
                style={[styles.successButton, { backgroundColor: "#28942c" }]}
                onPress={() => setSuccessModalVisible(false)}
              >
                <Text style={styles.successButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Comment Modal */}
        <Modal
          visible={commentModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCommentModalVisible(false)}
        >
          <View
            style={[
              styles.modalOverlay,
              {
                backgroundColor:
                  theme === "light"
                    ? "rgba(0, 0, 0, 0.5)"
                    : "rgba(0, 0, 0, 0.7)",
              },
            ]}
          >
            <View
              style={[
                styles.commentModalContent,
                { backgroundColor: cardBackground },
              ]}
            >
              <View style={styles.commentModalHeader}>
                <Text style={[styles.commentModalTitle, { color: textColor }]}>
                  Comments (
                  {selectedPost ? (comments[selectedPost.id] || []).length : 0})
                </Text>
                <TouchableOpacity
                  onPress={() => setCommentModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              </View>

              <CommentSection
                comments={selectedPost ? comments[selectedPost.id] || [] : []}
                onCommentAdd={handleCommentAdded}
                postId={selectedPost?.id}
              />
            </View>
          </View>
        </Modal>

        {/* Edit Business Modal */}
        <Modal
          visible={editBusinessModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditBusinessModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.editModalContent,
                { backgroundColor: cardBackground },
              ]}
            >
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Edit Business Name
              </Text>

              <TextInput
                style={[
                  styles.editTextInput,
                  {
                    color: textColor,
                    borderColor: textColor,
                    backgroundColor: buttonBackground,
                  },
                ]}
                placeholder="Enter business name"
                placeholderTextColor="#888"
                value={businessName}
                onChangeText={setBusinessName}
                maxLength={255}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setEditBusinessModalVisible(false);
                    setBusinessName("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdateBusiness}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Vendor Request Modal */}
        <Modal
          visible={vendorRequestModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setVendorRequestModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.editModalContent,
                { backgroundColor: cardBackground },
              ]}
            >
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Become a Vendor
              </Text>
              <Text style={[styles.modalSubtitle, { color: textColor }]}>
                Enter your business name to submit a vendor request. Admin
                approval is required.
              </Text>

              <TextInput
                style={[
                  styles.editTextInput,
                  {
                    color: textColor,
                    borderColor: textColor,
                    backgroundColor: buttonBackground,
                  },
                ]}
                placeholder="Enter business name"
                placeholderTextColor="#888"
                value={vendorRequestBusinessName}
                onChangeText={setVendorRequestBusinessName}
                maxLength={255}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setVendorRequestModalVisible(false);
                    setVendorRequestBusinessName("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleVendorRequest}
                >
                  <Text style={styles.saveButtonText}>Submit Request</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default MainProfile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
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

  name: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  nameContainer: {
    width: "90%",
    alignItems: "center",
    paddingHorizontal: 16,
  },
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
  buttonAlt: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: "100%",
  },
  buttonAltText: {
    fontSize: 14,
    fontWeight: "500",
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
  // New styles for posts and modals
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  placeholderImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  postImageContainer: {
    marginVertical: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: 200,
  },
  postStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 10,
  },
  postStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  postStatText: {
    fontSize: 12,
    color: "gray",
  },
  actionButtonSmall: {
    padding: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  loadingContainer: {
    width: "100%",
    borderRadius: 10,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  // Edit Modal Styles
  editModalContent: {
    width: "90%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  editImageContainer: {
    width: "100%",
    marginBottom: 15,
    alignItems: "center",
  },
  editImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  editImageNote: {
    fontSize: 12,
    fontStyle: "italic",
    opacity: 0.7,
  },
  editTextInput: {
    width: "100%",
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  // Delete Modal Styles
  deleteModalContent: {
    width: "85%",
    maxWidth: 350,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  deleteModalMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  // Modal Button Styles
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
  },
  saveButton: {
    backgroundColor: "#28942c",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  // Success Modal Styles
  successModal: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  successButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  successButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Comment Modal Styles
  commentModalContent: {
    width: "100%",
    height: "80%",
    borderRadius: 16,
    padding: 0,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  commentModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  commentModalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  // Business-related styles
  businessInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  editBusinessButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  editBusinessButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  becomeVendorButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  becomeVendorButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  // Infinite scroll styles
  loadingMoreContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingMoreText: {
    fontSize: 14,
    opacity: 0.7,
  },
  endOfPostsContainer: {
    padding: 20,
    alignItems: "center",
  },
  endOfPostsText: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: "italic",
  },
  loadMoreButton: {
    margin: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  loadMoreButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Pending vendor styles
  pendingVendorContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f39c12",
  },
  pendingVendorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  pendingIcon: {
    marginRight: 12,
  },
  pendingTextContainer: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  pendingSubtitle: {
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 18,
  },
});
