export interface UserSettings {
  id?: string;
  userId: string;
  theme: ThemeMode;
  notifications: NotificationSettings;
  defaultHydration: number;
  defaultUnits: UnitSystem;
  bakeryName?: string;
  bakeryLogo?: string;
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export enum UnitSystem {
  METRIC = 'metric',
  IMPERIAL = 'imperial'
}

export interface NotificationSettings {
  enableTaskReminders: boolean;
  enableTimerAlerts: boolean;
  enableFeedingReminders: boolean;
  reminderLeadTime: number; // minutes before due time
}
