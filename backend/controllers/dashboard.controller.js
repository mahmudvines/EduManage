// ============================================================
// controllers/dashboard.controller.js - Analytics & Stats
// ============================================================

const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const User = require('../models/User');

// @route   GET /api/dashboard/stats
// @desc    Get overall system statistics for admin dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Run all queries in parallel for better performance
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      totalAttendance,
      presentAttendance,
      recentStudents,
      gradeDistribution
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Teacher.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: true }),
      Attendance.countDocuments(),
      Attendance.countDocuments({ status: { $in: ['present', 'late'] } }),
      Student.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('name studentId department year createdAt'),
      Grade.aggregate([
        {
          $group: {
            _id: '$letterGrade',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const attendancePercentage = totalAttendance > 0
      ? Math.round((presentAttendance / totalAttendance) * 100)
      : 0;

    // Monthly enrollment data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEnrollment = await Student.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalCourses,
        attendancePercentage
      },
      recentStudents,
      gradeDistribution,
      monthlyEnrollment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/dashboard/teacher-stats
// @desc    Stats for teacher dashboard
const getTeacherDashboardStats = async (req, res) => {
  try {
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findOne({ user: req.user._id }).populate('assignedCourses');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const courseIds = teacher.assignedCourses.map(c => c._id);
    const courses = await Course.find({ _id: { $in: courseIds } }).populate('students', 'name');

    const totalStudents = courses.reduce((sum, c) => sum + c.students.length, 0);

    // Attendance for this teacher's courses
    const totalAtt = await Attendance.countDocuments({ course: { $in: courseIds } });
    const presentAtt = await Attendance.countDocuments({
      course: { $in: courseIds },
      status: { $in: ['present', 'late'] }
    });
    const attPercentage = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

    res.json({
      teacher,
      stats: {
        totalCourses: courses.length,
        totalStudents,
        attendancePercentage: attPercentage
      },
      courses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/dashboard/student-stats
// @desc    Stats for student dashboard
const getStudentDashboardStats = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('enrolledCourses', 'name code teacher schedule');

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const grades = await Grade.find({ student: student._id })
      .populate('course', 'name code');

    res.json({
      student,
      grades,
      stats: {
        totalCourses: student.enrolledCourses.length,
        attendancePercentage: student.attendancePercentage,
        gpa: student.gpa
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getTeacherDashboardStats, getStudentDashboardStats };
