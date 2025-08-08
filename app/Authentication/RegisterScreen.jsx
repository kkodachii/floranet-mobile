import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useTheme } from "../../Theme/ThemeProvider";

const RegisterScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();

  const [step, setStep] = useState(1);

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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={[styles.title, { color: colors.text }]}>
          Join our Community
        </Text>

        {step === 1 && (
          <>
            <Text style={[styles.label, { color: colors.text }]}>
              Homeowner Name
            </Text>
            <TextInput
              placeholder="Enter Homeowner Name"
              placeholderTextColor="#999"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.text },
              ]}
              value={homeownerName}
              onChangeText={setHomeownerName}
            />

            <Text style={[styles.label, { color: colors.text }]}>
              Resident Name
            </Text>
            <TextInput
              placeholder="Enter Resident Name"
              placeholderTextColor="#999"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.text },
              ]}
              value={residentName}
              onChangeText={setResidentName}
            />

            <Text style={[styles.label, { color: colors.text }]}>
              Relationship to Homeowner
            </Text>
            <View
              style={[styles.pickerContainer, { borderColor: colors.text }]}
            >
              <Picker
                selectedValue={relationship}
                onValueChange={(itemValue) => setRelationship(itemValue)}
                style={{ color: colors.text }}
              >
                <Picker.Item label="Family/Relative" value="Family/Relative" />
                <Picker.Item label="Tenant/Renter" value="Tenant/Renter" />
                <Picker.Item
                  label="Housekeeper/Caretaker"
                  value="Housekeeper/Caretaker"
                />
                <Picker.Item label="Me" value="Me" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.button} onPress={nextStep}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={[styles.label, { color: colors.text }]}>
              House Number
            </Text>
            <TextInput
              placeholder="Enter House Number"
              placeholderTextColor="#999"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.text },
              ]}
              value={houseNumber}
              onChangeText={setHouseNumber}
            />

            <Text style={[styles.label, { color: colors.text }]}>Street</Text>
            <TextInput
              placeholder="Enter Street"
              placeholderTextColor="#999"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.text },
              ]}
              value={street}
              onChangeText={setStreet}
            />

            <Text style={[styles.label, { color: colors.text }]}>
              Contact Number
            </Text>
            <TextInput
              placeholder="Enter Contact Number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.text },
              ]}
              value={contactNumber}
              onChangeText={setContactNumber}
            />

            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              placeholder="Enter Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.text },
              ]}
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={[styles.button, styles.secondary, styles.buttonRowFlex]}
                onPress={prevStep}
              >
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonRowFlex]}
                onPress={nextStep}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              placeholder="Enter Password"
              placeholderTextColor="#999"
              secureTextEntry
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.text },
              ]}
              value={password}
              onChangeText={setPassword}
            />

            <Text style={[styles.label, { color: colors.text }]}>
              Confirm Password
            </Text>
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.text },
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxChecked,
                ]}
              />
              <Text style={[styles.checkboxText, { color: colors.text }]}>
                I accept the{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => router.push("/Authentication/TermsCondition")}
                >
                  Terms and Conditions
                </Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={[styles.button, styles.secondary, styles.buttonRowFlex]}
                onPress={prevStep}
              >
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonRowFlex]}
                onPress={() => router.push("/Authentication/ResidentNumber")}
              >
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </View>

            {/* Go back to login link */}
            <TouchableOpacity
              onPress={() => router.replace("/Index")}
              style={{ marginTop: 20, alignItems: "center" }}
            >
              <Text style={styles.linkText}>Go back to Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#28942c",
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 14,
  },
  linkText: {
    color: "#28942c",
  },
  button: {
    backgroundColor: "#28942c",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonRowFlex: {
    flex: 1,
  },
  secondary: {
    backgroundColor: "#666",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  rowButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
});
