import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Vérifie si l'utilisateur est admin ou staff
  if (!user?.is_staff && !user?.is_superuser) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;