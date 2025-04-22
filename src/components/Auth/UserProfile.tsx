import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { 
  Box, 
  Avatar,
  Typography, 
  Container, 
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Chip,
  Snackbar
} from '@mui/material';
import { 
  Person, 
  ExitToApp, 
  Settings, 
  VerifiedUser, 
  MarkEmailRead, 
  Email 
} from '@mui/icons-material';

const UserProfile = () => {
  const { currentUser, userData, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Check if email is verified
  const isEmailVerified = currentUser?.emailVerified || userData?.emailVerified;

  const handleLogout = async () => {
    try {
      setError('');
      setLoading(true);
      await logout();
    } catch (error) {
      setError('Failed to log out');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setError('');
      setVerificationLoading(true);
      
      // Import sendEmailVerification dynamically to avoid circular dependencies
      const { sendEmailVerification } = await import('firebase/auth');
      
      if (currentUser) {
        await sendEmailVerification(currentUser);
        setSuccessMessage('Verification email sent! Please check your inbox.');
        setShowSnackbar(true);
      }
    } catch (error) {
      setError('Failed to send verification email. Please try again later.');
      console.error(error);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'primary.main',
              fontSize: '2rem',
              mb: 2
            }}
          >
            {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0)}
          </Avatar>
          <Typography component="h1" variant="h5">
            {currentUser?.displayName || 'User'}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {currentUser?.email}
          </Typography>
          
          {/* Email verification status */}
          {isEmailVerified ? (
            <Chip 
              icon={<VerifiedUser />} 
              label="Email Verified" 
              color="success" 
              variant="outlined"
              sx={{ mb: 2 }}
            />
          ) : (
            <Box sx={{ width: '100%', mb: 3 }}>
              <Alert 
                severity="warning" 
                sx={{ mb: 2 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={handleResendVerification}
                    disabled={verificationLoading}
                    startIcon={verificationLoading ? <CircularProgress size={16} /> : <Email />}
                  >
                    Resend
                  </Button>
                }
              >
                Please verify your email address to access all features.
              </Alert>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ width: '100%', my: 2 }} />

          <List sx={{ width: '100%' }}>
            <ListItem>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Profile Settings" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Account Settings" />
            </ListItem>
          </List>

          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Logout'}
          </Button>
        </Box>
      </Paper>
      
      {/* Success message snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </Container>
  );
};

export default UserProfile;
