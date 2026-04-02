// ============================================================
// App.js - Root component with routing
// ============================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage  from './pages/StudentsPage';
import TeachersPage  from './pages/TeachersPage';
import CoursesPage   from './pages/CoursesPage';
import AttendancePage from './pages/AttendancePage';
import GradesPage    from './pages/GradesPage';
import ProfilePage   from './pages/ProfilePage';

// Layout
import Layout from './components/common/Layout';

// ── Protected Route ──────────────────────────────────────
// Redirects to login if not authenticated
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Role-based protection
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ── Public Route ─────────────────────────────────────────
// Redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected Routes (wrapped in Layout) */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<DashboardPage />} />
        <Route path="students"   element={<ProtectedRoute roles={['admin','teacher']}><StudentsPage /></ProtectedRoute>} />
        <Route path="teachers"   element={<ProtectedRoute roles={['admin']}><TeachersPage /></ProtectedRoute>} />
        <Route path="courses"    element={<CoursesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="grades"     element={<GradesPage />} />
        <Route path="profile"    element={<ProfilePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
