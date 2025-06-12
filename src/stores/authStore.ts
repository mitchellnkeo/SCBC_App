import { create } from 'zustand';
import { AuthState, AuthUser, LoginCredentials, RegisterCredentials } from '../types';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  onAuthStateChange,
} from '../services/authService';

interface AuthStore extends AuthState {
  // Actions
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  // Initialize authentication state and set up listener
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // Get current user if any
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        set({
          user: currentUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }

      // Set up auth state listener
      onAuthStateChange((user: AuthUser | null) => {
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      });

    } catch (error: any) {
      console.error('Auth initialization error:', error);
      set({
        error: error.message || 'Failed to initialize authentication',
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  // Login action
  login: async (credentials: LoginCredentials) => {
    try {
      set({ isLoading: true, error: null });

      const user = await loginUser(credentials);
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

    } catch (error: any) {
      console.error('Login error:', error);
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      throw error; // Re-throw so UI can handle it
    }
  },

  // Register action
  register: async (credentials: RegisterCredentials) => {
    try {
      set({ isLoading: true, error: null });

      const user = await registerUser(credentials);
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      set({
        error: error.message || 'Registration failed',
        isLoading: false,
      });
      throw error; // Re-throw so UI can handle it
    }
  },

  // Logout action
  logout: async () => {
    try {
      set({ isLoading: true, error: null });

      await logoutUser();
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

    } catch (error: any) {
      console.error('Logout error:', error);
      set({
        error: error.message || 'Logout failed',
        isLoading: false,
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Refresh current user data
  refreshUser: async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        set({ user: currentUser });
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
    }
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
})); 