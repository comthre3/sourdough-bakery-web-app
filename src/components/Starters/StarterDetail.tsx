import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  LocalDining as DiningIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import useStarterStore from '../../store/starterStore';
import { Starter, StarterStatus, FeedingFrequency, FeedingRecord } from '../../types/Starter';
import { updateStarterStatus, addFeedingRecord, deleteFeedingRecord } from '../../services/starterService';

// Helper function to format feeding frequency
const formatFeedingFrequency = (frequency: FeedingFrequency, customHours?: number): string => {
  switch (frequency) {
    case FeedingFrequency.TWICE_DAILY:
      return 'Twice Daily';
    case FeedingFrequency.DAILY:
      return 'Daily';
    case FeedingFrequency.EVERY_OTHER_DAY:
      return 'Every Other Day';
    case FeedingFrequency.WEEKLY:
      return 'Weekly';
    case FeedingFrequency.CUSTOM:
      return `Every ${customHours} hours`;
    default:
      return 'Unknown';
  }
};

// Helper function to calculate next feeding date
const calculateNextFeeding = (starter: Starter): Date => {
  const lastFeeding = new Date(starter.lastFeedingDate);
  const now = new Date();
  
  switch (starter.feedingSchedule.frequency) {
    case FeedingFrequency.TWICE_DAILY:
      return new Date(lastFeeding.getTime() + 12 * 60 * 60 * 1000);
    case FeedingFrequency.DAILY:
      return new Date(lastFeeding.getTime() + 24 * 60 * 60 * 1000);
    case FeedingFrequency.EVERY_OTHER_DAY:
      return new Date(lastFeeding.getTime() + 48 * 60 * 60 * 1000);
    case FeedingFrequency.WEEKLY:
      return new Date(lastFeeding.getTime() + 7 * 24 * 60 * 60 * 1000);
    case FeedingFrequency.CUSTOM:
      const hours = starter.feedingSchedule.customHours || 24;
      return new Date(lastFeeding.getTime() + hours * 60 * 60 * 1000);
    default:
      return new Date(lastFeeding.getTime() + 24 * 60 * 60 * 1000);
  }
};

// Helper function to get feeding status
const getFeedingStatus = (starter: Starter): { status: 'ok' | 'due' | 'overdue', hoursUntilNext: number } => {
  const nextFeeding = calculateNextFeeding(starter);
  const now = new Date();
  
  if (nextFeeding > now) {
    // Not due yet
    const hoursUntilNext = differenceInHours(nextFeeding, now);
    return { status: 'ok', hoursUntilNext };
  } else {
    // Due or overdue
    const hoursSinceNext = differenceInHours(now, nextFeeding);
    
    if (hoursSinceNext <= 6) {
      // Due (within 6 hours of scheduled time)
      return { status: 'due', hoursUntilNext: -hoursSinceNext };
    } else {
      // Overdue (more than 6 hours past scheduled time)
      return { status: 'overdue', hoursUntilNext: -hoursSinceNext };
    }
  }
};

const getStatusColor = (status: StarterStatus) => {
  switch (status) {
    case StarterStatus.ACTIVE:
      return 'success';
    case StarterStatus.DORMANT:
      return 'warning';
    case StarterStatus.ARCHIVED:
      return 'error';
    default:
      return 'default';
  }
};

const getFeedingStatusColor = (status: 'ok' | 'due' | 'overdue') => {
  switch (status) {
    case 'ok':
      return 'success';
    case 'due':
      return 'warning';
    case 'overdue':
      return 'error';
    default:
      return 'default';
  }
};

const StarterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    starters, 
    loading, 
    error, 
    setError,
    updateStarterStatus: updateStarterStatusInStore,
    addFeedingRecord: addFeedingRecordToStore,
    deleteFeedingRecord: deleteFeedingRecordFromStore
  } = useStarterStore();
  
  const [feedingDialogOpen, setFeedingDialogOpen] = useState(false);
  const [feedingData, setFeedingData] = useState({
    flourType: 'All-Purpose Flour',
    flourAmount: 50,
    waterAmount: 50,
    starterAmount: 50,
    temperature: 75,
    notes: '',
    activityRating: 3
  });
  
  const starter = starters.find(s => s.id === id);
  const feedingStatus = starter ? getFeedingStatus(starter) : { status: 'ok', hoursUntilNext: 0 };
  
  const handleStatusChange = async (newStatus: StarterStatus) => {
    if (!starter || !starter.id) return;
    
    try {
      await updateStarterStatus(starter.id, newStatus);
      updateStarterStatusInStore(starter.id, newStatus);
    } catch (err) {
      setError('Failed to update starter status. Please try again.');
      console.error(err);
    }
  };
  
  const handleAddFeeding = async () => {
    if (!starter || !starter.id || !currentUser) return;
    
    try {
      const feedingRecord: FeedingRecord = {
        date: new Date(),
        flourType: feedingData.flourType,
        flourAmount: feedingData.flourAmount,
        waterAmount: feedingData.waterAmount,
        starterAmount: feedingData.starterAmount,
        temperature: feedingData.temperature,
        notes: feedingData.notes,
        activityRating: feedingData.activityRating
      };
      
      const recordId = await addFeedingRecord(starter.id, feedingRecord);
      addFeedingRecordToStore(starter.id, { ...feedingRecord, id: recordId });
      
      // Reset feeding form and close dialog
      setFeedingData({
        flourType: 'All-Purpose Flour',
        flourAmount: 50,
        waterAmount: 50,
        starterAmount: 50,
        temperature: 75,
        notes: '',
        activityRating: 3
      });
      setFeedingDialogOpen(false);
    } catch (err) {
      setError('Failed to record feeding. Please try again.');
      console.error(err);
    }
  };
  
  const handleDeleteFeeding = async (recordId: string | undefined) => {
    if (!recordId || !starter || !starter.id) return;
    
    if (window.confirm('Are you sure you want to delete this feeding record?')) {
      try {
        await deleteFeedingRecord(starter.id, recordId);
        deleteFeedingRecordFromStore(starter.id, recordId);
      } catch (err) {
        setError('Failed to delete feeding record. Please try again.');
        console.error(err);
      }
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
  
  if (!starter) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">
          Starter not found.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/starters')}
          sx={{ mt: 2 }}
        >
          Back to Starters
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
          onClick={() => navigate('/starters')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
          {starter.name}
        </Typography>
        <Chip 
          label={starter.status} 
          color={getStatusColor(starter.status)}
          sx={{ mr: 2 }}
        />
        <IconButton 
          color="primary" 
          onClick={() => navigate(`/starters/edit/${starter.id}`)}
          sx={{ mr: 1 }}
        >
          <EditIcon />
        </IconButton>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Starter Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {starter.description && (
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    {starter.description}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Created:
                </Typography>
                <Typography variant="body1">
                  {format(new Date(starter.dateCreated), 'MMMM d, yyyy')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Hydration:
                </Typography>
                <Typography variant="body1">
                  {starter.hydration}%
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Feeding Schedule:
                </Typography>
                <Typography variant="body1">
                  {formatFeedingFrequency(
                    starter.feedingSchedule.frequency, 
                    starter.feedingSchedule.customHours
                  )}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Last Fed:
                </Typography>
                <Typography variant="body1">
                  {format(new Date(starter.lastFeedingDate), 'MMMM d, yyyy h:mm a')}
                  {' '}
                  ({differenceInDays(new Date(), new Date(starter.lastFeedingDate))} days ago)
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography 
                  variant="body1" 
                  color={`${getFeedingStatusColor(feedingStatus.status)}.main`}
                  sx={{ fontWeight: 'bold', mt: 1 }}
                >
                  {feedingStatus.status === 'ok' 
                    ? `Next feeding in ${feedingStatus.hoursUntilNext} hours` 
                    : feedingStatus.status === 'due'
                      ? 'Feeding due now!'
                      : `Overdue by ${Math.abs(feedingStatus.hoursUntilNext)} hours`}
                </Typography>
              </Grid>
              
              {starter.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Notes:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {starter.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<DiningIcon />}
                onClick={() => setFeedingDialogOpen(true)}
                color="primary"
              >
                Record Feeding
              </Button>
              
              {starter.status === StarterStatus.ACTIVE ? (
                <Button
                  variant="outlined"
                  startIcon={<ArchiveIcon />}
                  onClick={() => handleStatusChange(StarterStatus.DORMANT)}
                  color="warning"
                >
                  Mark as Dormant
                </Button>
              ) : starter.status === StarterStatus.DORMANT ? (
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => handleStatusChange(StarterStatus.ACTIVE)}
                  color="success"
                >
                  Reactivate
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<UnarchiveIcon />}
                  onClick={() => handleStatusChange(StarterStatus.ACTIVE)}
                  color="success"
                >
                  Unarchive
                </Button>
              )}
              
              {starter.status !== StarterStatus.ARCHIVED && (
                <Button
                  variant="outlined"
                  startIcon={<ArchiveIcon />}
                  onClick={() => handleStatusChange(StarterStatus.ARCHIVED)}
                  color="error"
                >
                  Archive
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Feeding History
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setFeedingDialogOpen(true)}
                size="small"
              >
                Add Feeding
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {starter.feedingHistory.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                No feeding records yet. Record your first feeding to start tracking.
              </Typography>
            ) : (
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Flour</TableCell>
                      <TableCell align="right">Amounts (g)</TableCell>
                      <TableCell>Activity</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...starter.feedingHistory]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <Typography variant="body2">
                              {format(new Date(record.date), 'MMM d, yyyy')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(record.date), 'h:mm a')}
                            </Typography>
                          </TableCell>
                          <TableCell>{record.flourType}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {record.flourAmount}/{record.waterAmount}/{record.starterAmount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              flour/water/starter
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {record.activityRating && (
                              <Rating 
                                value={record.activityRating} 
                                readOnly 
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteFeeding(record.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Feeding Dialog */}
      <Dialog open={feedingDialogOpen} onClose={() => setFeedingDialogOpen(false)}>
        <DialogTitle>Record Feeding for {starter.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Flour Type"
                value={feedingData.flourType}
                onChange={(e) => setFeedingData({ ...feedingData, flourType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Flour Amount"
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
                value={feedingData.flourAmount}
                onChange={(e) => setFeedingData({ ...feedingData, flourAmount: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Water Amount"
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
                value={feedingData.waterAmount}
                onChange={(e) => setFeedingData({ ...feedingData, waterAmount: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Starter Amount"
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
                value={feedingData.starterAmount}
                onChange={(e) => setFeedingData({ ...feedingData, starterAmount: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Temperature"
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">°F</InputAdornment>,
                }}
                value={feedingData.temperature}
                onChange={(e) => setFeedingData({ ...feedingData, temperature: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" gutterBottom>
                  Starter Activity (1-5)
                </Typography>
                <Rating
                  value={feedingData.activityRating}
                  onChange={(_, newValue) => {
                    setFeedingData({ ...feedingData, activityRating: newValue || 3 });
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={feedingData.notes}
                onChange={(e) => setFeedingData({ ...feedingData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddFeeding} variant="contained" color="primary">
            Record Feeding
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StarterDetail;
