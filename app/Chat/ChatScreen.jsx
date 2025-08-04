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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../Theme/ThemeProvider";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ChatScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const chat = params.chat ? JSON.parse(params.chat) : null;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const statusBarBackground = theme === "light" ? "#f7f8fa" : "#181c23";
  const chatBg = theme === "light" ? "#f7f8fa" : "#181c23";
  const bubbleOwn = "#28942c";
  const bubbleOther = theme === "light" ? "#fff" : "#232a34";
  const inputBg = theme === "light" ? "#fff" : "#232a34";
  const borderColor = theme === "light" ? "#e0e0e0" : "#333";
  const textColor = colors.text;
  const timeColor = theme === "light" ? "#999" : "#aaa";

  // Sample messages for the chat
  const sampleMessages = [
    {
      id: "1",
      text: "Hi there! How can I help you today?",
      sender: chat?.id,
      timestamp: "10:30 AM",
      isOwn: false,
    },
    {
      id: "2",
      text: "I have a question about the maintenance request I submitted",
      sender: "me",
      timestamp: "10:32 AM",
      isOwn: true,
    },
    {
      id: "3",
      text: "Sure! I can see your request. What would you like to know?",
      sender: chat?.id,
      timestamp: "10:33 AM",
      isOwn: false,
    },
    {
      id: "4",
      text: "When will the maintenance team arrive?",
      sender: "me",
      timestamp: "10:35 AM",
      isOwn: true,
    },
    {
      id: "5",
      text: "The team is scheduled to arrive tomorrow between 9 AM and 11 AM. I'll send you a notification when they're on their way.",
      sender: chat?.id,
      timestamp: "10:36 AM",
      isOwn: false,
    },
    {
      id: "6",
      text: "Perfect! Thank you for the update.",
      sender: "me",
      timestamp: "10:37 AM",
      isOwn: true,
    },
  ];

  useEffect(() => {
    setMessages(sampleMessages);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    const message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
    };
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
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

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageRow,
        item.isOwn ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" },
      ]}
    >
      {!item.isOwn && (
        <View style={styles.avatarMini}>
          {chat?.avatar ? (
            <Image source={{ uri: chat.avatar }} style={styles.avatarImgMini} />
          ) : (
            <View style={[styles.avatarMiniCircle, { backgroundColor: getRoleColor(chat?.role) }] }>
              <Text style={styles.avatarMiniText}>{chat?.name?.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
      )}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: item.isOwn ? bubbleOwn : bubbleOther,
            alignSelf: item.isOwn ? "flex-end" : "flex-start",
            borderTopLeftRadius: item.isOwn ? 18 : 6,
            borderTopRightRadius: item.isOwn ? 6 : 18,
            borderBottomLeftRadius: 18,
            borderBottomRightRadius: 18,
            marginLeft: item.isOwn ? 40 : 0,
            marginRight: item.isOwn ? 0 : 8,
          },
        ]}
      >
        <Text style={[styles.bubbleText, { color: item.isOwn ? '#fff' : textColor }]}>{item.text}</Text>
        <Text style={[styles.bubbleTime, { color: item.isOwn ? 'rgba(255,255,255,0.7)' : timeColor }]}>{item.timestamp}</Text>
      </View>
    </View>
  );

  if (!chat) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: chatBg }] }>
        <StatusBar backgroundColor={statusBarBackground} barStyle={theme === "light" ? "dark-content" : "light-content"} />
        <View style={styles.container}>
          <View style={styles.headerStandard}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: textColor }]}>Chat</Text>
          </View>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: textColor }]}>Chat not found</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: chatBg }] }>
      <StatusBar backgroundColor={statusBarBackground} barStyle={theme === "light" ? "dark-content" : "light-content"} />
      <KeyboardAvoidingView
        style={[styles.container, keyboardOpen && { marginBottom: Platform.OS === 'ios' ? 0 : 0 }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.headerStandard}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <View style={styles.headerInfoStandard}>
            {chat.avatar ? (
              <Image source={{ uri: chat.avatar }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarCircle, { backgroundColor: getRoleColor(chat.role) }] }>
                <Text style={styles.avatarText}>{chat.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.headerName, { color: textColor }]}>{chat.name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(chat.role) }]}>
                <Text style={styles.roleText}>{chat.role}</Text>
              </View>
            </View>
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
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Message Input */}
        <View style={[styles.inputBar, { backgroundColor: inputBg, borderTopColor: borderColor }, keyboardOpen && { marginBottom: Platform.OS === 'ios' ? 44 : 36 } ]}>
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
            style={[styles.sendButton, { backgroundColor: newMessage.trim() ? "#28942c" : borderColor }]}
            onPress={sendMessage}
            disabled={newMessage.trim() === ""}
          >
            <Ionicons name="send" size={20} color={newMessage.trim() ? "#fff" : timeColor} />
          </TouchableOpacity>
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
    borderColor: "#e0e0e0",
    backgroundColor: "transparent",
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
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
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