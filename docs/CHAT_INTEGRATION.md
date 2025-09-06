# Chat System Integration Guide

## Overview
The chat system has been fully integrated with your mobile app. Here's how to use the new features:

## 🚀 Key Features Implemented

### 1. **Direct Messages - One-on-one conversations**
- Automatically creates conversations between two users
- Finds existing conversations to avoid duplicates
- Supports both direct messages and group chats

### 2. **Message Management - Send, edit, delete messages**
- Send messages with optimistic UI updates
- Edit your own messages
- Delete your own messages
- Real-time message status tracking

### 3. **Read Status - Track which messages have been read**
- Automatic read status when viewing conversations
- Last read timestamp tracking per user
- Visual indicators for unread messages

### 4. **Unread Counts - Get unread message counts per user**
- Real-time unread count in chat list
- Per-conversation unread counts
- Automatic count updates when messages are read

## 📱 Mobile App Integration

### Updated Files:
1. **`services/api.js`** - Added `chatService` with all API methods
2. **`app/Chat/ChatHomepage.jsx`** - Now uses real API data
3. **`app/Chat/ChatScreen.jsx`** - Real-time messaging with API

### API Service Usage:

```javascript
import { chatService } from '../services/api';

// Get all conversations
const conversations = await chatService.getConversations();

// Create a new conversation
const conversation = await chatService.createConversation([userId], 'Optional Title');

// Send a message
const message = await chatService.sendMessage(conversationId, 'Hello!');

// Get messages for a conversation
const messages = await chatService.getMessages(conversationId);

// Mark messages as read
await chatService.markAsRead(conversationId);

// Get unread count
const { unread_count } = await chatService.getUnreadCount();
```

## 🔄 Data Flow

### Chat Homepage:
1. Loads conversations from API on mount
2. Displays real conversation data with unread counts
3. Supports search through conversation titles and participant names
4. Pull-to-refresh to reload conversations

### Chat Screen:
1. Loads messages for specific conversation
2. Automatically marks messages as read when viewed
3. Optimistic UI updates when sending messages
4. Real-time message display with proper formatting

## 🎨 UI Features

### Conversation List:
- **Avatar Display**: Shows profile pictures or colored initials
- **Role Badges**: Admin (red), Resident (teal), Vendor (blue)
- **Unread Indicators**: Red badges with count
- **Timestamp Formatting**: "2:30 PM", "Yesterday", "Dec 15"
- **Last Message Preview**: Shows latest message content

### Chat Interface:
- **Message Bubbles**: Different colors for own vs other messages
- **Sender Avatars**: Shows for other participants
- **Timestamps**: Formatted time display
- **Loading States**: Shows loading while fetching messages
- **Empty States**: Helpful messages when no messages exist

## 🔧 Technical Implementation

### State Management:
- **Conversations**: Stored in `conversations` state array
- **Messages**: Stored in `messages` state array
- **Loading States**: Separate loading for conversations and messages
- **Error Handling**: User-friendly error messages

### API Integration:
- **Authentication**: Uses existing auth token system
- **Error Handling**: Graceful error handling with user feedback
- **Optimistic Updates**: Immediate UI updates for better UX
- **Real-time Ready**: Structure supports WebSocket integration

## 🚀 Next Steps

### Immediate Use:
1. **Test the API**: Use the sample data created by the seeder
2. **Create Conversations**: Start new chats with other users
3. **Send Messages**: Test the messaging functionality
4. **Check Unread Counts**: Verify read status tracking

### Future Enhancements:
1. **Real-time Updates**: Add WebSocket support for live messaging
2. **Push Notifications**: Notify users of new messages
3. **File Attachments**: Support image and file sharing
4. **Message Reactions**: Add emoji reactions to messages
5. **Message Search**: Search through message history

## 🧪 Testing

### Test Scenarios:
1. **Create Conversation**: Start a new chat with another user
2. **Send Messages**: Send text messages back and forth
3. **Read Status**: Verify messages are marked as read
4. **Unread Counts**: Check that unread counts update correctly
5. **Search**: Test searching through conversations
6. **Refresh**: Test pull-to-refresh functionality

### Sample Data:
The system includes sample conversations and messages created by the `ChatSeeder`. You can test with this data or create new conversations.

## 📊 API Endpoints Used

### User Endpoints:
- `GET /api/user/conversations` - Get user's conversations
- `POST /api/user/conversations` - Create new conversation
- `GET /api/user/conversations/{id}` - Get specific conversation
- `GET /api/user/conversations/{id}/messages` - Get messages
- `POST /api/user/messages` - Send message
- `PUT /api/user/messages/{id}` - Edit message
- `DELETE /api/user/messages/{id}` - Delete message
- `POST /api/user/conversations/{id}/mark-read` - Mark as read
- `GET /api/user/chat/unread-count` - Get unread count

The chat system is now fully functional and ready for use! 🎉
