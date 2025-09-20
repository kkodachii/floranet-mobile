// Pusher implementation for React Native
import Pusher from 'pusher-js';

// Pusher configuration from your Laravel .env
const PUSHER_CONFIG = {
  key: 'e48e3f31ab5c564487f4',
  cluster: 'ap1',
  encrypted: true,
  forceTLS: true,
};

class PusherService {
  constructor() {
    this.pusher = null;
    this.channels = new Map();
    this.listeners = new Map();
  }

  // Initialize Pusher connection
  initialize() {
    if (this.pusher) {
      return this.pusher;
    }

    try {
      this.pusher = new Pusher(PUSHER_CONFIG.key, {
        cluster: PUSHER_CONFIG.cluster,
        encrypted: PUSHER_CONFIG.encrypted,
        forceTLS: PUSHER_CONFIG.forceTLS,
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
      });

      console.log('📡 Pusher initialized successfully');
      return this.pusher;
    } catch (error) {
      console.error('❌ Failed to initialize Pusher:', error);
      return null;
    }
  }

  // Subscribe to a conversation channel
  subscribeToConversation(conversationId, onMessage) {
    if (!this.pusher) {
      const initialized = this.initialize();
      if (!initialized) {
        console.error('❌ Cannot subscribe: Pusher not initialized');
        return null;
      }
    }

    try {
      const channelName = `conversation.${conversationId}`;
      
      // Unsubscribe from existing channel if already subscribed
      if (this.channels.has(channelName)) {
        this.unsubscribeFromConversation(conversationId);
      }

      const channel = this.pusher.subscribe(channelName);
      
      // Store channel reference
      this.channels.set(channelName, channel);
      
      // Bind to message.sent event
      const listener = (data) => {
        console.log('📨 Real-time message received:', data);
        onMessage(data);
      };
      
      channel.bind('message.sent', listener);
      
      // Store listener reference for cleanup
      this.listeners.set(channelName, listener);

      console.log(`📡 Subscribed to conversation channel: ${channelName}`);
      return channel;
    } catch (error) {
      console.error('❌ Failed to subscribe to conversation:', error);
      return null;
    }
  }

  // Unsubscribe from a conversation channel
  unsubscribeFromConversation(conversationId) {
    const channelName = `conversation.${conversationId}`;
    
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName);
      const listener = this.listeners.get(channelName);
      
      if (listener) {
        channel.unbind('message.sent', listener);
        this.listeners.delete(channelName);
      }
      
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
      
      console.log(`📡 Unsubscribed from conversation channel: ${channelName}`);
    }
  }

  // Subscribe to notifications channel
  subscribeToNotifications(onNotification) {
    if (!this.pusher) {
      const initialized = this.initialize();
      if (!initialized) {
        console.error('❌ Cannot subscribe: Pusher not initialized');
        return null;
      }
    }

    try {
      const channelName = 'notifications';
      
      if (this.channels.has(channelName)) {
        this.unsubscribeFromNotifications();
      }

      const channel = this.pusher.subscribe(channelName);
      this.channels.set(channelName, channel);
      
      const listener = (data) => {
        console.log('🔔 Real-time notification received:', data);
        onNotification(data);
      };
      
      channel.bind('new-notification', listener);
      this.listeners.set(channelName, listener);

      console.log(`📡 Subscribed to notifications channel: ${channelName}`);
      return channel;
    } catch (error) {
      console.error('❌ Failed to subscribe to notifications:', error);
      return null;
    }
  }

  // Unsubscribe from notifications channel
  unsubscribeFromNotifications() {
    const channelName = 'notifications';
    
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName);
      const listener = this.listeners.get(channelName);
      
      if (listener) {
        channel.unbind('new-notification', listener);
        this.listeners.delete(channelName);
      }
      
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
      
      console.log(`📡 Unsubscribed from notifications channel: ${channelName}`);
    }
  }

  // Get connection state
  getConnectionState() {
    if (!this.pusher) {
      return 'disconnected';
    }
    try {
      return this.pusher.connection.state;
    } catch (error) {
      console.error('❌ Error getting connection state:', error);
      return 'disconnected';
    }
  }

  // Disconnect from Pusher
  disconnect() {
    if (this.pusher) {
      try {
        // Unsubscribe from all channels
        this.channels.forEach((channel, channelName) => {
          this.pusher.unsubscribe(channelName);
        });
        
        this.channels.clear();
        this.listeners.clear();
        
        this.pusher.disconnect();
        this.pusher = null;
        
        console.log('📡 Disconnected from Pusher');
      } catch (error) {
        console.error('❌ Error disconnecting from Pusher:', error);
      }
    }
  }

  // Reconnect to Pusher
  reconnect() {
    if (this.pusher) {
      try {
        this.pusher.connect();
        console.log('📡 Reconnecting to Pusher...');
      } catch (error) {
        console.error('❌ Error reconnecting to Pusher:', error);
      }
    } else {
      // Try to reinitialize if pusher is null
      this.initialize();
    }
  }
}

// Create singleton instance
const pusherService = new PusherService();

export default pusherService;
