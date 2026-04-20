// routes/attendance.routes.js
const express = require('express');
const router = express.Router();
const { markAttendance, getStudentAttendance, getCourseAttendance } = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', authorize('admin', 'teacher'), markAttendance);
router.get('/course/:courseId', authorize('admin', 'teacher'), getCourseAttendance);
router.get('/:studentId', getStudentAttendance);

module.exports = router;
