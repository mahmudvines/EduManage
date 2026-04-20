// ============================================================
// models/Attendance.js - Attendance Schema
// ============================================================

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required']
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      required: [true, 'Status is required'],
      default: 'present'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate attendance records
// A student can only have one attendance record per course per day
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
