import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import useTaskStore from '../../store/taskStore';
import { Task, TaskStatus, TaskPriority } from '../../types/Task';
import { useAuth } from '../../context/AuthContext';
import { fetchTasks, updateTaskStatus } from '../../services/taskService';

const TaskList: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    tasks, 
    filteredTasks, 
    loading, 
    error, 
    setTasks, 
    setLoading, 
    setError, 
    setFilter,
    updateTaskStatus: updateTaskStatusInStore
  } = useTaskStore();
  
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const tasksData = await fetchTasks(currentUser.uid);
        setTasks(tasksData);
        setError(null);
      } catch (err) {
        setError('Failed to load tasks. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [currentUser, setTasks, setLoading, setError]);
  
  useEffect(() => {
    setFilter({
      status: statusFilter ? statusFilter as TaskStatus : undefined,
      priority: priorityFilter ? priorityFilter as TaskPriority : undefined,
      searchTerm: searchTerm || undefined,
      dueDate: dateFilter
    });
  }, [statusFilter, priorityFilter, searchTerm, dateFilter, setFilter]);
  
  const handleStatusChange = async (taskId: string | undefined, newStatus: TaskStatus) => {
    if (!taskId) return;
    
    try {
      await updateTaskStatus(taskId, newStatus);
      updateTaskStatusInStore(taskId, newStatus);
    } catch (err) {
      setError('Failed to update task status. Please try again.');
      console.error(err);
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
  
  const clearFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setSearchTerm('');
    setDateFilter(null);
  };
  
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Tasks
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component="a"
          href="/tasks/new"
        >
          New Task
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
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
                <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
                <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
                <MenuItem value={TaskStatus.COMPLETED}>Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="priority-filter-label">Priority</InputLabel>
              <Select
                labelId="priority-filter-label"
                id="priority-filter"
                value={priorityFilter}
                label="Priority"
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
                <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
                <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={dateFilter}
                onChange={(newValue) => setDateFilter(newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={clearFilters} size="small">
            Clear Filters
          </Button>
        </Box>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          {error}
        </Paper>
      ) : filteredTasks.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No tasks found. Create a new task to get started.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {filteredTasks.map((task, index) => (
              <React.Fragment key={task.id}>
                {index > 0 && <Divider />}
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    <Box>
                      <IconButton 
                        edge="end" 
                        aria-label="edit"
                        component="a"
                        href={`/tasks/edit/${task.id}`}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        component="a"
                        href={`/tasks/delete/${task.id}`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon onClick={() => {
                    const newStatus = task.status === TaskStatus.COMPLETED 
                      ? TaskStatus.TODO 
                      : TaskStatus.COMPLETED;
                    handleStatusChange(task.id, newStatus);
                  }} sx={{ cursor: 'pointer' }}>
                    {getStatusIcon(task.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            textDecoration: task.status === TaskStatus.COMPLETED ? 'line-through' : 'none',
                            color: task.status === TaskStatus.COMPLETED ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {task.title}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={task.priority} 
                          color={getPriorityColor(task.priority)}
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{
                            display: 'block',
                            textDecoration: task.status === TaskStatus.COMPLETED ? 'line-through' : 'none',
                            color: task.status === TaskStatus.COMPLETED ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {task.description}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                          {task.dueDate && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeIcon fontSize="small" />
                              Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                            </Typography>
                          )}
                          {task.assignedTo && (
                            <Typography variant="caption" color="text.secondary">
                              Assigned to: {task.assignedTo}
                            </Typography>
                          )}
                          {task.relatedRecipeId && (
                            <Typography 
                              variant="caption" 
                              color="primary"
                              component="a"
                              href={`/recipes/${task.relatedRecipeId}`}
                              sx={{ cursor: 'pointer' }}
                            >
                              View related recipe
                            </Typography>
                          )}
                        </Box>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default TaskList;
