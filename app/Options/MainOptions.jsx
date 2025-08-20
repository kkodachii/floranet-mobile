import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../Theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { authService } from "../../services/api";

const SettingItem = ({ icon, label, onPress, textColor, disabled }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={disabled}>
    {icon}
    <Text style={[styles.settingText, { color: textColor, opacity: disabled ? 0.6 : 1 }]}>{label}</Text>
  </TouchableOpacity>
);

const Option = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { residentName = "Juan Dela Cruz" } = useLocalSearchParams();
  const { theme, colors } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const backgroundColor = colors.background;
  const textColor = colors.text;
  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = statusBarBackground;
  const cardBackground = theme === "light" ? "#f0f0f0" : "#1e1e1e";

  const performLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (_) {
      // ignore
    }
    setShowLogoutModal(false);
    setTimeout(() => {
      router.replace("/");
      setIsLoggingOut(false);
    }, 50);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { paddingTop: insets.top, backgroundColor }]}
    >
      <StatusBar
        backgroundColor={statusBarBackground}
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />

      <View style={styles.container}>
        {/* ✅ Dynamic header title */}
        <Header title={residentName} />

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={[styles.settingsContainer, { backgroundColor: cardBackground }]}> 
            <SettingItem
              icon={<Feather name="flag" size={20} color={textColor} />}
              label="Report Profile"
              onPress={() =>
                Alert.alert("Report", `You have reported ${residentName}.`)
              }
              textColor={textColor}
            />
            <SettingItem
              icon={<Feather name="slash" size={20} color={textColor} />}
              label="Block"
              onPress={() =>
                Alert.alert("Confirm Block", `Block ${residentName}?`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Block", onPress: () => Alert.alert("Blocked", `${residentName} has been blocked.`) },
                ])
              }
              textColor={textColor}
            />
            <SettingItem
              icon={<Feather name="share-2" size={20} color={textColor} />}
              label="Share Profile"
              onPress={() => Alert.alert("Shared", `Link to ${residentName}'s profile copied.`)}
              textColor={textColor}
            />
            {/* Change Password */}
            <SettingItem
              icon={<Feather name="key" size={20} color={textColor} />}
              label="Change Password"
              onPress={() => router.push("/Profile/ChangePassword")}
              textColor={textColor}
            />
            <View style={{ height: 8 }} />
            <SettingItem
              icon={<Feather name="log-out" size={20} color="#d9534f" />}
              label={isLoggingOut ? "Logging out..." : "Logout"}
              onPress={() => setShowLogoutModal(true)}
              textColor={textColor}
              disabled={isLoggingOut}
            />
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

export default Option;

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
  navWrapper: {
    backgroundColor: "#fff",
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
