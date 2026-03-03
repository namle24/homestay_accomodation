import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdminOrReceptionist = user?.role === 'admin' || user?.role === 'receptionist';

  if (!isAdminOrReceptionist) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
