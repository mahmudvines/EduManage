// ============================================================
// services/api.js - Centralized API configuration
// All HTTP calls go through this file
// ============================================================

import axios from 'axios';

// Base URL from environment variable or default to localhost
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // 10 seconds
  headers: { 'Content-Type': 'application/json' }
});

// ── Request Interceptor ──────────────────────────────────
// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────
// Handle global errors (e.g., auto-logout on 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// AUTH SERVICES
// ============================================================
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data)
};

// ============================================================
// STUDENT SERVICES
// ============================================================
export const studentService = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`)
};

// ============================================================
// TEACHER SERVICES
// ============================================================
export const teacherService = {
  getAll: (params) => api.get('/teachers', { params }),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`)
};

// ============================================================
// COURSE SERVICES
// ============================================================
export const courseService = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enrollStudent: (courseId, studentId) => api.post(`/courses/${courseId}/enroll`, { studentId })
};

// ============================================================
// ATTENDANCE SERVICES
// ============================================================
export const attendanceService = {
  mark: (data) => api.post('/attendance', data),
  getByStudent: (studentId, params) => api.get(`/attendance/${studentId}`, { params }),
  getByCourse: (courseId, params) => api.get(`/attendance/course/${courseId}`, { params })
};

// ============================================================
// GRADE SERVICES
// ============================================================
export const gradeService = {
  upload: (data) => api.post('/grades', data),
  getByStudent: (studentId) => api.get(`/grades/${studentId}`),
  getByCourse: (courseId) => api.get(`/grades/course/${courseId}`)
};

// ============================================================
// DASHBOARD SERVICES
// ============================================================
export const dashboardService = {
  getAdminStats: () => api.get('/dashboard/stats'),
  getTeacherStats: () => api.get('/dashboard/teacher'),
  getStudentStats: () => api.get('/dashboard/student')
};

export default api;
