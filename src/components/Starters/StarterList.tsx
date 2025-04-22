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
  Chip,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  LocalDining as DiningIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import useStarterStore from '../../store/starterStore';
import { Starter, StarterStatus, FeedingFrequency, FeedingRecord } from '../../types/Starter';
import { fetchStarters, updateStarterStatus, addFeedingRecord } from '../../services/starterService';

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

const StarterList: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    starters, 
    filteredStarters,
    loading, 
    error, 
    setStarters, 
    setLoading, 
    setError,
    setFilter,
    updateStarterStatus: updateStarterStatusInStore,
    addFeedingRecord: addFeedingRecordToStore
  } = useStarterStore();
  
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [quickFeedingStarter, setQuickFeedingStarter] = useState<Starter | null>(null);
  const [quickFeedingData, setQuickFeedingData] = useState({
    flourType: 'All-Purpose Flour',
    flourAmount: 50,
    waterAmount: 50,
    starterAmount: 50,
    notes: ''
  });
  
  // Load starters
  useEffect(() => {
    const loadStarters = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const startersData = await fetchStarters(currentUser.uid);
        setStarters(startersData);
        setError(null);
      } catch (err) {
        setError('Failed to load starters. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadStarters();
  }, [currentUser, setStarters, setLoading, setError]);
  
  // Apply filters
  useEffect(() => {
    setFilter({
      status: statusFilter ? statusFilter as StarterStatus : undefined,
      searchTerm: searchTerm || undefined
    });
  }, [statusFilter, searchTerm, setFilter]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleStatusChange = async (starter: Starter, newStatus: StarterStatus) => {
    if (!starter.id) return;
    
    try {
      await updateStarterStatus(starter.id, newStatus);
      updateStarterStatusInStore(starter.id, newStatus);
    } catch (err) {
      setError('Failed to update starter status. Please try again.');
      console.error(err);
    }
  };
  
  const handleQuickFeeding = async () => {
    if (!quickFeedingStarter || !quickFeedingStarter.id || !currentUser) return;
    
    try {
      const feedingRecord: FeedingRecord = {
        date: new Date(),
        flourType: quickFeedingData.flourType,
        flourAmount: quickFeedingData.flourAmount,
        waterAmount: quickFeedingData.waterAmount,
        starterAmount: quickFeedingData.starterAmount,
        notes: quickFeedingData.notes,
        activityRating: 3 // Default middle rating
      };
      
      const recordId = await addFeedingRecord(quickFeedingStarter.id, feedingRecord);
      addFeedingRecordToStore(quickFeedingStarter.id, { ...feedingRecord, id: recordId });
      
      // Reset quick feeding form
      setQuickFeedingStarter(null);
      setQuickFeedingData({
        flourType: 'All-Purpose Flour',
        flourAmount: 50,
        waterAmount: 50,
        starterAmount: 50,
        notes: ''
      });
    } catch (err) {
      setError('Failed to record feeding. Please try again.');
      console.error(err);
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
  
  const clearFilters = () => {
    setStatusFilter('');
    setSearchTerm('');
  };
  
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Sourdough Starters
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component="a"
          href="/starters/new"
        >
          New Starter
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value={StarterStatus.ACTIVE}>Active</MenuItem>
                <MenuItem value={StarterStatus.DORMANT}>Dormant</MenuItem>
                <MenuItem value={StarterStatus.ARCHIVED}>Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={clearFilters} size="small">
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          {error}
        </Paper>
      ) : filteredStarters.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No starters found. Create a new starter to get started.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Starters" />
            <Tab label="Feeding Schedule" />
          </Tabs>
          
          <Box sx={{ p: 2 }}>
            {activeTab === 0 ? (
              // Starters Tab
              <Grid container spacing={3}>
                {filteredStarters.map((starter) => {
                  const feedingStatus = getFeedingStatus(starter);
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={starter.id}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          borderTop: '4px solid',
                          borderColor: `${getFeedingStatusColor(feedingStatus.status)}.main`
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" component="h3" noWrap title={starter.name}>
                              {starter.name}
                            </Typography>
                            <Chip 
                              label={starter.status} 
                              color={getStatusColor(starter.status)}
                              size="small"
                            />
                          </Box>
                          
                          {starter.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {starter.description}
                            </Typography>
                          )}
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Created:
                              </Typography>
                              <Typography variant="body2">
                                {format(new Date(starter.dateCreated), 'MMM d, yyyy')}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Hydration:
                              </Typography>
                              <Typography variant="body2">
                                {starter.hydration}%
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">
                                Feeding Schedule:
                              </Typography>
                              <Typography variant="body2">
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
                              <Typography variant="body2">
                                {format(new Date(starter.lastFeedingDate), 'MMM d, yyyy h:mm a')}
                                {' '}
                                ({differenceInDays(new Date(), new Date(starter.lastFeedingDate))} days ago)
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography 
                                variant="body2" 
                                color={`${getFeedingStatusColor(feedingStatus.status)}.main`}
                                sx={{ fontWeight: 'bold' }}
                              >
                                {feedingStatus.status === 'ok' 
                                  ? `Next feeding in ${feedingStatus.hoursUntilNext} hours` 
                                  : feedingStatus.status === 'due'
                                    ? 'Feeding due now!'
                                    : `Overdue by ${Math.abs(feedingStatus.hoursUntilNext)} hours`}
                              </Typography>
                            </Grid>
                          </Grid>
                          
                          {starter.notes && (
                            <>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                Notes:
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {starter.notes}
                              </Typography>
                            </>
                          )}
                        </CardContent>
                        
                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button
                            size="small"
                            startIcon={<DiningIcon />}
                            onClick={() => setQuickFeedingStarter(starter)}
                            color="primary"
                          >
                            Feed
                          </Button>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            component="a"
                            href={`/starters/edit/${starter.id}`}
                          >
                            Edit
                          </Button>
                          
                          {starter.status === StarterStatus.ACTIVE ? (
                            <Button
                              size="small"
                              startIcon={<ArchiveIcon />}
                              onClick={() => handleStatusChange(starter, StarterStatus.DORMANT)}
                              color="warning"
                            >
                              Dormant
                            </Button>
                          ) : starter.status === StarterStatus.DORMANT ? (
                            <Button
                              size="small"
                              startIcon={<RefreshIcon />}
                              onClick={() => handleStatusChange(starter, StarterStatus.ACTIVE)}
                              color="success"
                            >
                              Activate
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              startIcon={<UnarchiveIcon />}
                              onClick={() => handleStatusChange(starter, StarterStatus.ACTIVE)}
                              color="success"
                            >
                              Unarchive
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              // Feeding Schedule Tab
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Starter</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Feeding</TableCell>
                      <TableCell>Next Feeding</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStarters
                      .sort((a, b) => {
                        // Sort by feeding status (overdue first, then due, then ok)
                        const statusA = getFeedingStatus(a).status;
                        const statusB = getFeedingStatus(b).status;
                        
                        if (statusA === 'overdue' && statusB !== 'overdue') return -1;
                        if (statusA !== 'overdue' && statusB === 'overdue') return 1;
                        if (statusA === 'due' && statusB !== 'due') return -1;
                        if (statusA !== 'due' && statusB === 'due') return 1;
                        
                        // If same status, sort by next feeding time
                        const nextFeedingA = calculateNextFeeding(a);
                        const nextFeedingB = calculateNextFeeding(b);
                        return nextFeedingA.getTime() - nextFeedingB.getTime();
                      })
                      .map((starter) => {
                        const feedingStatus = getFeedingStatus(starter);
                        const nextFeeding = calculateNextFeeding(starter);
                        
                        return (
                          <TableRow key={starter.id}>
                            <TableCell>
                              <Typography variant="body1">
                                {starter.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatFeedingFrequency(
                                  starter.feedingSchedule.frequency, 
                                  starter.feedingSchedule.customHours
                                )}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={starter.status} 
                                color={getStatusColor(starter.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {format(new Date(starter.lastFeedingDate), 'MMM d, yyyy')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(starter.lastFeedingDate), 'h:mm a')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2"
                                color={`${getFeedingStatusColor(feedingStatus.status)}.main`}
                                sx={{ fontWeight: 'bold' }}
                              >
                                {feedingStatus.status === 'ok' 
                                  ? format(nextFeeding, 'MMM d, yyyy h:mm a')
                                  : feedingStatus.status === 'due'
                                    ? 'Due now!'
                                    : `Overdue by ${Math.abs(feedingStatus.hoursUntilNext)} hours`}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                startIcon={<DiningIcon />}
                                onClick={() => setQuickFeedingStarter(starter)}
                                color="primary"
                              >
                                Feed
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>
      )}
      
      {/* Quick Feeding Dialog */}
      {quickFeedingStarter && (
        <Paper sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Feeding: {quickFeedingStarter.name}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Flour Type"
                value={quickFeedingData.flourType}
                onChange={(e) => setQuickFeedingData({ ...quickFeedingData, flourType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Flour Amount (g)"
                type="number"
                value={quickFeedingData.flourAmount}
                onChange={(e) => setQuickFeedingData({ ...quickFeedingData, flourAmount: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Water Amount (g)"
                type="number"
                value={quickFeedingData.waterAmount}
                onChange={(e) => setQuickFeedingData({ ...quickFeedingData, waterAmount: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Starter Amount (g)"
                type="number"
                value={quickFeedingData.starterAmount}
                onChange={(e) => setQuickFeedingData({ ...quickFeedingData, starterAmount: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={quickFeedingData.notes}
                onChange={(e) => setQuickFeedingData({ ...quickFeedingData, notes: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setQuickFeedingStarter(null)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleQuickFeeding}
              >
                Record Feeding
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default StarterList;
