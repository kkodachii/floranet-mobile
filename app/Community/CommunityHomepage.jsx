import React, { useEffect, useRef, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Animated,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { communityService, buildStorageUrl, authService } from "../../services/api";

import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import CommentSection from "./CommentSection";

const CHIP_LABELS = ["All", "Events", "Announcements", "Businesses", "Projects"];
const CATEGORY_MAP = {
  All: "all",
  Events: "events",
  Announcements: "announcement",
  Businesses: "business",
  Projects: "project",
};

const CategoryBadge = ({ category }) => {
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

  return (
    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(category) }]}>
      <Text style={styles.categoryText}>{category?.toUpperCase() || "GENERAL"}</Text>
    </View>
  );
};

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

const CommunityHomepage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
  const buttonBackground = theme === "light" ? "#e1e5ea" : "#1F2633";
  const textColor = colors.text;

  const [selectedChip, setSelectedChip] = useState("All");
  const [interestedStates, setInterestedStates] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [comments, setComments] = useState({});
  const [isCommentSheetVisible, setCommentSheetVisible] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Fetch posts from API
  const fetchPosts = async (category = null, page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const params = { page, per_page: 20 };
      if (category && category !== "All") {
        params.category = CATEGORY_MAP[category];
      }
      
      const response = await communityService.getPosts(params);
      console.log('API Response:', { 
        success: response.success, 
        postsCount: response.data?.data?.length || 0,
        pagination: response.data?.links,
        currentPage: page,
        append
      });
      
      if (response.success) {
        const postsData = response.data.data || [];
        const paginationData = response.data.links || {};
        
        if (append) {
          setPosts(prev => [...prev, ...postsData]);
        } else {
          setPosts(postsData);
        }
        
        // Check if there are more posts
        const hasMore = paginationData.next !== null && postsData.length > 0;
        console.log('Has more posts:', hasMore, 'Next URL:', paginationData.next, 'Posts received:', postsData.length);
        setHasMorePosts(hasMore);
        
        // If no posts received and not appending, set hasMorePosts to false
        if (postsData.length === 0 && !append) {
          setHasMorePosts(false);
        }
        
        // Initialize like states from API data
        const initialLikedStates = {};
        const initialInterestedStates = {};
        postsData.forEach(post => {
          // Handle both is_liked and is_interested fields
          // Also check for alternative field names that might be used
          const isLiked = post.is_liked !== undefined ? post.is_liked : 
                         post.liked !== undefined ? post.liked : 
                         post.user_liked !== undefined ? post.user_liked : false;
          
          const isInterested = post.is_interested !== undefined ? post.is_interested : 
                              post.interested !== undefined ? post.interested : 
                              post.user_interested !== undefined ? post.user_interested : false;
          
          if (isLiked !== false) {
            initialLikedStates[post.id] = isLiked;
          }
          if (isInterested !== false) {
            initialInterestedStates[post.id] = isInterested;
          }
        });
        
        if (append) {
          setLikedPosts(prev => ({ ...prev, ...initialLikedStates }));
          setInterestedStates(prev => ({ ...prev, ...initialInterestedStates }));
        } else {
          setLikedPosts(initialLikedStates);
          setInterestedStates(initialInterestedStates);
        }
      } else {
        Alert.alert("Error", response.message || "Failed to load posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Refresh posts
  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMorePosts(true);
    await fetchPosts(selectedChip, 1, false);
    setRefreshing(false);
  };

  // Load more posts
  const loadMorePosts = async () => {
    console.log('loadMorePosts called:', { loadingMore, hasMorePosts, currentPage });
    if (!loadingMore && hasMorePosts) {
      const nextPage = currentPage + 1;
      console.log('Loading more posts, next page:', nextPage);
      setCurrentPage(nextPage);
      await fetchPosts(selectedChip, nextPage, true);
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

  // Load comments for a post
  const loadComments = async (postId) => {
    try {
      const response = await communityService.getComments(postId);
      if (response.success) {
        console.log("Comments loaded for post", postId, ":", response.data);
        setComments(prev => ({
          ...prev,
          [postId]: response.data || []
        }));
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  // Toggle like on a post
  const toggleLike = async (postId) => {
    try {
      const response = await communityService.toggleLike(postId);
      if (response.success) {
        setLikedPosts(prev => ({
          ...prev,
          [postId]: response.data.is_liked
        }));
        // Update the post in the posts array
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: response.data.likes_count }
            : post
        ));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      Alert.alert("Error", "Failed to update like. Please try again.");
    }
  };

  useEffect(() => {
    fetchPosts();
    loadCurrentUser();
  }, []);

  // Refresh posts when returning to this screen (e.g., after creating a post)
  useFocusEffect(
    React.useCallback(() => {
      fetchPosts(selectedChip);
    }, [selectedChip])
  );

  // Load current user data
  const loadCurrentUser = async () => {
    try {
      const userData = await authService.getProfileCached();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const animate = () => {
      if (!isMounted) return;
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(animate, 3000);
      });
    };
    animate();
    return () => {
      isMounted = false;
    };
  }, [fadeAnim]);

  const chipRefs = useRef({});
  const chipScrollRef = useRef(null);
  const handleChipPress = (label) => {
    setSelectedChip(label);
    setCurrentPage(1);
    setHasMorePosts(true);
    fetchPosts(label, 1, false);
    const chipRef = chipRefs.current[label];
    if (chipRef && chipScrollRef.current) {
      chipRef.measureLayout(
        chipScrollRef.current,
        (x) => chipScrollRef.current.scrollTo({ x: x - 16, animated: true }),
        (e) => console.warn("Measure error", e)
      );
    }
  };

  const openCommentSheet = (postId) => {
    setSelectedPostIndex(postId);
    setCommentSheetVisible(true);
    loadComments(postId);
  };
  
  const closeCommentSheet = () => {
    setCommentSheetVisible(false);
    setSelectedPostIndex(null);
  };

  const handleCommentAdded = async (newComment) => {
    if (selectedPostIndex === null || !newComment || !newComment.trim()) return;
    
    try {
      const response = await communityService.addComment(selectedPostIndex, newComment.trim());
      if (response.success) {
        // Reload comments for this post
        await loadComments(selectedPostIndex);
        // Update comment count in posts array
        setPosts(prev => prev.map(post => 
          post.id === selectedPostIndex 
            ? { ...post, comments_count: (post.comments_count || 0) + 1 }
            : post
        ));
      } else {
        Alert.alert("Error", response.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment. Please try again.");
    }
  };

  const handleChatPress = () => router.push("/Chat/ChatHomepage");
  const goToCreatePost = () => router.push("/Community/CreatePost");
  const goToSearch = () => router.push("/Community/Search");
  
  // Handle profile navigation
  const handleProfilePress = (postUserId) => {
    if (currentUser && postUserId === currentUser.id) {
      // Navigate to own profile
      router.push("/Profile/MainProfile");
    } else {
      // Navigate to other user's profile
      router.push({
        pathname: "/Profile/OtherProfile",
        params: { userId: postUserId }
      });
    }
  };
  const goToViewPost = (postData) => {
    // Navigate to ViewPost page with post data
    router.push({
      pathname: "/Community/ViewPost",
      params: {
        postId: postData.id.toString(),
        postData: JSON.stringify(postData),
      },
    });
  };

  const renderChips = () => (
    <ScrollView
      ref={chipScrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6 }}
    >
      {CHIP_LABELS.map((label) => {
        const isSelected = label === selectedChip;
        return (
          <View
            key={label}
            ref={(r) => (chipRefs.current[label] = r)}
            style={{ marginRight: 8 }}
          >
            <TouchableOpacity
              onPress={() => handleChipPress(label)}
              style={[
                styles.chip,
                { backgroundColor: isSelected ? "#28942c" : buttonBackground },
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
          </View>
        );
      })}
    </ScrollView>
  );

  const renderEventCard = (post, isInterested) => {
    const eventDetails = parseEventDetails(post.content);
    
    return (
      <View
        key={`event-${post.id}`}
        style={[styles.eventCard, { backgroundColor: cardBackground }]}
      >
        {post.images && post.images.length > 0 ? (
          <TouchableOpacity
            style={styles.eventImageContainer}
            onPress={() => goToViewPost(post)}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: buildStorageUrl(post.images[0]) }}
              style={styles.eventImage}
              imageStyle={styles.eventImageStyle}
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.7)", "transparent", "rgba(0,0,0,0.7)"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />

              <CategoryBadge category={post.category} />
              <TouchableOpacity
                style={[
                  styles.interestButtonOverlay,
                  {
                    backgroundColor: isInterested
                      ? "rgba(40,148,44,0.95)"
                      : "rgba(255,255,255,0.9)",
                  },
                ]}
                onPress={async (e) => {
                  e.stopPropagation();
                  try {
                    await toggleLike(post.id);
                    setInterestedStates((prev) => ({
                      ...prev,
                      [post.id]: !prev[post.id],
                    }));
                  } catch (error) {
                    console.error('Error toggling like:', error);
                  }
                }}
              >
                <Text
                  style={[
                    styles.interestButtonOverlayText,
                    { color: isInterested ? "#fff" : "#000" },
                  ]}
                >
                  Interested
                </Text>
              </TouchableOpacity>
            </ImageBackground>
          </TouchableOpacity>
        ) : (
          <View style={styles.eventHeaderContainer}>
            <View style={styles.eventHeaderTop}>
              <CategoryBadge category={post.category} />
              <TouchableOpacity
                style={[
                  styles.interestButton,
                  {
                    backgroundColor: isInterested ? "#28942c" : "#e0e0e0",
                  },
                ]}
                onPress={async () => {
                  try {
                    await toggleLike(post.id);
                    setInterestedStates((prev) => ({
                      ...prev,
                      [post.id]: !prev[post.id],
                    }));
                  } catch (error) {
                    console.error('Error toggling like:', error);
                  }
                }}
              >
                <Text
                  style={[
                    styles.interestButtonText,
                    { color: isInterested ? "#fff" : "#000" },
                  ]}
                >
                  Interested
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.eventDetailsContainer}>
          <Text style={[styles.eventTitleMain, { color: textColor }]}>
            {eventDetails.description}
          </Text>
          <Text
            style={[
              styles.eventSubtitle,
              { color: textColor, opacity: 0.8, marginBottom: 12 },
            ]}
          >
            Hosted by {post.user?.is_admin ? 'Administrator' : (post.user?.name || 'Unknown User')}
          </Text>

          <View style={styles.eventMeta}>
            {eventDetails.date && (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color={textColor} />
                <Text style={[styles.metaText, { color: textColor }]}>
                  {eventDetails.date}
                </Text>
              </View>
            )}

            {eventDetails.time && (
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={16} color={textColor} />
                <Text style={[styles.metaText, { color: textColor }]}>
                  {eventDetails.time}
                </Text>
              </View>
            )}

            {eventDetails.location && (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color={textColor} />
                <Text style={[styles.metaText, { color: textColor }]}>
                  {eventDetails.location}
                </Text>
              </View>
            )}

            {!eventDetails.date && !eventDetails.time && !eventDetails.location && (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color={textColor} />
                <Text style={[styles.metaText, { color: textColor }]}>
                  {new Date(post.published_at).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderPostCard = (post) => {
    const lowerCat = (post.category || "").toLowerCase();
    const isVendorOrBusiness = ["business"].includes(lowerCat);
    const isAnnouncement = lowerCat === "announcement";
    const isLiked = !!likedPosts[post.id];

    return (
      <View
        key={`post-${post.id}`}
        style={[styles.postCard, { backgroundColor: cardBackground }]}
      >
        <TouchableOpacity
          onPress={() => handleProfilePress(post.user?.id)}
          style={styles.postHeaderRow}
        >
          <View style={styles.avatarContainer}>
            {post.user?.profile_picture ? (
              <Image 
                source={{ uri: buildStorageUrl(post.user.profile_picture) }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="person" size={24} color="#ccc" />
              </View>
            )}
          </View>

          <View style={{ marginLeft: 10, flex: 1 }}>
            <View style={styles.postHeaderTop}>
              <Text style={[styles.postName, { color: textColor }]}>
                {post.user?.is_admin ? 'Administrator' : (post.user?.name || 'Unknown User')}
              </Text>
              <CategoryBadge category={post.category} />
            </View>
            <View style={styles.postTimeContainer}>
              <Ionicons name="globe-outline" size={12} color={textColor} style={{ marginRight: 4 }} />
              <Text style={[styles.postTime, { color: textColor }]}>
                {formatTimeAgo(post.published_at)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text style={[styles.postCaption, { color: textColor }]}>
          {post.content}
        </Text>

        {/* Images - only show if there are images */}
        {post.images && post.images.length > 0 && (
          <TouchableOpacity
            style={styles.imagePlaceholder}
            onPress={() => goToViewPost(post)}
            activeOpacity={0.8}
          >
            <Image 
              source={{ uri: buildStorageUrl(post.images[0]) }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        {isVendorOrBusiness && (
          <View style={{ marginTop: 4, marginBottom: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <TouchableOpacity
                onPress={handleChatPress}
                style={{
                  backgroundColor: "transparent",
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: textColor,
                }}
              >
                <Text
                  style={{ color: textColor, fontSize: 14, fontWeight: "600" }}
                >
                  Message
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => toggleLike(post.id)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "green" : textColor}
            />
            <Text style={[styles.iconText, { color: textColor }]}>
              {post.likes_count || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openCommentSheet(post.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color={textColor} />
            <Text style={[styles.iconText, { color: textColor }]}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openCommentSheet(post.id)}
            style={{ marginLeft: "auto" }}
          >
            <Text style={[styles.commentCount, { color: textColor }]}>
              {post.comments_count || 0} comments
            </Text>
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
        <Header />

        <ScrollView 
          contentContainerStyle={{ paddingBottom: 90, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.container}>
            {/* Topbar */}
            <View style={styles.topBar}>
              <Text style={[styles.title, { color: textColor }]}>
                Community Hub
              </Text>
              <View style={styles.iconGroup}>
                <TouchableOpacity onPress={goToSearch}>
                  <Ionicons
                    name="search-outline"
                    size={24}
                    color={textColor}
                    style={{ marginRight: 16 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleChatPress}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={24}
                    color={textColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Chips */}
            <View style={styles.chipContainer}>{renderChips()}</View>

            {/* Create post input */}
            <View
              style={[
                styles.postInputRow,
                { marginHorizontal: 20, marginTop: 20 },
              ]}
            >
              <View style={styles.avatarContainer}>
                {currentUser?.profile_picture ? (
                  <Image 
                    source={{ uri: buildStorageUrl(currentUser.profile_picture) }} 
                    style={styles.avatar} 
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons name="person" size={24} color="#ccc" />
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[
                  styles.inputButton,
                  { borderColor: textColor, backgroundColor: buttonBackground },
                ]}
                onPress={goToCreatePost}
              >
                <Text style={[styles.inputButtonText, { color: textColor }]}>
                  What's on your mind?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Main content (filtered posts) */}
            <View style={styles.content}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: textColor }]}>
                    Loading posts...
                  </Text>
                </View>
              ) : posts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: textColor }]}>
                    No posts found
                  </Text>
                </View>
              ) : (
                <>
                  {posts.map((post) => {
                    const isEvent = (post.category || "").toLowerCase() === "events";
                    if (isEvent) {
                      return renderEventCard(
                        post,
                        !!interestedStates[post.id]
                      );
                    }
                    return renderPostCard(post);
                  })}
                  
                  {/* Loading more indicator */}
                  {loadingMore && posts.length > 0 && (
                    <View style={styles.loadingMoreContainer}>
                      <Text style={[styles.loadingMoreText, { color: textColor }]}>
                        Loading more posts...
                      </Text>
                    </View>
                  )}
                  
                  {/* Load More Button (fallback) */}
                  {hasMorePosts && !loadingMore && posts.length > 0 && (
                    <TouchableOpacity
                      style={[styles.loadMoreButton, { backgroundColor: buttonBackground }]}
                      onPress={loadMorePosts}
                    >
                      <Text style={[styles.loadMoreButtonText, { color: textColor }]}>
                        Load More Posts
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {/* End of posts indicator */}
                  {!hasMorePosts && posts.length > 0 && (
                    <View style={styles.endOfPostsContainer}>
                      <Text style={[styles.endOfPostsText, { color: textColor }]}>
                        You've reached the end of posts
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Comments Bottom Sheet Modal */}
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
                    Comments (
                    {selectedPostIndex !== null
                      ? (comments[selectedPostIndex] || []).length
                      : 0}
                    )
                  </Text>
                  <TouchableOpacity onPress={closeCommentSheet}>
                    <Ionicons name="close" size={28} color={textColor} />
                  </TouchableOpacity>
                </View>

                <CommentSection
                  comments={
                    selectedPostIndex !== null
                      ? comments[selectedPostIndex] || []
                      : []
                  }
                  onCommentAdd={handleCommentAdded}
                  postId={selectedPostIndex}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>

        {/* Navbar */}
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

export default CommunityHomepage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: { fontSize: 24, fontWeight: "bold" },

  chipContainer: { marginTop: 18 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  chipText: { fontSize: 12, fontWeight: "500" },

  postInputRow: { flexDirection: "row", alignItems: "center" },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%", borderRadius: 20 },
  placeholder: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },

  inputButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    justifyContent: "center",
    borderWidth: 1,
  },
  inputButtonText: { fontSize: 14 },

  content: { flex: 1, paddingHorizontal: 20 },

  eventCard: {
    marginTop: 20,
    borderRadius: 12,
    padding: 0,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  eventImageContainer: { width: "100%", height: 140, backgroundColor: "#eee" },
  eventImage: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },
  eventImageStyle: { borderRadius: 0 },
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

  interestButtonOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  interestButtonOverlayText: { fontSize: 11, fontWeight: "600" },

  eventHeaderContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  eventHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  interestButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  eventDetailsContainer: { padding: 16 },
  eventTitleMain: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  eventSubtitle: { fontSize: 14 },
  eventMeta: { marginBottom: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  metaText: { marginLeft: 8, fontSize: 13, opacity: 0.8 },

  postCard: {
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  postHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  postName: { fontWeight: "bold", fontSize: 16 },
  postTime: { fontSize: 10, color: "#555" },
  postTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  postCaption: { fontSize: 16, marginBottom: 12, fontWeight: "bold" },

  imagePlaceholder: {
    height: 200,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: -16,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 10,
  },
  iconButton: { flexDirection: "row", alignItems: "center" },
  iconText: { marginLeft: 4, fontSize: 13 },
  commentCount: { fontSize: 12 },

  iconGroup: { flexDirection: "row", alignItems: "center" },

  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  commentBottomSheet: {
    backgroundColor: "#fff",
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

  navWrapper: { backgroundColor: "#968585ff" },
});