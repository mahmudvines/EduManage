// routes/course.routes.js
const express = require('express');
const router = express.Router();
const {
  getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse, enrollStudent
} = require('../controllers/course.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', authorize('admin'), createCourse);
router.put('/:id', authorize('admin'), updateCourse);
router.delete('/:id', authorize('admin'), deleteCourse);
router.post('/:id/enroll', authorize('admin', 'teacher'), enrollStudent);

module.exports = router;
