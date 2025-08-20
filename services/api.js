import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.8.14:8000/api';
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
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    if (user) await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },
  load: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const userJson = await SecureStore.getItemAsync(USER_KEY);
    const user = userJson ? JSON.parse(userJson) : null;
    return { token, user };
  },
  clear: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};

// In-memory user cache and dedupe
let profileCache = null;
let profileCachedAt = 0;
let inflightProfilePromise = null;
const PROFILE_TTL_MS = 2 * 60 * 1000; // 2 minutes

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
    return response.data; // { user, token, type: 'user' }
  },
  // Optional admin login if needed later
  adminLogin: async ({ email, password }) => {
    const response = await api.post('/admin/login', { email, password });
    return response.data; // { user, token, type: 'admin' }
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
  },
  // Get current user profile (with house)
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  // Cached profile getter with TTL and request dedupe
  getProfileCached: async ({ force = false } = {}) => {
    const now = Date.now();
    if (!force && profileCache && (now - profileCachedAt) < PROFILE_TTL_MS) {
      return profileCache;
    }
    if (inflightProfilePromise) return inflightProfilePromise;

    inflightProfilePromise = (async () => {
      const user = await authService.getProfile();
      profileCache = user;
      profileCachedAt = Date.now();
      await authStorage.save({ token: await SecureStore.getItemAsync(TOKEN_KEY), user });
      inflightProfilePromise = null;
      return user;
    })();

    return inflightProfilePromise;
  },
  // Refresh cached user from API and persist
  refreshAndCacheUser: async () => {
    const user = await authService.getProfile();
    profileCache = user;
    profileCachedAt = Date.now();
    await authStorage.save({ token: await SecureStore.getItemAsync(TOKEN_KEY), user });
    return user;
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

// Initialize token from storage and seed cache on module load
(async () => {
  try {
    const { token, user } = await authStorage.load();
    if (token) setAuthToken(token);
    if (user) {
      profileCache = user;
      profileCachedAt = Date.now();
    }
  } catch (_) {}
})(); 