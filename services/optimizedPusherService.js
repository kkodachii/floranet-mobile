// Optimized Real-time Service using Smart Polling
// This provides real-time-like behavior without complex WebSocket dependencies

class OptimizedPusherService {
  constructor() {
    this.channels = new Map();
    this.listeners = new Map();
    this.pollingIntervals = new Map();
    this.lastMessageIds = new Map();
    this.isAppInBackground = false;
    this.pollingFrequency = 1000; // 2 seconds - faster than before
    this.connectionStatus = 'disconnected';
  }

  // Initialize the service
  initialize() {
    console.log('📡 Optimized Pusher service initialized');
    this.connectionStatus = 'connected';
    return true;
  }

  // Subscribe to a conversation channel using smart polling
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

    // Start smart polling for new messages
    this.startSmartPolling(conversationId, onMessage);

    console.log(`📡 Subscribed to conversation channel: ${channelName}`);
    return { conversationId, onMessage };
  }

  // Start smart polling for new messages
  startSmartPolling(conversationId, onMessage) {
    const pollInterval = setInterval(async () => {
      if (this.isAppInBackground) return; // Don't poll if app is in background

      try {
        // Import messagingService dynamically to avoid circular imports
        const { messagingService } = await import('./messagingService');
        
        // Get latest messages with a small limit for efficiency
        const response = await messagingService.getMessages(conversationId, 1, 5);
        
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
              console.log('📨 New message received via smart polling:', message);
              onMessage(message);
            });
          }
        }
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
    }, this.pollingFrequency);

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

  // Subscribe to notifications channel (using smart polling)
  subscribeToNotifications(onNotification) {
    const channelName = 'notifications';
    
    if (this.channels.has(channelName)) {
      this.unsubscribeFromNotifications();
    }

    this.channels.set(channelName, { onNotification });
    this.listeners.set(channelName, onNotification);

    // Start polling for conversation list updates
    this.startConversationListPolling(onNotification);

    console.log(`📡 Subscribed to notifications channel: ${channelName}`);
    return { onNotification };
  }

  // Start polling for conversation list updates
  startConversationListPolling(onNotification) {
    const pollInterval = setInterval(async () => {
      if (this.isAppInBackground) return;

      try {
        // Import messagingService dynamically
        const { messagingService } = await import('./messagingService');
        
        // Get conversations to check for updates
        const response = await messagingService.getConversations();
        
        if (response.success) {
          // Trigger notification callback to refresh conversation list
          onNotification({
            type: 'conversation_update',
            data: response.data
          });
        }
      } catch (error) {
        console.error('Error polling for conversation updates:', error);
      }
    }, this.pollingFrequency * 2); // Poll less frequently for conversation list

    this.pollingIntervals.set('notifications', pollInterval);
  }

  // Unsubscribe from notifications channel
  unsubscribeFromNotifications() {
    const channelName = 'notifications';
    
    if (this.channels.has(channelName)) {
      this.channels.delete(channelName);
      this.listeners.delete(channelName);
      
      // Clear polling interval
      if (this.pollingIntervals.has('notifications')) {
        clearInterval(this.pollingIntervals.get('notifications'));
        this.pollingIntervals.delete('notifications');
      }
      
      console.log(`📡 Unsubscribed from notifications channel: ${channelName}`);
    }
  }

  // Handle app state changes
  handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      this.isAppInBackground = true;
      this.connectionStatus = 'background';
      console.log('📱 App is in background, reducing polling frequency');
    } else if (nextAppState === 'active') {
      this.isAppInBackground = false;
      this.connectionStatus = 'connected';
      console.log('📱 App is in foreground, resuming normal polling');
    }
  };

  // Get connection state
  getConnectionState() {
    return this.connectionStatus;
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
    
    this.connectionStatus = 'disconnected';
    console.log('📡 Disconnected from Optimized Pusher service');
  }

  // Reconnect to service
  reconnect() {
    console.log('📡 Reconnecting to Optimized Pusher service...');
    this.connectionStatus = 'connected';
    this.isAppInBackground = false;
  }

  // Set polling frequency (useful for battery optimization)
  setPollingFrequency(frequency) {
    this.pollingFrequency = frequency;
    console.log(`📡 Polling frequency set to ${frequency}ms`);
  }
}

// Create singleton instance
const optimizedPusherService = new OptimizedPusherService();

export default optimizedPusherService;
