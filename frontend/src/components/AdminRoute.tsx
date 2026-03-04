import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const AdminRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { setLanguage } = useLanguage();

  useEffect(() => {
    setLanguage('vi');
  }, [setLanguage]);
  
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
