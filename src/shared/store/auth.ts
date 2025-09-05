import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types';
import { authApi, LoginRequest, RegisterRequest } from '../api/auth';
import { setSecureItem, getSecureItem, removeSecureItem } from '../lib/storage';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: any) => {
    storage.set(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login(credentials);
          
          // Store tokens securely
          await setSecureItem('access_token', response.accessToken);
          await setSecureItem('refresh_token', response.refreshToken);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.register(data);
          
          // Store tokens securely
          await setSecureItem('access_token', response.accessToken);
          await setSecureItem('refresh_token', response.refreshToken);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authApi.logout();
        } catch (error) {
          console.warn('Logout API call failed:', error);
        } finally {
          // Clear tokens and state regardless of API call result
          await removeSecureItem('access_token');
          await removeSecureItem('refresh_token');
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      logoutAll: async () => {
        set({ isLoading: true });
        
        try {
          await authApi.logoutAll();
        } catch (error) {
          console.warn('Logout all API call failed:', error);
        } finally {
          // Clear tokens and state regardless of API call result
          await removeSecureItem('access_token');
          await removeSecureItem('refresh_token');
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuthStatus: async () => {
        const token = await getSecureItem('access_token');
        const refreshToken = await getSecureItem('refresh_token');
        
        if (token && refreshToken) {
          // Token exists, user should be authenticated
          // The API client will handle token refresh if needed
          set({ isAuthenticated: true });
        } else {
          set({ 
            user: null, 
            isAuthenticated: false 
          });
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);