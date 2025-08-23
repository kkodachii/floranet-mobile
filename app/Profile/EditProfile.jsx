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
  Modal,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { authStorage, authService, buildStorageUrl } from "../../services/api";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

const EditProfile = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const [profilePic, setProfilePic] = useState(null); // local picked uri (file:)
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const openModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const [initial, setInitial] = useState({
    name: "",
    email: "",
    contact_no: "",
    house_number: "",
    street: "",
  });

  const streetOptions = [
    "Adelfa",
    "Bougainvillea",
    "Champaca",
    "Dahlia",
    "Gumamela",
    "Ilang-ilang",
    "Jasmin",
    "Kalachuchi",
    "Lilac",
    "Rosal",
    "Sampaguita",
    "Santan",
    "Waling-waling",
  ];

  useEffect(() => {
    (async () => {
      try {
        // First try to load from cache
        const { user: cached } = await authStorage.load();
        let userData = cached;
        
        // If no cached data, try to fetch fresh data
        if (!userData) {
          try {
            userData = await authService.getProfileCached({ force: true });
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            return;
          }
        }
        
        if (userData) {
          setUser(userData);
          const start = {
            name: userData.name || "",
            email: userData.email || "",
            contact_no: userData.contact_no || "",
            house_number: userData.house?.house_number || "",
            street: userData.house?.street || "",
          };
          setInitial(start);
          setName(start.name);
          setEmail(start.email);
          setContactNumber(start.contact_no);
          setHouseNumber(start.house_number);
          setStreet(start.street);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    })();
  }, []);

  const pickProfilePic = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      openModal("Permission denied", "You need to allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setProfilePic(uri);
    }
  };

  const hasFieldChanges = useMemo(() => {
    return (
      name !== initial.name ||
      email !== initial.email ||
      contactNumber !== initial.contact_no ||
      houseNumber !== initial.house_number ||
      street !== initial.street
    );
  }, [name, email, contactNumber, houseNumber, street, initial]);

  const hasPicChange = !!profilePic;
  const disableSave = !hasFieldChanges && !hasPicChange;

  const handleSubmit = async () => {
    if (disableSave) return;
    if (!name || !email) {
      openModal("Validation", "Please enter name and email.");
      return;
    }
    try {
      setSaving(true);
      const payload = {};
      if (name !== initial.name) payload.name = name;
      if (email !== initial.email) payload.email = email;
      if (contactNumber !== initial.contact_no) payload.contact_no = contactNumber;
      if (houseNumber !== initial.house_number) payload.house_number = houseNumber;
      if (street !== initial.street) payload.street = street;

      if (Object.keys(payload).length > 0) {
        await authService.updateProfile(payload);
      }

      if (hasPicChange && profilePic.startsWith("file:")) {
        await authService.uploadProfilePicture(profilePic);
        setProfilePic(null);
      }

      const fresh = await authService.getProfileCached({ force: true });
      setUser(fresh);
      await authStorage.save({ token: null, user: fresh });

      const updatedInit = {
        name,
        email,
        contact_no: contactNumber,
        house_number: houseNumber,
        street,
      };
      setInitial(updatedInit);

      openModal("Success", "Profile updated successfully.");
    } catch (e) {
      const message = e?.response?.data?.message
        || (e?.response?.data?.errors && Object.values(e.response.data.errors).flat().join("\n"))
        || "Failed to update profile.";
      openModal("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const displayPicUri = profilePic || (user?.profile_picture ? buildStorageUrl(user.profile_picture) : null);

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
            {displayPicUri ? (
              <Image source={{ uri: displayPicUri }} style={styles.profilePic} />
            ) : (
              <View style={styles.profilePlaceholder} />
            )}
            <Text style={{ marginTop: 6, color: colors.text }}>
              Tap to change photo
            </Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <View style={[styles.inputWrapper, inputWrapperStyle(theme, colors)]}>
              <Ionicons name="person-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter full name"
                placeholderTextColor={colors.text + "60"}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <View style={[styles.inputWrapper, inputWrapperStyle(theme, colors)]}>
              <Ionicons name="mail-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter email"
                placeholderTextColor={colors.text + "60"}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Contact Number</Text>
            <View style={[styles.inputWrapper, inputWrapperStyle(theme, colors)]}>
              <Ionicons name="call-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter contact number"
                placeholderTextColor={colors.text + "60"}
                value={contactNumber}
                onChangeText={setContactNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>House Number</Text>
            <View style={[styles.inputWrapper, inputWrapperStyle(theme, colors)]}>
              <Ionicons name="home-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter house number (e.g., B3A - L23)"
                placeholderTextColor={colors.text + "60"}
                value={houseNumber}
                onChangeText={setHouseNumber}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Street</Text>
            <View style={[styles.pickerWrapper, inputWrapperStyle(theme, colors)]}>
              <Ionicons name="location-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
              <Picker
                style={[styles.picker, { color: colors.text }]}
                selectedValue={street}
                onValueChange={(itemValue) => setStreet(itemValue)}
                dropdownIconColor={colors.text}
              >
                <Picker.Item label="Select Street" value="" />
                {streetOptions.map((option, index) => (
                  <Picker.Item key={index} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity style={[styles.button, disableSave ? { opacity: 0.5 } : null]} onPress={handleSubmit} disabled={saving || disableSave}>
            <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
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

      {/* Validation Modal */}
      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}> 
            <Text style={[styles.modalTitle, { color: colors.text }]}>{modalTitle}</Text>
            <Text style={[styles.modalMessage, { color: colors.text }]}>{modalMessage}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalPrimary]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalPrimaryText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const inputWrapperStyle = (theme, colors) => ({
  backgroundColor: theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
  borderColor: theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
  shadowColor: theme === "light" ? "#000" : "transparent",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: theme === "light" ? 0.1 : 0,
  shadowRadius: theme === "light" ? 4 : 0,
  elevation: theme === "light" ? 2 : 0,
});

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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, paddingVertical: 16 },
  pickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  picker: { flex: 1, height: 56 },
  profilePicWrapper: { alignItems: "center", marginBottom: 20 },
  profilePic: { width: 100, height: 100, borderRadius: 50 },
  profilePlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#ccc" },
  button: {
    backgroundColor: "#28942c",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  navWrapper: { backgroundColor: "#fff" },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxWidth: 360, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#00000022' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalMessage: { fontSize: 14, opacity: 0.8, marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  modalPrimary: { backgroundColor: '#28942c' },
  modalPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
