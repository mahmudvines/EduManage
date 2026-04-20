require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ==================== MODELS ====================
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  department: String,
  subject: String,
  avatar: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const StudentSchema = new mongoose.Schema({
  name: String, email: String, rollNumber: String, class: String, section: String,
  semester: String, parentName: String, parentPhone: String, address: String,
  dateOfBirth: Date, gender: String, status: { type: String, default: 'Active' }
});
const Student = mongoose.model('Student', StudentSchema);

const ClassSchema = new mongoose.Schema({
  className: String, teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherName: String, subject: String, dayOfWeek: String, startTime: String,
  endTime: String, durationMinutes: Number, room: String, semester: String,
  academicYear: String, maxStudents: Number, status: { type: String, default: 'Active' }
});
const Class = mongoose.model('Class', ClassSchema);

// ==================== AUTH ====================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==================== PROFILE ====================
const getUserIdFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try { return jwt.verify(token, process.env.JWT_SECRET || 'secretkey').id; }
  catch { return null; }
};

app.get('/api/profile', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ success: false });
  const user = await User.findById(userId).select('-password');
  res.json({ success: true, data: user });
});

app.put('/api/profile', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ success: false });
  const { name, email, password } = req.body;
  const update = { name, email };
  if (password && password.trim()) update.password = await bcrypt.hash(password, 10);
  const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
  res.json({ success: true, data: user });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.post('/api/profile/avatar', upload.single('avatar'), async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ success: false });
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  const avatarUrl = `/uploads/${req.file.filename}`;
  await User.findByIdAndUpdate(userId, { avatar: avatarUrl });
  res.json({ success: true, avatarUrl });
});

// ==================== STUDENT CRUD ====================
app.get('/api/students', async (req, res) => {
  try { const students = await Student.find().sort({ createdAt: -1 }); res.json({ success: true, data: students }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
app.post('/api/students', async (req, res) => {
  try { const student = new Student(req.body); await student.save(); res.status(201).json({ success: true, data: student }); }
  catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
app.put('/api/students/:id', async (req, res) => {
  try { const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, data: student }); }
  catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
app.delete('/api/students/:id', async (req, res) => {
  try { await Student.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==================== TEACHER CRUD ====================
app.get('/api/auth/teachers', async (req, res) => {
  try { const teachers = await User.find({ role: 'teacher' }).select('-password'); res.json(teachers); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
app.post('/api/auth/teachers', async (req, res) => {
  try { const { name, email, password, department, subject } = req.body; const hash = await bcrypt.hash(password, 10); const teacher = new User({ name, email, password: hash, role: 'teacher', department, subject }); await teacher.save(); res.status(201).json({ success: true, data: teacher }); }
  catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
app.put('/api/auth/teachers/:id', async (req, res) => {
  try { const { name, email, department, subject } = req.body; const teacher = await User.findByIdAndUpdate(req.params.id, { name, email, department, subject }, { new: true }); res.json({ success: true, data: teacher }); }
  catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
app.delete('/api/auth/teachers/:id', async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==================== CLASS CRUD ====================
app.get('/api/classes', async (req, res) => {
  try { const classes = await Class.find(); res.json({ success: true, data: classes }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
app.post('/api/classes', async (req, res) => {
  try { const cls = new Class(req.body); await cls.save(); res.status(201).json({ success: true, data: cls }); }
  catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
app.put('/api/classes/:id', async (req, res) => {
  try { const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, data: cls }); }
  catch (err) { res.status(400).json({ success: false, message: err.message }); }
});
app.delete('/api/classes/:id', async (req, res) => {
  try { await Class.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==================== DASHBOARD ====================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'Active' });
    const totalClasses = await Class.countDocuments();
    res.json({ success: true, data: { totalStudents, activeStudents, totalClasses, recentLogs: [] } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
app.get('/api/dashboard/attendance', (req, res) => {
  res.json({ success: true, data: [{ month: 'Jan', present: 85, absent: 15 }, { month: 'Feb', present: 88, absent: 12 }, { month: 'Mar', present: 92, absent: 8 }, { month: 'Apr', present: 90, absent: 10 }, { month: 'May', present: 87, absent: 13 }, { month: 'Jun', present: 91, absent: 9 }] });
});
app.get('/api/dashboard/course-enrollment', (req, res) => {
  res.json({ success: true, data: [{ name: 'Mathematics', students: 45 }, { name: 'Physics', students: 38 }, { name: 'Chemistry', students: 42 }, { name: 'Biology', students: 30 }] });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
