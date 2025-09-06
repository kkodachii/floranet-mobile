import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../Theme/ThemeProvider";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import { chatService } from "../../services/api";

const sampleUsers = [
  { id: "1", name: "John Smith", role: "Admin", avatar: null },
  { id: "2", name: "Sarah Johnson", role: "Resident", avatar: null },
  { id: "3", name: "Mike's Plumbing", role: "Vendor", avatar: null },
  { id: "4", name: "Emma Davis", role: "Resident", avatar: null },
  { id: "5", name: "Security Team", role: "Admin", avatar: null },
  { id: "6", name: "Green Thumb Landscaping", role: "Vendor", avatar: null },
  { id: "7", name: "Alex Lee", role: "Resident", avatar: null },
  { id: "8", name: "Maria Garcia", role: "Resident", avatar: null },
  { id: "9", name: "Vendor Express", role: "Vendor", avatar: null },
];

const ChatHomepage = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const chatBg = theme === "light" ? "#f7f8fa" : "#181c23";
  const cardBg = theme === "light" ? "#fff" : "#232a34";
  const borderColor = theme === "light" ? "#e0e0e0" : "#333";
  const textColor = colors.text;
  const timeColor = theme === "light" ? "#999" : "#aaa";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";

  // Load conversations from API
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatService.getConversations();
      if (response.success) {
        setConversations(response.data);
        setFilteredChats(response.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Filter chats based on search query
  const filterChats = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredChats(conversations);
    } else {
      const filtered = conversations.filter((conversation) => {
        // Search in conversation title or participant names
        const titleMatch = conversation.title?.toLowerCase().includes(query.toLowerCase());
        const participantMatch = conversation.participants?.some(participant => 
          participant.name.toLowerCase().includes(query.toLowerCase())
        );
        return titleMatch || participantMatch;
      });
      setFilteredChats(filtered);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "#ff6b6b";
      case "Resident":
        return "#4ecdc4";
      case "Vendor":
        return "#45b7d1";
      default:
        return "#95a5a6";
    }
  };

  const renderChatItem = ({ item }) => {
    // Get the other participant (not current user)
    const otherParticipant = item.participants?.find(p => !p.is_me);
    const displayName = item.title || otherParticipant?.name || 'Unknown';
    const displayRole = otherParticipant?.isAdmin ? 'Admin' : 'Resident';
    
    // Format timestamp
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

    return (
      <TouchableOpacity
        style={[styles.chatItem, { backgroundColor: cardBg, borderColor: borderColor }]}
        onPress={() => router.push({ pathname: "/Chat/ChatScreen", params: { conversation: JSON.stringify(item) } })}
        activeOpacity={0.8}
      >
        <View style={styles.avatarContainer}>
          {otherParticipant?.profile_picture ? (
            <Image source={{ uri: otherParticipant.profile_picture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: getRoleColor(displayRole) }] }>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, { color: textColor }]} numberOfLines={1}>{displayName}</Text>
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
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(displayRole) }] }>
              <Text style={styles.roleText}>{displayRole}</Text>
            </View>
            <Text style={[styles.lastMessage, { color: timeColor }]} numberOfLines={1}>{item.last_message || 'No messages yet'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // --- New Chat Modal ---
  const filteredUsers = userSearch.trim() === ""
    ? sampleUsers
    : sampleUsers.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.role.toLowerCase().includes(userSearch.toLowerCase())
      );

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => {
        setModalVisible(false);
        setUserSearch("");
        // Navigate to chat with this user
        router.push({ pathname: "/Chat/ChatScreen", params: { chat: JSON.stringify({ ...item, lastMessage: "", timestamp: "", unreadCount: 0 }) } });
      }}
      activeOpacity={0.8}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: getRoleColor(item.role) }] }>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.chatName, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.roleText, { color: getRoleColor(item.role), fontWeight: 'bold', marginTop: 2 }]}>{item.role}</Text>
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
            keyExtractor={(item) => item.id}
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
            onPress={() => setModalVisible(true)}
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
                <TouchableOpacity onPress={() => setModalVisible(false)}>
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
                  onChangeText={setUserSearch}
                  autoFocus
                />
              </View>
              <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={item => item.id}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 320 }}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: timeColor, marginTop: 24 }]}>No users found.</Text>
                }
              />
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
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
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
});

export default ChatHomepage; 