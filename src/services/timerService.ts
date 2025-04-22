import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Timer, TimerStatus, TimerPreset } from '../types/Timer';

const TIMERS_COLLECTION = 'timers';
const PRESETS_COLLECTION = 'timerPresets';

// Timer CRUD operations
export const fetchTimers = async (userId: string): Promise<Timer[]> => {
  try {
    const timersQuery = query(collection(db, TIMERS_COLLECTION), where('createdBy', '==', userId));
    const querySnapshot = await getDocs(timersQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        duration: data.duration,
        remainingTime: data.remainingTime,
        status: data.status,
        recipeId: data.recipeId,
        recipeName: data.recipeName,
        step: data.step,
        notes: data.notes,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
        createdBy: data.createdBy,
        notificationEnabled: data.notificationEnabled
      } as Timer;
    });
  } catch (error) {
    console.error('Error fetching timers:', error);
    throw error;
  }
};

export const createTimer = async (timer: Timer, userId: string): Promise<string> => {
  try {
    const timerData = {
      ...timer,
      createdBy: userId,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    const docRef = await addDoc(collection(db, TIMERS_COLLECTION), timerData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating timer:', error);
    throw error;
  }
};

export const updateTimer = async (timer: Timer): Promise<void> => {
  if (!timer.id) {
    throw new Error('Timer ID is required for update');
  }
  
  try {
    const timerRef = doc(db, TIMERS_COLLECTION, timer.id);
    const timerData = {
      ...timer,
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    // Remove id from the data as it's not stored in the document
    delete timerData.id;
    
    await updateDoc(timerRef, timerData);
  } catch (error) {
    console.error('Error updating timer:', error);
    throw error;
  }
};

export const deleteTimer = async (timerId: string): Promise<void> => {
  try {
    const timerRef = doc(db, TIMERS_COLLECTION, timerId);
    await deleteDoc(timerRef);
  } catch (error) {
    console.error('Error deleting timer:', error);
    throw error;
  }
};

export const updateTimerStatus = async (timerId: string, status: TimerStatus, remainingTime: number): Promise<void> => {
  try {
    const timerRef = doc(db, TIMERS_COLLECTION, timerId);
    await updateDoc(timerRef, {
      status,
      remainingTime,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error updating timer status:', error);
    throw error;
  }
};

// Timer Preset CRUD operations
export const fetchTimerPresets = async (userId: string): Promise<TimerPreset[]> => {
  try {
    const presetsQuery = query(collection(db, PRESETS_COLLECTION), where('createdBy', '==', userId));
    const querySnapshot = await getDocs(presetsQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        duration: data.duration,
        recipeId: data.recipeId,
        recipeName: data.recipeName,
        step: data.step,
        notes: data.notes,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
        createdBy: data.createdBy
      } as TimerPreset;
    });
  } catch (error) {
    console.error('Error fetching timer presets:', error);
    throw error;
  }
};

export const createTimerPreset = async (preset: TimerPreset, userId: string): Promise<string> => {
  try {
    const presetData = {
      ...preset,
      createdBy: userId,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    const docRef = await addDoc(collection(db, PRESETS_COLLECTION), presetData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating timer preset:', error);
    throw error;
  }
};

export const updateTimerPreset = async (preset: TimerPreset): Promise<void> => {
  if (!preset.id) {
    throw new Error('Preset ID is required for update');
  }
  
  try {
    const presetRef = doc(db, PRESETS_COLLECTION, preset.id);
    const presetData = {
      ...preset,
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    // Remove id from the data as it's not stored in the document
    delete presetData.id;
    
    await updateDoc(presetRef, presetData);
  } catch (error) {
    console.error('Error updating timer preset:', error);
    throw error;
  }
};

export const deleteTimerPreset = async (presetId: string): Promise<void> => {
  try {
    const presetRef = doc(db, PRESETS_COLLECTION, presetId);
    await deleteDoc(presetRef);
  } catch (error) {
    console.error('Error deleting timer preset:', error);
    throw error;
  }
};

// Helper function to create a timer from a preset
export const createTimerFromPreset = async (preset: TimerPreset, userId: string): Promise<string> => {
  try {
    const timer: Timer = {
      name: preset.name,
      duration: preset.duration,
      remainingTime: preset.duration,
      status: TimerStatus.IDLE,
      recipeId: preset.recipeId,
      recipeName: preset.recipeName,
      step: preset.step,
      notes: preset.notes,
      notificationEnabled: true
    };
    
    return await createTimer(timer, userId);
  } catch (error) {
    console.error('Error creating timer from preset:', error);
    throw error;
  }
};
