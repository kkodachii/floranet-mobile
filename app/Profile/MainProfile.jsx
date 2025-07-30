import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import React from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MainProfile = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <Header />

        <View style={styles.content}>
          <Text style={styles.title}>Profile Homepage</Text>
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

export default MainProfile;

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
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
