import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  Slider,
  CircularProgress,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Opacity as OpacityIcon,
  Scale as ScaleIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import useSettingsStore from '../../store/settingsStore';
import { ThemeMode, UnitSystem } from '../../types/Settings';
import { fetchUserSettings, updateUserSettings } from '../../services/settingsService';

const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    settings, 
    loading, 
    error, 
    setSettings, 
    setLoading, 
    setError 
  } = useSettingsStore();
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [localSettings, setLocalSettings] = useState(settings);
  
  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const userSettings = await fetchUserSettings(currentUser.uid);
        setSettings(userSettings);
        setLocalSettings(userSettings);
        setError(null);
      } catch (err) {
        setError('Failed to load settings. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [currentUser, setSettings, setLoading, setError]);
  
  // Update local settings when store settings change
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);
  
  const handleSaveSettings = async () => {
    if (!currentUser || !localSettings) return;
    
    setSaveStatus('saving');
    try {
      await updateUserSettings({
        ...localSettings,
        userId: currentUser.uid
      });
      setSettings({
        ...localSettings,
        userId: currentUser.uid
      });
      setSaveStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveStatus('error');
    }
  };
  
  const handleThemeChange = (theme: ThemeMode) => {
    if (!localSettings) return;
    
    setLocalSettings({
      ...localSettings,
      theme
    });
  };
  
  const handleNotificationChange = (field: keyof typeof localSettings.notifications, value: boolean | number) => {
    if (!localSettings) return;
    
    setLocalSettings({
      ...localSettings,
      notifications: {
        ...localSettings.notifications,
        [field]: value
      }
    });
  };
  
  const handleDefaultHydrationChange = (_event: Event, value: number | number[]) => {
    if (!localSettings) return;
    
    setLocalSettings({
      ...localSettings,
      defaultHydration: value as number
    });
  };
  
  const handleDefaultUnitsChange = (units: UnitSystem) => {
    if (!localSettings) return;
    
    setLocalSettings({
      ...localSettings,
      defaultUnits: units
    });
  };
  
  const handleBakeryInfoChange = (field: 'bakeryName' | 'bakeryLogo', value: string) => {
    if (!localSettings) return;
    
    setLocalSettings({
      ...localSettings,
      [field]: value
    });
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
  
  if (!localSettings) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">
          Settings could not be loaded. Please try again later.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Settings
      </Typography>
      
      {saveStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}
      
      {saveStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to save settings. Please try again.
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SettingsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Appearance
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Theme
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant={localSettings.theme === ThemeMode.LIGHT ? "contained" : "outlined"}
                  startIcon={<LightModeIcon />}
                  onClick={() => handleThemeChange(ThemeMode.LIGHT)}
                >
                  Light
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant={localSettings.theme === ThemeMode.DARK ? "contained" : "outlined"}
                  startIcon={<DarkModeIcon />}
                  onClick={() => handleThemeChange(ThemeMode.DARK)}
                >
                  Dark
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant={localSettings.theme === ThemeMode.SYSTEM ? "contained" : "outlined"}
                  onClick={() => handleThemeChange(ThemeMode.SYSTEM)}
                >
                  System Default
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Notifications
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.notifications.enableTaskReminders}
                onChange={(e) => handleNotificationChange('enableTaskReminders', e.target.checked)}
              />
            }
            label="Task Reminders"
          />
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.notifications.enableTimerAlerts}
                onChange={(e) => handleNotificationChange('enableTimerAlerts', e.target.checked)}
              />
            }
            label="Timer Alerts"
          />
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.notifications.enableFeedingReminders}
                onChange={(e) => handleNotificationChange('enableFeedingReminders', e.target.checked)}
              />
            }
            label="Starter Feeding Reminders"
          />
        </FormGroup>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Reminder Lead Time (minutes before due)
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Slider
                value={localSettings.notifications.reminderLeadTime}
                onChange={(e, value) => handleNotificationChange('reminderLeadTime', value as number)}
                step={5}
                marks
                min={5}
                max={60}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item>
              <Typography variant="body1">
                {localSettings.notifications.reminderLeadTime} min
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <OpacityIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Recipe Defaults
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Default Hydration Percentage
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  value={localSettings.defaultHydration}
                  onChange={handleDefaultHydrationChange}
                  step={1}
                  min={50}
                  max={100}
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item>
                <Typography variant="body1">
                  {localSettings.defaultHydration}%
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom>
              Default Units
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant={localSettings.defaultUnits === UnitSystem.METRIC ? "contained" : "outlined"}
                  startIcon={<ScaleIcon />}
                  onClick={() => handleDefaultUnitsChange(UnitSystem.METRIC)}
                >
                  Metric (g)
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant={localSettings.defaultUnits === UnitSystem.IMPERIAL ? "contained" : "outlined"}
                  startIcon={<ScaleIcon />}
                  onClick={() => handleDefaultUnitsChange(UnitSystem.IMPERIAL)}
                >
                  Imperial (oz)
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <StoreIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Bakery Information
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bakery Name"
              value={localSettings.bakeryName || ''}
              onChange={(e) => handleBakeryInfoChange('bakeryName', e.target.value)}
              placeholder="Enter your bakery name"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bakery Logo URL"
              value={localSettings.bakeryLogo || ''}
              onChange={(e) => handleBakeryInfoChange('bakeryLogo', e.target.value)}
              placeholder="Enter URL to your bakery logo"
              helperText="This will be displayed in the app header"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSettings}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;
