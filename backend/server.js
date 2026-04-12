// ============================================================
// server.js - Main Entry Point for the Backend API
// ============================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // <-- make sure this file exists

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// ROUTES
// ============================================================
// ROUTES
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');
const courseRoutes = require('./routes/course.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const gradeRoutes = require('./routes/grade.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/dashboard', dashboardRoutes); // <-- FIXED

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 5000;

// Listen on 0.0.0.0 to accept connections from any IP address
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access from any IP: http://<your-ip>:${PORT}`);
});

