const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management';

// Define models inline (no external file dependency)
const User = mongoose.model('User', new mongoose.Schema({
  name: String, email: String, password: String, role: String,
  department: String, subject: String, avatar: String, createdAt: Date
}));
const Student = mongoose.model('Student', new mongoose.Schema({
  name: String, email: String, rollNumber: String, class: String, section: String,
  semester: String, parentName: String, parentPhone: String, address: String,
  dateOfBirth: Date, gender: String, enrollmentDate: Date, status: String
}));
const Class = mongoose.model('Class', new mongoose.Schema({
  className: String, teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherName: String, subject: String, dayOfWeek: String, startTime: String,
  endTime: String, durationMinutes: Number, room: String, semester: String,
  academicYear: String, maxStudents: Number, status: String
}));

const generateStudent = () => {
  const gender = faker.person.sex();
  const firstName = faker.person.firstName(gender);
  const lastName = faker.person.lastName();
  return {
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    rollNumber: faker.string.alphanumeric(8).toUpperCase(),
    class: faker.helpers.arrayElement(['9','10','11','12']),
    section: faker.helpers.arrayElement(['A','B','C']),
    semester: faker.helpers.arrayElement(['1st','2nd','3rd','4th']),
    parentName: faker.person.fullName(),
    parentPhone: faker.phone.number(),
    address: faker.location.streetAddress(),
    dateOfBirth: faker.date.birthdate({ min: 2005, max: 2010, mode: 'year' }),
    gender: gender === 'male' ? 'Male' : 'Female',
    status: faker.helpers.arrayElement(['Active','Inactive','Graduated']),
    enrollmentDate: new Date()
  };
};

const seed = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear old data
  await Student.deleteMany({});
  await User.deleteMany({ role: 'teacher' });
  await Class.deleteMany({});
  console.log('Cleared old students, teachers, classes');

  // 150 students
  const students = [];
  for (let i = 0; i < 150; i++) students.push(generateStudent());
  await Student.insertMany(students);
  console.log(`Added ${students.length} students`);

  // 25 teachers
  const teachers = [];
  for (let i = 1; i <= 25; i++) {
    const hash = await bcrypt.hash('password123', 10);
    teachers.push({
      name: faker.person.fullName(),
      email: `teacher${i}@school.com`,
      password: hash,
      role: 'teacher',
      department: faker.helpers.arrayElement(['Mathematics','Physics','Chemistry','Biology','English','History','CS','Economics']),
      subject: faker.helpers.arrayElement(['Algebra','Calculus','Mechanics','Literature','Programming','Macroeconomics']),
      createdAt: new Date()
    });
  }
  const insertedTeachers = await User.insertMany(teachers);
  console.log(`Added ${insertedTeachers.length} teachers`);

  // 20 classes
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const classes = [];
  for (let i = 0; i < 20; i++) {
    const teacher = faker.helpers.arrayElement(insertedTeachers);
    classes.push({
      className: `${faker.helpers.arrayElement(['Math','Physics','Chemistry','English','History'])} ${faker.number.int({ min: 101, max: 301 })}`,
      teacherId: teacher._id,
      teacherName: teacher.name,
      subject: teacher.subject,
      dayOfWeek: faker.helpers.arrayElement(days),
      startTime: `${faker.number.int({ min: 8, max: 14 }).toString().padStart(2,'0')}:00`,
      endTime: `${faker.number.int({ min: 9, max: 15 }).toString().padStart(2,'0')}:00`,
      durationMinutes: 60,
      room: `Room ${faker.number.int({ min: 101, max: 300 })}`,
      semester: faker.helpers.arrayElement(['Spring 2024','Fall 2024','Spring 2025']),
      status: 'Active'
    });
  }
  await Class.insertMany(classes);
  console.log(`Added ${classes.length} classes`);

  // Ensure admin user
  const admin = await User.findOne({ email: 'admin@school.com' });
  if (!admin) {
    const adminHash = await bcrypt.hash('Admin@123', 10);
    await User.create({ name: 'Admin', email: 'admin@school.com', password: adminHash, role: 'admin' });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  console.log('Seeding complete!');
  process.exit(0);
};
seed().catch(err => { console.error(err); process.exit(1); });
