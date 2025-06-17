import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, SettingsState, DEFAULT_SETTINGS } from '../types/settings';

const SETTINGS_STORAGE_KEY = 'app_settings';

interface SettingsStore extends SettingsState {
  // Actions
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
  clearError: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial state
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,

  // Load settings from AsyncStorage
  loadSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings) as AppSettings;
        // Merge with defaults to ensure all properties exist
        const mergedSettings = { ...DEFAULT_SETTINGS, ...parsedSettings };
        set({ settings: mergedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      set({ error: 'Failed to load settings' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Update a specific setting
  updateSetting: async (key, value) => {
    try {
      set({ error: null });
      
      const currentSettings = get().settings;
      const updatedSettings = { ...currentSettings, [key]: value };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      
      // Update state
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Error updating setting:', error);
      set({ error: 'Failed to update setting' });
    }
  },

  // Reset to default settings
  resetSettings: async () => {
    try {
      set({ error: null });
      
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      set({ settings: DEFAULT_SETTINGS });
    } catch (error) {
      console.error('Error resetting settings:', error);
      set({ error: 'Failed to reset settings' });
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },
})); 