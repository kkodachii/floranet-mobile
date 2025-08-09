import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../Theme/ThemeProvider";

const TermsAndCondition = () => {
  const router = useRouter();
  const { colors, theme } = useTheme();

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
          {/* Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={["#28942c", "#2d9d31"]}
                style={styles.iconGradient}
              >
                <Ionicons name="document-text-outline" size={32} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Terms and Agreement</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              By using the FloraNet system, you agree to the following terms and conditions
            </Text>

            {/* Terms Content */}
            <View style={[styles.termsCard, { 
              backgroundColor: theme === "light" ? "#ffffff" : "#1F2633",
              shadowColor: theme === "light" ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: theme === "light" ? 0.1 : 0.1,
              shadowRadius: theme === "light" ? 8 : 8,
              elevation: theme === "light" ? 8 : 8,
            }]}>
              <Section
                title="Use of Service"
                content="FloraNet is intended for use by registered residents and administrators of the subdivision community. It must be used for lawful and authorized purposes only."
                color={colors.text}
                icon="shield-checkmark-outline"
              />

              <Section
                title="User Responsibilities"
                content="Users are responsible for maintaining the confidentiality of their account information. Misuse of the system, including false reports or unauthorized access, is prohibited."
                color={colors.text}
                icon="person-check-outline"
              />

              <Section
                title="Data Privacy"
                content="FloraNet respects your privacy. Personal data will only be used for community-related services and will not be shared without consent, except as required by law."
                color={colors.text}
                icon="lock-closed-outline"
              />

              <Section
                title="System Availability"
                content="While we aim for uninterrupted access, the system may be temporarily unavailable due to maintenance or unforeseen issues. The development team is not liable for any inconvenience caused."
                color={colors.text}
                icon="wifi-outline"
              />

              <Section
                title="Modifications"
                content="These terms may be updated as needed to improve services. Continued use of the system constitutes acceptance of any changes."
                color={colors.text}
                icon="settings-outline"
              />

              <View style={styles.finalNote}>
                <Ionicons name="information-circle-outline" size={20} color="#28942c" />
                <Text style={[styles.finalText, { color: colors.text }]}>
                  If you do not agree with any part of these terms, please discontinue use of the FloraNet system.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.backButtonStyle}
              onPress={() => router.back()}
            >
              <LinearGradient
                colors={["#28942c", "#2d9d31", "#32a636"]}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>I Understand</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const Section = ({ title, content, color, icon }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color="#28942c" style={styles.sectionIcon} />
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    </View>
    <Text style={[styles.sectionContent, { color }]}>{content}</Text>
  </View>
);

export default TermsAndCondition;

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: 24,
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
  termsCard: {
    borderRadius: 16,
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  finalNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(40, 148, 44, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  finalText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 8,
    fontWeight: "500",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40, // Extra padding to avoid navigation bar
  },
  backButtonStyle: {
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
});
