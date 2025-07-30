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

const Index = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <Header />

        <View style={styles.content}>
          <AccountDetails
            homeownerName="Juan Dela Cruz"
            residentId="B3A - L23"
            avatarUri={null}
          />
          <View style={styles.buttonGrid}>
            <MenuButton
              icon={<Ionicons name="wallet" size={30} color="#2f3b4c" />}
              label="FINANCE"
              onPress={() => router.push("/Finance/FinanceHomepage/")}
            />
            <MenuButton
              icon={<FontAwesome5 name="users" size={30} color="#2f3b4c" />}
              label="COMMUNITY"
              onPress={() => router.push("/Community/CommunityHomepage")}
            />
            <MenuButton
              icon={<MaterialIcons name="shield" size={30} color="#2f3b4c" />}
              label="SECURITY"
              onPress={() => router.push("/Security/SecurityHomepage")}
            />
            <MenuButton
              icon={
                <MaterialIcons name="emergency" size={30} color="#2f3b4c" />
              }
              label="EMERGENCY"
              onPress={() => router.push("/Emergency/EmergencyHomepage")}
            />
          </View>
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

const AccountDetails = ({ residentId, homeownerName, avatarUri }) => (
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
      <Text style={styles.homeownerName}>{homeownerName}</Text>
      <Text style={styles.residentId}>Resident ID: {residentId}</Text>

      <TouchableOpacity style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>More Details</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const MenuButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <View style={styles.iconWrapper}>{icon}</View>
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

export default Index;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f7f9",
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
  paymentCard: {
  backgroundColor: "#fff",
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
    color: "#2f3b4c",
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
    backgroundColor: "#edf0f2",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: 150,
    height: 90,
  },
  buttonText: {
    color: "#2f3b4c",
    fontWeight: "bold",
    fontSize: 14,
    flexShrink: 1,
  },
});
