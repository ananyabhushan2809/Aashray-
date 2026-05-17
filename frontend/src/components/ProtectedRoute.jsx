/**
 * ProtectedRoute.jsx — Route Guard
 * ==================================
 * Checks JWT authentication and role requirements before rendering pages.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (allowedRole && user.role !== allowedRole) {
      // Redirect to correct dashboard if role mismatch
      return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
    }
  } catch (error) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
