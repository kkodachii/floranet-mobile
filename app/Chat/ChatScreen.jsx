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
import { chatService } from "../../services/api";

const ChatScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const conversation = params.conversation ? JSON.parse(params.conversation) : null;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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

  // Load messages from API
  const loadMessages = async () => {
    if (!conversation?.id) return;
    
    try {
      setLoading(true);
      const response = await chatService.getMessages(conversation.id);
      if (response.success) {
        setMessages(response.data.reverse()); // Reverse to show oldest first
        // Mark messages as read
        await chatService.markAsRead(conversation.id);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversation?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

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
    if (newMessage.trim() === "" || sending || !conversation?.id) return;
    
    const messageContent = newMessage.trim();
    setNewMessage("");
    setSending(true);
    
    // Optimistically add message to UI
    const tempMessage = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      sender_id: 0, // Will be updated when real message comes back
      is_own_message: true,
      created_at: new Date().toISOString(),
      formatted_time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, tempMessage]);
    
    try {
      const response = await chatService.sendMessage(conversation.id, messageContent);
      if (response.success) {
        // Replace temp message with real message
        setMessages((prev) => prev.map(msg => 
          msg.id === tempMessage.id ? response.data : msg
        ));
      } else {
        // Remove temp message on error
        setMessages((prev) => prev.filter(msg => msg.id !== tempMessage.id));
        setNewMessage(messageContent); // Restore message text
        Alert.alert('Error', 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(messageContent); // Restore message text
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
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

  const renderMessage = ({ item }) => {
    const isOwn = item.is_own_message;
    const otherParticipant = conversation?.participants?.find(p => !p.is_me);
    
    return (
      <View
        style={[
          styles.messageRow,
          isOwn ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" },
        ]}
      >
        {!isOwn && (
          <View style={styles.avatarMini}>
            {item.sender?.profile_picture ? (
              <Image source={{ uri: item.sender.profile_picture }} style={styles.avatarImgMini} />
            ) : (
              <View style={[styles.avatarMiniCircle, { backgroundColor: getRoleColor(item.sender?.isAdmin ? 'Admin' : 'Resident') }] }>
                <Text style={styles.avatarMiniText}>{item.sender?.name?.charAt(0).toUpperCase() || '?'}</Text>
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
            },
          ]}
        >
          <Text style={[styles.bubbleText, { color: isOwn ? '#fff' : textColor }]}>{item.content}</Text>
          <Text style={[styles.bubbleTime, { color: isOwn ? 'rgba(255,255,255,0.7)' : timeColor }]}>{item.formatted_time}</Text>
        </View>
      </View>
    );
  };

  if (!conversation) {
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
              const otherParticipant = conversation.participants?.find(p => !p.is_me);
              const displayName = conversation.title || otherParticipant?.name || 'Unknown';
              const displayRole = otherParticipant?.isAdmin ? 'Admin' : 'Resident';
              
              return (
                <>
                  {otherParticipant?.profile_picture ? (
                    <Image source={{ uri: otherParticipant.profile_picture }} style={styles.avatarImg} />
                  ) : (
                    <View style={[styles.avatarCircle, { backgroundColor: getRoleColor(displayRole) }] }>
                      <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.headerName, { color: textColor }]}>{displayName}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(displayRole) }]}>
                      <Text style={styles.roleText}>{displayRole}</Text>
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: textColor }]}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: timeColor }]}>No messages yet. Start the conversation!</Text>
              </View>
            }
          />
        )}

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
              style={[styles.sendButton, { backgroundColor: (newMessage.trim() && !sending) ? "#28942c" : borderColor }]}
              onPress={sendMessage}
              disabled={newMessage.trim() === "" || sending}
            >
              <Ionicons name="send" size={20} color={(newMessage.trim() && !sending) ? "#fff" : timeColor} />
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
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 0,
    alignSelf: 'flex-start',
    marginTop: 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },
});

export default ChatScreen; 