import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, userType }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userType && currentUser.userType !== userType) {
    const redirectPath = currentUser.userType === 'volunteer' ? '/volunteer/dashboard' : '/ngo/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;

