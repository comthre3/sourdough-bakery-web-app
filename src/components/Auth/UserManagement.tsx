import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth, UserRole, UserData } from '../../context/AuthContext';

const UserManagement = () => {
  const { getAllUsers, updateUserRole, hasPermission } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.TRAINEE);
  
  // Check if user has permission to manage users
  const canManageUsers = hasPermission('canManageUsers');
  const canManageRoles = hasPermission('canManageRoles');
  
  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setOpenEditDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenEditDialog(false);
    setSelectedUser(null);
  };
  
  const handleRoleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedRole(event.target.value as UserRole);
  };
  
  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    
    try {
      setError('');
      await updateUserRole(selectedUser.uid, selectedRole);
      
      // Update local state
      setUsers(users.map(user => 
        user.uid === selectedUser.uid 
          ? { ...user, role: selectedRole } 
          : user
      ));
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role. Please try again.');
    }
  };
  
  // Function to get color for role chip
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'error';
      case UserRole.MANAGER:
        return 'primary';
      case UserRole.BAKER:
        return 'success';
      case UserRole.TRAINEE:
        return 'default';
      default:
        return 'default';
    }
  };
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress size={60} sx={{ color: '#4C7A4C', mb: 2 }} />
        <Typography variant="h6">Loading users...</Typography>
      </Box>
    );
  }
  
  return (
    <Container component="main" maxWidth="lg">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 4,
          borderRadius: '8px',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            component="h1" 
            variant="h5" 
            sx={{ 
              color: '#4C7A4C',
              fontWeight: 500
            }}
          >
            User Management
          </Typography>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
              sx={{ 
                borderColor: '#4C7A4C',
                color: '#4C7A4C',
                mr: 2
              }}
            >
              Refresh
            </Button>
            
            {canManageUsers && (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                sx={{ 
                  backgroundColor: '#4C7A4C',
                  '&:hover': {
                    backgroundColor: '#3c613c',
                  }
                }}
              >
                Add User
              </Button>
            )}
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Login</TableCell>
                {canManageRoles && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>{user.displayName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.createdAt instanceof Date 
                        ? user.createdAt.toLocaleDateString() 
                        : new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.lastLogin instanceof Date 
                        ? user.lastLogin.toLocaleDateString() 
                        : new Date(user.lastLogin).toLocaleDateString()}
                    </TableCell>
                    {canManageRoles && (
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEditClick(user)}
                          disabled={!canManageRoles}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={canManageRoles ? 6 : 5} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          Edit User Role
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>User:</strong> {selectedUser.displayName} ({selectedUser.email})
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  value={selectedRole}
                  label="Role"
                  onChange={handleRoleChange as any}
                >
                  <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                  <MenuItem value={UserRole.MANAGER}>Manager</MenuItem>
                  <MenuItem value={UserRole.BAKER}>Baker</MenuItem>
                  <MenuItem value={UserRole.TRAINEE}>Trainee</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateRole}
            variant="contained"
            sx={{ 
              backgroundColor: '#4C7A4C',
              '&:hover': {
                backgroundColor: '#3c613c',
              }
            }}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
