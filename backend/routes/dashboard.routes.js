// routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats, getTeacherDashboardStats, getStudentDashboardStats } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/stats', authorize('admin'), getDashboardStats);
router.get('/teacher', authorize('teacher'), getTeacherDashboardStats);
router.get('/student', authorize('student'), getStudentDashboardStats);

module.exports = router;
