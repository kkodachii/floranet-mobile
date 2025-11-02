import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../Theme/ThemeProvider";
import { authService } from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";

const RegisterScreen = () => {
  const router = useRouter();
  const { colors, theme } = useTheme();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [homeownerName, setHomeownerName] = useState("");
  const [residentName, setResidentName] = useState("");
  const [block, setBlock] = useState("");
  const [lot, setLot] = useState("");
  const [street, setStreet] = useState("");

  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [residentId, setResidentId] = useState("");
  const [hasViewedTerms, setHasViewedTerms] = useState(false);

  // Street options
  const streetOptions = [
    "Adelfa",
    "Bougainvillea",
    "Camia",
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

  // Get next resident ID when component mounts
  useEffect(() => {
    const getNextResidentId = async () => {
      try {
        const response = await authService.getNextResidentId();
        setResidentId(response.next_resident_id);
      } catch (error) {
        console.error("Error getting next resident ID:", error);
        // Fallback to a default ID if API fails
        setResidentId("MHH0001");
      }
    };

    getNextResidentId();
  }, []);

  const nextStep = () => {
    if (step === 1) {
      if (!homeownerName || !residentName || !residentId) {
        Alert.alert(
          "Error",
          "Please wait for Resident ID to load and fill in all fields before proceeding."
        );
        return;
      }
    } else if (step === 2) {
      if (!block || !lot || !street || !contactNumber) {
        Alert.alert("Error", "Please fill in all fields before proceeding.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleRegister = async () => {
    if (
      !homeownerName ||
      !residentName ||
      !residentId ||
      !block ||
      !lot ||
      !street ||
      !contactNumber ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (street === "") {
      Alert.alert("Error", "Please select a street.");
      return;
    }

    // Validate block and lot format
    if (!block.trim()) {
      Alert.alert("Error", "Please enter a valid block.");
      return;
    }

    if (!lot.trim()) {
      Alert.alert("Error", "Please enter a valid lot.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    // Password length validation
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (!acceptedTerms) {
      Alert.alert("Error", "Please accept the Terms and Conditions.");
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        name: residentName,
        email: email,
        password: password,
        password_confirmation: confirmPassword,
        contact_no: contactNumber,
        house_owner_name: homeownerName,
        resident_id: residentId,
        block: block,
        lot: lot,
        street: street,
        // Note: house_id will be null initially, admin will need to assign it
      };

      const response = await authService.register(userData);

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      }

      Alert.alert("Registration Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => {
    const steps = 3;
    const progress = (step / steps) * 100;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={["#28942c", "#2d9d31"]}
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.text }]}>
          Step {step} of {steps}
        </Text>
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="person-circle-outline" size={32} color="#28942c" />
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Personal Information
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.text }]}>
          Tell us about yourself and your household
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Homeowner Name
        </Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor:
                theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
              borderColor:
                theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
              shadowColor: theme === "light" ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === "light" ? 0.1 : 0,
              shadowRadius: theme === "light" ? 4 : 0,
              elevation: theme === "light" ? 2 : 0,
            },
          ]}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={colors.text + "80"}
            style={styles.inputIcon}
          />
          <TextInput
            autoCapitalize="words"
            placeholder="Enter Homeowner Name"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            value={homeownerName}
            onChangeText={(text) => {
              const titleCase = text
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase());
              setHomeownerName(titleCase);
            }}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Resident Name
        </Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor:
                theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
              borderColor:
                theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
              shadowColor: theme === "light" ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === "light" ? 0.1 : 0,
              shadowRadius: theme === "light" ? 4 : 0,
              elevation: theme === "light" ? 2 : 0,
            },
          ]}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={colors.text + "80"}
            style={styles.inputIcon}
          />
          <TextInput
            autoCapitalize="words"
            placeholder="Enter Resident Name"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            value={residentName}
            onChangeText={(text) => {
              const titleCase = text
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase());
              setResidentName(titleCase);
            }}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Resident ID</Text>
        <View
          style={[
            styles.residentIdContainer,
            {
              backgroundColor:
                theme === "light" ? "#f8f9fa" : "rgba(255, 255, 255, 0.05)",
              borderColor:
                theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
            },
          ]}
        >
          <Ionicons
            name="card-outline"
            size={20}
            color="#28942c"
            style={styles.inputIcon}
          />
          <Text style={[styles.residentIdText, { color: "#28942c" }]}>
            {residentId || "Loading..."}
          </Text>
        </View>
        <Text style={[styles.helperText, { color: colors.text + "80" }]}>
          This ID will be automatically assigned to your account
        </Text>
      </View>

      {/* Navigation Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={nextStep}
        activeOpacity={1.0}
      >
        <LinearGradient
          colors={["#28942c", "#2d9d31", "#32a636"]}
          style={styles.gradientButton}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  useFocusEffect(
    React.useCallback(() => {
      // Check if user accepted terms from the Terms screen
      if (global.termsAccepted) {
        setAcceptedTerms(true);
        setHasViewedTerms(true);
        global.termsAccepted = false; // Reset the flag
      }
    }, [])
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="home-outline" size={32} color="#28942c" />
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Address Information
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.text }]}>
          Provide your residential details
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Block</Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor:
                theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
              borderColor:
                theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
              shadowColor: theme === "light" ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === "light" ? 0.1 : 0,
              shadowRadius: theme === "light" ? 4 : 0,
              elevation: theme === "light" ? 2 : 0,
            },
          ]}
        >
          <Ionicons
            name="business-outline"
            size={20}
            color={colors.text + "80"}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="e.g. A3B"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            value={block}
            onChangeText={(text) => setBlock(text.toUpperCase())}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Lot</Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor:
                theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
              borderColor:
                theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
              shadowColor: theme === "light" ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === "light" ? 0.1 : 0,
              shadowRadius: theme === "light" ? 4 : 0,
              elevation: theme === "light" ? 2 : 0,
            },
          ]}
        >
          <Ionicons
            name="home-outline"
            size={20}
            color={colors.text + "80"}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="e.g. L32"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            value={lot}
            onChangeText={(text) => setLot(text.toUpperCase())}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Street</Text>
        <View
          style={[
            styles.pickerWrapper,
            {
              backgroundColor:
                theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
              borderColor:
                theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
              shadowColor: theme === "light" ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === "light" ? 0.1 : 0,
              shadowRadius: theme === "light" ? 4 : 0,
              elevation: theme === "light" ? 2 : 0,
            },
          ]}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={colors.text + "80"}
            style={styles.inputIcon}
          />
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

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Contact Number
        </Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor:
                theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
              borderColor:
                theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
              shadowColor: theme === "light" ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === "light" ? 0.1 : 0,
              shadowRadius: theme === "light" ? 4 : 0,
              elevation: theme === "light" ? 2 : 0,
            },
          ]}
        >
          <Ionicons
            name="call-outline"
            size={20}
            color={colors.text + "80"}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Enter Contact Number"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            value={contactNumber}
            onChangeText={(text) => {
              const digitsOnly = text.replace(/[^0-9]/g, "");

              if (digitsOnly.length > 11) return;

              if (digitsOnly.length >= 2 && !digitsOnly.startsWith("09")) {
                Alert.alert(
                  "Invalid Number",
                  "Please enter a valid Philippine mobile number."
                );
                return;
              }

              setContactNumber(digitsOnly);
            }}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.prevButton}
          onPress={prevStep}
          activeOpacity={1.0}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.navButtonText, { color: colors.text }]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={nextStep}
          activeOpacity={1.0}
        >
          <LinearGradient
            colors={["#28942c", "#2d9d31", "#32a636"]}
            style={styles.gradientButton}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="shield-checkmark-outline" size={32} color="#28942c" />
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Account Security
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.text }]}>
          Create your account credentials
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Email Address
        </Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor:
                theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
              borderColor:
                theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
              shadowColor: theme === "light" ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === "light" ? 0.1 : 0,
              shadowRadius: theme === "light" ? 4 : 0,
              elevation: theme === "light" ? 2 : 0,
            },
          ]}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color={colors.text + "80"}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Enter Email Address"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor:
                theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
              borderColor:
                theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
              shadowColor: theme === "light" ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === "light" ? 0.1 : 0,
              shadowRadius: theme === "light" ? 4 : 0,
              elevation: theme === "light" ? 2 : 0,
            },
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={colors.text + "80"}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Enter Password"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            activeOpacity={1.0}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.text + "80"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          Confirm Password
        </Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor:
                theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
              borderColor:
                theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
              shadowColor: theme === "light" ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme === "light" ? 0.1 : 0,
              shadowRadius: theme === "light" ? 4 : 0,
              elevation: theme === "light" ? 2 : 0,
            },
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={colors.text + "80"}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
            activeOpacity={1.0}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.text + "80"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.termsContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => {
            if (hasViewedTerms) {
              setAcceptedTerms(!acceptedTerms);
            }
          }}
          activeOpacity={hasViewedTerms ? 1.0 : 0.5}
        >
          <View
            style={[
              styles.checkbox,
              acceptedTerms && styles.checkboxChecked,
              !hasViewedTerms && { opacity: 0.5 }, // Visual indicator that it's disabled
            ]}
          >
            {acceptedTerms && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>
          <Text style={[styles.termsText, { color: colors.text }]}>
            I agree to the{" "}
            <Text
              style={styles.termsLink}
              onPress={() => {
                setHasViewedTerms(true);
                router.push({
                  pathname: "/Authentication/TermsCondition",
                  params: { onAccept: "true" },
                });
              }}
            >
              Terms and Conditions
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.prevButton}
          onPress={prevStep}
          activeOpacity={1.0}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.navButtonText, { color: colors.text }]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          activeOpacity={1.0}
          disabled={isLoading}
        >
          <LinearGradient
            colors={["#28942c", "#2d9d31", "#32a636"]}
            style={styles.gradientButton}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.registerButtonText}>Create Account</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        backgroundColor={statusBarBackground}
        barStyle={theme === "light" ? "dark-content" : "light-content"}
        translucent={false}
      />

      <LinearGradient
        colors={
          theme === "light"
            ? ["#ffffff", "#f8f9fa", "#e9ecef"]
            : ["#14181F", "#1F2633", "#27313F"]
        }
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {renderProgressBar()}

          {/* Content Area */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Success Modal */}
      {showSuccessModal && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: theme === "light" ? "#ffffff" : "#1F2633",
                borderColor:
                  theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
              },
            ]}
          >
            <View style={styles.modalContent}>
              <View style={styles.successIconContainer}>
                <LinearGradient
                  colors={["#28942c", "#2d9d31", "#32a636"]}
                  style={styles.successIconGradient}
                >
                  <Ionicons name="checkmark" size={40} color="#fff" />
                </LinearGradient>
              </View>

              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Registration Successful!
              </Text>

              <Text style={[styles.modalMessage, { color: colors.text }]}>
                Your account has been created successfully. Please wait for
                admin approval before you can log in.
              </Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.replace("/");
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#28942c", "#2d9d31", "#32a636"]}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 60,
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    paddingTop: 20,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  residentIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  residentIdText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28942c",
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  pickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  picker: {
    flex: 1,
    height: 56,
  },
  termsContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#28942c",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#28942c",
  },
  termsText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: "#28942c",
    fontWeight: "600",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  prevButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    marginLeft: 20,
  },
  registerButton: {
    flex: 1,
    marginLeft: 20,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#28942c",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  // Modal Styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    width: "85%",
    maxWidth: 350,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContent: {
    padding: 30,
    alignItems: "center",
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#28942c",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
    opacity: 0.8,
  },
  modalButton: {
    width: "100%",
  },
  modalButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#28942c",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
