import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Loader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
    <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-sm font-medium text-gray-500 tracking-wider uppercase animate-pulse">
      Loading eMART...
    </p>
  </div>
);

export const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!token || !user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};
