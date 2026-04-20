// ============================================================
// models/Teacher.js - Teacher Schema
// ============================================================

const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Teacher name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true
    },
    teacherId: {
      type: String,
      required: [true, 'Teacher ID is required'],
      unique: true
    },
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    specialization: {
      type: String,
      trim: true
    },
    qualification: {
      type: String,
      trim: true
    },
    // Courses assigned to this teacher
    assignedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    joinDate: {
      type: Date,
      default: Date.now
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

module.exports = mongoose.model('Teacher', teacherSchema);
