import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";

const categories = ["Event", "Announcement", "Business", "Vendor"];

const CreatePost = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const [caption, setCaption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [images, setImages] = useState([]);

  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "You need to allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: selectedCategory !== "Event",
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset) => asset.uri);

      if (selectedCategory === "Event") {
        setImages([selected[0]]); // Only allow one
      } else {
        setImages((prev) => [...prev, ...selected]);
      }
    }
  };

  const handleSubmit = async () => {
    if (
      !selectedCategory ||
      !caption.trim() ||
      images.length === 0 ||
      (selectedCategory === "Event" &&
        (!eventDate.trim() || !eventTime.trim() || !eventLocation.trim()))
    ) {
      Alert.alert("Missing Fields", "Please complete all fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("category", selectedCategory);

      if (selectedCategory === "Event") {
        const eventData = {
          dateTime: `${eventDate} – ${eventTime}`,
          location: eventLocation,
        };
        formData.append("event", JSON.stringify(eventData));
        formData.append("eventImage", {
          uri: images[0],
          name: "eventImage.jpg",
          type: "image/jpeg",
        });
      } else {
        images.forEach((uri, index) => {
          formData.append("images", {
            uri,
            name: `photo${index}.jpg`,
            type: "image/jpeg",
          });
        });
      }

      const response = await fetch("https://your-api.com/posts", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Post created successfully!");
        setCaption("");
        setImages([]);
        setSelectedCategory("");
        setEventDate("");
        setEventTime("");
        setEventLocation("");
      } else {
        Alert.alert("Error", data.message || "Something went wrong.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to server.");
    }
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
        <Header title="Create Post" />

        <ScrollView contentContainerStyle={styles.form}>
          {/* Category Chips */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Select Category
            </Text>
            <View style={styles.chipContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        selectedCategory === cat ? "#28942c" : "#e0e0e0",
                    },
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setImages([]); // reset images on category change
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: selectedCategory === cat ? "#fff" : "#000",
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Caption */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Caption</Text>
            <TextInput
              style={[
                styles.input,
                { height: 100, textAlignVertical: "top", color: colors.text },
              ]}
              placeholder="Write a caption..."
              placeholderTextColor="#888"
              multiline
              value={caption}
              onChangeText={setCaption}
            />
          </View>

          {/* Event Inputs */}
          {selectedCategory === "Event" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Event Date
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g., Fri, 2 June"
                  placeholderTextColor="#888"
                  value={eventDate}
                  onChangeText={setEventDate}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Event Time
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g., 11:00 AM"
                  placeholderTextColor="#888"
                  value={eventTime}
                  onChangeText={setEventTime}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Location
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g., Clubhouse, Community Area"
                  placeholderTextColor="#888"
                  value={eventLocation}
                  onChangeText={setEventLocation}
                />
              </View>
            </>
          )}

          {/* Image Picker */}
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImages}>
            <Text style={styles.uploadBtnText}>
              {selectedCategory === "Event" ? "Add Event Banner" : "Add Photos"}
            </Text>
          </TouchableOpacity>

          {/* Image Preview */}
          <View style={styles.imagePreviewContainer}>
            {images.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.imagePreview} />
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit Post</Text>
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

export default CreatePost;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 62,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#28942c",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "500",
  },
  uploadBtn: {
    backgroundColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 14,
  },
  uploadBtnText: {
    color: "#000",
    fontWeight: "500",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
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
