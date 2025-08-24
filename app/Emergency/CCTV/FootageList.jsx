import React, { useEffect, useState, useCallback } from 'react';
import {
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	Image,
	Alert,
	Linking,
	StyleSheet,
	StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
			style={styles.videoPlayer}
			nativeControls
			allowsFullscreen
			allowsPictureInPicture
		/>
	);
};

const FootageList = () => {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { colors, theme } = useTheme();
	const { id } = useLocalSearchParams();
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);

	const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
	const cardBackground = theme === "light" ? "#ffffff" : "#14181F";
	const borderColor = theme === "light" ? "#e0e0e0" : "#333";

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

	const renderFootageCard = (f, idx) => {
		const isImage = f.is_image || /\.(png|jpe?g|gif)$/i.test(f.file_name || f.cctv_footage || '');
		const isVideo = f.is_video || /\.(mp4|mov|avi|wmv|m3u8)$/i.test(f.file_name || f.cctv_footage || '');
		const src = buildStorageUrl(f.cctv_footage);

		return (
			<View key={`footage-${String(f.id ?? '')}-${idx}`} style={[styles.footageCard, { backgroundColor: cardBackground, borderColor }]}>
				{/* Card Header */}
				<View style={[styles.cardHeader, { borderBottomColor: theme === 'light' ? '#f0f0f0' : '#444' }]}>
					<View style={styles.headerContent}>
						<Text style={[styles.fileName, { color: colors.text }]}>
							{f.file_name || 'File'}
						</Text>
						{isImage && (
							<View style={styles.fileTypeBadge}>
								<Ionicons name="image-outline" size={14} color="#28942c" />
								<Text style={styles.fileTypeText}>Image</Text>
							</View>
						)}
						{isVideo && (
							<View style={styles.fileTypeBadge}>
								<Ionicons name="videocam-outline" size={14} color="#28942c" />
								<Text style={styles.fileTypeText}>Video</Text>
							</View>
						)}
					</View>
					{f.description ? (
						<Text style={[styles.description, { color: theme === 'light' ? '#666' : '#aaa' }]}>
							{f.description}
						</Text>
					) : null}
				</View>

				{/* Media Content */}
				<View style={styles.mediaContainer}>
					{isImage && src ? (
						<Image
							source={{ uri: src }}
							style={styles.mediaImage}
							resizeMode="cover"
						/>
					) : null}
					{isVideo && src ? (
						<Footage src={src} />
					) : null}
				</View>

				{/* Card Footer */}
				<View style={styles.cardFooter}>
					<TouchableOpacity
						onPress={() => openDownload(f.id)}
						style={styles.downloadButton}
						activeOpacity={0.7}
					>
						<Ionicons name="download-outline" size={16} color="#28942c" />
						<Text style={styles.downloadButtonText}>Download</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
			<StatusBar backgroundColor={statusBarBackground} barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
			<View style={styles.content}>
				<HeaderBack title="CCTV Footage" />

				<ScrollView
					contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.headerSection}>
						<Text style={[styles.requestId, { color: colors.text }]}>
							Request ID: {id}
						</Text>
					</View>

					{items.length === 0 && !loading ? (
						<View style={styles.emptyState}>
							<Ionicons name="videocam-outline" size={48} color={theme === 'light' ? '#ccc' : '#555'} />
							<Text style={[styles.emptyStateText, { color: theme === 'light' ? '#666' : '#aaa' }]}>
								No footage uploaded yet
							</Text>
						</View>
					) : null}

					{items.map(renderFootageCard)}
				</ScrollView>

				<View style={[styles.navbarContainer, { paddingBottom: insets.bottom }]}>
					<Navbar />
				</View>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	headerSection: {
		marginBottom: 20,
	},
	requestId: {
		fontSize: 16,
		fontWeight: '600',
	},
	emptyState: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 60,
	},
	emptyStateText: {
		fontSize: 16,
		marginTop: 12,
		fontWeight: '500',
	},
	footageCard: {
		borderRadius: 12,
		marginBottom: 16,
		overflow: 'hidden',
		borderWidth: 1,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	cardHeader: {
		padding: 16,
		borderBottomWidth: 1,
	},
	headerContent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	fileName: {
		fontWeight: '700',
		fontSize: 16,
		flex: 1,
	},
	fileTypeBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(40, 148, 44, 0.1)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		gap: 4,
	},
	fileTypeText: {
		color: '#28942c',
		fontSize: 12,
		fontWeight: '600',
	},
	description: {
		fontSize: 14,
		marginTop: 4,
	},
	mediaContainer: {
		padding: 12,
	},
	mediaImage: {
		width: '100%',
		height: 220,
		borderRadius: 8,
	},
	videoPlayer: {
		width: '100%',
		height: 220,
		borderRadius: 8,
		overflow: 'hidden',
	},
	cardFooter: {
		padding: 12,
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	downloadButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#28942c',
		gap: 6,
	},
	downloadButtonText: {
		color: '#28942c',
		fontWeight: '600',
		fontSize: 14,
	},
	navbarContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: 'transparent',
	},
});

export default FootageList; 