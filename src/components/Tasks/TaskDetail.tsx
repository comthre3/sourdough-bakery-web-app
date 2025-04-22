import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Task, TaskStatus, TaskPriority } from '../../types/Task';
import useTaskStore from '../../store/taskStore';
import { updateTaskStatus, deleteTask } from '../../services/taskService';
import useRecipeStore from '../../store/recipeStore';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, loading, error, updateTaskStatus: updateTaskStatusInStore, deleteTask: deleteTaskInStore } = useTaskStore();
  const { recipes } = useRecipeStore();
  
  const task = tasks.find(t => t.id === id);
  const relatedRecipe = task?.relatedRecipeId ? recipes.find(r => r.id === task.relatedRecipeId) : null;
  
  const handleStatusChange = async () => {
    if (!task || !task.id) return;
    
    const newStatus = task.status === TaskStatus.COMPLETED 
      ? TaskStatus.TODO 
      : TaskStatus.COMPLETED;
    
    try {
      await updateTaskStatus(task.id, newStatus);
      updateTaskStatusInStore(task.id, newStatus);
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };
  
  const handleDelete = async () => {
    if (!task || !task.id) return;
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task.id);
        deleteTaskInStore(task.id);
        navigate('/tasks');
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };
  
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'error';
      case TaskPriority.MEDIUM:
        return 'warning';
      case TaskPriority.LOW:
        return 'success';
      default:
        return 'default';
    }
  };
  
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircleIcon color="success" />;
      case TaskStatus.IN_PROGRESS:
        return <AccessTimeIcon color="warning" />;
      case TaskStatus.TODO:
        return <RadioButtonUncheckedIcon />;
      default:
        return <RadioButtonUncheckedIcon />;
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
        {error}
      </Paper>
    );
  }
  
  if (!task) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">
          Task not found.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tasks')}
          sx={{ mt: 2 }}
        >
          Back to Tasks
        </Button>
      </Paper>
    );
  }
  
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tasks')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
          Task Details
        </Typography>
        <IconButton 
          color="primary" 
          onClick={() => navigate(`/tasks/edit/${task.id}`)}
          sx={{ mr: 1 }}
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          color="error" 
          onClick={handleDelete}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              mr: 2
            }}
            onClick={handleStatusChange}
          >
            {getStatusIcon(task.status)}
          </Box>
          <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
            {task.title}
          </Typography>
          <Chip 
            label={task.priority} 
            color={getPriorityColor(task.priority)}
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {task.description}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getStatusIcon(task.status)}
              <Typography variant="body1" sx={{ ml: 1 }}>
                {task.status}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Priority
            </Typography>
            <Chip 
              label={task.priority} 
              color={getPriorityColor(task.priority)}
              size="small"
            />
          </Grid>
          
          {task.dueDate && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Due Date
              </Typography>
              <Typography variant="body1">
                {format(new Date(task.dueDate), 'MMMM d, yyyy')}
              </Typography>
            </Grid>
          )}
          
          {task.assignedTo && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Assigned To
              </Typography>
              <Typography variant="body1">
                {task.assignedTo}
              </Typography>
            </Grid>
          )}
          
          {relatedRecipe && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Related Recipe
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate(`/recipes/${relatedRecipe.id}`)}
              >
                {relatedRecipe.title}
              </Button>
            </Grid>
          )}
          
          {task.createdAt && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}
              </Typography>
            </Grid>
          )}
          
          {task.updatedAt && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Last Updated: {format(new Date(task.updatedAt), 'MMM d, yyyy')}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default TaskDetail;
