import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentManagementPage from './pages/StudentManagementPage';
import ClassManagementPage from './pages/ClassManagementPage';
import TeacherManagementPage from './pages/TeacherManagementPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import SettingsPage from './pages/SettingsPage';
import AdminProfilePage from './pages/AdminProfilePage';
import StudentsDetailPage from './pages/StudentsDetailPage';
import ActiveStudentsPage from './pages/ActiveStudentsPage';
import ClassesDetailPage from './pages/ClassesDetailPage';
import OngoingCoursesPage from './pages/OngoingCoursesPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/dashboard" replace />;
  if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') {
    return (
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/students" element={<StudentManagementPage />} />
          <Route path="/teachers" element={<TeacherManagementPage />} />
          <Route path="/classes" element={<ClassManagementPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<AdminProfilePage />} />
          <Route path="/students-detail" element={<StudentsDetailPage />} />
          <Route path="/active-students" element={<ActiveStudentsPage />} />
          <Route path="/classes-detail" element={<ClassesDetailPage />} />
          <Route path="/ongoing-courses" element={<OngoingCoursesPage />} />
          <Route path="/" element={<RoleBasedRedirect />} />
        </Routes>
      </Layout>
    );
  } else if (user.role === 'teacher') {
    return (
      <Layout>
        <Routes>
          <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<AdminProfilePage />} />
          <Route path="/" element={<RoleBasedRedirect />} />
        </Routes>
      </Layout>
    );
  } else if (user.role === 'student') {
    return (
      <Layout>
        <Routes>
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<AdminProfilePage />} />
          <Route path="/" element={<RoleBasedRedirect />} />
        </Routes>
      </Layout>
    );
  }
  return null;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedRoute><AppRoutes /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
