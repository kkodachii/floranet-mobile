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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";

const CommunityHomepage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
  const buttonBackground = theme === "light" ? "#e1e5ea" : "#1F2633";
  const textColor = colors.text;

  const chipLabels = [
    "All",
    "Events",
    "Announcements",
    "Vendors",
    "Businesses",
  ];
  const categoryMap = {
    All: "All",
    Events: "Event",
    Announcements: "Announcement",
    Vendors: "Vendor",
    Businesses: "Business",
  };

  const [selectedChip, setSelectedChip] = useState("All");
  const [showCategory, setShowCategory] = useState(false);
  const [interestedStates, setInterestedStates] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Comment bottom sheet states
  const [isCommentSheetVisible, setCommentSheetVisible] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState({
    0: [
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
    ],
    1: [
      {
        id: 3,
        author: "Lisa Reyes",
        content: "I saw a gray cat near the playground yesterday!",
        time: "30 minutes ago",
        avatar: null,
      },
    ],
    2: [
      {
        id: 4,
        author: "Tom Garcia",
        content: "Do you deliver? I'm interested in your vegetables.",
        time: "45 minutes ago",
        avatar: null,
      },
    ],
  });

  const openCommentSheet = (postIndex) => {
    setSelectedPostIndex(postIndex);
    setCommentSheetVisible(true);
  };
  
  const closeCommentSheet = () => {
    setCommentSheetVisible(false);
    setSelectedPostIndex(null);
    setNewComment("");
  };

  const handleAddComment = () => {
    if (newComment.trim() && selectedPostIndex !== null) {
      const newCommentObj = {
        id: Date.now(),
        author: "You",
        content: newComment.trim(),
        time: "Just now",
        avatar: null,
      };
      
      setComments(prev => ({
        ...prev,
        [selectedPostIndex]: [...(prev[selectedPostIndex] || []), newCommentObj]
      }));
      
      setNewComment("");
    }
  };

  const renderComment = ({ item }) => (
    <View style={[styles.commentItem, { borderBottomColor: colors.border || '#e0e0e0' }]}>
      <View style={styles.commentAvatar}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.commentAvatarImage} />
        ) : (
          <View style={[styles.commentAvatarPlaceholder, { backgroundColor: colors.border || '#e0e0e0' }]}>
            <Text style={[styles.commentAvatarText, { color: textColor }]}>
              {item.author.charAt(0)}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.commentContent}>
        <View style={[styles.commentBubble, { backgroundColor: buttonBackground }]}>
          <Text style={[styles.commentAuthor, { color: textColor }]}>{item.author}</Text>
          <Text style={[styles.commentText, { color: textColor }]}>{item.content}</Text>
        </View>
        <Text style={[styles.commentTime, { color: colors.textSecondary || '#666' }]}>{item.time}</Text>
      </View>
    </View>
  );

  useEffect(() => {
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;

      fadeAnim.setValue(0);

      setShowCategory((prev) => !prev);

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
  }, []);

  const chipRefs = useRef({});
  const scrollViewRef = useRef(null);

  const handleChipPress = (label) => {
    setSelectedChip(label);
    const chipRef = chipRefs.current[label];
    if (chipRef && scrollViewRef.current) {
      chipRef.measureLayout(
        scrollViewRef.current,
        (x) => {
          scrollViewRef.current.scrollTo({ x: x - 16, animated: true });
        },
        (error) => {
          console.warn("Measure error", error);
        }
      );
    }
  };

  const handleChatPress = () => {
    router.push("/Chat/ChatHomepage");
  };

  const posts = [
    {
      homeownerName: "Juan Dela Cruz",
      residentId: "B3A - L23",
      avatarUri: null,
      postTime: "July 31, 2025 at 10:30 AM",
      caption: "Join us for our grand opening!",
      category: "Event",
      commentCount: 12,
      likes: 45,
      event: {
        dateTime: "Fri, 2 June – 11:00 AM",
        location: "Clubhouse, Community Area",
        image:
          "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=400&fit=crop",
      },
      residentName: "Juan Dela Cruz",
      residentID: "B3A - L23",
      houseNumber: "23",
      street: "Blk B3A",
      businessName: "Juan's Buko Shake",
      contactNumber: "09171234567",
    },
    {
      homeownerName: "Maria Santos",
      residentId: "C2B - L12",
      avatarUri: null,
      postTime: "July 30, 2025 at 2:15 PM",
      caption: "Lost cat! Please help us find Luna near Block C.",
      category: "Announcement",
      commentCount: 8,
      likes: 30,
      residentName: "Maria Santos",
      residentID: "C2B - L12",
      houseNumber: "12",
      street: "Blk C2B",
      businessName: "",
      contactNumber: "09182345678",
    },
    {
      homeownerName: "Pedro Reyes",
      residentId: "A1 - L5",
      avatarUri: null,
      postTime: "July 29, 2025 at 6:00 PM",
      caption: "Fresh vegetables for sale this Saturday!",
      category: "Vendor",
      commentCount: 5,
      likes: 18,
      residentName: "Pedro Reyes",
      residentID: "A1 - L5",
      houseNumber: "5",
      street: "Blk A1",
      businessName: "Pedro's Farm Goods",
      contactNumber: "09183456789",
    },
  ];

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
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <Text style={[styles.title, { color: textColor }]}>
              Community Hub
            </Text>
            <View style={styles.iconGroup}>
              <TouchableOpacity
                onPress={() => router.push("/Community/Search")}
              >
                <Ionicons
                  name="search-outline"
                  size={24}
                  color={textColor}
                  style={{ marginRight: 16 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/Community/ChatHomepage")}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={24}
                  color={textColor}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.chipContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {chipLabels.map((label, index) => {
                const isSelected = label === selectedChip;
                return (
                  <View
                    key={index}
                    ref={(ref) => (chipRefs.current[label] = ref)}
                    style={{ marginRight: 8 }}
                  >
                    <TouchableOpacity
                      onPress={() => handleChipPress(label)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? "green"
                            : buttonBackground,
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
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View
            style={[
              styles.postInputRow,
              { marginHorizontal: 20, marginTop: 20 },
            ]}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.placeholder}>
                <Ionicons name="person" size={24} color="#ccc" />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.inputButton, { borderColor: textColor }]}
              onPress={() => router.push("/Community/CreatePost")}
            >
              <Text style={[styles.inputButtonText, { color: textColor }]}>
                What's on your mind?
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {posts
              .filter((post) => {
                if (selectedChip === "All") return true;
                return (
                  post.category.toLowerCase() ===
                  categoryMap[selectedChip].toLowerCase()
                );
              })
              .map((post, index) => {
                const isEvent = post.category.toLowerCase() === "event";
                const isVendorOrBusiness = ["vendor", "business"].includes(
                  post.category.toLowerCase()
                );
                const isInterested = interestedStates[index] || false;
                const isLiked = likedPosts[index] || false;

                const handleInterestPress = () => {
                  setInterestedStates((prev) => ({
                    ...prev,
                    [index]: !prev[index],
                  }));
                };

                const handleLikePress = () => {
                  setLikedPosts((prev) => ({
                    ...prev,
                    [index]: !prev[index],
                  }));
                };

                if (isEvent && post.event) {
                  return (
                    <View
                      key={index}
                      style={[
                        styles.postCard,
                        {
                          backgroundColor: cardBackground,
                          flexDirection: "row",
                          alignItems: "flex-start",
                        },
                      ]}
                    >
                      <Image
                        source={{
                          uri:
                            post.event.image ||
                            "https://via.placeholder.com/80",
                        }}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 12,
                          marginRight: 16,
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#28942c",
                            marginBottom: 4,
                          }}
                        >
                          {post.event.dateTime}
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "700",
                            color: textColor,
                            marginBottom: 8,
                          }}
                        >
                          {post.caption}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#7f8c8d",
                            marginBottom: 2,
                          }}
                        >
                          {post.event.location}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#7f8c8d",
                            marginBottom: 10,
                          }}
                        >
                          Hosted by {post.homeownerName}
                        </Text>
                        <TouchableOpacity
                          style={{
                            backgroundColor: isInterested
                              ? "#28942c"
                              : "transparent",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: isInterested ? "#28942c" : textColor,
                            alignSelf: "flex-start",
                          }}
                          onPress={handleInterestPress}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: isInterested ? "#fff" : textColor,
                            }}
                          >
                            Interested
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }

                return (
                  <View
                    key={index}
                    style={[
                      styles.postCard,
                      { backgroundColor: cardBackground },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => router.push("/Profile/OtherProfile")}
                      style={styles.postHeaderRow}
                    >
                      <View style={styles.avatarContainer}>
                        {post.avatarUri ? (
                          <Image
                            source={{ uri: post.avatarUri }}
                            style={styles.avatar}
                          />
                        ) : (
                          <View style={styles.placeholder}>
                            <Ionicons name="person" size={24} color="#ccc" />
                          </View>
                        )}
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <Text style={[styles.postName, { color: textColor }]}>
                          {post.homeownerName}
                        </Text>
                        <Animated.Text
                          style={[
                            styles.postTime,
                            { color: textColor, opacity: fadeAnim },
                          ]}
                        >
                          {showCategory ? post.category : post.postTime}
                        </Animated.Text>
                      </View>
                    </TouchableOpacity>

                    <Text style={[styles.postCaption, { color: textColor }]}>
                      {post.caption}
                    </Text>

                    <View style={styles.imagePlaceholder}>
                      <Text style={{ color: "#888" }}>Photo goes here</Text>
                    </View>

                    {isVendorOrBusiness && (
                      <View style={{ marginTop: 1, marginBottom: 12 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            {[...Array(5)].map((_, i) => (
                              <Ionicons
                                key={i}
                                name="star"
                                size={16}
                                color={i < 4 ? "#28942c" : "#ccc"}
                              />
                            ))}
                            <Text
                              style={{
                                marginLeft: 6,
                                fontSize: 12,
                                color: textColor,
                              }}
                            >
                              4.0
                            </Text>
                          </View>
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
                              style={{
                                color: textColor,
                                fontSize: 14,
                                fontWeight: "600",
                              }}
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
                        onPress={handleLikePress}
                      >
                        <Ionicons
                          name={isLiked ? "heart" : "heart-outline"}
                          size={20}
                          color={isLiked ? "green" : textColor}
                        />
                        <Text style={[styles.iconText, { color: textColor }]}>
                          {post.likes + (isLiked ? 1 : 0)}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => openCommentSheet(index)}
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={20}
                          color={textColor}
                        />
                        <Text style={[styles.iconText, { color: textColor }]}>
                          Comment
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => openCommentSheet(index)}
                        style={{ marginLeft: "auto" }}
                      >
                        <Text
                          style={[styles.commentCount, { color: textColor }]}
                        >
                          {(comments[index] || []).length} comments
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
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
              style={[styles.commentBottomSheet, { backgroundColor: cardBackground }]}
              activeOpacity={1}
            >
              <View style={styles.bottomSheetHeader}>
                <Text style={[styles.bottomSheetTitle, { color: textColor }]}>
                  Comments ({selectedPostIndex !== null ? (comments[selectedPostIndex] || []).length : 0})
                </Text>
                <TouchableOpacity onPress={closeCommentSheet}>
                  <Ionicons name="close" size={28} color={textColor} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={selectedPostIndex !== null ? comments[selectedPostIndex] || [] : []}
                renderItem={renderComment}
                keyExtractor={(item) => item.id.toString()}
                style={styles.commentsList}
                showsVerticalScrollIndicator={false}
              />
              
              <View style={[styles.commentInputContainer, { 
                backgroundColor: cardBackground, 
                borderTopColor: colors.border || '#e0e0e0' 
              }]}>
                <View style={styles.commentInputRow}>
                  <View style={styles.commentInputAvatar}>
                    <View style={[styles.commentAvatarPlaceholder, { backgroundColor: colors.border || '#e0e0e0' }]}>
                      <Text style={[styles.commentAvatarText, { color: textColor }]}>U</Text>
                    </View>
                  </View>
                  <TextInput
                    style={[styles.commentInput, { 
                      backgroundColor: buttonBackground, 
                      color: textColor,
                      borderColor: colors.border || '#e0e0e0'
                    }]}
                    placeholder="Write a comment..."
                    placeholderTextColor={colors.textSecondary || '#666'}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, { 
                      backgroundColor: newComment.trim() ? colors.primary || '#007AFF' : colors.border || '#e0e0e0'
                    }]}
                    onPress={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <Ionicons name="send" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

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
    </SafeAreaView>
  );
};

export default CommunityHomepage;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: "space-between" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  chipContainer: { marginTop: 24 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  chipText: { fontSize: 12, fontWeight: "500" },
  content: { flex: 1, paddingHorizontal: 20 },
  navWrapper: { backgroundColor: "#fff" },
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
  postName: { fontWeight: "bold", fontSize: 16 },
  postTime: { fontSize: 10, color: "#555" },
  postCaption: { fontSize: 16, marginBottom: 12, fontWeight: "bold" },
  imagePlaceholder: {
    height: 180,
    backgroundColor: "#eee",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
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
  postInputRow: { flexDirection: "row", alignItems: "center" },
  inputButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
  },
  inputButtonText: { fontSize: 14 },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  // Bottom Sheet Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  commentBottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingTop: 20,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Comment Styles
  commentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  commentAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 8,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
  },
  commentTime: {
    fontSize: 11,
    marginLeft: 8,
  },
  commentInputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 80,
    marginRight: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});