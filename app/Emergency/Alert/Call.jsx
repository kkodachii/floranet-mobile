import { useEffect } from "react";
import { Linking, Alert, Platform } from "react-native";

const ADMIN_PHONE = "09605643884"; // mock admin number

const Call = ({ visible, onClose, phoneNumber }) => {
	useEffect(() => {
		const triggerCall = async () => {
			const target = (phoneNumber && String(phoneNumber).trim()) || ADMIN_PHONE;
			
			try {
				if (Platform.OS === 'android') {
					// For Android, use tel: scheme directly
					const url = `tel:${target}`;
					const supported = await Linking.canOpenURL(url);
					if (supported) {
						await Linking.openURL(url);
					} else {
						// Fallback to dial intent if direct call is not supported
						const dialUrl = `tel:${target}`;
						await Linking.openURL(dialUrl);
					}
				} else {
					// For iOS, use tel: scheme
					const url = `tel:${target}`;
					const supported = await Linking.canOpenURL(url);
					if (supported) {
						await Linking.openURL(url);
					} else {
						Alert.alert('Error', 'Calling is not supported on this device.');
					}
				}
			} catch (e) {
				console.log('Call error:', e);
				// Try fallback approach for Android
				if (Platform.OS === 'android') {
					try {
						const fallbackUrl = `tel:${target}`;
						await Linking.openURL(fallbackUrl);
					} catch (fallbackError) {
						Alert.alert('Error', 'Failed to start the call. Please check your phone permissions.');
					}
				} else {
					Alert.alert('Error', 'Failed to start the call.');
				}
			} finally {
				onClose && onClose();
			}
		};
		if (visible) {
			triggerCall();
		}
	}, [visible, onClose, phoneNumber]);

	return null;
};

export default Call; 