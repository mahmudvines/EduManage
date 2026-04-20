const express = require('express');
const router = express.Router();
let classes = [];

router.get('/stats', (req, res) => {
  res.json({ totalClasses: classes.length });
});

router.get('/', (req, res) => res.json(classes));
router.get('/:id', (req, res) => {
  const c = classes.find(x => x._id === req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json(c);
});
router.post('/', (req, res) => {
  const c = { _id: Date.now().toString(), ...req.body };
  classes.push(c);
  res.status(201).json(c);
});
router.put('/:id', (req, res) => {
  const i = classes.findIndex(x => x._id === req.params.id);
  if (i === -1) return res.status(404).json({ message: 'Not found' });
  classes[i] = { ...classes[i], ...req.body };
  res.json(classes[i]);
});
router.delete('/:id', (req, res) => {
  classes = classes.filter(x => x._id !== req.params.id);
  res.json({ message: 'Deleted' });
});
module.exports = router;
