import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
        {/* Header remains at the top */}
        <Header />

        {/* Title and Chat Button */}
        <View style={styles.topBar}>
          <Text style={[styles.title, { color: textColor }]}>
            Community
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
            {["All", "Events", "Posts", "Polls", "Announcements"].map(
              (label, index) => (
                <TouchableOpacity key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{label}</Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
        </View>

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
    paddingLeft: 20,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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
    alignItems: "center",
    justifyContent: "center",
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
});
