const express = require('express');
const router = express.Router();
let teachers = [];

router.get('/stats', (req, res) => {
  res.json({ totalTeachers: teachers.length, activeTeachers: teachers.length });
});

router.get('/', (req, res) => res.json(teachers));
router.get('/:id', (req, res) => {
  const t = teachers.find(x => x._id === req.params.id);
  if (!t) return res.status(404).json({ message: 'Not found' });
  res.json(t);
});
router.post('/', (req, res) => {
  const t = { _id: Date.now().toString(), ...req.body };
  teachers.push(t);
  res.status(201).json(t);
});
router.put('/:id', (req, res) => {
  const i = teachers.findIndex(x => x._id === req.params.id);
  if (i === -1) return res.status(404).json({ message: 'Not found' });
  teachers[i] = { ...teachers[i], ...req.body };
  res.json(teachers[i]);
});
router.delete('/:id', (req, res) => {
  teachers = teachers.filter(x => x._id !== req.params.id);
  res.json({ message: 'Deleted' });
});
module.exports = router;
