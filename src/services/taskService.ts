import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Task, TaskStatus } from '../types/Task';

const COLLECTION_NAME = 'tasks';

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  try {
    const tasksQuery = query(collection(db, COLLECTION_NAME), where('createdBy', '==', userId));
    const querySnapshot = await getDocs(tasksQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate ? data.dueDate.toDate() : null,
        status: data.status,
        priority: data.priority,
        relatedRecipeId: data.relatedRecipeId,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
        createdBy: data.createdBy
      } as Task;
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (task: Task, userId: string): Promise<string> => {
  try {
    const taskData = {
      ...task,
      createdBy: userId,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
      dueDate: task.dueDate ? Timestamp.fromDate(new Date(task.dueDate)) : null
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), taskData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (task: Task): Promise<void> => {
  if (!task.id) {
    throw new Error('Task ID is required for update');
  }
  
  try {
    const taskRef = doc(db, COLLECTION_NAME, task.id);
    const taskData = {
      ...task,
      updatedAt: Timestamp.fromDate(new Date()),
      dueDate: task.dueDate ? Timestamp.fromDate(new Date(task.dueDate)) : null
    };
    
    // Remove id from the data as it's not stored in the document
    delete taskData.id;
    
    await updateDoc(taskRef, taskData);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, {
      status,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};
