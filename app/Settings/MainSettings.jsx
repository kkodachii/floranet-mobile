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
  Dimensions,
  Modal,
} from "react-native";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { authService } from "../../services/api";
import { setOneSignalUserId } from "../_layout";

const screenHeight = Dimensions.get("window").height;

const SettingItem = ({ icon, label, onPress, textColor }) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    activeOpacity={0.6}
  >
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
  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const [searchTerm, setSearchTerm] = useState("");
  const [showAccount, setShowAccount] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showLinked, setShowLinked] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const filterMatch = (label) =>
    label.toLowerCase().includes(searchTerm.toLowerCase());

  const handleThemeToggle = () => toggleTheme();
  const performLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      // Disconnect pusher service to stop pooling
      const pusherService = (await import('../../services/optimizedPusherService')).default;
      pusherService.disconnect();
      
      await authService.logout();
      // Clear OneSignal external user ID
      await setOneSignalUserId(null);
    } catch (_) {}
    setShowLogoutModal(false);
    router.replace("/");
    setIsLoggingOut(false);
  };

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

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          scrollEnabled={scrollEnabled}
          onContentSizeChange={(contentWidth, contentHeight) => {
            setScrollEnabled(contentHeight > screenHeight - insets.top - 100);
          }}
        >
          <View>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Feather name="search" size={24} color={textColor} />
              <TextInput
                placeholder="Search settings..."
                placeholderTextColor={textColor}
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            {/* Account Section */}
            <TouchableOpacity
              style={styles.dropdownHeaderRow}
              onPress={() => setShowAccount(!showAccount)}
              activeOpacity={0.6}
            >
              <View style={styles.dropdownHeader}>
                <Feather name="user" size={26} color={textColor} />
                <Text style={[styles.settingText, { color: textColor }]}>Account</Text>
              </View>
              <Feather
                name={showAccount ? "chevron-up" : "chevron-down"}
                size={26}
                color={textColor}
              />
            </TouchableOpacity>
            {showAccount && (
              <View style={styles.dropdownGroup}>
                {filterMatch("Edit Profile") && (
                  <SettingItem
                    icon={<Feather name="edit" size={24} color={textColor} />}
                    label="Edit Profile"
                    onPress={() => router.push("Profile/EditProfile")}
                    textColor={textColor}
                  />
                )}
                {filterMatch("Manage Posts") && (
                  <SettingItem
                    icon={<Feather name="file-text" size={24} color={textColor} />}
                    label="Manage Posts"
                    onPress={() => router.push("Profile/ManagePost")}
                    textColor={textColor}
                  />
                )}

              </View>
            )}

            {/* Appearance */}
            <TouchableOpacity
              style={styles.dropdownHeaderRow}
              onPress={() => setShowAppearance(!showAppearance)}
              activeOpacity={0.6}
            >
              <View style={styles.dropdownHeader}>
                <Feather name="eye" size={26} color={textColor} />
                <Text style={[styles.settingText, { color: textColor }]}>Appearance</Text>
              </View>
              <Feather
                name={showAppearance ? "chevron-up" : "chevron-down"}
                size={26}
                color={textColor}
              />
            </TouchableOpacity>
            {showAppearance && (
              <View style={styles.dropdownGroup}>
                {filterMatch("Dark Mode") && (
                  <SettingItem
                    icon={<Feather name="moon" size={24} color={textColor} />}
                    label={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                    onPress={handleThemeToggle}
                    textColor={textColor}
                  />
                )}
              </View>
            )}

            {/* Security & Privacy */}
            <TouchableOpacity
              style={styles.dropdownHeaderRow}
              onPress={() => setShowSecurity(!showSecurity)}
              activeOpacity={0.6}
            >
              <View style={styles.dropdownHeader}>
                <Feather name="lock" size={26} color={textColor} />
                <Text style={[styles.settingText, { color: textColor }]}>Security & Privacy</Text>
              </View>
              <Feather
                name={showSecurity ? "chevron-up" : "chevron-down"}
                size={26}
                color={textColor}
              />
            </TouchableOpacity>
            {showSecurity && (
              <View style={styles.dropdownGroup}>
                {filterMatch("Change Password") && (
                  <SettingItem
                    icon={<Feather name="key" size={24} color={textColor} />}
                    label="Change Password"
                    onPress={() => router.push("/Profile/ChangePassword")}
                    textColor={textColor}
                  />
                )}
              </View>
            )}



            {/* Other Options */}
            {filterMatch("Notifications") && (
              <SettingItem
                icon={<Feather name="bell" size={24} color={textColor} />}
                label="Notifications"
                onPress={() => router.push("/Settings/Notifications")}
                textColor={textColor}
              />
            )}
            {filterMatch("Report a problem") && (
              <SettingItem
                icon={<Feather name="alert-circle" size={24} color={textColor} />}
                label="Report a problem"
                onPress={() => Alert.alert("Report a Problem", "Functionality coming soon.")}
                textColor={textColor}
              />
            )}
            {filterMatch("About") && (
              <SettingItem
                icon={<Feather name="info" size={24} color={textColor} />}
                label="About"
                onPress={() => Alert.alert("About", "App version 1.0.0\nDeveloped by YourName")}
                textColor={textColor}
              />
            )}

            {/* Logout */}
            {filterMatch("Logout") && (
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setShowLogoutModal(true)}
                activeOpacity={0.6}
              >
                <Feather name="log-out" size={24} color={textColor} />
                <Text style={[styles.settingText, { color: textColor }]}>{isLoggingOut ? 'Logging out...' : 'Logout'}</Text>
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

      {/* Logout Confirmation Modal */}
      <Modal
        transparent
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}> 
            <Text style={[styles.modalTitle, { color: colors.text }]}>Logout</Text>
            <Text style={[styles.modalMessage, { color: colors.text }]}>Are you sure you want to logout?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDestructive]}
                onPress={performLogout}
                disabled={isLoggingOut}
              >
                <Text style={styles.modalDestructiveText}>{isLoggingOut ? 'Logging out...' : 'Logout'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 80,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 5,
  },
  settingText: {
    marginLeft: 14,
    fontSize: 18,
    fontWeight: "500",
  },
  dropdownGroup: {
    paddingLeft: 40,
  },
  dropdownHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ccc3",
    padding: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#00000022',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalCancel: {
    borderColor: '#cccccc',
  },
  modalDestructive: {
    backgroundColor: '#d9534f',
    borderColor: '#d9534f',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalDestructiveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
