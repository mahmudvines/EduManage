const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management';
const User = mongoose.model('User', new mongoose.Schema({ name: String, email: String, password: String, role: String, department: String, subject: String }));
const Student = mongoose.model('Student', new mongoose.Schema({ name: String, email: String, rollNumber: String, class: String, section: String, parentName: String, parentPhone: String, address: String, dateOfBirth: Date, gender: String, status: String }));

async function seedUsers() {
  await mongoose.connect(MONGODB_URI);
  const existingTeacher = await User.findOne({ email: 'teacher@school.com' });
  if (!existingTeacher) {
    const hash = await bcrypt.hash('teacher123', 10);
    await User.create({ name: 'Sample Teacher', email: 'teacher@school.com', password: hash, role: 'teacher', department: 'Mathematics', subject: 'Algebra' });
    console.log('Sample teacher created (teacher@school.com / teacher123)');
  }
  const existingStudent = await User.findOne({ email: 'student@school.com' });
  if (!existingStudent) {
    const hash = await bcrypt.hash('student123', 10);
    await User.create({ name: 'Sample Student', email: 'student@school.com', password: hash, role: 'student' });
    // Also create a student record
    const studentExists = await Student.findOne({ email: 'student@school.com' });
    if (!studentExists) {
      await Student.create({ name: 'Sample Student', email: 'student@school.com', rollNumber: 'STU001', class: '10', section: 'A', status: 'Active' });
    }
    console.log('Sample student created (student@school.com / student123)');
  }
  console.log('Seeding complete');
  process.exit();
}
seedUsers().catch(console.error);
