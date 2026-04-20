const express = require('express');
const router = express.Router();
let fees = [];

router.get('/stats', (req, res) => {
  res.json({ totalCollected: 0, pendingAmount: 0, totalTransactions: fees.length });
});

router.get('/', (req, res) => res.json(fees));
router.post('/', (req, res) => {
  const f = { _id: Date.now().toString(), ...req.body, date: new Date() };
  fees.push(f);
  res.status(201).json(f);
});
module.exports = router;
