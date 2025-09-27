import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeProvider";
import { useRouter } from "expo-router";
import { authStorage, authService } from "../services/api";

const Header = () => {
  const { theme, colors } = useTheme();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadUnread = async () => {
      try {
        // load cached auth (same pattern as your EditProfile)
        const { user } = await authStorage.load();
        if (!user?.id) {
          if (mounted) setUnreadCount(0);
          return;
        }

        // call authService.getNotifications(user.id)
        const res = await authService.getNotifications(user.id);

        // support both axios-like responses and direct arrays
        const items = res?.data ?? res ?? [];

        // determine unread: handle both "read_at" (timestamp) or "read" (boolean)
        const unread = Array.isArray(items)
          ? items.filter((n) => !(n?.read_at || n?.read)).length
          : 0;

        if (mounted) setUnreadCount(unread);
      } catch (err) {
        console.warn("Failed to load notifications:", err?.message ?? err);
        if (mounted) setUnreadCount(0);
      }
    };

    loadUnread();

    return () => {
      mounted = false;
    };
  }, []); // runs once on mount; add dependencies if you want auto-refresh

  const isDarkMode = theme === "dark";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.headbg,
          borderBottomColor: isDarkMode ? "#333" : "#ccc",
        },
      ]}
    >
      <Text style={styles.brand}>
        <Text style={{ color: colors.text }}>Flora</Text>
        <Text style={{ color: "#28942c" }}>Net</Text>
      </Text>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => router.push("/Settings/Notifications")}
      >
        <View>
          <Ionicons
            name="notifications-outline"
            size={28}
            color={colors.text}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  brand: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  iconButton: {
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});

export default Header;
