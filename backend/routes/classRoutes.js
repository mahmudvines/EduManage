const express = require('express');
const router = express.Router();
const { getAllClasses, createClass, updateClass, deleteClass } = require('../controllers/classController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getAllClasses).post(createClass);
router.route('/:id').put(updateClass).delete(deleteClass);

module.exports = router;
