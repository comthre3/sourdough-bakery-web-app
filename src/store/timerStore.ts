import { create } from 'zustand';
import { Timer, TimerStatus, TimerPreset, TimerFilter } from '../types/Timer';

interface TimerState {
  timers: Timer[];
  filteredTimers: Timer[];
  presets: TimerPreset[];
  currentTimer: Timer | null;
  filter: TimerFilter;
  loading: boolean;
  error: string | null;
  
  // Actions
  setTimers: (timers: Timer[]) => void;
  setPresets: (presets: TimerPreset[]) => void;
  setCurrentTimer: (timer: Timer | null) => void;
  setFilter: (filter: TimerFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addTimer: (timer: Timer) => void;
  updateTimer: (timer: Timer) => void;
  deleteTimer: (timerId: string) => void;
  addPreset: (preset: TimerPreset) => void;
  updatePreset: (preset: TimerPreset) => void;
  deletePreset: (presetId: string) => void;
  startTimer: (timerId: string) => void;
  pauseTimer: (timerId: string) => void;
  resumeTimer: (timerId: string) => void;
  resetTimer: (timerId: string) => void;
  completeTimer: (timerId: string) => void;
  updateTimerTime: (timerId: string, remainingTime: number) => void;
}

const useTimerStore = create<TimerState>((set) => ({
  timers: [],
  filteredTimers: [],
  presets: [],
  currentTimer: null,
  filter: {},
  loading: false,
  error: null,
  
  setTimers: (timers) => {
    set((state) => {
      const filteredTimers = filterTimers(timers, state.filter);
      return { timers, filteredTimers };
    });
  },
  
  setPresets: (presets) => set({ presets }),
  
  setCurrentTimer: (timer) => set({ currentTimer: timer }),
  
  setFilter: (filter) => {
    set((state) => {
      const filteredTimers = filterTimers(state.timers, filter);
      return { filter, filteredTimers };
    });
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  addTimer: (timer) => {
    set((state) => {
      const updatedTimers = [...state.timers, timer];
      const filteredTimers = filterTimers(updatedTimers, state.filter);
      return { timers: updatedTimers, filteredTimers };
    });
  },
  
  updateTimer: (timer) => {
    set((state) => {
      const updatedTimers = state.timers.map((t) => 
        t.id === timer.id ? timer : t
      );
      const filteredTimers = filterTimers(updatedTimers, state.filter);
      return { timers: updatedTimers, filteredTimers };
    });
  },
  
  deleteTimer: (timerId) => {
    set((state) => {
      const updatedTimers = state.timers.filter((t) => t.id !== timerId);
      const filteredTimers = filterTimers(updatedTimers, state.filter);
      return { timers: updatedTimers, filteredTimers };
    });
  },
  
  addPreset: (preset) => {
    set((state) => ({
      presets: [...state.presets, preset]
    }));
  },
  
  updatePreset: (preset) => {
    set((state) => ({
      presets: state.presets.map((p) => 
        p.id === preset.id ? preset : p
      )
    }));
  },
  
  deletePreset: (presetId) => {
    set((state) => ({
      presets: state.presets.filter((p) => p.id !== presetId)
    }));
  },
  
  startTimer: (timerId) => {
    set((state) => {
      const updatedTimers = state.timers.map((t) => 
        t.id === timerId 
          ? { ...t, status: TimerStatus.RUNNING, updatedAt: new Date() } 
          : t
      );
      const filteredTimers = filterTimers(updatedTimers, state.filter);
      return { timers: updatedTimers, filteredTimers };
    });
  },
  
  pauseTimer: (timerId) => {
    set((state) => {
      const updatedTimers = state.timers.map((t) => 
        t.id === timerId 
          ? { ...t, status: TimerStatus.PAUSED, updatedAt: new Date() } 
          : t
      );
      const filteredTimers = filterTimers(updatedTimers, state.filter);
      return { timers: updatedTimers, filteredTimers };
    });
  },
  
  resumeTimer: (timerId) => {
    set((state) => {
      const updatedTimers = state.timers.map((t) => 
        t.id === timerId 
          ? { ...t, status: TimerStatus.RUNNING, updatedAt: new Date() } 
          : t
      );
      const filteredTimers = filterTimers(updatedTimers, state.filter);
      return { timers: updatedTimers, filteredTimers };
    });
  },
  
  resetTimer: (timerId) => {
    set((state) => {
      const updatedTimers = state.timers.map((t) => 
        t.id === timerId 
          ? { ...t, status: TimerStatus.IDLE, remainingTime: t.duration, updatedAt: new Date() } 
          : t
      );
      const filteredTimers = filterTimers(updatedTimers, state.filter);
      return { timers: updatedTimers, filteredTimers };
    });
  },
  
  completeTimer: (timerId) => {
    set((state) => {
      const updatedTimers = state.timers.map((t) => 
        t.id === timerId 
          ? { ...t, status: TimerStatus.COMPLETED, remainingTime: 0, updatedAt: new Date() } 
          : t
      );
      const filteredTimers = filterTimers(updatedTimers, state.filter);
      return { timers: updatedTimers, filteredTimers };
    });
  },
  
  updateTimerTime: (timerId, remainingTime) => {
    set((state) => {
      const updatedTimers = state.timers.map((t) => 
        t.id === timerId 
          ? { ...t, remainingTime, updatedAt: new Date() } 
          : t
      );
      const filteredTimers = filterTimers(updatedTimers, state.filter);
      return { timers: updatedTimers, filteredTimers };
    });
  },
}));

// Helper function to filter timers based on filter criteria
const filterTimers = (timers: Timer[], filter: TimerFilter): Timer[] => {
  return timers.filter((timer) => {
    // Filter by status
    if (filter.status && timer.status !== filter.status) {
      return false;
    }
    
    // Filter by related recipe
    if (filter.recipeId && timer.recipeId !== filter.recipeId) {
      return false;
    }
    
    // Filter by search term
    if (filter.searchTerm) {
      const searchTermLower = filter.searchTerm.toLowerCase();
      const nameMatch = timer.name.toLowerCase().includes(searchTermLower);
      const stepMatch = timer.step ? timer.step.toLowerCase().includes(searchTermLower) : false;
      const notesMatch = timer.notes ? timer.notes.toLowerCase().includes(searchTermLower) : false;
      if (!nameMatch && !stepMatch && !notesMatch) {
        return false;
      }
    }
    
    return true;
  });
};

export default useTimerStore;
