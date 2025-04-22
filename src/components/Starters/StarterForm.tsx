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
  Divider,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Starter, StarterStatus, FeedingFrequency, FeedingSchedule } from '../../types/Starter';
import useStarterStore from '../../store/starterStore';
import { useAuth } from '../../context/AuthContext';
import { createStarter, updateStarter } from '../../services/starterService';

const StarterForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    starters, 
    loading, 
    error, 
    setLoading, 
    setError, 
    addStarter, 
    updateStarter: updateStarterInStore 
  } = useStarterStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const isEditMode = Boolean(id);
  const currentStarter = isEditMode ? starters.find(starter => starter.id === id) : null;
  
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    description: Yup.string(),
    dateCreated: Yup.date().required('Creation date is required'),
    lastFeedingDate: Yup.date().required('Last feeding date is required'),
    feedingFrequency: Yup.string().required('Feeding frequency is required'),
    customHours: Yup.number().when('feedingFrequency', {
      is: FeedingFrequency.CUSTOM,
      then: Yup.number().required('Custom hours is required').positive('Must be positive'),
      otherwise: Yup.number().notRequired()
    }),
    hydration: Yup.number()
      .required('Hydration percentage is required')
      .min(0, 'Must be at least 0')
      .max(200, 'Must be at most 200'),
    status: Yup.string().required('Status is required'),
    notes: Yup.string()
  });
  
  const formik = useFormik({
    initialValues: {
      name: currentStarter?.name || '',
      description: currentStarter?.description || '',
      dateCreated: currentStarter?.dateCreated || new Date(),
      lastFeedingDate: currentStarter?.lastFeedingDate || new Date(),
      feedingFrequency: currentStarter?.feedingSchedule.frequency || FeedingFrequency.DAILY,
      customHours: currentStarter?.feedingSchedule.customHours || 24,
      hydration: currentStarter?.hydration || 100,
      status: currentStarter?.status || StarterStatus.ACTIVE,
      notes: currentStarter?.notes || ''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!currentUser) {
        setFormError('You must be logged in to create or edit starters');
        return;
      }
      
      setIsSubmitting(true);
      setFormError(null);
      
      try {
        const feedingSchedule: FeedingSchedule = {
          frequency: values.feedingFrequency as FeedingFrequency,
          customHours: values.feedingFrequency === FeedingFrequency.CUSTOM ? values.customHours : undefined
        };
        
        const starterData: Starter = {
          id: isEditMode ? id : undefined,
          name: values.name,
          description: values.description || undefined,
          dateCreated: values.dateCreated,
          lastFeedingDate: values.lastFeedingDate,
          feedingSchedule,
          hydration: values.hydration,
          status: values.status as StarterStatus,
          notes: values.notes || undefined,
          feedingHistory: currentStarter?.feedingHistory || []
        };
        
        if (isEditMode && id) {
          await updateStarter(starterData);
          updateStarterInStore(starterData);
        } else {
          const newStarterId = await createStarter(starterData, currentUser.uid);
          addStarter({ ...starterData, id: newStarterId });
        }
        
        navigate('/starters');
      } catch (err) {
        console.error('Error saving starter:', err);
        setFormError('Failed to save starter. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  });
  
  if (isEditMode && !currentStarter && loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        {isEditMode ? 'Edit Starter' : 'Create New Starter'}
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
                label="Starter Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={2}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Starter Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date Created"
                  value={formik.values.dateCreated}
                  onChange={(value) => formik.setFieldValue('dateCreated', value)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      error: formik.touched.dateCreated && Boolean(formik.errors.dateCreated),
                      helperText: formik.touched.dateCreated && formik.errors.dateCreated
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Last Feeding Date"
                  value={formik.values.lastFeedingDate}
                  onChange={(value) => formik.setFieldValue('lastFeedingDate', value)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      error: formik.touched.lastFeedingDate && Boolean(formik.errors.lastFeedingDate),
                      helperText: formik.touched.lastFeedingDate && formik.errors.lastFeedingDate
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="hydration"
                name="hydration"
                label="Hydration"
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                value={formik.values.hydration}
                onChange={formik.handleChange}
                error={formik.touched.hydration && Boolean(formik.errors.hydration)}
                helperText={formik.touched.hydration && formik.errors.hydration}
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
                  <MenuItem value={StarterStatus.ACTIVE}>Active</MenuItem>
                  <MenuItem value={StarterStatus.DORMANT}>Dormant</MenuItem>
                  <MenuItem value={StarterStatus.ARCHIVED}>Archived</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Feeding Schedule
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.feedingFrequency && Boolean(formik.errors.feedingFrequency)}>
                <InputLabel id="feeding-frequency-label">Feeding Frequency</InputLabel>
                <Select
                  labelId="feeding-frequency-label"
                  id="feedingFrequency"
                  name="feedingFrequency"
                  value={formik.values.feedingFrequency}
                  label="Feeding Frequency"
                  onChange={formik.handleChange}
                >
                  <MenuItem value={FeedingFrequency.TWICE_DAILY}>Twice Daily</MenuItem>
                  <MenuItem value={FeedingFrequency.DAILY}>Daily</MenuItem>
                  <MenuItem value={FeedingFrequency.EVERY_OTHER_DAY}>Every Other Day</MenuItem>
                  <MenuItem value={FeedingFrequency.WEEKLY}>Weekly</MenuItem>
                  <MenuItem value={FeedingFrequency.CUSTOM}>Custom</MenuItem>
                </Select>
                {formik.touched.feedingFrequency && formik.errors.feedingFrequency && (
                  <FormHelperText>{formik.errors.feedingFrequency}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {formik.values.feedingFrequency === FeedingFrequency.CUSTOM && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="customHours"
                  name="customHours"
                  label="Custom Hours"
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                  }}
                  value={formik.values.customHours}
                  onChange={formik.handleChange}
                  error={formik.touched.customHours && Boolean(formik.errors.customHours)}
                  helperText={formik.touched.customHours && formik.errors.customHours}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Notes"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/starters')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Starter' : 'Create Starter'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default StarterForm;
