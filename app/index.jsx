import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../assets/floranet.png";
import { useTheme } from "../Theme/ThemeProvider";
import { useAuth } from "../services/AuthContext";
import { setOneSignalUserId, sendCurrentOneSignalIdsToBackend } from "./_layout";

const Index = () => {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPendingModal, setShowPendingModal] = useState(false);

  const handleLogin = async () => {
    setError("");
    // Backend requires email + password for /api/user/login
    const email = identifier.trim();
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      const result = await login({ email, password });
      
      // Reinitialize pusher service after successful login
      const pusherService = (await import('../services/optimizedPusherService')).default;
      pusherService.reconnect();
      
      // Also try to send current OneSignal IDs to backend
      await sendCurrentOneSignalIdsToBackend();
      
      // Navigation will be handled automatically by the AuthContext
    } catch (e) {
      const message = e?.response?.data?.message
        || (e?.response?.data?.errors && Object.values(e.response.data.errors).flat().join("\n"))
        || "Login failed. Please check your credentials.";
      
      // Check if it's a pending account error
      if (message.includes("pending approval") || message.includes("not accepted")) {
        setShowPendingModal(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.logoWrapper, { backgroundColor: theme === "light" ? "#f8f9fa" : "#1F2633" }]}> 
              <Image source={Logo} style={styles.logo} />
            </View>
            <Text style={styles.brand}>
              <Text style={{ color: colors.text }}>Flora</Text>
              <Text style={{ color: "#28942c" }}>Net</Text>
            </Text>
            <Text style={[styles.tagline, { color: colors.text }]}> 
              Join our community of homeowners and make managing your home simpler,
              smarter, and safer
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Identifier Input */}
            <View style={styles.inputContainer}>
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
                  name="person-outline" 
                  size={20} 
                  color={colors.text + "80"} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Email"
                  placeholderTextColor={colors.text + "60"}
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
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
                  placeholder="Password"
                  placeholderTextColor={colors.text + "60"}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={colors.text + "80"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push("/Authentication/ForgotPassword")}
            >
              <Text style={[styles.forgotPasswordText, { color: "#28942c" }]}> 
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Error message */}
            {Boolean(error) && (
              <Text style={{ color: '#d9534f', marginBottom: 12 }}>{error}</Text>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { opacity: loading ? 0.6 : 1 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={["#28942c", "#2d9d31", "#32a636"]}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>{loading ? "Logging in..." : "Log In"}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: colors.text }]}> 
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/Authentication/RegisterScreen")}>
                <Text style={[styles.registerLink, { color: "#28942c" }]}> 
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Pending Account Modal */}
      {showPendingModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { 
            backgroundColor: theme === "light" ? "#ffffff" : "#1F2633",
            borderColor: theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
          }]}> 
            <View style={styles.modalContent}>
              <View style={styles.pendingIconContainer}>
                <LinearGradient
                  colors={["#ff9500", "#ff8c00", "#ff7f00"]}
                  style={styles.pendingIconGradient}
                >
                  <Ionicons name="time-outline" size={40} color="#fff" />
                </LinearGradient>
              </View>
              
              <Text style={[styles.modalTitle, { color: colors.text }]}> 
                Account Pending Approval
              </Text>
              
              <Text style={[styles.modalMessage, { color: colors.text }]}> 
                Your account is currently pending admin approval. You will be able to log in once your account has been approved. Please contact an administrator if you have any questions.
              </Text>
              
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => setShowPendingModal(false)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#ff9500", "#ff8c00", "#ff7f00"]}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  brand: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    letterSpacing: 1,
  },
  tagline: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
    opacity: 0.8,
  },
  formSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
  forgotPassword: {
    alignItems: "flex-end",
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 16,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '85%',
    maxWidth: 350,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
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
    alignItems: 'center',
  },
  pendingIconContainer: {
    marginBottom: 20,
  },
  pendingIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff9500',
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
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
    opacity: 0.8,
  },
  modalButton: {
    width: '100%',
  },
  modalButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#ff9500',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
