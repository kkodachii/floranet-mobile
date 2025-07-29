import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: "home-outline",
      iconActive: "home",
    },
    {
      id: "chat",
      label: "Chat",
      icon: "chatbubble-outline",
      iconActive: "chatbubble",
    },
    {
      id: "community",
      label: "Community",
      icon: "people-outline",
      iconActive: "people",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "person-outline",
      iconActive: "person",
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tabItem}
          onPress={() => setActiveTab(tab.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === tab.id ? tab.iconActive : tab.icon}
            size={24}
            color={activeTab === tab.id ? "#000" : "#888"}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === tab.id ? "#000" : "#888" },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#fff",
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
