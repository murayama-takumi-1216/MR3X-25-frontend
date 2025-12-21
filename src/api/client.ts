import axios, { type AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable sending cookies with requests (required for HTTP-only cookie auth)
  withCredentials: true,
});

// No need to add Authorization header - cookies are sent automatically with withCredentials: true

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Don't redirect for these cases:
      // 1. Login request - let Login component handle the error
      // 2. Already on login page
      // 3. Session verification request (/users/me) - let AuthContext handle it
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const isSessionVerification = error.config?.url?.includes('/users/me');
      const isAlreadyOnLoginPage = window.location.pathname.includes('/auth/login');

      if (!isLoginRequest && !isSessionVerification && !isAlreadyOnLoginPage) {
        // Clear auth from memory store
        useAuthStore.getState().clearAuth();
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
