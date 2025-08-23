import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../Theme/ThemeProvider';
import HeaderBack from '../../../components/HeaderBack';
import Navbar from '../../../components/Navbar';
import { cctvService, buildStorageUrl } from '../../../services/api';
import { VideoView, useVideoPlayer } from 'expo-video';

const Footage = ({ src }) => {
	const player = useVideoPlayer(src, (p) => {
		p.loop = false;
	});
	return (
		<VideoView
			player={player}
			style={{ width: '100%', height: 220, borderRadius: 12, overflow: 'hidden' }}
			nativeControls
			allowsFullscreen
			allowsPictureInPicture
		/>
	);
};

const Card = ({ children, theme }) => (
	<View style={{
		borderRadius: 16,
		marginBottom: 16,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: theme === 'light' ? '#e0e0e0' : '#333',
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	}}>
		{children}
	</View>
);

const CardHeader = ({ title, subtitle, colors, theme }) => (
	<View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme === 'light' ? '#f0f0f0' : '#444' }}>
		<Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{title}</Text>
		{subtitle ? <Text style={{ color: theme === 'light' ? '#666' : '#aaa', marginTop: 4 }}>{subtitle}</Text> : null}
	</View>
);

const CardFooter = ({ children }) => (
	<View style={{ padding: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
		{children}
	</View>
);

const FootageList = () => {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { colors, theme } = useTheme();
	const { id } = useLocalSearchParams();
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);

	const load = useCallback(async () => {
		if (!id) return;
		setLoading(true);
		try {
			const footage = await cctvService.listFootage(String(id));
			setItems(footage);
		} catch (e) {
			// ignore
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		load();
	}, [load]);

	useFocusEffect(
		useCallback(() => {
			load();
			const t = setInterval(load, 2000);
			return () => clearInterval(t);
		}, [load])
	);

	const openDownload = (footageId) => {
		const url = cctvService.downloadFootageUrl(String(id), String(footageId));
		Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open download link.'));
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
			<View style={{ flex: 1 }}>
				<HeaderBack title="CCTV Footage" />
				<ScrollView contentContainerStyle={{ padding: 20 }}>
					<Text style={{ color: colors.text, fontSize: 16, marginBottom: 12 }}>Request ID: {id}</Text>
					{items.length === 0 && !loading ? (
						<Text style={{ color: colors.text }}>No footage uploaded yet.</Text>
					) : null}
					{items.map((f, idx) => {
						const isImage = f.is_image || /\.(png|jpe?g|gif)$/i.test(f.file_name || f.cctv_footage || '');
						const isVideo = f.is_video || /\.(mp4|mov|avi|wmv|m3u8)$/i.test(f.file_name || f.cctv_footage || '');
						const src = buildStorageUrl(f.cctv_footage);
						return (
							<Card key={`footage-${String(f.id ?? '')}-${idx}`} theme={theme}>
								<CardHeader title={f.file_name || 'File'} subtitle={f.description || ''} colors={colors} theme={theme} />
								<View style={{ padding: 12 }}>
									{isImage && src ? (
										<Image source={{ uri: src }} style={{ width: '100%', height: 220, borderRadius: 12 }} resizeMode="cover" />
									) : null}
									{isVideo && src ? (
										<Footage src={src} />
									) : null}
								</View>
								<CardFooter>
									<TouchableOpacity onPress={() => openDownload(f.id)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#28942c' }}>
										<Text style={{ color: '#28942c', fontWeight: '600' }}>Download</Text>
									</TouchableOpacity>
								</CardFooter>
							</Card>
						);
					})}
				</ScrollView>
				<View style={{ paddingBottom: insets.bottom || 16 }}>
					<Navbar />
				</View>
			</View>
		</SafeAreaView>
	);
};

export default FootageList; 