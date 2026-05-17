/**
 * App.jsx — Root Application Component & Routing Setup
 * ======================================================
 * Defines all frontend navigation routes and role-protected layout wrappers.
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintPage from './pages/ComplaintPage';
import VisitorPage from './pages/VisitorPage';
import FeeReminderPage from './pages/FeeReminderPage';
import MessFeedbackPage from './pages/MessFeedbackPage';
import StudentsPage from './pages/StudentsPage';
import MessLeadPage from './pages/MessLeadPage';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isAuthPage = location.pathname === '/login';

  if (isAuthPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 w-full overflow-x-hidden pb-12">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Public / Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Student Protected Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/complaints"
            element={
              <ProtectedRoute allowedRole="student">
                <ComplaintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/mess-feedback"
            element={
              <ProtectedRoute allowedRole="student">
                <MessFeedbackPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRole="admin">
                <StudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRole="admin">
                <ComplaintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/visitors"
            element={
              <ProtectedRoute allowedRole="admin">
                <VisitorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fees"
            element={
              <ProtectedRoute allowedRole="admin">
                <FeeReminderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/mess-lead"
            element={
              <ProtectedRoute allowedRole="admin">
                <MessLeadPage />
              </ProtectedRoute>
            }
          />

          {/* Root Fallback Redirect */}
          <Route
            path="*"
            element={
              <Navigate to="/login" replace />
            }
          />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
