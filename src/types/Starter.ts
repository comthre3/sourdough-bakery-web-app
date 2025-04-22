export interface Starter {
  id?: string;
  name: string;
  description?: string;
  dateCreated: Date;
  lastFeedingDate: Date;
  feedingSchedule: FeedingSchedule;
  hydration: number;
  status: StarterStatus;
  notes?: string;
  feedingHistory: FeedingRecord[];
  createdBy?: string;
}

export enum StarterStatus {
  ACTIVE = 'active',
  DORMANT = 'dormant',
  ARCHIVED = 'archived'
}

export interface FeedingSchedule {
  frequency: FeedingFrequency;
  customHours?: number; // For CUSTOM frequency
}

export enum FeedingFrequency {
  TWICE_DAILY = 'twice_daily',
  DAILY = 'daily',
  EVERY_OTHER_DAY = 'every_other_day',
  WEEKLY = 'weekly',
  CUSTOM = 'custom'
}

export interface FeedingRecord {
  id?: string;
  date: Date;
  flourType: string;
  flourAmount: number;
  waterAmount: number;
  starterAmount: number;
  temperature?: number;
  notes?: string;
  activityRating?: number; // 1-5 rating of starter activity
  images?: string[]; // URLs to images
}

export interface StarterFilter {
  status?: StarterStatus;
  searchTerm?: string;
}
