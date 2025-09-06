import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const DEFAULT_PROD_API = 'https://floranet-laravel.onrender.com/api';

const DEFAULT_DEV_API = 'http://192.168.254.107:8000/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || (__DEV__ ? DEFAULT_DEV_API : DEFAULT_PROD_API);
export const API_ORIGIN = API_BASE_URL.replace(/\/?api$/, '');
export const buildStorageUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('storage/') ? path : `storage/${path}`;
  return `${API_ORIGIN.replace(/\/$/, '')}/${normalized}`;
};

const TOKEN_KEY = 'floranet_token';
const USER_KEY = 'floranet_user';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const authStorage = {
  save: async ({ token, user }) => {
    try {
      if (token) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        setAuthToken(token);
      }
      if (user) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  },
  load: async () => {
    try {
      const [token, userStr] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      
      const user = userStr ? JSON.parse(userStr) : null;
      if (token) {
        setAuthToken(token);
      }
      
      return { token, user };
    } catch (error) {
      console.error('Error loading auth data:', error);
      return { token: null, user: null };
    }
  },
  clear: async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
      setAuthToken(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },
};

// In-memory user cache and dedupe
let profileCache = null;
let profileCachedAt = 0;
let inflightProfilePromise = null;
const PROFILE_TTL_MS = 2 * 60 * 1000; // 2 minutes

// Throttle and error backoff for profile fetching
let lastProfileFetchMs = 0;
let errorBackoffUntilMs = 0;
const MIN_FETCH_GAP_MS = 5 * 1000; // do not refetch more than once every 5s
const ERROR_BACKOFF_MS = 10 * 1000; // wait 10s after an error before trying again

export const authService = {
  // User registration
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data; // { user, token, message }
  },
  
  // Get next resident ID
  getNextResidentId: async () => {
    const response = await api.get('/next-resident-id');
    return response.data; // { next_resident_id }
  },
  
  // User login (non-admin)
  login: async ({ email, password }) => {
    const response = await api.post('/user/login', { email, password });
    const result = { ...response.data, type: 'user' }; // { user, token, type: 'user' }
    
    // Save auth data to secure storage
    if (result.token && result.user) {
      await authStorage.save({ token: result.token, user: result.user });
    }
    
    return result;
  },
  // Optional admin login if needed later
  adminLogin: async ({ email, password }) => {
    const response = await api.post('/admin/login', { email, password });
    return {...response.data, type:'user'}; // { user, token, type: 'admin' }
  },
  // Logout using API and clear storage
  logout: async () => {
    try {
      await api.post('/user/logout');
    } catch (_) {
      // ignore
    }
    await authStorage.clear();
    setAuthToken(null);
    profileCache = null;
    profileCachedAt = 0;
    inflightProfilePromise = null;
    lastProfileFetchMs = 0;
    errorBackoffUntilMs = 0;
  },
  // Get current user profile (with house)
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  // Cached profile getter with TTL, throttle, error backoff, and request dedupe
  getProfileCached: async ({ force = false } = {}) => {
    const now = Date.now();

    // If we don't have an auth token set, avoid network and return best-known user
    const hasAuthHeader = Boolean(api.defaults.headers.common['Authorization']);
    if (!hasAuthHeader) {
      if (profileCache) return profileCache;
      return null;
    }

    // Respect error backoff period
    if (!force && now < errorBackoffUntilMs) {
      return profileCache;
    }

    // Return fresh-enough cache
    if (!force && profileCache && (now - profileCachedAt) < PROFILE_TTL_MS) {
      return profileCache;
    }

    // Throttle frequent calls
    if (!force && (now - lastProfileFetchMs) < MIN_FETCH_GAP_MS && profileCache) {
      return profileCache;
    }

    if (inflightProfilePromise) return inflightProfilePromise;

    lastProfileFetchMs = now;
    inflightProfilePromise = (async () => {
      try {
        const user = await authService.getProfile();
        profileCache = user;
        profileCachedAt = Date.now();
        errorBackoffUntilMs = 0; // clear backoff on success
        inflightProfilePromise = null;
        return user;
      } catch (err) {
        // Set a backoff window to avoid spamming on errors
        errorBackoffUntilMs = Date.now() + ERROR_BACKOFF_MS;
        inflightProfilePromise = null;
        // Return cached user if available; otherwise propagate null
        if (profileCache) return profileCache;
        return null;
      }
    })();

    return inflightProfilePromise;
  },
  // Refresh cached user from API and persist
  refreshAndCacheUser: async () => {
    const user = await authService.getProfile();
    profileCache = user;
    profileCachedAt = Date.now();
    return user;
  },
  // Clear profile cache completely
  clearProfileCache: async () => {
    profileCache = null;
    profileCachedAt = 0;
    inflightProfilePromise = null;
    lastProfileFetchMs = 0;
    errorBackoffUntilMs = 0;
  },
  // Update profile (name, email, contact_no, optional password with current_password)
  updateProfile: async (payload) => {
    const response = await api.put('/user/profile', payload);
    await authService.getProfileCached({ force: true });
    return response.data;
  },
  // Upload profile picture (multipart)
  uploadProfilePicture: async (uri) => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || `profile_${Date.now()}.jpg`;
    const file = { uri, name: filename, type: 'image/jpeg' };
    formData.append('profile_picture', file);
    const response = await api.post('/user/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await authService.getProfileCached({ force: true });
    return response.data;
  },
};

