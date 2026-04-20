const Student = require('../models/Student');
const Class = require('../models/Class');
const SystemLog = require('../models/SystemLog');

exports.getStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'Active' });
    const totalClasses = await Class.countDocuments();
    const recentLogs = await SystemLog.find().sort({ timestamp: -1 }).limit(5);
    res.json({ success: true, data: { totalStudents, activeStudents, totalClasses, recentLogs } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAttendanceData = async (req, res) => {
  // Mock attendance data (replace with real attendance collection if exists)
  const data = [
    { month: 'Jan', present: 85, absent: 15 },
    { month: 'Feb', present: 88, absent: 12 },
    { month: 'Mar', present: 92, absent: 8 },
    { month: 'Apr', present: 90, absent: 10 },
    { month: 'May', present: 87, absent: 13 },
    { month: 'Jun', present: 91, absent: 9 }
  ];
  res.json({ success: true, data });
};

exports.getCourseEnrollment = async (req, res) => {
  try {
    // Aggregate enrollment by subject (if you have enrollment model)
    // For demo, return mock data
    const data = [
      { name: 'Mathematics', students: 45 },
      { name: 'Physics', students: 38 },
      { name: 'Chemistry', students: 42 },
      { name: 'Biology', students: 30 }
    ];
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
