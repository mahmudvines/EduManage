// ============================================================
// controllers/attendance.controller.js
// ============================================================

const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// @route   POST /api/attendance
// @desc    Mark attendance for students in a course
const markAttendance = async (req, res) => {
  try {
    const { courseId, date, attendanceData } = req.body;
    // attendanceData: [{ studentId, status, notes }, ...]

    // Find the teacher profile
    const teacher = await Teacher.findOne({ user: req.user._id });

    const results = [];
    for (const record of attendanceData) {
      try {
        const attendance = await Attendance.findOneAndUpdate(
          {
            student: record.studentId,
            course: courseId,
            date: new Date(date).setHours(0, 0, 0, 0)
          },
          {
            student: record.studentId,
            course: courseId,
            markedBy: teacher?._id,
            date: new Date(date),
            status: record.status,
            notes: record.notes || ''
          },
          { upsert: true, new: true }
        );
        results.push(attendance);
      } catch (err) {
        // Continue if one record fails
        console.error('Attendance record error:', err);
      }
    }

    // Update attendance percentage for each student
    for (const record of attendanceData) {
      await updateStudentAttendancePercentage(record.studentId);
    }

    res.json({ message: 'Attendance marked successfully', count: results.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: Recalculate student's overall attendance percentage
const updateStudentAttendancePercentage = async (studentId) => {
  const total = await Attendance.countDocuments({ student: studentId });
  const present = await Attendance.countDocuments({
    student: studentId,
    status: { $in: ['present', 'late'] }
  });

  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  await Student.findByIdAndUpdate(studentId, { attendancePercentage: percentage });
};

// @route   GET /api/attendance/:studentId
// @desc    Get attendance for a specific student
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, startDate, endDate } = req.query;

    const filters = { student: studentId };
    if (courseId) filters.course = courseId;
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(filters)
      .populate('course', 'name code')
      .sort({ date: -1 });

    // Calculate summary
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({
      attendance,
      summary: { total, present, absent, percentage }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/attendance/course/:courseId
// @desc    Get attendance for an entire course on a date
const getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date } = req.query;

    const filters = { course: courseId };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filters.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const attendance = await Attendance.find(filters)
      .populate('student', 'name studentId')
      .sort({ 'student.name': 1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { markAttendance, getStudentAttendance, getCourseAttendance };
