const express = require('express');
const router = express.Router();
let grades = [];

router.get('/stats', (req, res) => {
  res.json({ totalGrades: grades.length, averageScore: 0 });
});

router.get('/', (req, res) => res.json(grades));
router.post('/', (req, res) => {
  const g = { _id: Date.now().toString(), ...req.body };
  grades.push(g);
  res.status(201).json(g);
});
router.get('/student/:studentId', (req, res) => {
  res.json(grades.filter(g => g.studentId === req.params.studentId));
});
module.exports = router;
