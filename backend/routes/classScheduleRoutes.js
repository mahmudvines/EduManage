const express = require('express');
const router = express.Router();
const { getSchedules, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/classScheduleController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getSchedules)
  .post(createSchedule);

router.route('/:id')
  .put(updateSchedule)
  .delete(deleteSchedule);

module.exports = router;
