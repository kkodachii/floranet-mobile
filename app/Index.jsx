import React from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const Index = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <Header />

        <View style={styles.content}>
          <AccountDetails
            homeownername="Juan Dela Cruz"
            houseNumber="B3A - L23"
            avatarUri={null}
          />

          <MenuButton
            icon={<Ionicons name="wallet" size={30} color="black" />}
            label="FINANCE AND SERVICES"
          />
          <MenuButton
            icon={<FontAwesome5 name="users" size={30} color="black" />}
            label="COMMUNITY"
          />
          <MenuButton
            icon={<MaterialIcons name="shield" size={30} color="black" />}
            label="SECURITY AND EMERGENCY"
          />
        </View>

        <View
          style={[styles.navWrapper, { paddingBottom: insets.bottom || 16 }]}
        >
          <Navbar />
        </View>
      </View>
    </SafeAreaView>
  );
};

const AccountDetails = ({ houseNumber, homeownername, avatarUri }) => (
  <View style={styles.paymentCard}>
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
      <Text style={styles.homeownername}>{homeownername}</Text>
      <Text style={styles.houseNumber}>House Number: {houseNumber}</Text>

      <TouchableOpacity style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>More Details</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const MenuButton = ({ icon, label }) => (
  <TouchableOpacity style={styles.button}>
    <View style={styles.iconWrapper}>{icon}</View>
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

export default Index;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
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
  navWrapper: {
    backgroundColor: "#fff",
  },

  // Payment Card Styles
  paymentCard: {
    backgroundColor: "#28942c",
    borderRadius: 16,
    padding: 20,
    width: 300,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
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
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badgeText: {
    color: "#28942c",
  },
  cardContent: {
    alignItems: "flex-start",
  },
  houseNumber: {
    color: "white",
    fontSize: 16,
    marginBottom: 15,
  },
  homeownername: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 3,
  },
  detailsButton: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 3,
  },
  detailsButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: 300,
    borderWidth: 1,
    borderColor: "#000",
  },
  iconWrapper: {
    marginRight: 12,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
    flexShrink: 1,
  },
});
