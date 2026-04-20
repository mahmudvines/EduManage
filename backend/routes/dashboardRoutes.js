const express = require('express');
const router = express.Router();
const { getStats, getAttendanceData, getCourseEnrollment } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getStats);
router.get('/attendance', getAttendanceData);
router.get('/course-enrollment', getCourseEnrollment);

module.exports = router;
