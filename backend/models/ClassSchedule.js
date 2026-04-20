const mongoose = require('mongoose');

const ClassScheduleSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherName: { type: String, required: true },
  courseName: { type: String, required: true },
  subject: { type: String, required: true },
  dayOfWeek: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], required: true },
  startTime: { type: String, required: true }, // HH:MM format
  endTime: { type: String, required: true },
  room: { type: String, required: true },
  semester: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClassSchedule', ClassScheduleSchema);
