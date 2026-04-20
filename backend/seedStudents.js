const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

// Import models
const Student = require('./models/Student');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management';

const generateRandomStudent = () => {
  const gender = faker.person.sex();
  const firstName = faker.person.firstName(gender);
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;
  const email = faker.internet.email({ firstName, lastName }).toLowerCase();
  const rollNumber = faker.string.alphanumeric(8).toUpperCase();
  const classValue = faker.helpers.arrayElement(['9', '10', '11', '12']);
  const section = faker.helpers.arrayElement(['A', 'B', 'C']);
  const semester = faker.helpers.arrayElement(['1st', '2nd', '3rd', '4th']);
  const parentName = faker.person.fullName();
  const parentPhone = faker.phone.number();
  const address = faker.location.streetAddress();
  const dateOfBirth = faker.date.birthdate({ min: 2005, max: 2010, mode: 'year' });
  const studentGender = gender === 'male' ? 'Male' : 'Female';
  const status = faker.helpers.arrayElement(['Active', 'Inactive', 'Graduated']);
  return {
    name, email, rollNumber, class: classValue, section, semester,
    parentName, parentPhone, address, dateOfBirth, gender: studentGender,
    status, enrollmentDate: new Date()
  };
};

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing students (optional)
    await Student.deleteMany({});
    console.log('Cleared existing students');

    const students = [];
    for (let i = 0; i < 200; i++) {
      students.push(generateRandomStudent());
    }
    await Student.insertMany(students);
    console.log(`✅ Seeded ${students.length} students`);

    // Also create a few teacher users if none exist
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    if (teacherCount === 0) {
      const teacherPassword = await bcrypt.hash('teacher123', 10);
      const teachers = [
        { name: 'Mr. Smith', email: 'smith@school.com', password: teacherPassword, role: 'teacher' },
        { name: 'Ms. Johnson', email: 'johnson@school.com', password: teacherPassword, role: 'teacher' },
        { name: 'Dr. Williams', email: 'williams@school.com', password: teacherPassword, role: 'teacher' }
      ];
      await User.insertMany(teachers);
      console.log('✅ Created 3 teacher accounts');
    }

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
