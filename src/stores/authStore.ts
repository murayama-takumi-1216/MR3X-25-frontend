import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  emailVerified: boolean;
  agencyId?: string;
  agencyName?: string;
  creci?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

// Memory-only store - NO localStorage or sessionStorage
// Tokens are stored in HTTP-only cookies
// User info is fetched from server on page load
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading to check session

  setAuth: (user) => {
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  updateUser: (userData) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
