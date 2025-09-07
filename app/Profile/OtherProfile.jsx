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
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import HeaderBack from "../../components/HeaderBack";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { authStorage, authService, buildStorageUrl, communityService } from "../../services/api";
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

const OtherProfile = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [hideSensitiveInfo, setHideSensitiveInfo] = useState(false);
  const [selectedChip, setSelectedChip] = useState("Posts");

  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [currentPostsPage, setCurrentPostsPage] = useState(1);
  const [hasMoreUserPosts, setHasMoreUserPosts] = useState(true);
  const [likedPosts, setLikedPosts] = useState({});
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [adminAccessDeniedModal, setAdminAccessDeniedModal] = useState(false);

  // Get userId from route params
  const searchParams = useLocalSearchParams();
  const { userId: rawUserId } = router.params || searchParams || {};
  const userId = rawUserId ? parseInt(rawUserId) : null;
  
  console.log('OtherProfile - userId:', userId);

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
  const buttonBackground = theme === "light" ? "#e1e5ea" : "#1F2633";
  const textColor = colors.text;

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  // Load user data
  const loadUserData = async () => {
    if (!userId) {
      console.log('No userId provided');
      return;
    }
    
    console.log('Loading user data for userId:', userId);
    setLoadingUser(true);
    
    try {
      // Load user profile data
      const response = await authService.getUserProfile(userId);
      
      if (response.success) {
        setUser(response.data);
        console.log('User data loaded successfully');
      } else {
        console.log('Failed to load user profile:', response.message);
        // Check if it's an admin access denial
        if (response.message && response.message.includes('access denied')) {
          setAdminAccessDeniedModal(true);
        } else {
          Alert.alert('Error', response.message || 'Failed to load user profile');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Check if it's a 404 error (user not found or admin access denied)
      if (error.response && error.response.status === 404) {
        setAdminAccessDeniedModal(true);
      } else {
        Alert.alert('Error', 'Failed to load user profile');
        router.back();
      }
    } finally {
      setLoadingUser(false);
    }
  };

  // Load user's posts
  const loadUserPosts = async (page = 1, append = false) => {
    if (!userId) return;
    
    try {
      if (page === 1) {
        setLoadingPosts(true);
      } else {
        setLoadingMorePosts(true);
      }
      
      const response = await communityService.getPosts({ 
        user_id: userId, 
        page,
        per_page: 20
      });
      
      if (response.success) {
        const postsData = response.data.data || [];
        const paginationData = response.data.links || {};
        
        if (append) {
          setUserPosts(prev => [...prev, ...postsData]);
        } else {
          setUserPosts(postsData);
        }
        
        // Check if there are more posts
        const hasMore = paginationData.next !== null && postsData.length > 0;
        setHasMoreUserPosts(hasMore);
        
        // If no posts received and not appending, set hasMoreUserPosts to false
        if (postsData.length === 0 && !append) {
          setHasMoreUserPosts(false);
        }
      }
    } catch (error) {
      console.error('Error loading user posts:', error);
    } finally {
      setLoadingPosts(false);
      setLoadingMorePosts(false);
    }
  };

  // Load posts when user is available
  useEffect(() => {
    if (userId) {
      setCurrentPostsPage(1);
      setHasMoreUserPosts(true);
      loadUserPosts(1, false);
    }
  }, [userId]);

  // Load more user posts
  const loadMoreUserPosts = async () => {
    if (!loadingMorePosts && hasMoreUserPosts && userId) {
      const nextPage = currentPostsPage + 1;
      setCurrentPostsPage(nextPage);
      await loadUserPosts(nextPage, true);
    }
  };

  // Reload posts when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        setCurrentPostsPage(1);
        setHasMoreUserPosts(true);
        loadUserPosts(1, false);
      }
    }, [userId])
  );

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh user data
      await loadUserData();
      
      // Refresh posts
      if (userId) {
        setCurrentPostsPage(1);
        setHasMoreUserPosts(true);
        await loadUserPosts(1, false);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Initialize like states from posts data
  useEffect(() => {
    if (userPosts.length > 0) {
      const initialLikedStates = {};
      userPosts.forEach(post => {
        initialLikedStates[post.id] = post.is_liked || false;
      });
      setLikedPosts(initialLikedStates);
    }
  }, [userPosts]);

  // Handle like toggle
  const handleToggleLike = async (postId) => {
    try {
      const response = await communityService.toggleLike(postId);
      
      if (response.success) {
        // Update like state
        setLikedPosts(prev => ({
          ...prev,
          [postId]: response.data.is_liked || false
        }));
        // Update the post in the posts array
        setUserPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes_count: response.data.likes_count || 0,
                is_liked: response.data.is_liked || false
              }
            : post
        ));
      } else {
        Alert.alert('Error', response.message || 'Failed to update like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
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
        setComments(prev => ({
          ...prev,
          [postId]: response.data || []
        }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Handle comment added
  const handleCommentAdded = async (newComment) => {
    if (!selectedPost || !newComment || !newComment.trim()) return;
    
    try {
      const response = await communityService.addComment(selectedPost.id, newComment.trim());
      if (response.success) {
        // Reload comments for this post
        await loadComments(selectedPost.id);
        // Update comment count in posts array
        setUserPosts(prev => prev.map(post => 
          post.id === selectedPost.id 
            ? { ...post, comments_count: (post.comments_count || 0) + 1 }
            : post
        ));
      } else {
        Alert.alert('Error', response.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
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
      <Ionicons name={icon} size={22} color={color || textColor} />
      <Text style={[styles.actionText, { color: color || textColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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
              {user?.name || 'Unknown User'}
            </Text>
            <Text style={styles.postTimestamp}>{formatTimeAgo(post.published_at)}</Text>
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
              colors={['#28942c']} // Android
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
          >
          </View>

          <View style={styles.profileImageContainer}>
            <View style={[styles.profileImage, { backgroundColor: "#e4e6ea" }]}>
              {user?.profile_picture ? (
                <Image
                  source={{ uri: buildStorageUrl(user.profile_picture) }}
                  style={{ width: 160, height: 160, borderRadius: 80 }}
                />
              ) : (
                <Ionicons name="person" size={40} color="#bcc0c4" />
              )}
            </View>
          </View>

          <Text style={[styles.name, { color: textColor }]}>
            {loadingUser ? 'Loading...' : (user?.name || '—')}
          </Text>
          <Text style={[styles.subText, { color: textColor }]}>
            Resident ID: {loadingUser ? 'Loading...' : (user?.resident_id || '—')}
          </Text>

          <View style={styles.profileActions}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: textColor }]}
              onPress={() => router.push("/Chat/ChatHomepage")}
            >
              <Ionicons name="chatbubble-outline" size={14} color={textColor} style={{ marginRight: 6 }} />
              <Text style={[styles.buttonText, { color: textColor }]}>
                Message
              </Text>
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
                      {loadingUser ? 'Loading...' : (user?.house?.house_number || '—')}
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
                      {loadingUser ? 'Loading...' : (user?.house?.street || '—')}
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
                      {loadingUser ? 'Loading...' : (user?.contact_no || '—')}
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
              {loadingUser ? (
                <View style={{ alignSelf: "stretch", marginBottom: 20 }}>
                  <Text style={[styles.subText, { color: textColor }]}>
                    Loading business information...
                  </Text>
                </View>
              ) : user?.vendor?.business_name && user?.vendor?.isAccepted ? (
                <View style={{ alignSelf: "stretch", marginBottom: 20 }}>
                  <View style={styles.businessInfoContainer}>
                    <Text style={[styles.businessName, { color: textColor }]}>
                      {user.vendor.business_name}
                    </Text>
                  </View>
                </View>
              ) : (user?.vendor?.business_name && !user?.vendor?.isAccepted) ? (
                <View style={{ alignSelf: "stretch", marginBottom: 20 }}>
                  <View style={[styles.pendingVendorContainer, { backgroundColor: "#f39c12" }]}>
                    <View style={styles.pendingVendorContent}>
                      <Ionicons 
                        name="time-outline" 
                        size={20} 
                        color="#ffffff" 
                        style={styles.pendingIcon}
                      />
                      <View style={styles.pendingTextContainer}>
                        <Text style={[styles.pendingTitle, { color: "#ffffff" }]}>
                          {user?.vendor?.business_name || 'Business'} - Pending
                        </Text>
                        <Text style={[styles.pendingSubtitle, { color: "#ffffff" }]}>
                          Business request is under review.
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
                </View>
              )}
            </View>
          ) : (
            <View style={{ width: "100%", paddingHorizontal: 16 }}>
              {/* Posts Section */}
              <Text style={[styles.sectionTitle, { marginLeft: 0 }]}>
                Posts
              </Text>

              {loadingPosts ? (
                <View style={[styles.loadingContainer, { backgroundColor: buttonBackground }]}>
                  <Text style={[styles.loadingText, { color: textColor }]}>
                    Loading posts...
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
                      <Text style={[styles.loadingMoreText, { color: textColor }]}>
                        Loading more posts...
                      </Text>
                    </View>
                  )}
                  
                  {/* Load More Button (fallback) */}
                  {hasMoreUserPosts && !loadingMorePosts && userPosts.length > 0 && (
                    <TouchableOpacity
                      style={[styles.loadMoreButton, { backgroundColor: buttonBackground }]}
                      onPress={loadMoreUserPosts}
                    >
                      <Text style={[styles.loadMoreButtonText, { color: textColor }]}>
                        Load More Posts
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {/* End of posts indicator */}
                  {!hasMoreUserPosts && userPosts.length > 0 && (
                    <View style={styles.endOfPostsContainer}>
                      <Text style={[styles.endOfPostsText, { color: textColor }]}>
                        You've reached the end of posts
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
                    This user hasn't shared anything yet.
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

        {/* Comment Modal */}
        <Modal
          visible={commentModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCommentModalVisible(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)' }]}>
            <View style={[styles.commentModalContent, { backgroundColor: cardBackground }]}>
              <View style={styles.commentModalHeader}>
                <Text style={[styles.commentModalTitle, { color: textColor }]}>
                  Comments ({selectedPost ? (comments[selectedPost.id] || []).length : 0})
                </Text>
                <TouchableOpacity 
                  onPress={() => setCommentModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              </View>
              
              <CommentSection
                comments={selectedPost ? (comments[selectedPost.id] || []) : []}
                onCommentAdd={handleCommentAdded}
                postId={selectedPost?.id}
              />
            </View>
          </View>
        </Modal>

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
                icon="close"
                label="Cancel"
                color="red"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </TouchableOpacity>
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
                onPress={() => {
                  setAdminAccessDeniedModal(false);
                  router.back();
                }}
              >
                <Text style={styles.adminAccessButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default OtherProfile;

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
  postImageContainer: {
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 10,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 12,
    color: 'gray',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  // Comment Modal Styles
  commentModalContent: {
    width: '100%',
    height: '80%',
    borderRadius: 16,
    padding: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  commentModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  // Business-related styles
  businessInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingIcon: {
    marginRight: 12,
  },
  pendingTextContainer: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pendingSubtitle: {
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 18,
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
  // Admin Access Modal Styles
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
});