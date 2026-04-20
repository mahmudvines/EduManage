// routes/teacher.routes.js
const express = require('express');
const router = express.Router();
const {
  getAllTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher
} = require('../controllers/teacher.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', authorize('admin'), getAllTeachers);
router.get('/:id', authorize('admin'), getTeacherById);
router.post('/', authorize('admin'), createTeacher);
router.put('/:id', authorize('admin'), updateTeacher);
router.delete('/:id', authorize('admin'), deleteTeacher);

module.exports = router;
