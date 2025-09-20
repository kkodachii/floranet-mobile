import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Modal,
  Platform,
  Alert,
  ActionSheetIOS,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../Theme/ThemeProvider";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { messagingService } from "../../services/messagingService";
import { buildStorageUrl } from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";
import { AppState } from "react-native";
import pusherService from "../../services/optimizedPusherService";
import { useScreenContext } from "../../services/ScreenContext";

const sampleUsers = [
  { id: "1", name: "John Smith", role: "Admin", avatar: null },
  { id: "2", name: "Sarah Johnson", role: "Resident", resident_id: "R001", avatar: null },
  { id: "3", name: "Mike's Plumbing", role: "Vendor", resident_id: "R002", vendor: { isAccepted: true }, avatar: null },
  { id: "4", name: "Emma Davis", role: "Resident", resident_id: "R003", avatar: null },
  { id: "5", name: "Security Team", role: "Admin", avatar: null },
  { id: "6", name: "Green Thumb Landscaping", role: "Vendor", resident_id: "R004", vendor: { isAccepted: true }, avatar: null },
  { id: "7", name: "Alex Lee", role: "Resident", resident_id: "R005", avatar: null },
  { id: "8", name: "Maria Garcia", role: "Resident", resident_id: "R006", avatar: null },
  { id: "9", name: "Vendor Express", role: "Vendor", resident_id: "R007", vendor: { isAccepted: true }, avatar: null },
];

