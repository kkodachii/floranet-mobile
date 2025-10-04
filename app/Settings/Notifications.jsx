import React, { useMemo, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../Theme/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderBack from "../../components/HeaderBack";
import { authStorage, authService } from "../../services/api";

const categories = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "general", label: "General" },
  { key: "waste", label: "Waste" },
];

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState("all");

  // 🔹 Load user from storage
  useEffect(() => {
    (async () => {
      try {
        const { user: cached } = await authStorage.load();
        if (cached) {
          setUser(cached);
          fetchNotifications(cached.id);
        }
      } catch (err) {
        console.error("❌ Failed to load user:", err);
      }
    })();
  }, []);

  // 🔹 Fetch notifications
  const fetchNotifications = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await authService.getNotifications(id);
      setNotifications(res);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Mark single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await authService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    } catch (err) {
      console.error("❌ Error marking as read:", err);
    }
  };

  // 🔹 Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await authService.markAllAsRead(user.id);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (err) {
      console.error("❌ Error marking all as read:", err);
    }
  };

  // 🔹 Filter tabs
  const filtered = useMemo(() => {
    if (active === "all") return notifications;
    if (active === "unread") return notifications.filter((n) => !n.read_at);
    
    // Filter by notification type
    return notifications.filter((n) => {
      const notificationType = n.data?.type;
      
      if (active === "waste") {
        // Check for waste-related notifications
        return notificationType === "waste" || 
               notificationType === "garbage" ||
               n.data?.title?.toLowerCase().includes("waste") ||
               n.data?.title?.toLowerCase().includes("garbage") ||
               n.data?.message?.toLowerCase().includes("waste") ||
               n.data?.message?.toLowerCase().includes("garbage");
      } else if (active === "general") {
        // All other notifications go to general
        return notificationType !== "waste" && 
               notificationType !== "garbage" &&
               !n.data?.title?.toLowerCase().includes("waste") &&
               !n.data?.title?.toLowerCase().includes("garbage") &&
               !n.data?.message?.toLowerCase().includes("waste") &&
               !n.data?.message?.toLowerCase().includes("garbage");
      }
      
      return false;
    });
  }, [notifications, active]);

  // 🔹 Render item
  const renderItem = ({ item }) => {
    const tint = "#28942c";
    const cardBg = theme === "light" ? "#fff" : "#14181F";
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleMarkAsRead(item.id)}
        style={[
          styles.card,
          {
            backgroundColor: cardBg,
            borderColor: theme === "light" ? "#e1e5ea" : "#27313F",
            opacity: item.read_at ? 0.6 : 1,
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: tint + "20" }]}>
          <Ionicons name="notifications" size={20} color={tint} />
          {!item.read_at && (
            <View style={[styles.iconUnreadDot, { borderColor: cardBg }]} />
          )}
        </View>
        <View style={styles.cardContent}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.data?.title || "Notification"}
          </Text>
          <Text
            style={[styles.message, { color: colors.text + "AA" }]}
            numberOfLines={2}
          >
            {item.data?.message}
          </Text>
          <Text style={[styles.timestamp, { color: colors.text + "88" }]}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <StatusBar
        backgroundColor={theme === "light" ? "#ffffff" : "#14181F"}
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />

      <View style={styles.container}>
        <HeaderBack title="Notifications" />

        <View style={{ flex: 1 }}>
          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={[
                styles.actionBtn,
                { backgroundColor: theme === "light" ? "#f1f3f5" : "#1F2633" },
              ]}
            >
              <Ionicons name="checkmark-done" size={16} color="#28942c" />
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                Mark all read
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.chipsRow}>
            {categories.map((c) => {
              const selected = active === c.key;
              const baseBg = theme === "light" ? "#f1f3f5" : "#1F2633";
              const baseBorder = theme === "light" ? "#e1e5ea" : "#27313F";
              return (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => setActive(c.key)}
                  style={[
                    styles.chip,
                    { backgroundColor: baseBg, borderColor: baseBorder },
                    selected && {
                      backgroundColor: "#28942c",
                      borderColor: "#28942c",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: selected ? "#fff" : colors.text },
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* List */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#28942c"
              style={{ marginTop: 20 }}
            />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={
                filtered.length === 0 && {
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }
              }
              ListEmptyComponent={() => (
                <View style={{ alignItems: "center" }}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={28}
                    color={colors.text + "66"}
                  />
                  <Text style={{ color: colors.text + "88", marginTop: 8 }}>
                    No notifications
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: "flex-start" },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionLabel: { fontSize: 13, fontWeight: "600" },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipLabel: { fontSize: 13, fontWeight: "600" },
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    position: "relative",
  },
  iconUnreadDot: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#28942c",
    borderWidth: 2,
  },
  cardContent: { flex: 1 },
  title: { fontSize: 14, fontWeight: "700" },
  message: { marginTop: 4, fontSize: 13 },
  timestamp: { marginTop: 6, fontSize: 11 },
});
