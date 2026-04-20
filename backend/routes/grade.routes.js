// routes/grade.routes.js
const express = require('express');
const router = express.Router();
const { uploadGrades, getStudentGrades, getCourseGrades } = require('../controllers/grade.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', authorize('admin', 'teacher'), uploadGrades);
router.get('/course/:courseId', authorize('admin', 'teacher'), getCourseGrades);
router.get('/:studentId', getStudentGrades);

module.exports = router;
