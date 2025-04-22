export interface Task {
  id?: string;
  title: string;
  description: string;
  assignedTo?: string;
  dueDate: Date | null;
  status: TaskStatus;
  priority: TaskPriority;
  relatedRecipeId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  searchTerm?: string;
  dueDate?: Date;
  relatedRecipeId?: string;
}
