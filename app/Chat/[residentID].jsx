import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../Theme/ThemeProvider";
import ChatNavbar from "../../components/ChatNavbar"; // ✅ Updated import

const allMessages = [
  { residentID: "RES001", content: "Hi there!" },
  { residentID: "RES001", content: "How can I pay my bills online?" },
  { residentID: "RES002", content: "Thanks for helping me yesterday!" },
  { residentID: "RES003", content: "Remember the meeting at 6 PM." },
  { residentID: "RES001", content: "Okay, I will check it now." },
];

const Chat = () => {
  const { residentID, name, avatar } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const statusBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const navBarBackground = theme === "light" ? "#ffffff" : "#14181F";
  const textColor = colors.text;
  const backgroundColor = colors.background;
  const cardBackground = colors.card;

  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState(
    allMessages.filter(
      (msg) => msg.residentID === residentID || msg.residentID !== residentID
    )
  );

  const scrollViewRef = useRef();

  const handleSend = () => {
    if (messageInput.trim() === "") return;
    const newMessages = [...messages, { residentID, content: messageInput }];
    setMessages(newMessages);
    setMessageInput("");

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor, paddingTop: insets.top }]}
    >
      <StatusBar
        backgroundColor={statusBarBackground}
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />

      <View
        style={[
          styles.chatHeader,
          {
            borderBottomColor: "#ccc",
            backgroundColor: statusBarBackground,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Image
          source={{
            uri:
              avatar ?? "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
          {name}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.chatCombinedContainer}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }
            >
              {messages.map((msg, index) => {
                const isCurrentUser = msg.residentID === residentID;
                return (
                  <View
                    key={index}
                    style={[
                      styles.messageBubble,
                      {
                        backgroundColor: isCurrentUser
                          ? "#28942c"
                          : cardBackground,
                        alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                        borderTopLeftRadius: isCurrentUser ? 12 : 0,
                        borderTopRightRadius: isCurrentUser ? 0 : 12,
                      },
                    ]}
                  >
                    <Text style={[styles.messageText, { color: textColor }]}>
                      {msg.content}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: navBarBackground,
                  paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
                },
              ]}
            >
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                value={messageInput}
                onChangeText={setMessageInput}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Ionicons name="send" size={20} color="#28942c" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.navWrapper,
          {
            paddingBottom: insets.bottom || 16,
            backgroundColor: navBarBackground,
          },
        ]}
      >
        <ChatNavbar /> {/* ✅ Updated component used here */}
      </View>
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
  },
  chatCombinedContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: "75%",
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  messageText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottom:100,
    borderColor: "#ddd",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
  },
  sendButton: {
    padding: 8,
  },
  navWrapper: {
  },
});