export const complaintsService = {
  list: async ({ page = 1 } = {}) => {
    const response = await api.get('/user/complaints', { params: { page } });
    return response.data; // Laravel resource collection with data, links, meta
  },
  create: async (payload) => {
    const response = await api.post('/user/complaints', payload);
    return response.data; // Complaint resource object
  },
  addFollowup: async (complaintId, message) => {
    const response = await api.patch(`/user/complaints/${complaintId}/followups`, { followups: message });
    return response.data;
  },
  getNextId: async () => {
    // Authorized user route preferred
    try {
      const response = await api.get('/user/complaints-next-id');
      return response.data?.next_log_id;
    } catch (_) {
      // Fallback to public route if authorized fails
      const response = await api.get('/complaints-next-id');
      return response.data?.next_log_id;
    }
  },
};

export const alertsService = {
  list: async ({ page = 1, type, status } = {}) => {
    const params = { page };
    if (type) params.type = type;
    if (status) params.status = status;
    const response = await api.get('/user/alerts', { params });
    return response.data; // { success, data: ResourceCollection, pagination }
  },
  create: async (payload) => {
    const response = await api.post('/user/alerts', payload);
    return response.data; // { success, message, data: Resource }
  },
}; 

export const cctvService = {
  list: async ({ page = 1 } = {}) => {
    const response = await api.get('/user/cctv-requests', { params: { page } });
    return response.data; // Laravel resource collection
  },
  create: async ({ resident_id, reason, date_of_incident, time_of_incident, location, status }) => {
    const payload = { resident_id, reason, date_of_incident, time_of_incident, location };
    if (status) payload.status = status;
    const response = await api.post('/user/cctv-requests', payload);
    return response.data; // CctvRequest resource
  },
  show: async (id) => {
    const response = await api.get(`/user/cctv-requests/${id}`);
    return response.data; // CctvRequest resource
  },
  updateFollowups: async (id, followups) => {
    const response = await api.patch(`/user/cctv-requests/${id}/followups`, { followups });
    return response.data; // CctvRequest resource
  },
  // Convenience: extract footage list from show()
  listFootage: async (id) => {
    const data = await cctvService.show(id);
    const req = data?.data || data;
    return Array.isArray(req?.footage) ? req.footage : [];
  },
  downloadFootageUrl: (requestId, footageId) => `${API_BASE_URL.replace(/\/$/, '')}/user/cctv-requests/${requestId}/footage/${footageId}/download`,
};

