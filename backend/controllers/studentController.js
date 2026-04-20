const Student = require('../models/Student');
const SystemLog = require('../models/SystemLog');

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    await SystemLog.create({
      action: 'CREATE', entity: 'Student', entityId: student._id,
      changes: req.body, performedBy: req.user.id, performedByName: req.user.name
    });
    res.status(201).json({ success: true, data: student });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    await SystemLog.create({
      action: 'UPDATE', entity: 'Student', entityId: student._id,
      changes: req.body, performedBy: req.user.id, performedByName: req.user.name
    });
    res.json({ success: true, data: student });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    await SystemLog.create({
      action: 'DELETE', entity: 'Student', entityId: student._id,
      changes: student, performedBy: req.user.id, performedByName: req.user.name
    });
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
