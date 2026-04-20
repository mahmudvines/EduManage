const express = require('express');
const router = express.Router();

// Mock data - replace with real DB queries later
let students = [];

// GET /api/students/stats - Dashboard stats
router.get('/stats', (req, res) => {
  res.json({
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    inactiveStudents: students.filter(s => s.status === 'inactive').length,
    newAdmissions: 0
  });
});

// GET /api/students - List all
router.get('/', (req, res) => {
  res.json(students);
});

// GET /api/students/:id
router.get('/:id', (req, res) => {
  const student = students.find(s => s._id === req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
});

// POST /api/students
router.post('/', (req, res) => {
  const student = { _id: Date.now().toString(), ...req.body, status: 'active', createdAt: new Date() };
  students.push(student);
  res.status(201).json(student);
});

// PUT /api/students/:id
router.put('/:id', (req, res) => {
  const index = students.findIndex(s => s._id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Student not found' });
  students[index] = { ...students[index], ...req.body };
  res.json(students[index]);
});

// DELETE /api/students/:id
router.delete('/:id', (req, res) => {
  students = students.filter(s => s._id !== req.params.id);
  res.json({ message: 'Student deleted' });
});

module.exports = router;
