import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  StatusBar,
  Keyboard,
  AppState,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../Theme/ThemeProvider";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderBack from "../../components/HeaderBack";
import { messagingService } from "../../services/messagingService";
import { buildStorageUrl, authService } from "../../services/api";
import pusherService from "../../services/optimizedPusherService";

const ChatScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const conversationId = params.conversationId;

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const keyboardOpenRef = useRef(false);
  const [appState, setAppState] = useState(AppState.currentState);

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const chatBg = theme === "light" ? "#f7f8fa" : "#181c23";
  const bubbleOwn = "#28942c";
  const bubbleOther = theme === "light" ? "#fff" : "#232a34";
  const inputBg = theme === "light" ? "#fff" : "#232a34";
  const borderColor = theme === "light" ? "#e0e0e0" : "#333";
  const textColor = colors.text;
  const timeColor = theme === "light" ? "#999" : "#aaa";

  // Load conversation and messages
  const loadConversation = async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      const response = await messagingService.getConversation(conversationId);
      
      if (response.success) {
        setConversation(response.data);
        setMessages(response.data.messages || []);
        
        // Mark messages as read
        await messagingService.markAsRead(conversationId);
        
        // Refresh conversation list to update unread counts
        // This will be handled by the parent component (ChatHomepage)
      }
    } catch (error) {
      // For testing purposes, add some sample messages with read status
      const sampleMessages = [
        {
          id: 1,
          conversation_id: conversationId,
          user_id: currentUser?.id,
          content: "Hello! How are you?",
          type: 'text',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          read_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // Read 25 minutes ago
          user: {
            id: currentUser?.id,
            name: currentUser?.name || 'You',
            profile_picture: currentUser?.profile_picture
          }
        },
        {
          id: 2,
          conversation_id: conversationId,
          user_id: 'other_user',
          content: "I'm doing great! Thanks for asking.",
          type: 'text',
          created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 minutes ago
          read_at: null, // Not read yet
          user: {
            id: 'other_user',
            name: 'Other User',
            profile_picture: null
          }
        },
        {
          id: 3,
          conversation_id: conversationId,
          user_id: currentUser?.id,
          content: "That's wonderful to hear!",
          type: 'text',
          created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
          read_at: null, // Not read yet
          user: {
            id: currentUser?.id,
            name: currentUser?.name || 'You',
            profile_picture: currentUser?.profile_picture
          }
        }
      ];
      setMessages(sampleMessages);
    } finally {
      setLoading(false);
    }
  };

  // Refresh message read status periodically
  const refreshReadStatus = async () => {
    if (!conversationId) return;
    
    try {
      const response = await messagingService.getConversation(conversationId);
      if (response.success && response.data.messages) {
        setMessages(prev => {
          const updatedMessages = prev.map(prevMsg => {
            const serverMsg = response.data.messages.find(sMsg => sMsg.id === prevMsg.id);
            if (serverMsg && serverMsg.read_at !== prevMsg.read_at) {
              return { ...prevMsg, read_at: serverMsg.read_at };
            }
            return prevMsg;
          });
          return updatedMessages;
        });
      }
    } catch (error) {
      // For testing purposes, simulate read status updates
      setMessages(prev => prev.map((msg, index) => {
        if (msg.user_id === currentUser?.id && !msg.read_at && Math.random() > 0.7) {
          return { ...msg, read_at: new Date().toISOString() };
        }
        return msg;
      }));
    }
  };

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await authService.getProfileCached();
        setCurrentUser(user);
      } catch (error) {
        // Error loading current user
      }
    };
    loadCurrentUser();
  }, []);

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  // Refresh read status when screen comes into focus
  useEffect(() => {
    const handleFocus = () => {
      refreshReadStatus();
    };

    // Refresh when component mounts or conversation changes
    handleFocus();

    // Set up periodic refresh every 10 seconds
    const interval = setInterval(refreshReadStatus, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [conversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Set up real-time messaging
  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to conversation channel for real-time messages
    const handleNewMessage = (messageData) => {
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(msg => msg.id === messageData.id);
        if (messageExists) {
          return prev;
        }
        return [...prev, messageData];
      });
    };

    // Handle message read status updates
    const handleMessageRead = (data) => {
      if (data.conversation_id === conversationId) {
        setMessages(prev => prev.map(msg => {
          if (data.message_ids && data.message_ids.includes(msg.id)) {
            return { ...msg, read_at: data.read_at || new Date().toISOString() };
          }
          return msg;
        }));
      }
    };

    pusherService.subscribeToConversation(conversationId, handleNewMessage);
    
    // Subscribe to read status updates
    pusherService.subscribeToNotifications((data) => {
      if (data.data && data.data.type === 'message_read') {
        handleMessageRead(data.data);
      }
    });

    // Cleanup on unmount
    return () => {
      pusherService.unsubscribeFromConversation(conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true);
      keyboardOpenRef.current = true;
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false);
      keyboardOpenRef.current = false;
    });
    
    // Listen for app state changes to close keyboard when app loses focus
    const handleAppStateChange = (nextAppState) => {
      setAppState(nextAppState);
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        Keyboard.dismiss();
        // Force reset keyboard state immediately
        setKeyboardOpen(false);
        keyboardOpenRef.current = false;
      } else if (nextAppState === 'active') {
        // When app becomes active again, ensure keyboard state is reset
        setKeyboardOpen(false);
        keyboardOpenRef.current = false;
      }
    };
    
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      showSub.remove();
      hideSub.remove();
      appStateSubscription?.remove();
    };
  }, []);

  const sendMessage = async () => {
    if (newMessage.trim() === "" || sending || !conversationId) return;
    
    const messageContent = newMessage.trim();
    const currentUserId = currentUser?.id;
    
    // Create optimistic message for instant UI update
    const optimisticMessage = {
      id: `temp_${Date.now()}`,
      conversation_id: conversationId,
      user_id: currentUserId,
      content: messageContent,
      type: 'text',
      created_at: new Date().toISOString(),
      user: {
        id: currentUserId,
        name: conversation?.participants?.[0]?.name || 'You',
        profile_picture: conversation?.participants?.[0]?.profile_picture
      }
    };
    
    try {
      setSending(true);
      
      // Add message instantly to UI
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage("");
      
      // Scroll to bottom immediately
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Send to server in background
      const response = await messagingService.sendMessage(
        conversationId,
        messageContent,
        'text'
      );
      
      if (response.success) {
        // Replace optimistic message with real message
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id ? response.data : msg
        ));
      } else {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    // Get current user ID from authentication context
    const currentUserId = currentUser?.id;
    const isOwn = item.user_id === currentUserId;
    const otherParticipant = conversation?.participants?.find(p => p.id !== currentUserId);
    
    
    return (
      <View
        style={[
          styles.messageRow,
          isOwn ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" },
        ]}
      >
        {!isOwn && (
          <View style={styles.avatarMini}>
            {otherParticipant?.profile_picture ? (
              <Image 
                source={{ uri: buildStorageUrl(otherParticipant.profile_picture) }} 
                style={styles.avatarImgMini}
              />
            ) : (
              <View style={[styles.avatarMiniCircle, { backgroundColor: getRoleColor(otherParticipant) }] }>
                <Ionicons name="person" size={12} color="#fff" />
              </View>
            )}
          </View>
        )}
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isOwn ? bubbleOwn : bubbleOther,
              alignSelf: isOwn ? "flex-end" : "flex-start",
              borderTopLeftRadius: isOwn ? 18 : 6,
              borderTopRightRadius: isOwn ? 6 : 18,
              borderBottomLeftRadius: 18,
              borderBottomRightRadius: 18,
              marginLeft: isOwn ? 40 : 0,
              marginRight: isOwn ? 0 : 8,
              maxWidth: '80%', // Limit bubble width
            },
          ]}
        >
          <Text style={[styles.bubbleText, { color: isOwn ? '#fff' : textColor }]}>{item.content}</Text>
          <Text style={[styles.bubbleTime, { color: isOwn ? 'rgba(255,255,255,0.7)' : timeColor }]}>
            {formatTimestamp(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (!conversationId) {
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
        <View style={styles.container}>
          <HeaderBack title="Chat" />
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: textColor }]}>Conversation not found</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
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
        <View style={styles.container}>
          <HeaderBack title="Chat" />
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: textColor }]}>Loading conversation...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
      <KeyboardAvoidingView
        style={[styles.container]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        enabled={keyboardOpen}
      >
        {/* Header */}
        <View style={[styles.headerStandard, { 
          backgroundColor: theme === "light" ? "#ffffff" : "#14181F",
          borderColor: theme === "light" ? "#e0e0e0" : "#333"
        }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <View style={styles.headerInfoStandard}>
            {(() => {
              // Get the other participant (not the current user)
              const otherParticipant = conversation?.participants?.find(p => p.id !== currentUser?.id) || conversation?.participants?.[0];
              return (
                <>
                  {otherParticipant?.profile_picture ? (
            <Image 
              source={{ uri: buildStorageUrl(otherParticipant.profile_picture) }} 
              style={styles.avatarImg}
            />
                  ) : (
                    <View style={[styles.avatarCircle, { backgroundColor: getRoleColor(otherParticipant) }] }>
                      <Ionicons name="person" size={20} color="#fff" />
                    </View>
                  )}
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.headerName, { color: textColor }]}>
                      {otherParticipant?.name || 'Unknown User'}
                    </Text>
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
                  </View>
                </>
              );
            })()}
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={22} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => `message-${item.id || index}`}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Custom Message Input Bar */}
        <View
          style={[
            styles.messageInputContainer,
            {
              backgroundColor: colors.navbg || (theme === "dark" ? "#1a1a1a" : "#ffffff"),
              borderTopColor: theme === "dark" ? "#333" : "#ccc",
              paddingBottom: keyboardOpen ? 40 : (insets.bottom || 16),
            },
          ]}
        >
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="add" size={24} color={timeColor} />
            </TouchableOpacity>
            <View style={[styles.inputWrapper, { backgroundColor: chatBg, borderColor: borderColor }] }>
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="Type a message..."
                placeholderTextColor={timeColor}
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                maxLength={500}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: newMessage.trim() && !sending ? "#28942c" : borderColor }]}
              onPress={sendMessage}
              disabled={newMessage.trim() === "" || sending}
            >
              <Ionicons name="send" size={20} color={newMessage.trim() && !sending ? "#fff" : timeColor} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerStandard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  headerInfoStandard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  moreButton: {
    marginLeft: 8,
    padding: 4,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 0,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  onlineStatus: {
    fontSize: 12,
    fontWeight: "500",
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 0,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-end",
  },
  avatarMini: {
    marginRight: 6,
  },
  avatarImgMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarMiniCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarMiniText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 2,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTime: {
    fontSize: 11,
    marginTop: 2,
    alignSelf: "flex-end",
  },
  messageInputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  attachButton: {
    marginRight: 6,
    padding: 4,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 6,
  },
  textInput: {
    fontSize: 15,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
  },
});

export default ChatScreen; 