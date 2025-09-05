import * as SecureStore from 'expo-secure-store';
import { MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';

// Initialize MMKV storage
const storage = new MMKV();

// Secure storage for sensitive data (tokens, passwords)
export const setSecureItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Fallback for web - use localStorage with basic encoding
      localStorage.setItem(`secure_${key}`, btoa(value));
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error('Error storing secure item:', error);
    throw error;
  }
};

export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      // Fallback for web
      const item = localStorage.getItem(`secure_${key}`);
      return item ? atob(item) : null;
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error('Error retrieving secure item:', error);
    return null;
  }
};

export const removeSecureItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(`secure_${key}`);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error('Error removing secure item:', error);
  }
};

// Regular storage for non-sensitive data
export const setItem = (key: string, value: any): void => {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error storing item:', error);
  }
};

export const getItem = <T>(key: string): T | null => {
  try {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error retrieving item:', error);
    return null;
  }
};

export const removeItem = (key: string): void => {
  try {
    storage.delete(key);
  } catch (error) {
    console.error('Error removing item:', error);
  }
};

export const clearAll = (): void => {
  try {
    storage.clearAll();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};