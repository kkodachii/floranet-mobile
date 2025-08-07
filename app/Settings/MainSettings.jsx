import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";

const SettingItem = ({ icon, label, onPress, textColor }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    {icon}
    <Text style={[styles.settingText, { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);

const Settings = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, toggleTheme, colors } = useTheme();

  const backgroundColor = colors.background;
  const textColor = colors.text;
  const cardBackground = theme === "light" ? "#f0f0f0" : "#1e1e1e";
  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const [searchTerm, setSearchTerm] = useState("");
  const [showAccount, setShowAccount] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showLinked, setShowLinked] = useState(false);

  const filterMatch = (label) =>
    label.toLowerCase().includes(searchTerm.toLowerCase());

  const handleThemeToggle = () => toggleTheme();
  const handleLogout = () => Alert.alert("Logout", "You have been logged out.");

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { paddingTop: insets.top, backgroundColor },
      ]}
    >
      <StatusBar
        backgroundColor={statusBarBackground}
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />
      <View style={styles.container}>
        <Header title="Settings" />

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={[styles.settingsContainer, { backgroundColor: cardBackground }]}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color={textColor} />
              <TextInput
                placeholder="Search settings..."
                placeholderTextColor={textColor}
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            {/* Account Section */}
            <View style={styles.dropdownHeaderRow}>
              <View style={styles.dropdownHeader}>
                <Feather name="user" size={20} color={textColor} />
                <Text style={[styles.settingText, { color: textColor }]}>Account</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAccount(!showAccount)}>
                <Feather
                  name={showAccount ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={textColor}
                />
              </TouchableOpacity>
            </View>
            {showAccount && (
              <View style={styles.dropdownGroup}>
                {filterMatch("Edit Profile") && (
                  <SettingItem
                    icon={<Feather name="edit" size={20} color={textColor} />}
                    label="Edit Profile"
                    onPress={() => router.push("Profile/EditProfile")}
                    textColor={textColor}
                  />
                )}
                {filterMatch("Manage Posts") && (
                  <SettingItem
                    icon={<Feather name="file-text" size={20} color={textColor} />}
                    label="Manage Posts"
                    onPress={() => router.push("Profile/ManagePost")}
                    textColor={textColor}
                  />
                )}
                {filterMatch("Activity Logs") && (
                  <SettingItem
                    icon={<Feather name="activity" size={20} color={textColor} />}
                    label="Activity Logs"
                    onPress={() => router.push("Profile/ActivityLogs")}
                    textColor={textColor}
                  />
                )}
                {filterMatch("Share Profile") && (
                  <SettingItem
                    icon={<Feather name="share-2" size={20} color={textColor} />}
                    label="Share Profile"
                    onPress={() => Alert.alert("Share", "Profile link copied!")}
                    textColor={textColor}
                  />
                )}
                {filterMatch("Delete / Deactivate Account") && (
                  <SettingItem
                    icon={<Feather name="trash" size={20} color={textColor} />}
                    label="Delete / Deactivate Account"
                    onPress={() =>
                      Alert.alert(
                        "Account Action",
                        "Do you want to delete or deactivate your account?",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Deactivate", onPress: () => console.log("Deactivated") },
                          { text: "Delete", onPress: () => console.log("Deleted") },
                        ]
                      )
                    }
                    textColor={textColor}
                  />
                )}
              </View>
            )}

            {/* Appearance */}
            <View style={styles.dropdownHeaderRow}>
              <View style={styles.dropdownHeader}>
                <Feather name="eye" size={20} color={textColor} />
                <Text style={[styles.settingText, { color: textColor }]}>Appearance</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAppearance(!showAppearance)}>
                <Feather
                  name={showAppearance ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={textColor}
                />
              </TouchableOpacity>
            </View>
            {showAppearance && (
              <View style={styles.dropdownGroup}>
                {filterMatch("Dark Mode") && (
                  <SettingItem
                    icon={<Feather name="moon" size={20} color={textColor} />}
                    label={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                    onPress={handleThemeToggle}
                    textColor={textColor}
                  />
                )}
              </View>
            )}

            {/* Security & Privacy */}
            <View style={styles.dropdownHeaderRow}>
              <View style={styles.dropdownHeader}>
                <Feather name="lock" size={20} color={textColor} />
                <Text style={[styles.settingText, { color: textColor }]}>Security & Privacy</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSecurity(!showSecurity)}>
                <Feather
                  name={showSecurity ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={textColor}
                />
              </TouchableOpacity>
            </View>
            {showSecurity && (
              <View style={styles.dropdownGroup}>
                {filterMatch("Change Password") && (
                  <SettingItem
                    icon={<Feather name="key" size={20} color={textColor} />}
                    label="Change Password"
                    onPress={() => Alert.alert("Security", "Change password clicked")}
                    textColor={textColor}
                  />
                )}
                {filterMatch("Two-Factor Authentication") && (
                  <SettingItem
                    icon={<Feather name="shield" size={20} color={textColor} />}
                    label="Two-Factor Authentication"
                    onPress={() => Alert.alert("Security", "2FA toggled")}
                    textColor={textColor}
                  />
                )}
                {filterMatch("Blocked Users") && (
                  <SettingItem
                    icon={<Feather name="slash" size={20} color={textColor} />}
                    label="Blocked Users"
                    onPress={() => Alert.alert("Security", "No blocked users yet")}
                    textColor={textColor}
                  />
                )}
              </View>
            )}

            {/* Linked Accounts */}
            <View style={styles.dropdownHeaderRow}>
              <View style={styles.dropdownHeader}>
                <Feather name="link" size={20} color={textColor} />
                <Text style={[styles.settingText, { color: textColor }]}>Linked Accounts</Text>
              </View>
              <TouchableOpacity onPress={() => setShowLinked(!showLinked)}>
                <Feather
                  name={showLinked ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={textColor}
                />
              </TouchableOpacity>
            </View>
            {showLinked && (
              <View style={styles.dropdownGroup}>
                {filterMatch("GCash") && (
                  <SettingItem
                    icon={<Feather name="credit-card" size={20} color={textColor} />}
                    label="GCash: Linked"
                    onPress={() => Alert.alert("GCash", "Your GCash account is linked.")}
                    textColor={textColor}
                  />
                )}
              </View>
            )}

            {filterMatch("Notifications") && (
              <SettingItem
                icon={<Feather name="bell" size={20} color={textColor} />}
                label="Notifications"
                onPress={() => router.push("/Settings/Notifications")}
                textColor={textColor}
              />
            )}
            {filterMatch("Report a problem") && (
              <SettingItem
                icon={<Feather name="alert-circle" size={20} color={textColor} />}
                label="Report a problem"
                onPress={() => Alert.alert("Report a Problem", "Functionality coming soon.")}
                textColor={textColor}
              />
            )}
            {filterMatch("About") && (
              <SettingItem
                icon={<Feather name="info" size={20} color={textColor} />}
                label="About"
                onPress={() => Alert.alert("About", "App version 1.0.0\nDeveloped by YourName")}
                textColor={textColor}
              />
            )}

            {/* Logout */}
            {filterMatch("Logout") && (
              <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                <Feather name="log-out" size={20} color={textColor} />
                <Text style={[styles.settingText, { color: textColor }]}>Logout</Text>
              </TouchableOpacity>
            )}
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

export default Settings;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  scrollContainer: {
    padding: 20,
  },
  settingsContainer: {
    borderRadius: 12,
    padding: 10,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
  },
  dropdownGroup: {
    paddingLeft: 32,
  },
  dropdownHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ccc3',
    padding: 3,
    borderRadius: 15,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
});
