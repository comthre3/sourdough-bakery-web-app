import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Task, TaskStatus, TaskPriority } from '../../types/Task';
import useTaskStore from '../../store/taskStore';
import { useAuth } from '../../context/AuthContext';
import { createTask, updateTask } from '../../services/taskService';
import useRecipeStore from '../../store/recipeStore';
import { fetchRecipes } from '../../services/recipeService';

const TaskForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { tasks, setLoading, setError, addTask, updateTask: updateTaskInStore } = useTaskStore();
  const { recipes, setRecipes } = useRecipeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const isEditMode = Boolean(id);
  const currentTask = isEditMode ? tasks.find(task => task.id === id) : null;
  
  useEffect(() => {
    const loadRecipes = async () => {
      if (!currentUser || recipes.length > 0) return;
      
      try {
        const recipesData = await fetchRecipes(currentUser.uid);
        setRecipes(recipesData);
      } catch (err) {
        console.error('Error loading recipes:', err);
      }
    };
    
    loadRecipes();
  }, [currentUser, recipes.length, setRecipes]);
  
  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    status: Yup.string().required('Status is required'),
    priority: Yup.string().required('Priority is required'),
    dueDate: Yup.date().nullable(),
    assignedTo: Yup.string(),
    relatedRecipeId: Yup.string()
  });
  
  const formik = useFormik({
    initialValues: {
      title: currentTask?.title || '',
      description: currentTask?.description || '',
      status: currentTask?.status || TaskStatus.TODO,
      priority: currentTask?.priority || TaskPriority.MEDIUM,
      dueDate: currentTask?.dueDate || null,
      assignedTo: currentTask?.assignedTo || '',
      relatedRecipeId: currentTask?.relatedRecipeId || ''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!currentUser) {
        setFormError('You must be logged in to create or edit tasks');
        return;
      }
      
      setIsSubmitting(true);
      setFormError(null);
      
      try {
        const taskData: Task = {
          ...values,
          id: isEditMode ? id : undefined
        };
        
        if (isEditMode && id) {
          await updateTask(taskData);
          updateTaskInStore(taskData);
        } else {
          const newTaskId = await createTask(taskData, currentUser.uid);
          addTask({ ...taskData, id: newTaskId });
        }
        
        navigate('/tasks');
      } catch (err) {
        console.error('Error saving task:', err);
        setFormError('Failed to save task. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  });
  
  if (isEditMode && !currentTask) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        {isEditMode ? 'Edit Task' : 'Create New Task'}
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        {formError && (
          <Box sx={{ mb: 2, color: 'error.main' }}>
            {formError}
          </Box>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Task Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  label="Status"
                  onChange={formik.handleChange}
                >
                  <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
                  <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
                  <MenuItem value={TaskStatus.COMPLETED}>Completed</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.priority && Boolean(formik.errors.priority)}>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  name="priority"
                  value={formik.values.priority}
                  label="Priority"
                  onChange={formik.handleChange}
                >
                  <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
                  <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
                  <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
                </Select>
                {formik.touched.priority && formik.errors.priority && (
                  <FormHelperText>{formik.errors.priority}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={formik.values.dueDate}
                  onChange={(value) => formik.setFieldValue('dueDate', value)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      error: formik.touched.dueDate && Boolean(formik.errors.dueDate),
                      helperText: formik.touched.dueDate && formik.errors.dueDate
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="assignedTo"
                name="assignedTo"
                label="Assigned To"
                value={formik.values.assignedTo}
                onChange={formik.handleChange}
                error={formik.touched.assignedTo && Boolean(formik.errors.assignedTo)}
                helperText={formik.touched.assignedTo && formik.errors.assignedTo}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Autocomplete
                  id="relatedRecipeId"
                  options={recipes}
                  getOptionLabel={(option) => option.title}
                  value={recipes.find(recipe => recipe.id === formik.values.relatedRecipeId) || null}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('relatedRecipeId', newValue?.id || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Related Recipe"
                      error={formik.touched.relatedRecipeId && Boolean(formik.errors.relatedRecipeId)}
                      helperText={formik.touched.relatedRecipeId && formik.errors.relatedRecipeId}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/tasks')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TaskForm;
