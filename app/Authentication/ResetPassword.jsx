import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../Theme/ThemeProvider";
import { authService } from "../../services/api";

const ResetPassword = () => {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { email, token } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      Alert.alert(
        "Invalid Link",
        "This password reset link is invalid or incomplete.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/Authentication/ForgotPassword")
          }
        ]
      );
    }
  }, [email, token]);

  const handleResetPassword = async () => {
    if (password.trim() === "") {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(email, token, password, confirmPassword);
      Alert.alert(
        "Success", 
        response.message || "Your password has been reset successfully.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/Authentication/Login")
          }
        ]
      );
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage = error.response?.data?.message || "Failed to reset password. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  if (!email || !token) {
    return null; // Will redirect via useEffect
  }

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
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={["#28942c", "#2d9d31"]}
                  style={styles.iconGradient}
                >
                  <Ionicons name="key-outline" size={32} color="#fff" />
                </LinearGradient>
              </View>

              <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
              <Text style={[styles.subtitle, { color: colors.text }]}>
                Enter your new password below.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                <View style={[styles.inputWrapper, { 
                  backgroundColor: theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
                  borderColor: theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
                  shadowColor: theme === "light" ? "#000" : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: theme === "light" ? 0.1 : 0,
                  shadowRadius: theme === "light" ? 4 : 0,
                  elevation: theme === "light" ? 2 : 0,
                }]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={colors.text + "80"} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.text + "60"}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={colors.text + "80"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
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
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={colors.text + "80"} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.text + "60"}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={colors.text + "80"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.resetButton, isLoading && styles.disabledButton]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ["#6c757d", "#6c757d"] : ["#28942c", "#2d9d31", "#32a636"]}
                  style={styles.gradientButton}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Reset Password</Text>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Back to Login Link */}
              <View style={styles.signInContainer}>
                <Text style={[styles.signInText, { color: colors.text }]}>
                  Remember your password?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.replace("/Authentication/Login")}>
                  <Text style={[styles.signInLink, { color: "#28942c" }]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

export default ResetPassword;

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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#28942c",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.7,
  },
  inputContainer: {
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
  resetButton: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#28942c",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: 16,
  },
  signInLink: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
