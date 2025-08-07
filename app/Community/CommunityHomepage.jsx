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
      businessName: "Juan’s Buko Shake",
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
      businessName: "Pedro’s Farm Goods",
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
                          {post.likes}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() =>
                          router.push(`Community/CommentSection/${index}`)
                        }
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
                        onPress={() => router.push(`/CommentSection/${index}`)}
                        style={{ marginLeft: "auto" }}
                      >
                        <Text
                          style={[styles.commentCount, { color: textColor }]}
                        >
                          {post.commentCount} comments
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
          </View>
        </View>
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
});
