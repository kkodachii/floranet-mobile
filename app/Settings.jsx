import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../Theme/ThemeProvider";

// Icon imports
import { Feather } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SecurityHomepage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
  const textColor = colors.text;
  const borderColor = theme === "light" ? "#e0e0e0" : "#333333";

  const handleThemeToggle = () => toggleTheme();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: () => {
          console.log("User logged out");
        },
      },
    ]);
  };

  const handleManagePosts = () => console.log("Navigate to Manage Posts");
  const handleEditProfile = () => console.log("Navigate to Edit Profile");

  const handleShareProfile = () =>
    Alert.alert("Share Profile", "Profile sharing functionality would go here");

  const handleReportProblem = () => {
    Alert.alert("Report a Problem", "What issue would you like to report?", [
      { text: "Technical Issue", onPress: () => console.log("Technical issue reported") },
      { text: "Content Issue", onPress: () => console.log("Content issue reported") },
      { text: "Other", onPress: () => console.log("Other issue reported") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleAccountStatus = () =>
    Alert.alert("Account Status", "Your account is active and in good standing.");

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            Alert.alert("Account Deletion", "Account deletion process would start here"),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { paddingTop: insets.top, backgroundColor: colors.background }]}
    >
      <StatusBar
        backgroundColor={statusBarBackground}
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />
      <View style={styles.container}>
        <Header />

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Text style={[styles.title, { color: textColor }]}>Settings & Privacy</Text>

          <View style={[styles.settingsList, { backgroundColor: cardBackground }]}>
            <SettingItem icon={<Feather name="moon" size={20} color={textColor} />} label="Dark mode" onPress={handleThemeToggle} />

            <SettingItem icon={<Feather name="edit-3" size={20} color={textColor} />} label="Manage posts" onPress={handleManagePosts} />

            <SettingItem icon={<Feather name="user" size={20} color={textColor} />} label="Edit profile" onPress={handleEditProfile} />

            <SettingItem icon={<Feather name="share" size={20} color={textColor} />} label="Share profile" onPress={handleShareProfile} />

            <SettingItem icon={<Feather name="alert-circle" size={20} color={textColor} />} label="Report a problem" onPress={handleReportProblem} />

            <SettingItem icon={<Feather name="bar-chart-2" size={20} color={textColor} />} label="Account status" onPress={handleAccountStatus} />

            <SettingItem icon={<Feather name="bell" size={20} color={textColor} />} label="Notifications" onPress={() => console.log("Notifications")} />

            <SettingItem icon={<MaterialIcons name="accessibility" size={20} color={textColor} />} label="Accessibility" onPress={() => console.log("Accessibility")} />

            <SettingItem icon={<MaterialIcons name="language" size={20} color={textColor} />} label="Language and region" onPress={() => console.log("Language")} />

            <SettingItem icon={<Feather name="film" size={20} color={textColor} />} label="Media" onPress={() => console.log("Media")} />

            <SettingItem icon={<MaterialCommunityIcons name="web" size={20} color={textColor} />} label="Browser" onPress={() => console.log("Browser")} />

            <SettingItem icon={<Feather name="trash-2" size={20} color="#ff4444" />} label="Delete account" onPress={handleDeleteAccount} isDestructive />

            <SettingItem icon={<Feather name="log-out" size={20} color="#ff4444" />} label="Logout" onPress={handleLogout} isDestructive isLast />
          </View>
        </ScrollView>

        <View style={[styles.navWrapper, { paddingBottom: insets.bottom || 16, backgroundColor: navBarBackground }]}>
          <Navbar />
        </View>
      </View>
    </SafeAreaView>
  );
};

// Reusable setting item component
const SettingItem = ({ icon, label, onPress, isDestructive, isLast }) => {
  return (
    <TouchableOpacity
      style={[styles.settingsItem, isLast && styles.lastItem]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={[styles.settingsText, { color: isDestructive ? "#ff4444" : undefined }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default SecurityHomepage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  settingsList: {
    borderRadius: 10,
    padding: 10,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 30,
    alignItems: "center",
    marginRight: 15,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
