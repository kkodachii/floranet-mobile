import { useEffect } from "react";
import { Linking, Alert, Platform } from "react-native";

const ADMIN_PHONE = "09605643884"; // mock admin number

const Call = ({ visible, onClose, phoneNumber }) => {
	useEffect(() => {
		const triggerCall = async () => {
			const target = (phoneNumber && String(phoneNumber).trim()) || ADMIN_PHONE;
			const scheme = Platform.OS === 'ios' ? 'tel' : 'tel';
			const url = `${scheme}:${target}`;
			try {
				const supported = await Linking.canOpenURL(url);
				if (supported) {
					await Linking.openURL(url);
				} else {
					Alert.alert('Error', 'Calling is not supported on this device.');
				}
			} catch (e) {
				Alert.alert('Error', 'Failed to start the call.');
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