export const adminService = {
  getAdminContact: async () => {
    try {
      const resp = await api.get('/user/admin-contact');
      return resp.data?.phone || null;
    } catch (_) {
      try {
        const resp = await api.get('/admin-contact');
        return resp.data?.phone || null;
      } catch (_) {
        return null;
      }
    }
  }
}; 

export const financeService = {
  // Get current month's due for authenticated user
  getCurrentMonthDue: async () => {
    const response = await api.get('/user/monthly-dues/current');
    return response.data; // { success, data: MonthlyDueResource or null, message }
  },

  // Get all months with payment status and collection reasons
  getAllMonthsStatus: async ({ year } = {}) => {
    const params = {};
    if (year) params.year = year;
    const response = await api.get('/user/monthly-dues/all-months', { params });
    return response.data; // { success, data: { months: [], summary: {} } }
  },

  // Get all monthly dues for authenticated user
  getMonthlyDues: async ({ page = 1, year } = {}) => {
    const params = { page };
    if (year) params.year = year;
    const response = await api.get('/user/monthly-dues', { params });
    return response.data; // Laravel resource collection
  },

  // Get payment history for authenticated user
  getPaymentHistory: async ({ page = 1 } = {}) => {
    const response = await api.get('/user/payments', { params: { page } });
    return response.data; // Laravel resource collection
  },

  // Get available years for monthly dues
  getAvailableYears: async () => {
    try {
      const user = await authService.getProfileCached();
      if (!user?.resident_id) return [];
      
      const response = await api.get(`/admin/residents/${user.resident_id}/monthly-dues/years`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching available years:', error);
      return [];
    }
  },

  // Get monthly dues for a specific year
  getYearHistory: async (year) => {
    try {
      const user = await authService.getProfileCached();
      if (!user?.resident_id) return [];
      
      const response = await api.get(`/admin/residents/${user.resident_id}/monthly-dues/history`, {
        params: { year }
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching year history:', error);
      return [];
    }
  }
};

export const communityService = {
  // Get all community posts with filters
  getPosts: async ({ page = 1, category, visibility, admin_only, resident_only, search, user_id } = {}) => {
    const params = { page };
    if (category) params.category = category;
    if (visibility) params.visibility = visibility;
    if (admin_only) params.admin_only = admin_only;
    if (resident_only) params.resident_only = resident_only;
    if (search) params.search = search;
    if (user_id) params.user_id = user_id;
    
    const response = await api.get('/user/community-posts', { params });
    return response.data; // { success, data: paginated posts, message }
  },

  // Get a specific post by ID
  getPost: async (id) => {
    const response = await api.get(`/user/community-posts/${id}`);
    return response.data; // { success, data: post, message }
  },

  // Create a new post
  createPost: async (postData) => {
    const formData = new FormData();
    
    // Add basic fields
    formData.append('type', postData.type || 'text');
    formData.append('category', postData.category);
    formData.append('visibility', postData.visibility || 'public');
    
    if (postData.content) {
      formData.append('content', postData.content);
    }
    
    // Add images if provided
    if (postData.images && postData.images.length > 0) {
      postData.images.forEach((image, index) => {
        formData.append('images[]', {
          uri: image.uri,
          name: image.name || `image_${index}.jpg`,
          type: image.type || 'image/jpeg'
        });
      });
    }
    
    const response = await api.post('/user/community-posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // { success, data: post, message }
  },

  // Update a post
  updatePost: async (id, postData) => {
    const formData = new FormData();
    
    // Add basic fields
    if (postData.type) formData.append('type', postData.type);
    if (postData.category) formData.append('category', postData.category);
    if (postData.visibility) formData.append('visibility', postData.visibility);
    if (postData.content !== undefined) formData.append('content', postData.content);
    
    // Add existing images to keep
    if (postData.existing_images) {
      postData.existing_images.forEach(image => {
        formData.append('existing_images[]', image);
      });
    }
    
    // Add new images
    if (postData.images && postData.images.length > 0) {
      postData.images.forEach((image, index) => {
        formData.append('images[]', {
          uri: image.uri,
          name: image.name || `image_${index}.jpg`,
          type: image.type || 'image/jpeg'
        });
      });
    }
    
    const response = await api.post(`/user/community-posts/${id}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'X-HTTP-Method-Override': 'PUT'
      }
    });
    return response.data; // { success, data: post, message }
  },

  // Delete a post
  deletePost: async (id) => {
    const response = await api.delete(`/user/community-posts/${id}`);
    return response.data; // { success, message }
  },

  // Toggle like on a post
  toggleLike: async (id, reaction = 'like') => {
    const response = await api.post(`/user/community-posts/${id}/like`, { reaction });
    return response.data; // { success, data: { likes_count, user_reaction, is_liked }, message }
  },

  // Add a comment to a post
  addComment: async (id, content, parentId = null) => {
    const response = await api.post(`/user/community-posts/${id}/comment`, { 
      content, 
      parent_id: parentId 
    });
    return response.data; // { success, data: comment, message }
  },

  // Get comments for a post
  getComments: async (id) => {
    const response = await api.get(`/user/community-posts/${id}/comments`);
    return response.data; // { success, data: comments, message }
  },

  // Delete a comment
  deleteComment: async (postId, commentId) => {
    const response = await api.delete(`/user/community-posts/${postId}/comments/${commentId}`);
    return response.data; // { success, message }
  }
};

export const vendorService = {
  // Create vendor request
  createVendorRequest: async (businessName) => {
    const response = await api.post('/user/vendor-request', {
      business_name: businessName
    });
    return response.data; // { success, message, data }
  },

  // Update vendor profile
  updateVendorProfile: async (businessName) => {
    const response = await api.put('/user/vendor-profile', {
      business_name: businessName
    });
    return response.data; // { success, message, data }
  },

  // Check vendor request status
  checkVendorRequestStatus: async () => {
    const response = await api.get('/user/vendor-request-status');
    return response.data; // { success, data: { has_request, status, business_name } }
  }
};

export const chatService = {
  // Get all conversations for the current user
  getConversations: async () => {
    const response = await api.get('/user/conversations');
    return response.data; // { success, data: ConversationResource[] }
  },

  // Create a new conversation or get existing one
  createConversation: async (participantIds, title = null) => {
    const response = await api.post('/user/conversations', {
      participant_ids: participantIds,
      title: title
    });
    return response.data; // { success, data: ConversationResource, message }
  },

  // Get a specific conversation with messages
  getConversation: async (conversationId) => {
    const response = await api.get(`/user/conversations/${conversationId}`);
    return response.data; // { success, data: ConversationResource }
  },

  // Get messages for a conversation
  getMessages: async (conversationId, page = 1, perPage = 20) => {
    const response = await api.get(`/user/conversations/${conversationId}/messages`, {
      params: { page, per_page: perPage }
    });
    return response.data; // { success, data: MessageResource[], pagination }
  },

  // Send a message
  sendMessage: async (conversationId, content, messageType = 'text', attachmentUrl = null) => {
    const response = await api.post('/user/messages', {
      conversation_id: conversationId,
      content: content,
      message_type: messageType,
      attachment_url: attachmentUrl
    });
    return response.data; // { success, data: MessageResource, message }
  },

  // Edit a message
  editMessage: async (messageId, content) => {
    const response = await api.put(`/user/messages/${messageId}`, {
      content: content
    });
    return response.data; // { success, data: MessageResource, message }
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/user/messages/${messageId}`);
    return response.data; // { success, message }
  },

  // Mark messages as read in a conversation
  markAsRead: async (conversationId) => {
    const response = await api.post(`/user/conversations/${conversationId}/mark-read`);
    return response.data; // { success, message }
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get('/user/chat/unread-count');
    return response.data; // { success, data: { unread_count } }
  },

  // Archive a conversation
  archiveConversation: async (conversationId) => {
    const response = await api.post(`/user/conversations/${conversationId}/archive`);
    return response.data; // { success, message }
  }
}; 