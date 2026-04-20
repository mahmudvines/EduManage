const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');
const Class = require('./models/Class');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management';

const seed = async () => {
  await mongoose.connect(MONGODB_URI);
  const hash = await bcrypt.hash('teacher123', 10);
  const teachers = [
    { name: 'Prof. Alan Turing', email: 'alan.turing@school.com', password: hash, role: 'teacher' },
    { name: 'Dr. Grace Hopper', email: 'grace.hopper@school.com', password: hash, role: 'teacher' },
    { name: 'Mr. Nikola Tesla', email: 'nikola.tesla@school.com', password: hash, role: 'teacher' },
    { name: 'Ms. Marie Curie', email: 'marie.curie@school.com', password: hash, role: 'teacher' },
  ];
  for (let t of teachers) {
    const exists = await User.findOne({ email: t.email });
    if (!exists) await User.create(t);
  }
  console.log('Teachers seeded');
  process.exit();
};
seed();
