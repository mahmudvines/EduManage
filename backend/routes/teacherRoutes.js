const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Class = require('../models/Class');
const Student = require('../models/Student');
const User = require('../models/User');

router.use(protect);
router.use((req, res, next) => { if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Access denied' }); next(); });

router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user._id });
    res.json(classes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/students', async (req, res) => {
  try {
    const teacherClasses = await Class.find({ teacherId: req.user._id });
    const studentIds = teacherClasses.flatMap(c => c.enrolledStudents || []);
    const students = await Student.find({ _id: { $in: studentIds } });
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/assignments', async (req, res) => {
  // Mock data – you can create an Assignment model later
  res.json([]);
});

module.exports = router;
