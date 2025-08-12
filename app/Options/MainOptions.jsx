import React from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../Theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";

const SettingItem = ({ icon, label, onPress, textColor }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    {icon}
    <Text style={[styles.settingText, { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);

const Option = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { residentName = "Juan Dela Cruz" } = useLocalSearchParams();
  const { theme, colors } = useTheme();

  const backgroundColor = colors.background;
  const textColor = colors.text;
  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = statusBarBackground;
  const cardBackground = theme === "light" ? "#f0f0f0" : "#1e1e1e";

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
});
