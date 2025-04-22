import { create } from 'zustand';
import { ThemeMode, UnitSystem, UserSettings, NotificationSettings } from '../types/Settings';

interface SettingsState {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setSettings: (settings: UserSettings) => void;
  setTheme: (theme: ThemeMode) => void;
  setNotifications: (notifications: NotificationSettings) => void;
  setDefaultHydration: (hydration: number) => void;
  setDefaultUnits: (units: UnitSystem) => void;
  setBakeryInfo: (name?: string, logo?: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultSettings: UserSettings = {
  userId: '',
  theme: ThemeMode.SYSTEM,
  notifications: {
    enableTaskReminders: true,
    enableTimerAlerts: true,
    enableFeedingReminders: true,
    reminderLeadTime: 30
  },
  defaultHydration: 75,
  defaultUnits: UnitSystem.METRIC
};

const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,
  error: null,
  
  setSettings: (settings) => set({ settings }),
  
  setTheme: (theme) => set((state) => ({
    settings: state.settings 
      ? { ...state.settings, theme } 
      : { ...defaultSettings, theme, userId: '' }
  })),
  
  setNotifications: (notifications) => set((state) => ({
    settings: state.settings 
      ? { ...state.settings, notifications } 
      : { ...defaultSettings, notifications, userId: '' }
  })),
  
  setDefaultHydration: (defaultHydration) => set((state) => ({
    settings: state.settings 
      ? { ...state.settings, defaultHydration } 
      : { ...defaultSettings, defaultHydration, userId: '' }
  })),
  
  setDefaultUnits: (defaultUnits) => set((state) => ({
    settings: state.settings 
      ? { ...state.settings, defaultUnits } 
      : { ...defaultSettings, defaultUnits, userId: '' }
  })),
  
  setBakeryInfo: (bakeryName, bakeryLogo) => set((state) => ({
    settings: state.settings 
      ? { ...state.settings, bakeryName, bakeryLogo } 
      : { ...defaultSettings, bakeryName, bakeryLogo, userId: '' }
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error })
}));

export default useSettingsStore;
