import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { ReactNode } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiredPermission 
}: ProtectedRouteProps) => {
  const { currentUser, userRole, loading, hasPermission } = useAuth();
  const location = useLocation();

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
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (!currentUser) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && userRole !== requiredRole) {
    // Check if user has a higher role than required
    const roleHierarchy = [
      UserRole.TRAINEE,
      UserRole.BAKER,
      UserRole.MANAGER,
      UserRole.ADMIN
    ];
    
    const userRoleIndex = roleHierarchy.indexOf(userRole as UserRole);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
    
    // If user's role is lower in hierarchy than required role
    if (userRoleIndex < requiredRoleIndex) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  // Check permission-based access if required
  if (requiredPermission && !hasPermission(requiredPermission as any)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
