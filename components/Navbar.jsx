import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "../Theme/ThemeProvider"; // ✅ custom hook for theme

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, colors } = useTheme();

  const isDarkMode = theme === "dark";

  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: "home-outline",
      iconActive: "home",
      route: "/Index",
    },
    {
      id: "wallet",
      label: "Finance",
      icon: "wallet-outline",
      iconActive: "wallet",
      route: "/Finance/FinanceHomepage",
    },
    {
      id: "community",
      label: "Community",
      icon: "people-outline",
      iconActive: "people",
      route: "/Community/CommunityHomepage",
    },
    {
      id: "shield",
      label: "Security",
      icon: "shield-outline",
      iconActive: "shield",
      route: "/Security/SecurityHomepage",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "person-outline",
      iconActive: "person",
      route: "/Profile/MainProfile",
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.navbg || (isDarkMode ? "#1a1a1a" : "#ffffff"),
          borderTopColor: isDarkMode ? "#333" : "#ccc",
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.route;
        const activeColor = "#28942c";
        const inactiveColor = isDarkMode ? "#f6f7f9" : "#1F2633";

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => router.replace(tab.route)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={24}
              color={isActive ? activeColor : inactiveColor}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? activeColor : inactiveColor },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    borderTopWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Navbar;
