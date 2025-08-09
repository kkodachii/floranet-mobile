import React, { useState } from "react";
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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../Theme/ThemeProvider";

const RegisterScreen = () => {
  const router = useRouter();
  const { colors, theme } = useTheme();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [homeownerName, setHomeownerName] = useState("");
  const [residentName, setResidentName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [relationship, setRelationship] = useState("Family/Relative");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleRegister = () => {
    if (
      !homeownerName ||
      !residentName ||
      !houseNumber ||
      !street ||
      !contactNumber ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match.");
      return;
    }
    if (!acceptedTerms) {
      Alert.alert("Please accept the Terms and Conditions.");
      return;
    }
    Alert.alert("Registered successfully!");
    router.replace("/MainHomepage");
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
        <Text style={[styles.stepTitle, { color: colors.text }]}>Personal Information</Text>
        <Text style={[styles.stepSubtitle, { color: colors.text }]}>
          Tell us about yourself and your household
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Homeowner Name</Text>
        <View style={[styles.inputWrapper, { 
          backgroundColor: theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
          borderColor: theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
          shadowColor: theme === "light" ? "#000" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === "light" ? 0.1 : 0,
          shadowRadius: theme === "light" ? 4 : 0,
          elevation: theme === "light" ? 2 : 0,
        }]}>
          <Ionicons name="person-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
          <TextInput
            placeholder="Enter Homeowner Name"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            value={homeownerName}
            onChangeText={setHomeownerName}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Resident Name</Text>
        <View style={[styles.inputWrapper, { 
          backgroundColor: theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
          borderColor: theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
          shadowColor: theme === "light" ? "#000" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === "light" ? 0.1 : 0,
          shadowRadius: theme === "light" ? 4 : 0,
          elevation: theme === "light" ? 2 : 0,
        }]}>
          <Ionicons name="person-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
          <TextInput
            placeholder="Enter Resident Name"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            value={residentName}
            onChangeText={setResidentName}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Relationship</Text>
        <View style={[styles.pickerWrapper, { 
          backgroundColor: theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
          borderColor: theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
          shadowColor: theme === "light" ? "#000" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === "light" ? 0.1 : 0,
          shadowRadius: theme === "light" ? 4 : 0,
          elevation: theme === "light" ? 2 : 0,
        }]}>
          <Picker
            selectedValue={relationship}
            onValueChange={setRelationship}
            style={[styles.picker, { color: colors.text }]}
          >
            <Picker.Item label="Family/Relative" value="Family/Relative" />
            <Picker.Item label="Tenant" value="Tenant" />
            <Picker.Item label="Owner" value="Owner" />
          </Picker>
        </View>
      </View>

      {/* Navigation Button */}
      <TouchableOpacity style={styles.nextButton} onPress={nextStep} activeOpacity={1.0}>
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

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="home-outline" size={32} color="#28942c" />
        <Text style={[styles.stepTitle, { color: colors.text }]}>Address Information</Text>
        <Text style={[styles.stepSubtitle, { color: colors.text }]}>
          Provide your residential details
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>House Number</Text>
        <View style={[styles.inputWrapper, { 
          backgroundColor: theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
          borderColor: theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
          shadowColor: theme === "light" ? "#000" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === "light" ? 0.1 : 0,
          shadowRadius: theme === "light" ? 4 : 0,
          elevation: theme === "light" ? 2 : 0,
        }]}>
          <Ionicons name="home-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
          <TextInput
            placeholder="Enter House Number"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            value={houseNumber}
            onChangeText={setHouseNumber}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Street</Text>
        <View style={[styles.inputWrapper, { 
          backgroundColor: theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
          borderColor: theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
          shadowColor: theme === "light" ? "#000" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === "light" ? 0.1 : 0,
          shadowRadius: theme === "light" ? 4 : 0,
          elevation: theme === "light" ? 2 : 0,
        }]}>
          <Ionicons name="location-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
          <TextInput
            placeholder="Enter Street Name"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            value={street}
            onChangeText={setStreet}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Contact Number</Text>
        <View style={[styles.inputWrapper, { 
          backgroundColor: theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
          borderColor: theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
          shadowColor: theme === "light" ? "#000" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === "light" ? 0.1 : 0,
          shadowRadius: theme === "light" ? 4 : 0,
          elevation: theme === "light" ? 2 : 0,
        }]}>
          <Ionicons name="call-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
          <TextInput
            placeholder="Enter Contact Number"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.prevButton} onPress={prevStep} activeOpacity={1.0}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.navButtonText, { color: colors.text }]}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={nextStep} activeOpacity={1.0}>
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
        <Text style={[styles.stepTitle, { color: colors.text }]}>Account Security</Text>
        <Text style={[styles.stepSubtitle, { color: colors.text }]}>
          Create your account credentials
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
        <View style={[styles.inputWrapper, { 
          backgroundColor: theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
          borderColor: theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
          shadowColor: theme === "light" ? "#000" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === "light" ? 0.1 : 0,
          shadowRadius: theme === "light" ? 4 : 0,
          elevation: theme === "light" ? 2 : 0,
        }]}>
          <Ionicons name="mail-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
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
        <View style={[styles.inputWrapper, { 
          backgroundColor: theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
          borderColor: theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
          shadowColor: theme === "light" ? "#000" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === "light" ? 0.1 : 0,
          shadowRadius: theme === "light" ? 4 : 0,
          elevation: theme === "light" ? 2 : 0,
        }]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
          <TextInput
            placeholder="Enter Password"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} activeOpacity={1.0}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.text + "80"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
        <View style={[styles.inputWrapper, { 
          backgroundColor: theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
          borderColor: theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
          shadowColor: theme === "light" ? "#000" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme === "light" ? 0.1 : 0,
          shadowRadius: theme === "light" ? 4 : 0,
          elevation: theme === "light" ? 2 : 0,
        }]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor={colors.text + "60"}
            style={[styles.input, { color: colors.text }]}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon} activeOpacity={1.0}>
            <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.text + "80"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.termsContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAcceptedTerms(!acceptedTerms)}
          activeOpacity={1.0}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
            {acceptedTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={[styles.termsText, { color: colors.text }]}>
            I agree to the{" "}
            <Text style={styles.termsLink} onPress={() => router.push("/Authentication/TermsCondition")}>
              Terms and Conditions
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.prevButton} onPress={prevStep} activeOpacity={1.0}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.navButtonText, { color: colors.text }]}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={1.0}>
          <LinearGradient
            colors={["#28942c", "#2d9d31", "#32a636"]}
            style={styles.gradientButton}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
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
        colors={theme === "light" 
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
  pickerWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  picker: {
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
});
