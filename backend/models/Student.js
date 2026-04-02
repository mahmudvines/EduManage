// ============================================================
// models/Student.js - Student Schema
// ============================================================

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    // Reference to the User document for authentication
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    // Array of courses the student is enrolled in
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    // Overall attendance percentage (calculated field)
    attendancePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    // GPA or overall grade
    gpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 4.0
    },
    // Academic year / semester
    year: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      default: '1st Year'
    },
    department: {
      type: String,
      trim: true
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

// Virtual field: Full name (useful if storing first/last separately later)
studentSchema.virtual('profileUrl').get(function () {
  return `/students/${this._id}`;
});

module.exports = mongoose.model('Student', studentSchema);
