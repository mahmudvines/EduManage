// ============================================================
// config/seed.js - Seed the database with demo data
// Run with: npm run seed
// ============================================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_management';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Teacher.deleteMany({}),
      Course.deleteMany({}),
      Attendance.deleteMany({}),
      Grade.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Create Admin ──────────────────────────────────────
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@school.com',
      password: 'Admin@123',
      role: 'admin'
    });
    console.log('👤 Admin created: admin@school.com / Admin@123');

    // ── Create Teachers ───────────────────────────────────
    const teacherData = [
      { name: 'Dr. Sarah Johnson', email: 'sarah@school.com', dept: 'Computer Science', spec: 'Machine Learning', qual: 'PhD Computer Science', id: 'TCH0001' },
      { name: 'Prof. James Wilson', email: 'james@school.com', dept: 'Mathematics', spec: 'Calculus & Algebra', qual: 'MSc Mathematics', id: 'TCH0002' },
      { name: 'Dr. Emily Chen', email: 'emily@school.com', dept: 'Physics', spec: 'Quantum Mechanics', qual: 'PhD Physics', id: 'TCH0003' }
    ];

    const teachers = [];
    for (const t of teacherData) {
      const user = await User.create({ name: t.name, email: t.email, password: 'Teacher@123', role: 'teacher' });
      const teacher = await Teacher.create({
        user: user._id, name: t.name, email: t.email, teacherId: t.id,
        phone: '555-000-000' + teachers.length,
        department: t.dept, specialization: t.spec, qualification: t.qual
      });
      teachers.push(teacher);
    }
    console.log('👩‍🏫 3 Teachers created (password: Teacher@123)');

    // ── Create Courses ────────────────────────────────────
    const courseData = [
      { name: 'Introduction to Programming', code: 'CS101', dept: 'Computer Science', teacher: teachers[0]._id, credits: 3 },
      { name: 'Data Structures & Algorithms', code: 'CS201', dept: 'Computer Science', teacher: teachers[0]._id, credits: 4 },
      { name: 'Calculus I', code: 'MTH101', dept: 'Mathematics', teacher: teachers[1]._id, credits: 3 },
      { name: 'Linear Algebra', code: 'MTH201', dept: 'Mathematics', teacher: teachers[1]._id, credits: 3 },
      { name: 'Physics Fundamentals', code: 'PHY101', dept: 'Physics', teacher: teachers[2]._id, credits: 3 }
    ];

    const courses = [];
    for (const c of courseData) {
      const course = await Course.create({
        ...c, semester: 'Spring', year: 2025,
        schedule: { days: ['Monday', 'Wednesday'], time: '09:00 AM - 10:30 AM', room: `Room ${100 + courses.length}` },
        maxStudents: 30
      });
      // Link teacher -> course
      await Teacher.findByIdAndUpdate(c.teacher, { $push: { assignedCourses: course._id } });
      courses.push(course);
    }
    console.log('📚 5 Courses created');

    // ── Create Students ───────────────────────────────────
    const studentData = [
      { name: 'Alice Brown', email: 'alice@student.com', id: 'STU0001', dept: 'Computer Science', year: '2nd Year' },
      { name: 'Bob Martinez', email: 'bob@student.com', id: 'STU0002', dept: 'Computer Science', year: '1st Year' },
      { name: 'Carol White', email: 'carol@student.com', id: 'STU0003', dept: 'Mathematics', year: '3rd Year' },
      { name: 'David Kim', email: 'david@student.com', id: 'STU0004', dept: 'Physics', year: '2nd Year' },
      { name: 'Eva Zhang', email: 'eva@student.com', id: 'STU0005', dept: 'Computer Science', year: '1st Year' }
    ];

    const students = [];
    for (const s of studentData) {
      const user = await User.create({ name: s.name, email: s.email, password: 'Student@123', role: 'student' });
      // Enroll in first 2 courses
      const enrolledCourses = [courses[0]._id, courses[2]._id];
      const student = await Student.create({
        user: user._id, name: s.name, email: s.email,
        studentId: s.id, department: s.dept, year: s.year,
        gender: 'other', phone: '555-111-000' + students.length,
        enrolledCourses, attendancePercentage: Math.floor(Math.random() * 30) + 70,
        gpa: parseFloat((Math.random() * 2 + 2).toFixed(2))
      });
      // Update course enrollment
      for (const cId of enrolledCourses) {
        await Course.findByIdAndUpdate(cId, { $push: { students: student._id } });
      }
      students.push(student);
    }
    console.log('🎓 5 Students created (password: Student@123)');

    // ── Seed Attendance (last 7 days) ─────────────────────
    const statuses = ['present', 'present', 'present', 'present', 'absent', 'late'];
    for (let d = 6; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      date.setHours(9, 0, 0, 0);

      for (const student of students) {
        for (const courseId of [courses[0]._id, courses[2]._id]) {
          try {
            await Attendance.create({
              student: student._id, course: courseId,
              markedBy: teachers[0]._id, date,
              status: statuses[Math.floor(Math.random() * statuses.length)]
            });
          } catch (e) { /* skip duplicates */ }
        }
      }
    }
    console.log('📋 Attendance records created');

    // ── Seed Grades ───────────────────────────────────────
    for (const student of students) {
      for (const course of [courses[0], courses[2]]) {
        try {
          const score = Math.floor(Math.random() * 35) + 65;
          const assessments = [
            { name: 'Midterm', score: Math.floor(score * 0.9), maxScore: 100, weight: 30, date: new Date('2025-03-01') },
            { name: 'Assignment', score: Math.floor(score * 1.05), maxScore: 100, weight: 20, date: new Date('2025-02-15') },
            { name: 'Final Exam', score, maxScore: 100, weight: 50, date: new Date('2025-05-01') }
          ];
          const finalScore = Math.round(assessments.reduce((s, a) => s + (a.score / a.maxScore * 100) * (a.weight / 100), 0));
          const tempGrade = new Grade({ finalScore });
          const { letter, points } = tempGrade.calculateLetterGrade();

          await Grade.create({
            student: student._id, course: course._id,
            uploadedBy: teachers[0]._id, assessments,
            finalScore, letterGrade: letter, gradePoints: points,
            semester: 'Spring', year: 2025
          });
        } catch (e) { /* skip duplicates */ }
      }
    }
    console.log('📊 Grades seeded');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Demo Login Credentials:');
    console.log('  Admin:   admin@school.com   / Admin@123');
    console.log('  Teacher: sarah@school.com   / Teacher@123');
    console.log('  Student: alice@student.com  / Student@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedDatabase();
