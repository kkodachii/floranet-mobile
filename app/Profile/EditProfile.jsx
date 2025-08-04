import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";

const EditProfile = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState("Juan Dela Cruz");
  const [residentID, setResidentID] = useState("B3A - L23");
  const [houseNumber, setHouseNumber] = useState("23");
  const [street, setStreet] = useState("Blk B3A");
  const [contactNumber, setContactNumber] = useState("09171234567");

  const pickProfilePic = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "You need to allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!name || !residentID || !houseNumber || !street || !contactNumber) {
      Alert.alert("Missing Fields", "Please complete all fields.");
      return;
    }

    Alert.alert("Success", "Profile updated successfully.");
  };

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
        <Header title="Edit Profile" />

        <ScrollView contentContainerStyle={styles.form}>
          <TouchableOpacity
            style={styles.profilePicWrapper}
            onPress={pickProfilePic}
          >
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profilePic} />
            ) : (
              <View style={styles.profilePlaceholder} />
            )}
            <Text style={{ marginTop: 6, color: colors.text }}>
              Tap to change photo
            </Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Full Name
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter full name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Resident ID
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g., B3A - L23"
              placeholderTextColor="#888"
              value={residentID}
              onChangeText={setResidentID}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              House Number
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter house number"
              placeholderTextColor="#888"
              value={houseNumber}
              onChangeText={setHouseNumber}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Street</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter street"
              placeholderTextColor="#888"
              value={street}
              onChangeText={setStreet}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Contact Number
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter contact number"
              placeholderTextColor="#888"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
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

export default EditProfile;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: "space-between" },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 62,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "500", marginBottom: 8 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#28942c",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  profilePicWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
  },
  button: {
    backgroundColor: "#28942c",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  navWrapper: {
    backgroundColor: "#fff",
  },
});
