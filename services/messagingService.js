import { api } from './api';

export const messagingService = {
  // Get all conversations for the authenticated user
  getConversations: async () => {
    const response = await api.get('/user/conversations');
    return response.data;
  },

  // Create or get existing conversation between two users
  createConversation: async (userId) => {
    const response = await api.post('/user/conversations', { user_id: userId });
    return response.data;
  },

  // Get a specific conversation with messages
  getConversation: async (conversationId) => {
    const response = await api.get(`/user/conversations/${conversationId}`);
    return response.data;
  },

  // Get users available for messaging
  getAvailableUsers: async () => {
    const response = await api.get('/user/conversations/users/available');
    return response.data;
  },

  // Send a message to a conversation
  sendMessage: async (conversationId, content, type = 'text', attachmentUrl = null) => {
    const response = await api.post('/user/messages', {
      conversation_id: conversationId,
      content,
      type,
      attachment_url: attachmentUrl,
    });
    return response.data;
  },

  // Get messages for a conversation
  getMessages: async (conversationId, page = 1, perPage = 50) => {
    const response = await api.get(`/user/conversations/${conversationId}/messages`, {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    const response = await api.post(`/user/conversations/${conversationId}/messages/read`);
    return response.data;
  },
};
