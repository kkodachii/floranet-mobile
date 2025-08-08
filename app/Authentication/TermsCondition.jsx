import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../Theme/ThemeProvider";

const TermsAndCondition = () => {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.centeredContent}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>Terms and Agreement</Text>

        {/* Subtext */}
        <Text style={[styles.subtext, { color: colors.text }]}>
          By using the FloraNet system, you agree to the following terms:
        </Text>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.card || "#fff" }]}>
          <ScrollView contentContainerStyle={styles.cardContent}>
            <Section
              title="Use of Service"
              content="FloraNet is intended for use by registered residents and administrators of the subdivision community. It must be used for lawful and authorized purposes only."
              color={colors.text}
            />

            <Section
              title="User Responsibilities"
              content="Users are responsible for maintaining the confidentiality of their account information. Misuse of the system, including false reports or unauthorized access, is prohibited."
              color={colors.text}
            />

            <Section
              title="Data Privacy"
              content="FloraNet respects your privacy. Personal data will only be used for community-related services and will not be shared without consent, except as required by law."
              color={colors.text}
            />

            <Section
              title="System Availability"
              content="While we aim for uninterrupted access, the system may be temporarily unavailable due to maintenance or unforeseen issues. The development team is not liable for any inconvenience caused."
              color={colors.text}
            />

            <Section
              title="Modifications"
              content="These terms may be updated as needed to improve services. Continued use of the system constitutes acceptance of any changes."
              color={colors.text}
            />

            <Text style={[styles.paragraph, { color: colors.text }]}>
              If you do not agree with any part of these terms, please discontinue use of the FloraNet system.
            </Text>
          </ScrollView>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary || "#28942c" }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Section = ({ title, content, color }) => (
  <View style={styles.sectionContainer}>
    <Text style={[styles.subtitle, { color }]}>{title}</Text>
    <Text style={[styles.paragraph, { color }]}>{content}</Text>
  </View>
);

export default TermsAndCondition;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredContent: {
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtext: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    height: 500,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  cardContent: {
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  sectionContainer: {
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
