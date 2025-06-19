export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  profilePrivacy: 'public' | 'private';
}

export interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  profilePrivacy: 'public',
}; 