import { create } from 'zustand';
import { Starter, StarterStatus, FeedingRecord, StarterFilter } from '../types/Starter';

interface StarterState {
  starters: Starter[];
  filteredStarters: Starter[];
  currentStarter: Starter | null;
  filter: StarterFilter;
  loading: boolean;
  error: string | null;
  
  // Actions
  setStarters: (starters: Starter[]) => void;
  setCurrentStarter: (starter: Starter | null) => void;
  setFilter: (filter: StarterFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addStarter: (starter: Starter) => void;
  updateStarter: (starter: Starter) => void;
  deleteStarter: (starterId: string) => void;
  updateStarterStatus: (starterId: string, status: StarterStatus) => void;
  addFeedingRecord: (starterId: string, record: FeedingRecord) => void;
  updateFeedingRecord: (starterId: string, recordId: string, record: FeedingRecord) => void;
  deleteFeedingRecord: (starterId: string, recordId: string) => void;
}

const useStarterStore = create<StarterState>((set) => ({
  starters: [],
  filteredStarters: [],
  currentStarter: null,
  filter: {},
  loading: false,
  error: null,
  
  setStarters: (starters) => {
    set((state) => {
      const filteredStarters = filterStarters(starters, state.filter);
      return { starters, filteredStarters };
    });
  },
  
  setCurrentStarter: (starter) => set({ currentStarter: starter }),
  
  setFilter: (filter) => {
    set((state) => {
      const filteredStarters = filterStarters(state.starters, filter);
      return { filter, filteredStarters };
    });
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  addStarter: (starter) => {
    set((state) => {
      const updatedStarters = [...state.starters, starter];
      const filteredStarters = filterStarters(updatedStarters, state.filter);
      return { starters: updatedStarters, filteredStarters };
    });
  },
  
  updateStarter: (starter) => {
    set((state) => {
      const updatedStarters = state.starters.map((s) => 
        s.id === starter.id ? starter : s
      );
      const filteredStarters = filterStarters(updatedStarters, state.filter);
      return { starters: updatedStarters, filteredStarters };
    });
  },
  
  deleteStarter: (starterId) => {
    set((state) => {
      const updatedStarters = state.starters.filter((s) => s.id !== starterId);
      const filteredStarters = filterStarters(updatedStarters, state.filter);
      return { starters: updatedStarters, filteredStarters };
    });
  },
  
  updateStarterStatus: (starterId, status) => {
    set((state) => {
      const updatedStarters = state.starters.map((s) => 
        s.id === starterId ? { ...s, status } : s
      );
      const filteredStarters = filterStarters(updatedStarters, state.filter);
      return { starters: updatedStarters, filteredStarters };
    });
  },
  
  addFeedingRecord: (starterId, record) => {
    set((state) => {
      const updatedStarters = state.starters.map((s) => {
        if (s.id === starterId) {
          const updatedStarter = { 
            ...s, 
            feedingHistory: [...s.feedingHistory, record],
            lastFeedingDate: record.date
          };
          return updatedStarter;
        }
        return s;
      });
      const filteredStarters = filterStarters(updatedStarters, state.filter);
      return { starters: updatedStarters, filteredStarters };
    });
  },
  
  updateFeedingRecord: (starterId, recordId, record) => {
    set((state) => {
      const updatedStarters = state.starters.map((s) => {
        if (s.id === starterId) {
          const updatedFeedingHistory = s.feedingHistory.map((r) => 
            r.id === recordId ? record : r
          );
          
          // Update lastFeedingDate if this is the most recent feeding
          const mostRecentFeeding = [...updatedFeedingHistory].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          
          return { 
            ...s, 
            feedingHistory: updatedFeedingHistory,
            lastFeedingDate: mostRecentFeeding.date
          };
        }
        return s;
      });
      const filteredStarters = filterStarters(updatedStarters, state.filter);
      return { starters: updatedStarters, filteredStarters };
    });
  },
  
  deleteFeedingRecord: (starterId, recordId) => {
    set((state) => {
      const updatedStarters = state.starters.map((s) => {
        if (s.id === starterId) {
          const updatedFeedingHistory = s.feedingHistory.filter((r) => r.id !== recordId);
          
          // Update lastFeedingDate if we still have feeding records
          let lastFeedingDate = s.lastFeedingDate;
          if (updatedFeedingHistory.length > 0) {
            const mostRecentFeeding = [...updatedFeedingHistory].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0];
            lastFeedingDate = mostRecentFeeding.date;
          }
          
          return { 
            ...s, 
            feedingHistory: updatedFeedingHistory,
            lastFeedingDate
          };
        }
        return s;
      });
      const filteredStarters = filterStarters(updatedStarters, state.filter);
      return { starters: updatedStarters, filteredStarters };
    });
  },
}));

// Helper function to filter starters based on filter criteria
const filterStarters = (starters: Starter[], filter: StarterFilter): Starter[] => {
  return starters.filter((starter) => {
    // Filter by status
    if (filter.status && starter.status !== filter.status) {
      return false;
    }
    
    // Filter by search term
    if (filter.searchTerm) {
      const searchTermLower = filter.searchTerm.toLowerCase();
      const nameMatch = starter.name.toLowerCase().includes(searchTermLower);
      const descriptionMatch = starter.description ? starter.description.toLowerCase().includes(searchTermLower) : false;
      const notesMatch = starter.notes ? starter.notes.toLowerCase().includes(searchTermLower) : false;
      if (!nameMatch && !descriptionMatch && !notesMatch) {
        return false;
      }
    }
    
    return true;
  });
};

export default useStarterStore;
