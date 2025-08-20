import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StatusBar,
	Alert,
	Modal,
} from "react-native";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Header from "../../components/HeaderBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../Theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../../services/api";

const ChangePassword = () => {
	const insets = useSafeAreaInsets();
	const { colors, theme } = useTheme();

	const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
	const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNew, setShowNew] = useState(false);
	const [showCurrent, setShowCurrent] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [saving, setSaving] = useState(false);

	const [modalVisible, setModalVisible] = useState(false);
	const [modalTitle, setModalTitle] = useState("");
	const [modalMessage, setModalMessage] = useState("");
	const openModal = (title, message) => {
		setModalTitle(title);
		setModalMessage(message);
		setModalVisible(true);
	};

	const handleSubmit = async () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			openModal("Validation", "Please complete all fields.");
			return;
		}
		if (newPassword.length < 8) {
			openModal("Validation", "Password must be at least 8 characters.");
			return;
		}
		if (newPassword !== confirmPassword) {
			openModal("Validation", "Passwords do not match.");
			return;
		}
		try {
			setSaving(true);
			await authService.updateProfile({
				current_password: currentPassword,
				password: newPassword,
			});
			openModal("Success", "Password changed successfully.");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (e) {
			const message = e?.response?.data?.message
				|| (e?.response?.data?.errors && Object.values(e.response.data.errors).flat().join("\n"))
				|| "Failed to change password.";
			openModal("Error", message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<SafeAreaView
			style={[styles.safeArea, { paddingTop: insets.top, backgroundColor: colors.background }]}
		>
			<StatusBar backgroundColor={statusBarBackground} barStyle={theme === "light" ? "dark-content" : "light-content"} />
			<View style={styles.container}>
				<Header title="Change Password" />
				<ScrollView contentContainerStyle={styles.form}>
					<View style={styles.inputGroup}>
						<Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
						<View style={[styles.inputWrapper, inputWrapperStyle(theme, colors)]}>
							<Ionicons name="lock-closed-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
							<TextInput
								style={[styles.input, { color: colors.text }]}
								placeholder="Enter current password"
								placeholderTextColor={colors.text + "60"}
								secureTextEntry={!showCurrent}
								value={currentPassword}
								onChangeText={setCurrentPassword}
							/>
							<TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeIcon}>
								<Ionicons name={showCurrent ? "eye-outline" : "eye-off-outline"} size={20} color={colors.text + "80"} />
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.inputGroup}>
						<Text style={[styles.label, { color: colors.text }]}>New Password</Text>
						<View style={[styles.inputWrapper, inputWrapperStyle(theme, colors)]}>
							<Ionicons name="key-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
							<TextInput
								style={[styles.input, { color: colors.text }]}
								placeholder="Enter new password"
								placeholderTextColor={colors.text + "60"}
								secureTextEntry={!showNew}
								value={newPassword}
								onChangeText={setNewPassword}
							/>
							<TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
								<Ionicons name={showNew ? "eye-outline" : "eye-off-outline"} size={20} color={colors.text + "80"} />
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.inputGroup}>
						<Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
						<View style={[styles.inputWrapper, inputWrapperStyle(theme, colors)]}>
							<Ionicons name="shield-checkmark-outline" size={20} color={colors.text + "80"} style={styles.inputIcon} />
							<TextInput
								style={[styles.input, { color: colors.text }]}
								placeholder="Re-enter new password"
								placeholderTextColor={colors.text + "60"}
								secureTextEntry={!showConfirm}
								value={confirmPassword}
								onChangeText={setConfirmPassword}
							/>
							<TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
								<Ionicons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color={colors.text + "80"} />
							</TouchableOpacity>
						</View>
					</View>

					<TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={saving}>
						<Text style={styles.buttonText}>{saving ? 'Saving...' : 'Change Password'}</Text>
					</TouchableOpacity>
				</ScrollView>

				<View style={[styles.navWrapper, { paddingBottom: insets.bottom || 16, backgroundColor: navBarBackground }]}>
					<Navbar />
				</View>
			</View>

			{/* Validation Modal */}
			<Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
				<View style={styles.modalOverlay}>
					<View style={[styles.modalContent, { backgroundColor: colors.background }]}> 
						<Text style={[styles.modalTitle, { color: colors.text }]}>{modalTitle}</Text>
						<Text style={[styles.modalMessage, { color: colors.text }]}>{modalMessage}</Text>
						<View style={styles.modalActions}>
							<TouchableOpacity style={[styles.modalButton, styles.modalPrimary]} onPress={() => setModalVisible(false)}>
								<Text style={styles.modalPrimaryText}>OK</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

const inputWrapperStyle = (theme, colors) => ({
	backgroundColor: theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
	borderColor: theme === "light" ? "#e1e5e9" : "rgba(255, 255, 255, 0.2)",
	shadowColor: theme === "light" ? "#000" : "transparent",
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: theme === "light" ? 0.1 : 0,
	shadowRadius: theme === "light" ? 4 : 0,
	elevation: theme === "light" ? 2 : 0,
});

export default ChangePassword;

const styles = StyleSheet.create({
	safeArea: { flex: 1 },
	container: { flex: 1, justifyContent: "space-between" },
	form: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 62 },
	inputGroup: { marginBottom: 16 },
	label: { fontSize: 16, fontWeight: "500", marginBottom: 8 },
	inputWrapper: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 4 },
	inputIcon: { marginRight: 12 },
	input: { flex: 1, fontSize: 16, paddingVertical: 16 },
	eyeIcon: { padding: 8 },
	button: { backgroundColor: "#28942c", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 10 },
	buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
	navWrapper: { backgroundColor: "#fff" },
	modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
	modalContent: { width: '85%', maxWidth: 360, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#00000022' },
	modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
	modalMessage: { fontSize: 14, opacity: 0.8, marginBottom: 16 },
	modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
	modalButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
	modalPrimary: { backgroundColor: '#28942c' },
	modalPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
}); 