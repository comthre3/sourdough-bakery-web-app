import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

// Placeholder Dashboard component
const Dashboard = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" component="h1" gutterBottom>
      Sourdough Bakery Dashboard
    </Typography>
    <Typography variant="body1">
      Welcome to the Sourdough Bakery Web App!
    </Typography>
  </Box>
);

// Placeholder Login component
const Login = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" component="h1" gutterBottom>
      Login
    </Typography>
    <Typography variant="body1">
      Login form will be implemented here.
    </Typography>
  </Box>
);

const AppRouter: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={currentUser ? <Dashboard /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRouter;
