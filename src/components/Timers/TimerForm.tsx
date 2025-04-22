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
  Autocomplete,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Timer, TimerStatus, TimerPreset } from '../../types/Timer';
import useTimerStore from '../../store/timerStore';
import { useAuth } from '../../context/AuthContext';
import { createTimer, updateTimer, createTimerPreset, updateTimerPreset } from '../../services/timerService';
import useRecipeStore from '../../store/recipeStore';
import { fetchRecipes } from '../../services/recipeService';

// Helper function to convert HH:MM:SS to seconds
const timeToSeconds = (timeString: string): number => {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

// Helper function to format seconds to HH:MM:SS
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

interface TimerFormProps {
  isPreset?: boolean;
}

const TimerForm: React.FC<TimerFormProps> = ({ isPreset = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    timers, 
    presets,
    setLoading, 
    setError, 
    addTimer, 
    updateTimer: updateTimerInStore,
    addPreset,
    updatePreset: updatePresetInStore
  } = useTimerStore();
  const { recipes, setRecipes } = useRecipeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const isEditMode = Boolean(id);
  const currentItem = isPreset 
    ? isEditMode ? presets.find(preset => preset.id === id) : null
    : isEditMode ? timers.find(timer => timer.id === id) : null;
  
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
    name: Yup.string().required('Name is required'),
    duration: Yup.string()
      .required('Duration is required')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Invalid time format (HH:MM:SS)'),
    recipeId: Yup.string(),
    recipeName: Yup.string(),
    step: Yup.string(),
    notes: Yup.string(),
    notificationEnabled: isPreset ? Yup.boolean().notRequired() : Yup.boolean().required()
  });
  
  const formik = useFormik({
    initialValues: {
      name: currentItem?.name || '',
      duration: currentItem ? formatTime(currentItem.duration) : '00:00:00',
      recipeId: currentItem?.recipeId || '',
      recipeName: currentItem?.recipeName || '',
      step: currentItem?.step || '',
      notes: currentItem?.notes || '',
      notificationEnabled: isPreset ? false : (currentItem as Timer)?.notificationEnabled ?? true
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!currentUser) {
        setFormError('You must be logged in to create or edit timers');
        return;
      }
      
      setIsSubmitting(true);
      setFormError(null);
      
      try {
        const durationInSeconds = timeToSeconds(values.duration);
        
        if (isPreset) {
          // Handle timer preset
          const presetData: TimerPreset = {
            id: isEditMode ? id : undefined,
            name: values.name,
            duration: durationInSeconds,
            recipeId: values.recipeId || undefined,
            recipeName: values.recipeName || undefined,
            step: values.step || undefined,
            notes: values.notes || undefined
          };
          
          if (isEditMode && id) {
            await updateTimerPreset(presetData);
            updatePresetInStore(presetData);
          } else {
            const newPresetId = await createTimerPreset(presetData, currentUser.uid);
            addPreset({ ...presetData, id: newPresetId });
          }
          
          navigate('/timers');
        } else {
          // Handle timer
          const timerData: Timer = {
            id: isEditMode ? id : undefined,
            name: values.name,
            duration: durationInSeconds,
            remainingTime: isEditMode ? (currentItem as Timer).remainingTime : durationInSeconds,
            status: isEditMode ? (currentItem as Timer).status : TimerStatus.IDLE,
            recipeId: values.recipeId || undefined,
            recipeName: values.recipeName || undefined,
            step: values.step || undefined,
            notes: values.notes || undefined,
            notificationEnabled: values.notificationEnabled
          };
          
          if (isEditMode && id) {
            await updateTimer(timerData);
            updateTimerInStore(timerData);
          } else {
            const newTimerId = await createTimer(timerData, currentUser.uid);
            addTimer({ ...timerData, id: newTimerId });
          }
          
          navigate('/timers');
        }
      } catch (err) {
        console.error('Error saving timer:', err);
        setFormError('Failed to save timer. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  });
  
  if (isEditMode && !currentItem) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        {isEditMode 
          ? isPreset ? 'Edit Timer Preset' : 'Edit Timer' 
          : isPreset ? 'Create New Timer Preset' : 'Create New Timer'}
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
                id="name"
                name="name"
                label="Timer Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="duration"
                name="duration"
                label="Duration (HH:MM:SS)"
                value={formik.values.duration}
                onChange={formik.handleChange}
                error={formik.touched.duration && Boolean(formik.errors.duration)}
                helperText={formik.touched.duration && formik.errors.duration}
                placeholder="00:00:00"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Autocomplete
                  id="recipe"
                  options={recipes}
                  getOptionLabel={(option) => option.title}
                  value={recipes.find(recipe => recipe.id === formik.values.recipeId) || null}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('recipeId', newValue?.id || '');
                    formik.setFieldValue('recipeName', newValue?.title || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Related Recipe"
                      error={formik.touched.recipeId && Boolean(formik.errors.recipeId)}
                      helperText={formik.touched.recipeId && formik.errors.recipeId}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="step"
                name="step"
                label="Recipe Step"
                value={formik.values.step}
                onChange={formik.handleChange}
                error={formik.touched.step && Boolean(formik.errors.step)}
                helperText={formik.touched.step && formik.errors.step}
                placeholder="e.g., Bulk Fermentation, Proofing, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Notes"
                multiline
                rows={3}
                value={formik.values.notes}
                onChange={formik.handleChange}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
              />
            </Grid>
            
            {!isPreset && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      id="notificationEnabled"
                      name="notificationEnabled"
                      checked={formik.values.notificationEnabled}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Enable Notifications"
                />
                {formik.touched.notificationEnabled && formik.errors.notificationEnabled && (
                  <FormHelperText error>{formik.errors.notificationEnabled}</FormHelperText>
                )}
              </Grid>
            )}
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/timers')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TimerForm;
