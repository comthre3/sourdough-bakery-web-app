import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Tabs,
  Tab,
  Autocomplete
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Alarm as AlarmIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import useTimerStore from '../../store/timerStore';
import { Timer, TimerStatus, TimerPreset } from '../../types/Timer';
import { fetchTimers, fetchTimerPresets, updateTimerStatus, createTimerFromPreset } from '../../services/timerService';
import useRecipeStore from '../../store/recipeStore';
import { fetchRecipes } from '../../services/recipeService';

// Helper function to format time in HH:MM:SS
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

const TimerList: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    timers, 
    presets,
    loading, 
    error, 
    setTimers, 
    setPresets,
    setLoading, 
    setError,
    updateTimerTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    completeTimer
  } = useTimerStore();
  
  const { recipes, setRecipes } = useRecipeStore();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [recipeFilter, setRecipeFilter] = useState<string>('');
  
  // Load timers and presets
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const [timersData, presetsData] = await Promise.all([
          fetchTimers(currentUser.uid),
          fetchTimerPresets(currentUser.uid)
        ]);
        
        setTimers(timersData);
        setPresets(presetsData);
        setError(null);
      } catch (err) {
        setError('Failed to load timers. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentUser, setTimers, setPresets, setLoading, setError]);
  
  // Load recipes if needed
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
  
  // Timer tick effect
  useEffect(() => {
    const timerInterval = setInterval(() => {
      timers.forEach(timer => {
        if (timer.status === TimerStatus.RUNNING && timer.remainingTime > 0) {
          const newRemainingTime = timer.remainingTime - 1;
          updateTimerTime(timer.id!, newRemainingTime);
          
          // Update timer in database every 10 seconds to avoid excessive writes
          if (newRemainingTime % 10 === 0) {
            updateTimerStatus(timer.id!, timer.status, newRemainingTime).catch(err => {
              console.error('Error updating timer in database:', err);
            });
          }
          
          // Check if timer completed
          if (newRemainingTime === 0) {
            completeTimer(timer.id!);
            updateTimerStatus(timer.id!, TimerStatus.COMPLETED, 0).catch(err => {
              console.error('Error completing timer in database:', err);
            });
            
            // Show notification if enabled
            if (timer.notificationEnabled && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('Timer Completed', {
                  body: `${timer.name} timer has completed!`,
                  icon: '/favicon.ico'
                });
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('Timer Completed', {
                      body: `${timer.name} timer has completed!`,
                      icon: '/favicon.ico'
                    });
                  }
                });
              }
            }
          }
        }
      });
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [timers, updateTimerTime, completeTimer]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleStartTimer = async (timer: Timer) => {
    if (!timer.id) return;
    
    try {
      await updateTimerStatus(timer.id, TimerStatus.RUNNING, timer.remainingTime);
      startTimer(timer.id);
    } catch (err) {
      console.error('Error starting timer:', err);
    }
  };
  
  const handlePauseTimer = async (timer: Timer) => {
    if (!timer.id) return;
    
    try {
      await updateTimerStatus(timer.id, TimerStatus.PAUSED, timer.remainingTime);
      pauseTimer(timer.id);
    } catch (err) {
      console.error('Error pausing timer:', err);
    }
  };
  
  const handleResumeTimer = async (timer: Timer) => {
    if (!timer.id) return;
    
    try {
      await updateTimerStatus(timer.id, TimerStatus.RUNNING, timer.remainingTime);
      resumeTimer(timer.id);
    } catch (err) {
      console.error('Error resuming timer:', err);
    }
  };
  
  const handleResetTimer = async (timer: Timer) => {
    if (!timer.id) return;
    
    try {
      await updateTimerStatus(timer.id, TimerStatus.IDLE, timer.duration);
      resetTimer(timer.id);
    } catch (err) {
      console.error('Error resetting timer:', err);
    }
  };
  
  const handleCreateFromPreset = async (preset: TimerPreset) => {
    if (!currentUser) return;
    
    try {
      await createTimerFromPreset(preset, currentUser.uid);
      // Refresh timers
      const timersData = await fetchTimers(currentUser.uid);
      setTimers(timersData);
    } catch (err) {
      console.error('Error creating timer from preset:', err);
    }
  };
  
  // Filter timers based on search term and recipe filter
  const filteredTimers = timers.filter(timer => {
    const matchesSearch = searchTerm === '' || 
      timer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (timer.step && timer.step.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (timer.notes && timer.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRecipe = recipeFilter === '' || timer.recipeId === recipeFilter;
    
    return matchesSearch && matchesRecipe;
  });
  
  // Filter presets based on search term and recipe filter
  const filteredPresets = presets.filter(preset => {
    const matchesSearch = searchTerm === '' || 
      preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (preset.step && preset.step.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (preset.notes && preset.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRecipe = recipeFilter === '' || preset.recipeId === recipeFilter;
    
    return matchesSearch && matchesRecipe;
  });
  
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Timers
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component="a"
          href="/timers/new"
        >
          New Timer
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="recipe-filter-label">Recipe</InputLabel>
              <Select
                labelId="recipe-filter-label"
                id="recipe-filter"
                value={recipeFilter}
                label="Recipe"
                onChange={(e) => setRecipeFilter(e.target.value)}
              >
                <MenuItem value="">All Recipes</MenuItem>
                {recipes.map((recipe) => (
                  <MenuItem key={recipe.id} value={recipe.id}>
                    {recipe.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => { setSearchTerm(''); setRecipeFilter(''); }} size="small">
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Active Timers" />
          <Tab label="Timer Presets" />
        </Tabs>
        
        <Box sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2, color: 'error.main', textAlign: 'center' }}>
              {error}
            </Box>
          ) : activeTab === 0 ? (
            // Active Timers Tab
            filteredTimers.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1">
                  No timers found. Create a new timer or use a preset to get started.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredTimers.map((timer) => (
                  <Grid item xs={12} sm={6} md={4} key={timer.id}>
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        p: 2, 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderTop: '4px solid',
                        borderColor: timer.status === TimerStatus.RUNNING 
                          ? 'success.main' 
                          : timer.status === TimerStatus.PAUSED 
                            ? 'warning.main' 
                            : timer.status === TimerStatus.COMPLETED 
                              ? 'error.main' 
                              : 'primary.main'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="h3" noWrap title={timer.name}>
                          {timer.name}
                        </Typography>
                        <IconButton 
                          size="small" 
                          component="a"
                          href={`/timers/edit/${timer.id}`}
                        >
                          <SaveIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      {timer.recipeName && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ mb: 1 }}
                          component="a"
                          href={timer.recipeId ? `/recipes/${timer.recipeId}` : '#'}
                          sx={{ 
                            textDecoration: 'none', 
                            color: 'text.secondary',
                            '&:hover': {
                              textDecoration: 'underline',
                              color: 'primary.main'
                            }
                          }}
                        >
                          {timer.recipeName}
                        </Typography>
                      )}
                      
                      {timer.step && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Step: {timer.step}
                        </Typography>
                      )}
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        my: 2,
                        p: 2,
                        backgroundColor: 'background.default',
                        borderRadius: 1
                      }}>
                        <Typography 
                          variant="h4" 
                          component="div" 
                          sx={{ 
                            fontFamily: 'monospace',
                            color: timer.status === TimerStatus.COMPLETED 
                              ? 'error.main' 
                              : timer.status === TimerStatus.RUNNING 
                                ? 'success.main' 
                                : 'text.primary'
                          }}
                        >
                          {formatTime(timer.remainingTime)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                        {timer.status === TimerStatus.IDLE && (
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<PlayIcon />}
                            onClick={() => handleStartTimer(timer)}
                          >
                            Start
                          </Button>
                        )}
                        
                        {timer.status === TimerStatus.RUNNING && (
                          <Button
                            variant="contained"
                            color="warning"
                            startIcon={<PauseIcon />}
                            onClick={() => handlePauseTimer(timer)}
                          >
                            Pause
                          </Button>
                        )}
                        
                        {timer.status === TimerStatus.PAUSED && (
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<PlayIcon />}
                            onClick={() => handleResumeTimer(timer)}
                          >
                            Resume
                          </Button>
                        )}
                        
                        <Button
                          variant="outlined"
                          startIcon={<RefreshIcon />}
                          onClick={() => handleResetTimer(timer)}
                          disabled={timer.status === TimerStatus.IDLE}
                        >
                          Reset
                        </Button>
                      </Box>
                      
                      <Box sx={{ mt: 'auto' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={timer.notificationEnabled}
                              onChange={(e) => {
                                // Update notification setting
                                const updatedTimer = { ...timer, notificationEnabled: e.target.checked };
                                updateTimerStatus(timer.id!, timer.status, timer.remainingTime).catch(err => {
                                  console.error('Error updating timer notification setting:', err);
                                });
                              }}
                              size="small"
                            />
                          }
                          label="Notifications"
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )
          ) : (
            // Timer Presets Tab
            filteredPresets.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1">
                  No timer presets found. Create a new preset to save commonly used timers.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  component="a"
                  href="/timers/presets/new"
                  sx={{ mt: 2 }}
                >
                  New Preset
                </Button>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />}
                    component="a"
                    href="/timers/presets/new"
                    size="small"
                  >
                    New Preset
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {filteredPresets.map((preset) => (
                    <Grid item xs={12} sm={6} md={4} key={preset.id}>
                      <Paper 
                        elevation={3} 
                        sx={{ 
                          p: 2, 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" component="h3" noWrap title={preset.name}>
                            {preset.name}
                          </Typography>
                          <Box>
                            <IconButton 
                              size="small" 
                              component="a"
                              href={`/timers/presets/edit/${preset.id}`}
                              sx={{ mr: 1 }}
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small"
                              color="error"
                              component="a"
                              href={`/timers/presets/delete/${preset.id}`}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        {preset.recipeName && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ mb: 1 }}
                          >
                            {preset.recipeName}
                          </Typography>
                        )}
                        
                        {preset.step && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Step: {preset.step}
                          </Typography>
                        )}
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          my: 2,
                          p: 2,
                          backgroundColor: 'background.default',
                          borderRadius: 1
                        }}>
                          <Typography 
                            variant="h5" 
                            component="div" 
                            sx={{ fontFamily: 'monospace' }}
                          >
                            {formatTime(preset.duration)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'center' }}>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AlarmIcon />}
                            onClick={() => handleCreateFromPreset(preset)}
                            fullWidth
                          >
                            Use Preset
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </>
            )
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TimerList;
