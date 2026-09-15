import axios from 'axios';
import { BACKEND_URL } from '../utils/apiUrls';

// Create central API requester instance
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // Crucial to send/receive JWT HTTPOnly Cookies
});

// Request interceptor to attach Bearer token from localStorage as fallback
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle session expirations globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or not logged in, clear local details if necessary
      console.warn('Session expired or unauthorized request.');
    }
    return Promise.reject(error);
  }
);

export default api;
