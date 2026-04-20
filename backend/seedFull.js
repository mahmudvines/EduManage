const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

///OK

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

    // Drop old Student collection to remove indexes
    await Student.collection.drop().catch(err => console.log('No collection to drop, continuing...'));
    
    // Create new collection without problematic indexes
    await Student.init();
    console.log('Student collection reinitialized');

    // Generate 100 students
    const students = [];
    for (let i = 0; i < 100; i++) {
      students.push(generateRandomStudent());
    }
    await Student.insertMany(students);
    console.log(`✅ Seeded ${students.length} students`);

    // Clear existing non-admin users (optional)
    await User.deleteMany({ role: { $ne: 'admin' } });
    console.log('Cleared existing non-admin users');

    const hash = await bcrypt.hash('password123', 10);
    
    // Create 5 teachers
    const teachers = [];
    for (let i = 1; i <= 5; i++) {
      teachers.push({
        name: faker.person.fullName(),
        email: `teacher${i}@school.com`,
        password: hash,
        role: 'teacher'
      });
    }
    await User.insertMany(teachers);
    console.log(`✅ Created ${teachers.length} teachers`);

    // Create 5 admins (including the existing one)
    const adminEmails = ['admin@school.com', 'admin2@school.com', 'admin3@school.com', 'admin4@school.com', 'admin5@school.com'];
    for (let email of adminEmails) {
      const existing = await User.findOne({ email });
      if (!existing) {
        await User.create({
          name: `Admin ${email.split('@')[0]}`,
          email: email,
          password: hash,
          role: 'admin'
        });
      }
    }
    console.log('✅ Admin users ensured (5 total)');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
