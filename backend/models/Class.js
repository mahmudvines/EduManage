const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  className: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherName: { type: String, required: true },
  subject: { type: String, required: true },
  dayOfWeek: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  durationMinutes: { type: Number, required: true, default: 60 },
  room: { type: String, required: true },
  semester: { type: String, required: true },
  academicYear: { type: String, default: '2024-2025' },
  maxStudents: { type: Number, default: 30 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', ClassSchema);
