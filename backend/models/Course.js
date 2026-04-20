// ============================================================
// models/Course.js - Course Schema
// ============================================================

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    // Teacher assigned to this course
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    // Students enrolled in this course
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ],
    department: {
      type: String,
      trim: true
    },
    credits: {
      type: Number,
      default: 3,
      min: 1,
      max: 6
    },
    semester: {
      type: String,
      enum: ['Fall', 'Spring', 'Summer'],
      default: 'Fall'
    },
    year: {
      type: Number,
      default: new Date().getFullYear()
    },
    schedule: {
      days: [String], // e.g., ['Monday', 'Wednesday']
      time: String,   // e.g., '09:00 AM - 10:30 AM'
      room: String
    },
    maxStudents: {
      type: Number,
      default: 30
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual: number of enrolled students
courseSchema.virtual('enrollmentCount').get(function () {
  return this.students.length;
});

module.exports = mongoose.model('Course', courseSchema);
