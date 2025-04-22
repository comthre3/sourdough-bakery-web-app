export interface Timer {
  id?: string;
  name: string;
  duration: number; // in seconds
  remainingTime: number; // in seconds
  status: TimerStatus;
  recipeId?: string;
  recipeName?: string;
  step?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  notificationEnabled: boolean;
}

export enum TimerStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

export interface TimerPreset {
  id?: string;
  name: string;
  duration: number; // in seconds
  recipeId?: string;
  recipeName?: string;
  step?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface TimerFilter {
  status?: TimerStatus;
  recipeId?: string;
  searchTerm?: string;
}
