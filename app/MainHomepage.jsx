import React from "react";
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

const MainHomepage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
  const buttonBackground = theme === "light" ? "#e1e5ea" : "#1F2633";
  const textColor = colors.text;

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

        <View style={styles.content}>
          <AccountDetails
            homeownerName="Juan Dela Cruz"
            residentId="B3A - L23"
            avatarUri={null}
            cardBackground={cardBackground}
            textColor={textColor}
          />
          <View style={styles.buttonGrid}>
            <MenuButton
              icon={<Ionicons name="wallet" size={30} color={textColor} />}
              label="FINANCE"
              onPress={() => router.push("/Finance/FinanceHomepage/")}
              buttonBackground={buttonBackground}
              textColor={textColor}
            />
            <MenuButton
              icon={<FontAwesome5 name="users" size={30} color={textColor} />}
              label="COMMUNITY"
              onPress={() => router.push("/Community/CommunityHomepage")}
              buttonBackground={buttonBackground}
              textColor={textColor}
            />
            <MenuButton
              icon={<MaterialIcons name="shield" size={30} color={textColor} />}
              label="SECURITY"
              onPress={() => router.push("/Security/SecurityHomepage")}
              buttonBackground={buttonBackground}
              textColor={textColor}
            />
            <MenuButton
              icon={
                <MaterialIcons name="emergency" size={30} color={textColor} />
              }
              label="EMERGENCY"
              onPress={() => router.push("/Emergency/EmergencyHomepage")}
              buttonBackground={buttonBackground}
              textColor={textColor}
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
  residentId,
  homeownerName,
  avatarUri,
  cardBackground,
  textColor,
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
        <Text style={styles.badgeText}>Homeowner</Text>
      </View>
    </View>

    <View style={styles.cardContent}>
      <Text style={[styles.homeownerName, { color: textColor }]}>
        {homeownerName}
      </Text>
      <Text style={styles.residentId}>Resident ID: {residentId}</Text>

      <TouchableOpacity
        style={[styles.detailsButton, { borderColor: textColor }]}
      >
        <Text style={[styles.detailsButtonText, { color: textColor }]}>
          More Details
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const MenuButton = ({ icon, label, onPress, buttonBackground, textColor }) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: buttonBackground }]}
    onPress={onPress}
  >
    <View style={styles.iconWrapper}>{icon}</View>
    <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
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
  homeownerName: {
    fontSize: 32,
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  button: {
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: 150,
    height: 90,
  },
  buttonText: {
    marginTop: 3,
    fontSize: 14,
    flexShrink: 1,
  },
});
