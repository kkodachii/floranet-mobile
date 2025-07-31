import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import React from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

const CommunityHomepage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const textColor = colors.text;

  const handleChatPress = () => {
    router.push("/chat");
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

      <View style={styles.container}>
        <Header />

        {/* Title and Chat Button */}
        <View style={styles.topBar}>
          <Text style={[styles.title, { color: textColor }]}>
            Community Hub
          </Text>
          <TouchableOpacity onPress={handleChatPress}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color={textColor}
            />
          </TouchableOpacity>
        </View>

        {/* Scrollable Chips */}
        <View style={styles.chipContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["All", "Events", "Announcements", "Vendors", "Businesses"].map(
              (label, index) => (
                <TouchableOpacity key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{label}</Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>

        {/* Main Content with ScrollView */}
        <ScrollView style={styles.content}>
          <View style={styles.postCard}>
            {/* Post Header */}
            <Text style={styles.postName}>Juan Dela Cruz</Text>
            <Text style={styles.postTime}>July 31, 2025 at 10:30 AM</Text>
            <Text style={styles.postCategory}>Event</Text>

            {/* Caption */}
            <Text style={styles.postCaption}>
              Join us for our grand opening!
            </Text>

            {/* Placeholder Image */}
            <View style={styles.imagePlaceholder}>
              <Text style={{ color: "#888" }}>Photo goes here</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="heart-outline" size={20} color="black" />
                <Text style={styles.iconText}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="chatbubble-outline" size={20} color="black" />
                <Text style={styles.iconText}>Comment</Text>
              </TouchableOpacity>
              <Text style={styles.commentCount}>12 comments</Text>
            </View>

            {/* Interested Button */}
            <TouchableOpacity style={styles.interestedButton}>
              <Text style={styles.interestedText}>Interested</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Navbar */}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  chipContainer: {
    marginTop: 24,
    paddingLeft: 24,
    paddingRight: 24,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 17,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    marginRight: 10,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  navWrapper: {
    backgroundColor: "#fff",
  },

  // Post styles
  postCard: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  postTime: {
    fontSize: 12,
    color: "#555",
  },
  postCategory: {
    fontSize: 12,
    color: "#007aff",
    fontWeight: "600",
    marginBottom: 10,
  },
  postCaption: {
    fontSize: 14,
    marginBottom: 12,
  },
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
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconText: {
    marginLeft: 4,
    fontSize: 13,
  },
  commentCount: {
    marginLeft: "auto",
    fontSize: 12,
    color: "#777",
  },
  interestedButton: {
    backgroundColor: "#007aff",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  interestedText: {
    color: "white",
    fontWeight: "bold",
  },
});
