import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Vérifie si l'utilisateur est admin ou staff
  if (!user?.is_staff && !user?.is_superuser) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error" align="center">
          Accès refusé - Réservé aux administrateurs
        </Typography>
      </Box>
    );
  }

  return children;
};

export default AdminRoute;