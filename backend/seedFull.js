const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management';

// Define schemas (reuse your actual models if available, but we'll define inline for safety)
const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String,
  department: String, subject: String, avatar: String, createdAt: Date
});
const User = mongoose.model('User', UserSchema);

const StudentSchema = new mongoose.Schema({
  name: String, email: String, rollNumber: String, class: String, section: String,
  semester: String, parentName: String, parentPhone: String, address: String,
  dateOfBirth: Date, gender: String, enrollmentDate: Date, status: String
});
const Student = mongoose.model('Student', StudentSchema);

const ClassSchema = new mongoose.Schema({
  className: String, teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherName: String, subject: String, dayOfWeek: String, startTime: String,
  endTime: String, durationMinutes: Number, room: String, semester: String,
  academicYear: String, maxStudents: Number, status: String
});
const Class = mongoose.model('Class', ClassSchema);

// Helper: generate a random student
const generateStudent = () => {
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

// Helper: generate a random teacher (user)
const generateTeacher = async (index) => {
  const name = faker.person.fullName();
  const email = `teacher${index}@school.com`;
  const password = await bcrypt.hash('password123', 10);
  const departments = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];
  const subjects = ['Algebra', 'Calculus', 'Mechanics', 'Organic Chemistry', 'Literature', 'World History', 'Programming', 'Macroeconomics'];
  return {
    name,
    email,
    password,
    role: 'teacher',
    department: faker.helpers.arrayElement(departments),
    subject: faker.helpers.arrayElement(subjects),
    createdAt: new Date()
  };
};

// Helper: generate a random class
const generateClass = (teachers) => {
  const teacher = faker.helpers.arrayElement(teachers);
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const startHour = faker.number.int({ min: 8, max: 14 });
  const endHour = startHour + 1;
  const startTime = `${startHour.toString().padStart(2, '0')}:00`;
  const endTime = `${endHour.toString().padStart(2, '0')}:00`;
  const semesters = ['Spring 2024', 'Summer 2024', 'Fall 2024', 'Spring 2025'];
  return {
    className: `${faker.helpers.arrayElement(subjects)} ${faker.helpers.arrayElement(['101', '201', '301'])}`,
    teacherId: teacher._id,
    teacherName: teacher.name,
    subject: faker.helpers.arrayElement(subjects),
    dayOfWeek: faker.helpers.arrayElement(days),
    startTime,
    endTime,
    durationMinutes: 60,
    room: `Room ${faker.number.int({ min: 101, max: 300 })}`,
    semester: faker.helpers.arrayElement(semesters),
    academicYear: '2024-2025',
    maxStudents: faker.number.int({ min: 20, max: 40 }),
    status: 'Active'
  };
};

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Student.deleteMany({});
    await User.deleteMany({ role: 'teacher' });
    await Class.deleteMany({});
    console.log('🧹 Cleared old students, teachers, and classes');

    // 1. Create 25 teachers
    const teachers = [];
    for (let i = 1; i <= 25; i++) {
      teachers.push(await generateTeacher(i));
    }
    const insertedTeachers = await User.insertMany(teachers);
    console.log(`✅ Inserted ${insertedTeachers.length} teachers`);

    // 2. Create 150 students
    const students = [];
    for (let i = 0; i < 150; i++) {
      students.push(generateStudent());
    }
    await Student.insertMany(students);
    console.log(`✅ Inserted ${students.length} students`);

    // 3. Create 20 classes, assign random teachers
    const classes = [];
    for (let i = 0; i < 20; i++) {
      classes.push(generateClass(insertedTeachers));
    }
    await Class.insertMany(classes);
    console.log(`✅ Inserted ${classes.length} classes`);

    // 4. Ensure admin user exists
    const adminExists = await User.findOne({ email: 'admin@school.com' });
    if (!adminExists) {
      const adminHash = await bcrypt.hash('Admin@123', 10);
      await User.create({
        name: 'Admin',
        email: 'admin@school.com',
        password: adminHash,
        role: 'admin',
        createdAt: new Date()
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin already exists');
    }

    // 5. Final counts
    const finalStudentCount = await Student.countDocuments();
    const finalTeacherCount = await User.countDocuments({ role: 'teacher' });
    const finalClassCount = await Class.countDocuments();
    console.log(`\n📊 Final counts:`);
    console.log(`   Students: ${finalStudentCount}`);
    console.log(`   Teachers: ${finalTeacherCount}`);
    console.log(`   Classes: ${finalClassCount}`);

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seed();
