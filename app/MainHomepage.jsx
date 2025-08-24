import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeProvider";
import { StatusBar } from "react-native";
import { authStorage, authService, buildStorageUrl } from "../services/api";

const MainHomepage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
  const buttonBackground = theme === "light" ? "#e1e5ea" : "#1F2633";
  const iconCircleBackground = theme === "light" ? "#f0f4f8" : "#2A3441";
  const subtextColor = theme === "light" ? "#6B7280" : "#9CA3AF";
  const textColor = colors.text;

  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const { user: cachedUser } = await authStorage.load();
      if (cachedUser) setUser(cachedUser);
      try {
        const fresh = await authService.getProfileCached();
        setUser(fresh);
        await authStorage.save({ token: null, user: fresh });
      } catch (_) {}
    })();
  }, []);

  const displayName = user?.name || "Resident";
  const houseNumber = user?.house?.house_number || "-";
  const avatarUri = user?.profile_picture
    ? buildStorageUrl(user.profile_picture)
    : null;

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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header />
        <View style={styles.content}>
          <AccountDetails
            residentName={displayName}
            HouseNumber={houseNumber}
            avatarUri={avatarUri}
            cardBackground={cardBackground}
            textColor={textColor}
          />
          <View style={styles.buttonGrid}>
            <MenuButton
              icon={<Ionicons name="wallet" size={24} color={textColor} />}
              label="Finance"
              subtitle="Manage payments, dues, and billing"
              onPress={() => router.push("/Finance/FinanceHomepage/")}
              buttonBackground={buttonBackground}
              textColor={textColor}
              subtextColor={subtextColor}
              iconCircleBackground={iconCircleBackground}
            />
            <MenuButton
              icon={<FontAwesome5 name="users" size={24} color={textColor} />}
              label="Community"
              subtitle="Connect with neighbors and events"
              onPress={() => router.push("/Community/CommunityHomepage")}
              buttonBackground={buttonBackground}
              textColor={textColor}
              subtextColor={subtextColor}
              iconCircleBackground={iconCircleBackground}
            />
            <MenuButton
              icon={
                <MaterialIcons name="emergency" size={24} color={textColor} />
              }
              label="Security & Emergency"
              subtitle="Report incidents and access emergency contacts"
              onPress={() => router.push("/Emergency/EmergencyHomepage")}
              buttonBackground={buttonBackground}
              textColor={textColor}
              subtextColor={subtextColor}
              iconCircleBackground={iconCircleBackground}
              fullWidth
            />
          </View>
        </View>

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

const AccountDetails = ({
  HouseNumber,
  residentName,
  avatarUri,
  cardBackground,
  textColor,
  onMoreDetails,
}) => (
  <View style={[styles.paymentCard, { backgroundColor: cardBackground }]}>
    <View style={styles.cardHeader}>
      <View style={styles.avatarContainer}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="person" size={35} color="#ccc" />
          </View>
        )}
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Resident</Text>
      </View>
    </View>

    <View style={styles.cardContent}>
      <Text style={[styles.residentName, { color: textColor }]}>
        {residentName}
      </Text>
      <Text style={styles.residentId}>House Number: {HouseNumber}</Text>
    </View>
  </View>
);

const MenuButton = ({
  icon,
  label,
  subtitle,
  onPress,
  buttonBackground,
  textColor,
  subtextColor,
  iconCircleBackground,
  fullWidth,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      fullWidth && styles.buttonWide,
      { backgroundColor: buttonBackground },
    ]}
    onPress={onPress}
  >
    <View style={[styles.iconCircle, { backgroundColor: iconCircleBackground }]}>
      {icon}
    </View>
    <View style={styles.buttonTextContainer}>
      <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
      <Text style={[styles.buttonSubtext, { color: subtextColor }]}>
        {subtitle}
      </Text>
    </View>
  </TouchableOpacity>
);

export default MainHomepage;

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
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  navWrapper: {},
  paymentCard: {
    borderRadius: 16,
    padding: 20,
    width: 310,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 35,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#28942c",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: "#ffff",
  },
  cardContent: {
    alignItems: "flex-start",
  },
  residentId: {
    color: "#28942c",
    fontSize: 16,
    marginBottom: 15,
  },
  residentName: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 3,
  },
  detailsButton: {
    borderWidth: 1,
    borderColor: "#2f3b4c",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 3,
  },
  detailsButtonText: {
    color: "#2f3b4c",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonGrid: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    width: "100%",
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    width: 310,
    minHeight: 80,
  },
  buttonWide: {
    width: 310,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
});