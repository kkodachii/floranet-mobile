import { Stack } from "expo-router";
import Navbar from "../components/Navbar";
import { View, StyleSheet } from "react-native";

export default function Layout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
