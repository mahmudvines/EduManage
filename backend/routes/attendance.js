const express = require('express');
const router = express.Router();
let records = [];

router.get('/stats', (req, res) => {
  res.json({ totalRecords: records.length, presentToday: 0, absentToday: 0 });
});

router.get('/', (req, res) => res.json(records));
router.post('/', (req, res) => {
  const r = { _id: Date.now().toString(), ...req.body, date: new Date() };
  records.push(r);
  res.status(201).json(r);
});
router.get('/:id', (req, res) => {
  const r = records.find(x => x._id === req.params.id);
  if (!r) return res.status(404).json({ message: 'Not found' });
  res.json(r);
});
module.exports = router;
