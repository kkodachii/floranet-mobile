import axios from 'axios';

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
  save: async () => {},
  load: async () => ({ token: null, user: null }),
  clear: async () => {},
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