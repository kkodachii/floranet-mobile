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
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { communityService, authService } from "../../services/api";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

const CreatePost = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  const [caption, setCaption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Event fields - will be combined into content
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState(new Date());
  const [eventLocation, setEventLocation] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPost, setCreatedPost] = useState(null);

  // Get available categories based on user type
  const getAvailableCategories = () => {
    if (!user) return ["general"];
    
    const isVendor = user.vendor && user.vendor.business_name && user.vendor.isAccepted;
    
    if (isVendor) {
      return ["general", "events", "business"];
    } else {
      return ["general", "events"];
    }
  };

  const availableCategories = getAvailableCategories();
  
  // Debug logging
  useEffect(() => {
    console.log('CreatePost - Available categories:', availableCategories);
    console.log('CreatePost - User vendor status:', {
      hasVendor: !!user?.vendor,
      businessName: user?.vendor?.business_name,
      isAccepted: user?.vendor?.isAccepted
    });
  }, [user, availableCategories]);

  // Load user data on component mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Clear cache and force refresh to get latest user data including vendor info
        await authService.clearProfileCache();
        const userData = await authService.getProfileCached({ force: true });
        console.log('CreatePost - User vendor data:', userData?.vendor);
        setUser(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUser();
  }, []);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "You need to allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: selectedCategory !== "events",
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: 'image/jpeg'
      }));

      if (selectedCategory === "events") {
        setImages([selected[0]]); // Only allow one
      } else {
        setImages((prev) => [...prev, ...selected]);
      }
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Reset form
    setCaption("");
    setImages([]);
    setSelectedCategory("");
    setEventDate(new Date());
    setEventTime(new Date());
    setEventLocation("");
    // Navigate back
    router.back();
  };

  const handleSubmit = async () => {
    if (!selectedCategory || (!caption.trim() && images.length === 0)) {
      Alert.alert("Missing Fields", "Please add content and select a category.");
      return;
    }

    try {
      setLoading(true);
      
      // Combine event fields into content if it's an event post
      let finalContent = caption.trim();
      
      if (selectedCategory === "events") {
        const eventDetails = [];
        
        // Format date
        const formattedDate = eventDate.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        eventDetails.push(`Date: ${formattedDate}`);
        
        // Format time
        const formattedTime = eventTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        eventDetails.push(`Time: ${formattedTime}`);
        
        if (eventLocation.trim()) {
          eventDetails.push(`Location: ${eventLocation.trim()}`);
        }
        
        if (eventDetails.length > 0) {
          finalContent = `${finalContent}\n\nEvent Details:\n${eventDetails.join('\n')}`;
        }
      }
      
      const postData = {
        type: images.length > 0 ? (finalContent.trim() ? 'mixed' : 'image') : 'text',
        category: selectedCategory,
        content: finalContent,
        visibility: 'public',
        images: images
      };

      const response = await communityService.createPost(postData);

      if (response.success) {
        setCreatedPost(response.data);
        setShowSuccessModal(true);
      } else {
        Alert.alert("Error", response.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
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
              {availableCategories.map((cat) => (
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
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
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

          {/* Event Inputs - Optional */}
          {selectedCategory === "events" && (
            <View style={[styles.eventSection, { backgroundColor: theme === 'light' ? 'rgba(40,148,44,0.05)' : 'rgba(40,148,44,0.1)' }]}>
              <Text style={[styles.eventSectionTitle, { color: colors.text }]}>
                Event Details (Optional)
              </Text>
              
              <View style={styles.eventFieldsContainer}>
                <View style={styles.eventField}>
                  <Text style={[styles.eventLabel, { color: colors.text }]}>
                    Date
                  </Text>
                  <TouchableOpacity
                    style={[styles.eventPicker, { 
                      backgroundColor: theme === 'light' ? '#ffffff' : '#1F2633',
                      borderColor: theme === 'light' ? '#e0e0e0' : '#2A2F3A'
                    }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={[styles.eventPickerText, { color: colors.text }]}>
                      {eventDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                    <Text style={styles.eventPickerIcon}>📅</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={eventDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          setEventDate(selectedDate);
                        }
                      }}
                    />
                  )}
                </View>

                <View style={styles.eventField}>
                  <Text style={[styles.eventLabel, { color: colors.text }]}>
                    Time
                  </Text>
                  <TouchableOpacity
                    style={[styles.eventPicker, { 
                      backgroundColor: theme === 'light' ? '#ffffff' : '#1F2633',
                      borderColor: theme === 'light' ? '#e0e0e0' : '#2A2F3A'
                    }]}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={[styles.eventPickerText, { color: colors.text }]}>
                      {eventTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </Text>
                    <Text style={styles.eventPickerIcon}>🕐</Text>
                  </TouchableOpacity>
                  {showTimePicker && (
                    <DateTimePicker
                      value={eventTime}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedTime) => {
                        setShowTimePicker(false);
                        if (selectedTime) {
                          setEventTime(selectedTime);
                        }
                      }}
                    />
                  )}
                </View>

                <View style={styles.eventField}>
                  <Text style={[styles.eventLabel, { color: colors.text }]}>
                    Location (Optional)
                  </Text>
                  <TextInput
                    style={[styles.eventInput, { 
                      backgroundColor: theme === 'light' ? '#ffffff' : '#1F2633',
                      borderColor: theme === 'light' ? '#e0e0e0' : '#2A2F3A',
                      color: colors.text 
                    }]}
                    placeholder="e.g., Clubhouse, Community Area"
                    placeholderTextColor={theme === 'light' ? '#888' : '#666'}
                    value={eventLocation}
                    onChangeText={setEventLocation}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Image Picker */}
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImages}>
            <Text style={styles.uploadBtnText}>
              {selectedCategory === "events" ? "Add Event Banner" : "Add Photos"}
            </Text>
          </TouchableOpacity>

          {/* Image Preview */}
          <View style={styles.imagePreviewContainer}>
            {images.map((image, idx) => (
              <Image key={idx} source={{ uri: image.uri }} style={styles.imagePreview} />
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity 
            style={[
              styles.button, 
              { 
                opacity: (loading || !selectedCategory || (!caption.trim() && images.length === 0)) ? 0.6 : 1,
                backgroundColor: (loading || !selectedCategory || (!caption.trim() && images.length === 0)) ? '#ccc' : '#28942c'
              }
            ]} 
            onPress={handleSubmit}
            disabled={loading || !selectedCategory || (!caption.trim() && images.length === 0)}
          >
            <Text style={[
              styles.buttonText,
              { color: (loading || !selectedCategory || (!caption.trim() && images.length === 0)) ? '#666' : '#fff' }
            ]}>
              {loading ? "Creating Post..." : "Submit Post"}
            </Text>
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

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleSuccessModalClose}
        >
          <View style={[styles.modalOverlay, { backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)' }]}>
            <View style={[
              styles.successModal, 
              { 
                backgroundColor: colors.cardBackground || (theme === 'light' ? '#ffffff' : '#1F2633'),
                borderColor: colors.border || (theme === 'light' ? '#e0e0e0' : '#2A2F3A'),
                shadowColor: theme === 'light' ? '#000' : '#fff'
              }
            ]}>
              <Text style={[styles.successTitle, { color: colors.text || (theme === 'light' ? '#000' : '#fff') }]}>
                Post Created Successfully!
              </Text>
              <Text style={[styles.successMessage, { color: colors.textSecondary || (theme === 'light' ? '#666' : '#999') }]}>
                Your post has been shared with the community.
              </Text>
              <TouchableOpacity
                style={[styles.successButton, { backgroundColor: '#28942c' }]}
                onPress={handleSuccessModalClose}
              >
                <Text style={styles.successButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  pickerInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
  },
  pickerIcon: {
    fontSize: 18,
  },
  eventSection: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(40,148,44,0.2)',
  },
  eventSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#28942c',
  },
  eventFieldsContainer: {
    gap: 16,
  },
  eventField: {
    marginBottom: 16,
  },
  eventLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  eventPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  eventPickerText: {
    fontSize: 14,
    flex: 1,
  },
  eventPickerIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  eventInput: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
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
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successModal: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  successButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
