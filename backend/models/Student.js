const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rollNumber: { type: String, required: true, unique: true },
  class: { type: String, required: true },
  section: { type: String },
  semester: { type: String },
  parentName: { type: String },
  parentPhone: { type: String },
  address: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male','Female','Other'] },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active','Inactive','Graduated'], default: 'Active' },
  profileImage: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Drop any old indexes (like studentId_1) to avoid duplicate key errors
StudentSchema.on('index', function(error) {
  if (error) console.error('Index error:', error);
});

module.exports = mongoose.model('Student', StudentSchema);
