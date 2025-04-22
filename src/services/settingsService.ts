import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserSettings, ThemeMode, UnitSystem } from '../types/Settings';

const SETTINGS_COLLECTION = 'userSettings';

// Default settings to use when creating a new settings document
const getDefaultSettings = (userId: string): UserSettings => ({
  userId,
  theme: ThemeMode.SYSTEM,
  notifications: {
    enableTaskReminders: true,
    enableTimerAlerts: true,
    enableFeedingReminders: true,
    reminderLeadTime: 30
  },
  defaultHydration: 75,
  defaultUnits: UnitSystem.METRIC
});

// Fetch user settings
export const fetchUserSettings = async (userId: string): Promise<UserSettings> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      return { id: settingsSnap.id, ...settingsSnap.data() } as UserSettings;
    } else {
      // Create default settings if none exist
      const defaultSettings = getDefaultSettings(userId);
      await setDoc(settingsRef, defaultSettings);
      return { id: userId, ...defaultSettings };
    }
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

// Update user settings
export const updateUserSettings = async (settings: UserSettings): Promise<void> => {
  if (!settings.userId) {
    throw new Error('User ID is required for settings update');
  }
  
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, settings.userId);
    
    // Remove id from the data as it's not stored in the document
    const { id, ...settingsData } = settings;
    
    await updateDoc(settingsRef, settingsData);
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

// Update theme setting
export const updateTheme = async (userId: string, theme: ThemeMode): Promise<void> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    await updateDoc(settingsRef, { theme });
  } catch (error) {
    console.error('Error updating theme setting:', error);
    throw error;
  }
};

// Update notification settings
export const updateNotificationSettings = async (userId: string, notifications: any): Promise<void> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    await updateDoc(settingsRef, { notifications });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

// Update default hydration
export const updateDefaultHydration = async (userId: string, defaultHydration: number): Promise<void> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    await updateDoc(settingsRef, { defaultHydration });
  } catch (error) {
    console.error('Error updating default hydration:', error);
    throw error;
  }
};

// Update default units
export const updateDefaultUnits = async (userId: string, defaultUnits: UnitSystem): Promise<void> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    await updateDoc(settingsRef, { defaultUnits });
  } catch (error) {
    console.error('Error updating default units:', error);
    throw error;
  }
};

// Update bakery information
export const updateBakeryInfo = async (userId: string, bakeryName?: string, bakeryLogo?: string): Promise<void> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    await updateDoc(settingsRef, { 
      bakeryName: bakeryName || null,
      bakeryLogo: bakeryLogo || null
    });
  } catch (error) {
    console.error('Error updating bakery information:', error);
    throw error;
  }
};
