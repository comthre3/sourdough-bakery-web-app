import { create } from 'zustand';
import { Task, TaskStatus, TaskPriority, TaskFilter } from '../types/Task';

interface TaskState {
  tasks: Task[];
  filteredTasks: Task[];
  currentTask: Task | null;
  filter: TaskFilter;
  loading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  setCurrentTask: (task: Task | null) => void;
  setFilter: (filter: TaskFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  filteredTasks: [],
  currentTask: null,
  filter: {},
  loading: false,
  error: null,
  
  setTasks: (tasks) => {
    set((state) => {
      const filteredTasks = filterTasks(tasks, state.filter);
      return { tasks, filteredTasks };
    });
  },
  
  setCurrentTask: (task) => set({ currentTask: task }),
  
  setFilter: (filter) => {
    set((state) => {
      const filteredTasks = filterTasks(state.tasks, filter);
      return { filter, filteredTasks };
    });
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  addTask: (task) => {
    set((state) => {
      const updatedTasks = [...state.tasks, task];
      const filteredTasks = filterTasks(updatedTasks, state.filter);
      return { tasks: updatedTasks, filteredTasks };
    });
  },
  
  updateTask: (task) => {
    set((state) => {
      const updatedTasks = state.tasks.map((t) => 
        t.id === task.id ? task : t
      );
      const filteredTasks = filterTasks(updatedTasks, state.filter);
      return { tasks: updatedTasks, filteredTasks };
    });
  },
  
  deleteTask: (taskId) => {
    set((state) => {
      const updatedTasks = state.tasks.filter((t) => t.id !== taskId);
      const filteredTasks = filterTasks(updatedTasks, state.filter);
      return { tasks: updatedTasks, filteredTasks };
    });
  },
  
  updateTaskStatus: (taskId, status) => {
    set((state) => {
      const updatedTasks = state.tasks.map((t) => 
        t.id === taskId ? { ...t, status, updatedAt: new Date() } : t
      );
      const filteredTasks = filterTasks(updatedTasks, state.filter);
      return { tasks: updatedTasks, filteredTasks };
    });
  },
}));

// Helper function to filter tasks based on filter criteria
const filterTasks = (tasks: Task[], filter: TaskFilter): Task[] => {
  return tasks.filter((task) => {
    // Filter by status
    if (filter.status && task.status !== filter.status) {
      return false;
    }
    
    // Filter by priority
    if (filter.priority && task.priority !== filter.priority) {
      return false;
    }
    
    // Filter by assigned user
    if (filter.assignedTo && task.assignedTo !== filter.assignedTo) {
      return false;
    }
    
    // Filter by related recipe
    if (filter.relatedRecipeId && task.relatedRecipeId !== filter.relatedRecipeId) {
      return false;
    }
    
    // Filter by due date (same day)
    if (filter.dueDate && task.dueDate) {
      const filterDate = new Date(filter.dueDate);
      const taskDate = new Date(task.dueDate);
      
      if (
        filterDate.getFullYear() !== taskDate.getFullYear() ||
        filterDate.getMonth() !== taskDate.getMonth() ||
        filterDate.getDate() !== taskDate.getDate()
      ) {
        return false;
      }
    }
    
    // Filter by search term
    if (filter.searchTerm) {
      const searchTermLower = filter.searchTerm.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchTermLower);
      const descriptionMatch = task.description.toLowerCase().includes(searchTermLower);
      if (!titleMatch && !descriptionMatch) {
        return false;
      }
    }
    
    return true;
  });
};

export default useTaskStore;
