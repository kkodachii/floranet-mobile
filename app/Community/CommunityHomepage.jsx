import React, { useEffect, useRef, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";

import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import CommentSection from "./CommentSection";

const CHIP_LABELS = ["All", "Events", "Announcements", "Vendors", "Businesses"];
const CATEGORY_MAP = {
  All: "All",
  Events: "Event",
  Announcements: "Announcement",
  Vendors: "Vendor",
  Businesses: "Business",
};

const CategoryBadge = ({ label }) => (
  <View style={styles.categoryBadge}>
    <Text style={styles.categoryText}>{label}</Text>
  </View>
);

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
  const [showCategory, setShowCategory] = useState(false);
  const [interestedStates, setInterestedStates] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
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

  const [isCommentSheetVisible, setCommentSheetVisible] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
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
  }, [fadeAnim]);

  const chipRefs = useRef({});
  const chipScrollRef = useRef(null);
  const handleChipPress = (label) => {
    setSelectedChip(label);
    const chipRef = chipRefs.current[label];
    if (chipRef && chipScrollRef.current) {
      chipRef.measureLayout(
        chipScrollRef.current,
        (x) => chipScrollRef.current.scrollTo({ x: x - 16, animated: true }),
        (e) => console.warn("Measure error", e)
      );
    }
  };

  const openCommentSheet = (postIndex) => {
    setSelectedPostIndex(postIndex);
    setCommentSheetVisible(true);
  };
  const closeCommentSheet = () => {
    setCommentSheetVisible(false);
    setSelectedPostIndex(null);
  };

  const handleCommentAdded = (newComment) => {
    if (selectedPostIndex === null || !newComment || !newComment.trim()) return;
    const newCommentObj = {
      id: Date.now(),
      author: "You",
      content: newComment.trim(),
      time: "Just now",
      avatar: null,
    };
    setComments((prev) => ({
      ...prev,
      [selectedPostIndex]: [...(prev[selectedPostIndex] || []), newCommentObj],
    }));
  };

  const handleChatPress = () => router.push("/Chat/ChatHomepage");
  const goToCreatePost = () => router.push("/Community/CreatePost");
  const goToSearch = () => router.push("/Community/Search");
  const goToViewPost = (postData, index) => {
    // Navigate to ViewPost page with post data
    router.push({
      pathname: "/Community/ViewPost",
      params: {
        postId: index.toString(),
        homeownerName: postData.homeownerName || '',
        residentId: postData.residentId || '',
        postTime: postData.postTime || '',
        caption: postData.caption || '',
        category: postData.category || '',
        commentCount: postData.commentCount?.toString() || '0',
        likes: postData.likes?.toString() || '0',
        residentName: postData.residentName || '',
        residentID: postData.residentID || '',
        houseNumber: postData.houseNumber || '',
        street: postData.street || '',
        businessName: postData.businessName || '',
        contactNumber: postData.contactNumber || '',
        eventDateTime: postData.event?.dateTime || '',
        eventLocation: postData.event?.location || '',
        eventImage: postData.event?.image || '',
      },
    });
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
          "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1000&h=600&fit=crop",
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

  const renderEventCard = (post, index, isInterested) => (
    <View
      key={`event-${index}`}
      style={[styles.eventCard, { backgroundColor: cardBackground }]}
    >
      <TouchableOpacity
        style={styles.eventImageContainer}
        onPress={() => goToViewPost(post, index)}
        activeOpacity={0.8}
      >
        <ImageBackground
          source={{
            uri:
              post.event?.image ||
              "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=400&fit=crop",
          }}
          style={styles.eventImage}
          imageStyle={styles.eventImageStyle}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "transparent", "rgba(0,0,0,0.7)"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <CategoryBadge label="Event" />
          <TouchableOpacity
            style={[
              styles.interestButtonOverlay,
              {
                backgroundColor: isInterested
                  ? "rgba(40,148,44,0.95)"
                  : "rgba(255,255,255,0.9)",
              },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              setInterestedStates((prev) => ({
                ...prev,
                [index]: !prev[index],
              }));
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

      <View style={styles.eventDetailsContainer}>
        <Text style={[styles.eventTitleMain, { color: textColor }]}>
          {post.caption}
        </Text>
        <Text
          style={[
            styles.eventSubtitle,
            { color: textColor, opacity: 0.8, marginBottom: 12 },
          ]}
        >
          Hosted by {post.homeownerName}
        </Text>

        <View style={styles.eventMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={16} color={textColor} />
            <Text style={[styles.metaText, { color: textColor }]}>
              {post.event?.dateTime}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={textColor} />
            <Text style={[styles.metaText, { color: textColor }]}>
              {post.event?.location}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPostCard = (post, index) => {
    const lowerCat = (post.category || "").toLowerCase();
    const isVendorOrBusiness = ["vendor", "business"].includes(lowerCat);
    const isAnnouncement = lowerCat === "announcement";
    const isLiked = !!likedPosts[index];

    return (
      <View
        key={`post-${index}`}
        style={[styles.postCard, { backgroundColor: cardBackground }]}
      >
        <TouchableOpacity
          onPress={() => router.push("/Profile/OtherProfile")}
          style={styles.postHeaderRow}
        >
          <View style={styles.avatarContainer}>
            {post.avatarUri ? (
              <Image source={{ uri: post.avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="person" size={24} color="#ccc" />
              </View>
            )}
          </View>

          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={[styles.postName, { color: textColor }]}>
              {post.homeownerName}
            </Text>
            <Animated.Text
              style={[styles.postTime, { color: textColor, opacity: fadeAnim }]}
            >
              {showCategory ? post.category : post.postTime}
            </Animated.Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.postCaption, { color: textColor }]}>
          {post.caption}
        </Text>

        {/* Image placeholder - clickable for non-announcement posts */}
        {isAnnouncement ? (
          <View style={styles.imagePlaceholder}>
            <Text style={{ color: "#888" }}>Photo goes here</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.imagePlaceholder}
            onPress={() => goToViewPost(post, index)}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#888" }}>Photo goes here</Text>
          </TouchableOpacity>
        )}

        {isVendorOrBusiness && (
          <View style={{ marginTop: 4, marginBottom: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <RatingStars rating={4} />
                <Text style={{ marginLeft: 8, fontSize: 12, color: textColor }}>
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
            onPress={() =>
              setLikedPosts((prev) => ({ ...prev, [index]: !prev[index] }))
            }
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
            <Ionicons name="chatbubble-outline" size={20} color={textColor} />
            <Text style={[styles.iconText, { color: textColor }]}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openCommentSheet(index)}
            style={{ marginLeft: "auto" }}
          >
            <Text style={[styles.commentCount, { color: textColor }]}>
              {(comments[index] || []).length} comments
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
      <Header />

      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
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
              <View style={styles.placeholder}>
                <Ionicons name="person" size={24} color="#ccc" />
              </View>
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
            {posts
              .filter((post) =>
                selectedChip === "All"
                  ? true
                  : (post.category || "").toLowerCase() ===
                    CATEGORY_MAP[selectedChip].toLowerCase()
              )
              .map((post, index) => {
                const isEvent = (post.category || "").toLowerCase() === "event";
                if (isEvent && post.event) {
                  return renderEventCard(
                    post,
                    index,
                    !!interestedStates[index]
                  );
                }
                return renderPostCard(post, index);
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
    </SafeAreaView>
  );
};

export default CommunityHomepage;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
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
    backgroundColor: "#28942c",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    margin: 12,
  },
  categoryText: { color: "#ffffff", fontSize: 12, fontWeight: "600" },

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
  postName: { fontWeight: "bold", fontSize: 16 },
  postTime: { fontSize: 10, color: "#555" },
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

  navWrapper: { backgroundColor: "#968585ff" },
});