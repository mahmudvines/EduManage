// routes/student.routes.js
const express = require('express');
const router = express.Router();
const {
  getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent
} = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect); // All routes require login

router.get('/', authorize('admin', 'teacher'), getAllStudents);
router.get('/:id', getStudentById);
router.post('/', authorize('admin'), createStudent);
router.put('/:id', authorize('admin'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);

module.exports = router;
