// Simple real-time service using polling instead of WebSockets
// This avoids the complex polyfill issues with Pusher in React Native

class SimplePusherService {
  constructor() {
    this.channels = new Map();
    this.listeners = new Map();
    this.pollingIntervals = new Map();
    this.lastMessageIds = new Map();
  }

  // Initialize the service
  initialize() {
    console.log('📡 Simple Pusher service initialized');
    return true;
  }

  // Subscribe to a conversation channel using polling
  subscribeToConversation(conversationId, onMessage) {
    const channelName = `conversation.${conversationId}`;
    
    // Unsubscribe from existing channel if already subscribed
    if (this.channels.has(channelName)) {
      this.unsubscribeFromConversation(conversationId);
    }

    // Store channel reference
    this.channels.set(channelName, { conversationId, onMessage });
    this.listeners.set(channelName, onMessage);
    this.lastMessageIds.set(conversationId, 0);

    // Start polling for new messages
    this.startPolling(conversationId, onMessage);

    console.log(`📡 Subscribed to conversation channel: ${channelName}`);
    return { conversationId, onMessage };
  }

  // Start polling for new messages
  startPolling(conversationId, onMessage) {
    const pollInterval = setInterval(async () => {
      try {
        // Import messagingService dynamically to avoid circular imports
        const { messagingService } = await import('./messagingService');
        
        // Get latest messages
        const response = await messagingService.getMessages(conversationId, 1, 10);
        
        if (response.success && response.data.messages.length > 0) {
          const latestMessage = response.data.messages[0];
          const lastId = this.lastMessageIds.get(conversationId) || 0;
          
          // Check if we have new messages
          if (latestMessage.id > lastId) {
            // Get all new messages
            const newMessages = response.data.messages.filter(msg => msg.id > lastId);
            
            // Update last message ID
            this.lastMessageIds.set(conversationId, latestMessage.id);
            
            // Call the message handler for each new message
            newMessages.forEach(message => {
              console.log('📨 New message received via polling:', message);
              onMessage(message);
            });
          }
        }
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
    }, 2000); // Poll every 2 seconds

    this.pollingIntervals.set(conversationId, pollInterval);
  }

  // Unsubscribe from a conversation channel
  unsubscribeFromConversation(conversationId) {
    const channelName = `conversation.${conversationId}`;
    
    if (this.channels.has(channelName)) {
      this.channels.delete(channelName);
      this.listeners.delete(channelName);
    }

    // Clear polling interval
    if (this.pollingIntervals.has(conversationId)) {
      clearInterval(this.pollingIntervals.get(conversationId));
      this.pollingIntervals.delete(conversationId);
    }

    console.log(`📡 Unsubscribed from conversation channel: ${channelName}`);
  }

  // Subscribe to notifications channel (using polling)
  subscribeToNotifications(onNotification) {
    const channelName = 'notifications';
    
    if (this.channels.has(channelName)) {
      this.unsubscribeFromNotifications();
    }

    this.channels.set(channelName, { onNotification });
    this.listeners.set(channelName, onNotification);

    console.log(`📡 Subscribed to notifications channel: ${channelName}`);
    return { onNotification };
  }

  // Unsubscribe from notifications channel
  unsubscribeFromNotifications() {
    const channelName = 'notifications';
    
    if (this.channels.has(channelName)) {
      this.channels.delete(channelName);
      this.listeners.delete(channelName);
      
      console.log(`📡 Unsubscribed from notifications channel: ${channelName}`);
    }
  }

  // Get connection state
  getConnectionState() {
    return 'connected'; // Always connected with polling
  }

  // Disconnect from service
  disconnect() {
    // Clear all polling intervals
    this.pollingIntervals.forEach(interval => clearInterval(interval));
    this.pollingIntervals.clear();
    
    // Clear all channels and listeners
    this.channels.clear();
    this.listeners.clear();
    this.lastMessageIds.clear();
    
    console.log('📡 Disconnected from Simple Pusher service');
  }

  // Reconnect to service
  reconnect() {
    console.log('📡 Reconnecting to Simple Pusher service...');
    // Polling will automatically resume
  }
}

// Create singleton instance
const simplePusherService = new SimplePusherService();

export default simplePusherService;
