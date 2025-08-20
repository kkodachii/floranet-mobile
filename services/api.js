import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.8.14:8000/api';

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
}; 