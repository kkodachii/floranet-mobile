import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import Logo from "../assets/floranet.png";
import { useTheme } from "../Theme/ThemeProvider";

const Index = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    router.push("/MainHomepage");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.brand}>
          <Text style={{ color: colors.text }}>Flora</Text>
          <Text style={{ color: "#28942c" }}>Net</Text>
        </Text>
        <Text style={[styles.tagline, { color: colors.text }]}>
          Join our community of homeowners and make managing your home simpler,
          smarter, and safer
        </Text>
      </View>

      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.background, color: colors.text }
        ]}
        placeholder="Resident ID / Email / Username"
        placeholderTextColor={colors.text + "99"}
        value={identifier}
        onChangeText={setIdentifier}
      />

      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.background, color: colors.text }
        ]}
        placeholder="Password"
        placeholderTextColor={colors.text + "99"}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => router.push("/Authentication/ForgotPassword")}
      >
        <Text style={[styles.forgotPasswordText, { color: "#28942c" }]}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#28942c" }]}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => router.push("/Authentication/RegisterScreen")}
      >
        <Text style={styles.registerText}>
          Don’t have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 8,
    resizeMode: "contain",
  },
  brand: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  tagline: {
    textAlign: "center",
    fontSize: 16,
    paddingHorizontal: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  forgotPassword: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontWeight: "500",
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  registerButton: {
    alignItems: "center",
  },
  registerText: {
    color: "#28942c",
  },
});
