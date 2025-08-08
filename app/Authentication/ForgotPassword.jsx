import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useTheme } from "../../Theme/ThemeProvider";

const ForgotPassword = () => {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");

  const handleResetPassword = () => {
    if (email.trim() === "") {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    Alert.alert("Success", "Password reset instructions sent to your email.");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Forgot Password</Text>
      <Text style={[styles.subtext, { color: colors.text }]}>
        Enter your email address to receive a password reset link.
      </Text>

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.text }]}
        placeholder="Email"
        placeholderTextColor={colors.text + "99"}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "green" }]}
        onPress={handleResetPassword}
      >
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
