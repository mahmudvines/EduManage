// ============================================================
// models/Grade.js - Grade Schema
// ============================================================

const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    // Individual assessment scores
    assessments: [
      {
        name: String,        // e.g., "Midterm", "Quiz 1", "Final"
        score: Number,       // Score achieved
        maxScore: Number,    // Maximum possible score
        weight: Number,      // Weight in percentage (e.g., 30 for 30%)
        date: Date
      }
    ],
    // Final calculated grade
    finalScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    letterGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'N/A'],
      default: 'N/A'
    },
    gradePoints: {
      type: Number,
      min: 0,
      max: 4.0,
      default: 0
    },
    semester: {
      type: String
    },
    year: {
      type: Number
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index: one grade record per student per course per semester
gradeSchema.index({ student: 1, course: 1, semester: 1, year: 1 }, { unique: true });

// Helper method to calculate letter grade from score
gradeSchema.methods.calculateLetterGrade = function () {
  const score = this.finalScore;
  if (score >= 97) return { letter: 'A+', points: 4.0 };
  if (score >= 93) return { letter: 'A', points: 4.0 };
  if (score >= 90) return { letter: 'A-', points: 3.7 };
  if (score >= 87) return { letter: 'B+', points: 3.3 };
  if (score >= 83) return { letter: 'B', points: 3.0 };
  if (score >= 80) return { letter: 'B-', points: 2.7 };
  if (score >= 77) return { letter: 'C+', points: 2.3 };
  if (score >= 73) return { letter: 'C', points: 2.0 };
  if (score >= 70) return { letter: 'C-', points: 1.7 };
  if (score >= 60) return { letter: 'D', points: 1.0 };
  return { letter: 'F', points: 0.0 };
};

module.exports = mongoose.model('Grade', gradeSchema);
