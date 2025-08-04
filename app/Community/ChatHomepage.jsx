import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  TextInput,
} from "react-native";
import React from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";

const sampleMessages = [
  {
    residentID: "RES001",
    residentName: "Juan Dela Cruz",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    message: "Tanginamo",
    time: "2:45 PM",
    unreadCount: 2,
  },
  {
    residentID: "RES002",
    residentName: "Maria Santos",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    message: "Thank you for your help yesterday!",
    time: "1:12 PM",
    unreadCount: 0,
  },
  {
    residentID: "RES003",
    residentName: "Community Admin",
    avatar: null,
    message: "Don't forget to vote in the HOA elections!",
    time: "10:00 AM",
    unreadCount: 5,
  },
];

const ChatHomepage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const textColor = colors.text;
  const cardBackground = theme === "light" ? "#fff" : "#14181F";

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

        <View style={styles.topBar}>
          <Text style={[styles.title, { color: textColor }]}>Messages</Text>
        </View>

        <View style={styles.searchWrapper}>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: textColor,
                borderColor: textColor,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Search"
            placeholderTextColor={textColor}
          />
          <Ionicons
            name="search"
            size={20}
            color={textColor}
            style={styles.searchIcon}
          />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
          {sampleMessages.map((msg) => (
            <TouchableOpacity
              key={msg.residentID}
              style={[styles.messageCard, { backgroundColor: cardBackground }]}
              onPress={() =>
                router.push({
                  pathname: `/Chat/${msg.residentID}`,
                  params: {
                    name: msg.residentName,
                    avatar:
                      msg.avatar ??
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  },
                })
              }
            >
              <Image
                source={{
                  uri:
                    msg.avatar ??
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                style={styles.avatar}
              />
              <View style={styles.messageInfo}>
                <View style={styles.messageHeader}>
                  <Text style={[styles.name, { color: textColor }]}>
                    {msg.residentName}
                  </Text>
                  <Text style={[styles.time, { color: "#888" }]}>
                    {msg.time}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text
                    style={[styles.preview, { color: "#888", flex: 1 }]}
                    numberOfLines={1}
                  >
                    {msg.message}
                  </Text>
                  {msg.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{msg.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
      </View>
    </SafeAreaView>
  );
};

export default ChatHomepage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 17,
  },
  searchInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
  },
  searchIcon: {
    position: "absolute",
    left: 15,
  },
  messageCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 12,
    backgroundColor: "#ccc",
  },
  messageInfo: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  time: {
    fontSize: 12,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  preview: {
    fontSize: 14,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#28942c",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
});
