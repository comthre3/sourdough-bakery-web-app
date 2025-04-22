import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Container 
} from '@mui/material';
import { LockOutlined, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAuth();
  
  // Get the page they were trying to access
  const from = location.state?.from?.pathname || '/';
  
  const goBack = () => {
    navigate(-1);
  };
  
  const goHome = () => {
    navigate('/');
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 8,
          borderRadius: '8px',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <LockOutlined 
            sx={{ 
              fontSize: 60, 
              color: '#4C7A4C', 
              mb: 2 
            }} 
          />
          
          <Typography 
            component="h1" 
            variant="h5" 
            sx={{ 
              fontWeight: 500,
              mb: 2
            }}
          >
            Access Denied
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            You don't have permission to access this page. This area requires higher privileges than your current role ({userRole}).
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={goBack}
              sx={{ 
                borderColor: '#4C7A4C',
                color: '#4C7A4C',
              }}
            >
              Go Back
            </Button>
            
            <Button
              variant="contained"
              onClick={goHome}
              sx={{ 
                backgroundColor: '#4C7A4C',
                '&:hover': {
                  backgroundColor: '#3c613c',
                }
              }}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Unauthorized;