const ChatHomepage = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const router = useRouter();
  const { setModalState, setSearchingState } = useScreenContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [pusherConnected, setPusherConnected] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const chatBg = theme === "light" ? "#f7f8fa" : "#181c23";
  const cardBg = theme === "light" ? "#fff" : "#232a34";
  const borderColor = theme === "light" ? "#e0e0e0" : "#333";
  const textColor = colors.text;
  const timeColor = theme === "light" ? "#999" : "#aaa";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  // Sample data for different user types
  const chatList = [
    {
      id: "1",
      name: "John Smith",
      role: "Admin",
      lastMessage: "Please submit your maintenance request",
      timestamp: "2:30 PM",
      unreadCount: 2,
      avatar: null,
      online: true,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      role: "Resident",
      resident_id: "R001",
      lastMessage: "Thanks for the update!",
      timestamp: "1:45 PM",
      unreadCount: 0,
      avatar: null,
      online: false,
    },
    {
      id: "3",
      name: "Mike's Plumbing",
      role: "Vendor",
      resident_id: "R002",
      vendor: { isAccepted: true },
      lastMessage: "We'll be there tomorrow at 9 AM",
      timestamp: "11:20 AM",
      unreadCount: 1,
      avatar: null,
      online: true,
    },
    {
      id: "4",
      name: "Emma Davis",
      role: "Resident",
      resident_id: "R003",
      lastMessage: "Can you help with the parking issue?",
      timestamp: "Yesterday",
      unreadCount: 0,
      avatar: null,
      online: false,
    },
    {
      id: "5",
      name: "Security Team",
      role: "Admin",
      lastMessage: "Gate access updated",
      timestamp: "Yesterday",
      unreadCount: 0,
      avatar: null,
      online: true,
    },
    {
      id: "6",
      name: "Green Thumb Landscaping",
      role: "Vendor",
      resident_id: "R004",
      vendor: { isAccepted: true },
      lastMessage: "Garden maintenance completed",
      timestamp: "2 days ago",
      unreadCount: 0,
      avatar: null,
      online: false,
    },
  ];

  // Load conversations only
  const loadData = async () => {
    try {
      setLoading(true);
      const conversationsResponse = await messagingService.getConversations();

      if (conversationsResponse.success) {
        // Filter out conversations with no messages
        const conversationsWithMessages = conversationsResponse.data.filter(conv => 
          conv.last_message && conv.last_message.content
        );
        setConversations(conversationsWithMessages);
        setFilteredChats(conversationsWithMessages);
      }
    } catch (error) {
      // For testing purposes, add some sample conversations
      const sampleConversations = [
        {
          id: "1",
          title: "Chat with Sarah Johnson",
          last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          unread_count: 2,
          other_participant: {
            id: "2",
            name: "Sarah Johnson",
            resident_id: "R001",
            profile_picture: null
          },
          last_message: {
            content: "Thanks for the update!",
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
          }
        },
        {
          id: "2",
          title: "Chat with Mike's Plumbing",
          last_message_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          unread_count: 0,
          other_participant: {
            id: "3",
            name: "Mike's Plumbing",
            resident_id: "R002",
            vendor: { isAccepted: true },
            profile_picture: null
          },
          last_message: {
            content: "We'll be there tomorrow at 9 AM",
            created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
          }
        }
      ];
      // Filter out conversations with no messages
      const conversationsWithMessages = sampleConversations.filter(conv => 
        conv.last_message && conv.last_message.content
      );
      setConversations(conversationsWithMessages);
      setFilteredChats(conversationsWithMessages);
      
      // Also add sample users for the new chat modal
      const sampleUsers = [
        { id: "1", name: "John Smith", resident_id: null, isAccepted: true, profile_picture: null },
        { id: "2", name: "Sarah Johnson", resident_id: "R001", isAccepted: true, profile_picture: null },
        { id: "3", name: "Mike's Plumbing", resident_id: "R002", vendor: { isAccepted: true }, isAccepted: true, profile_picture: null },
        { id: "4", name: "Emma Davis", resident_id: "R003", isAccepted: true, profile_picture: null },
        { id: "5", name: "Alex Lee", resident_id: "R005", isAccepted: true, profile_picture: null },
        { id: "6", name: "Maria Garcia", resident_id: "R006", isAccepted: true, profile_picture: null },
        { id: "7", name: "Green Thumb Landscaping", resident_id: "R004", vendor: { isAccepted: true }, isAccepted: true, profile_picture: null },
        { id: "8", name: "Vendor Express", resident_id: "R007", vendor: { isAccepted: true }, isAccepted: true, profile_picture: null },
        { id: "9", name: "Tech Solutions", resident_id: "R008", vendor: { isAccepted: true }, isAccepted: true, profile_picture: null },
        { id: "10", name: "David Wilson", resident_id: "R009", isAccepted: true, profile_picture: null },
        { id: "11", name: "Lisa Chen", resident_id: "R010", isAccepted: true, profile_picture: null },
        { id: "12", name: "Maintenance Pro", resident_id: "R011", vendor: { isAccepted: true }, isAccepted: true, profile_picture: null },
      ];
      setAvailableUsers(sampleUsers);
    } finally {
      setLoading(false);
    }
  };

  // Load available users only when modal is opened
  const loadAvailableUsers = async () => {
    try {
      const usersResponse = await messagingService.getAvailableUsers();
      
      if (usersResponse.success) {
        setAvailableUsers(usersResponse.data);
      } else {
        // Set fallback users even if API fails
        const fallbackUsers = [
          { id: "1", name: "John Smith", resident_id: null, isAccepted: true, profile_picture: null },
          { id: "2", name: "Sarah Johnson", resident_id: "R001", isAccepted: true, profile_picture: null },
          { id: "3", name: "Mike's Plumbing", resident_id: "R002", vendor: { isAccepted: true }, isAccepted: true, profile_picture: null },
          { id: "4", name: "Emma Davis", resident_id: "R003", isAccepted: true, profile_picture: null },
          { id: "5", name: "Alex Lee", resident_id: "R005", isAccepted: true, profile_picture: null },
          { id: "6", name: "Maria Garcia", resident_id: "R006", isAccepted: true, profile_picture: null },
          { id: "7", name: "Green Thumb Landscaping", resident_id: "R004", vendor: { isAccepted: true }, isAccepted: true, profile_picture: null },
          { id: "8", name: "Vendor Express", resident_id: "R007", vendor: { isAccepted: true }, isAccepted: true, profile_picture: null },
        ];
        setAvailableUsers(fallbackUsers);
      }
    } catch (error) {
      // Set fallback users on error
      const fallbackUsers = [
        { id: "1", name: "John Smith", resident_id: null, isAccepted: true, profile_picture: null },
        { id: "2", name: "Sarah Johnson", resident_id: "R001", isAccepted: true, profile_picture: null },
        { id: "3", name: "Mike's Plumbing", resident_id: "R002", vendor: { isAccepted: true }, isAccepted: true, profile_picture: null },
        { id: "4", name: "Emma Davis", resident_id: "R003", isAccepted: true, profile_picture: null },
        { id: "5", name: "Alex Lee", resident_id: "R005", isAccepted: true, profile_picture: null },
        { id: "6", name: "Maria Garcia", resident_id: "R006", isAccepted: true, profile_picture: null },
        { id: "7", name: "Green Thumb Landscaping", resident_id: "R004", vendor: { isAccepted: true }, isAccepted: true, profile_picture: null },
        { id: "8", name: "Vendor Express", resident_id: "R007", vendor: { isAccepted: true }, isAccepted: true, profile_picture: null },
      ];
      setAvailableUsers(fallbackUsers);
    }
  };

  // Filter chats based on search query
  const filterChats = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredChats(conversations);
    } else {
      const filtered = conversations.filter(
        (chat) =>
          (chat.title || '').toLowerCase().includes(query.toLowerCase()) ||
          (chat.participants || []).some(p => (p.name || '').toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredChats(filtered);
    }
  };

  // Filter users in modal based on search query
  const filterUsers = (query) => {
    setUserSearch(query || '');
    setSearchingState((query || '').trim() !== ""); // Set searching state based on whether user is typing
  };

  useEffect(() => {
    loadData();
  }, []);

  // Refresh conversations when screen comes into focus (e.g., returning from ChatScreen)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Set up Pusher WebSocket for real-time conversation updates
  useEffect(() => {
    const initializePusher = () => {
      try {
        // Subscribe to general message updates
        pusherService.subscribeToNotifications((data) => {
          loadData(); // Refresh conversation list
        });
      } catch (error) {
        console.error('Failed to initialize Pusher:', error);
      }
    };

    initializePusher();

    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      setAppState(nextAppState);
      // Let the service handle app state changes
      pusherService.handleAppStateChange(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup on unmount
    return () => {
      pusherService.unsubscribeFromNotifications();
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getRoleColor = (participant) => {
    // Determine role based on participant data (no admin users)
    if (participant?.resident_id) {
      return "#4ecdc4"; // Resident - Teal
    } else if (participant?.isAccepted) {
      return "#45b7d1"; // Accepted User - Blue
    }
    return "#95a5a6"; // Default - Gray
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleLongPress = (item) => {
    const otherParticipant = item.other_participant || item.participants?.[0] || {};
    const participantName = otherParticipant?.name || 'Unknown User';
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Delete Conversation'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
          title: `Delete conversation with ${participantName}?`,
          message: 'This action cannot be undone.',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            deleteConversation(item.id);
          }
        }
      );
    } else {
      Alert.alert(
        'Delete Conversation',
        `Are you sure you want to delete the conversation with ${participantName}? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => deleteConversation(item.id)
          }
        ]
      );
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      const response = await messagingService.deleteConversation(conversationId);
      if (response.success) {
        // Remove conversation from local state
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        setFilteredChats(prev => prev.filter(conv => conv.id !== conversationId));
      } else {
        Alert.alert('Error', 'Failed to delete conversation');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete conversation');
    }
  };

  const renderChatItem = ({ item }) => {
    // Safely find the other participant, avoiding potential undefined issues
    const otherParticipant = item.other_participant || item.participants?.[0] || {};
    const lastMessage = item.last_message;
    
    return (
      <TouchableOpacity
        style={[styles.chatItem, { backgroundColor: cardBg, borderColor: borderColor }]}
        onPress={() => router.push({ pathname: "/Chat/ChatScreen", params: { conversationId: item.id } })}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.avatarContainer}>
          {otherParticipant?.profile_picture ? (
            <Image 
              source={{ uri: buildStorageUrl(otherParticipant.profile_picture) }} 
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: getRoleColor(otherParticipant) }] }>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, { color: textColor }]} numberOfLines={1}>
              {otherParticipant?.name || 'Unknown User'}
            </Text>
            <View style={styles.headerRight}>
              <Text style={[styles.timestamp, { color: timeColor }]}>{formatTimestamp(item.last_message_at)}</Text>
              {item.unread_count > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread_count}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.chatDetails}>
            <View style={styles.badgeContainer}>
              {otherParticipant?.resident_id && (
                <View style={[styles.roleBadge, { backgroundColor: "#4ecdc4" }]}>
                  <Text style={styles.roleText}>Resident</Text>
                </View>
              )}
              {otherParticipant?.vendor?.isAccepted && (
                <View style={[styles.roleBadge, { backgroundColor: "#ff8c00", marginLeft: 4 }]}>
                  <Text style={styles.roleText}>Vendor</Text>
                </View>
              )}
              {!otherParticipant?.resident_id && !otherParticipant?.vendor?.isAccepted && (
                <View style={[styles.roleBadge, { backgroundColor: "#95a5a6" }]}>
                  <Text style={styles.roleText}>
                    {otherParticipant?.isAccepted ? 'User' : 'Pending'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.lastMessage, { color: timeColor }]} numberOfLines={1}>
              {lastMessage?.content || 'No messages yet'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // --- New Chat Modal ---
  const filteredUsers = (userSearch || '').trim() === ""
    ? availableUsers
    : availableUsers.filter(u => {
        const searchTerm = (userSearch || '').toLowerCase();
        const userName = (u.name || '').toLowerCase();
        const businessName = (u.vendor?.business_name || '').toLowerCase();
        return userName.includes(searchTerm) || businessName.includes(searchTerm);
      });


  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={async () => {
        try {
          setModalVisible(false);
          setModalState(false); // Notify screen context that modal is closed
          setUserSearch("");
          setSearchingState(false); // Reset searching state
          
          // Create conversation with this user
          const response = await messagingService.createConversation(item.id);
          if (response.success) {
            // Navigate to chat with the conversation ID
            router.push({ pathname: "/Chat/ChatScreen", params: { conversationId: response.data.id } });
          } else {
            Alert.alert('Error', 'Failed to create conversation');
          }
        } catch (error) {
          console.error('Error creating conversation:', error);
          Alert.alert('Error', 'Failed to create conversation');
        }
      }}
      activeOpacity={0.8}
    >
      <View style={styles.avatarContainer}>
        {item.profile_picture ? (
          <Image source={{ uri: buildStorageUrl(item.profile_picture) }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: getRoleColor(item) }] }>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.chatName, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
        <View style={styles.badgeContainer}>
          {item.resident_id && (
            <View style={[styles.roleBadge, { backgroundColor: "#4ecdc4" }]}>
              <Text style={styles.roleText}>Resident</Text>
            </View>
          )}
          {item.vendor?.isAccepted && (
            <View style={[styles.roleBadge, { backgroundColor: "#ff8c00", marginLeft: 4 }]}>
              <Text style={styles.roleText}>Vendor</Text>
            </View>
          )}
          {!item.resident_id && !item.vendor?.isAccepted && (
            <View style={[styles.roleBadge, { backgroundColor: "#95a5a6" }]}>
              <Text style={styles.roleText}>
                {item.isAccepted ? 'User' : 'Pending'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-ellipses-outline" size={48} color={timeColor} style={{ marginBottom: 10 }} />
      <Text style={[styles.emptyText, { color: timeColor }]}>No chats yet. Start a new conversation!</Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        backgroundColor={statusBarBackground}
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header />
        <View style={styles.content}>
          <View style={[styles.searchContainer, { backgroundColor: cardBg, borderColor: borderColor }] }>
            <Ionicons name="search" size={20} color={timeColor} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search chats..."
              placeholderTextColor={timeColor}
              value={searchQuery}
              onChangeText={filterChats}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => filterChats("")} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={timeColor} />
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={filteredChats}
            renderItem={renderChatItem}
            keyExtractor={(item, index) => `conversation-${item.id || index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatList}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={timeColor}
                colors={[timeColor]}
                progressBackgroundColor={cardBg}
              />
            }
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              setModalVisible(true);
              setModalState(true); // Notify screen context that modal is open
              loadAvailableUsers(); // Load users when modal opens
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="chatbubble-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.navWrapper,
            {
              paddingBottom: insets.bottom || 16,
              backgroundColor: navBarBackground,
            },
          ]}
        >
          <Navbar />
        </View>
        {/* New Chat Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBg }] }>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: textColor }]}>Start New Chat</Text>
                <TouchableOpacity onPress={() => {
                  setModalVisible(false);
                  setModalState(false); // Notify screen context that modal is closed
                }}>
                  <Ionicons name="close" size={24} color={timeColor} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalSearchBar}>
                <Ionicons name="search" size={20} color={timeColor} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.modalSearchInput, { color: textColor }]}
                  placeholder="Search resident, vendor, admin..."
                  placeholderTextColor={timeColor}
                  value={userSearch}
                  onChangeText={filterUsers}
                  autoFocus
                />
              </View>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="refresh" size={24} color={colors.primary} />
                  <Text style={[styles.loadingText, { color: textColor }]}>Loading users...</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredUsers}
                  renderItem={renderUserItem}
                  keyExtractor={(item, index) => `user-${item.id || index}`}
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: 320 }}
                  ListEmptyComponent={
                    <View style={styles.emptyUserContainer}>
                      <Ionicons name="person-outline" size={48} color={timeColor} style={{ marginBottom: 10 }} />
                      <Text style={[styles.emptyText, { color: timeColor, marginTop: 24 }]}>
                        {availableUsers.length === 0 
                          ? 'No users available for messaging' 
                          : 'No users found matching your search'}
                      </Text>
                      {availableUsers.length === 0 && (
                        <Text style={[styles.emptySubText, { color: timeColor, marginTop: 8 }]}>
                          Make sure you have the proper permissions to start conversations
                        </Text>
                      )}
                    </View>
                  }
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    margin: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  clearButton: {
    marginLeft: 8,
  },
  chatList: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  chatName: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timestamp: {
    fontSize: 12,
    minWidth: 60,
    textAlign: "right",
  },
  chatDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    marginLeft: 2,
  },
  unreadBadge: {
    backgroundColor: "#ff6b6b",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  unreadText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  navWrapper: {
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#aaa',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
  },
  emptyUserContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#28942c',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    zIndex: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 18,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? '#f1f1f1' : '#f6f6f6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
  },
  pusherIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pusherText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ChatHomepage; 