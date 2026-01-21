import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 *
 * Rules:
 * - If auth is loading → show loading
 * - If not logged in → redirect to /login
 * - If role restriction exists and user role not allowed → redirect to /dashboard
 * - Otherwise → allow access
 *
 * NOTE:
 * - Status (ACTIVE / PENDING) routing is handled by AuthContext
 * - This component is a pure guard only
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
