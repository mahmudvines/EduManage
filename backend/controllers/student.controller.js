// ============================================================
// controllers/student.controller.js - Student CRUD Operations
// ============================================================

const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ============================================================
// @route   GET /api/students
// @desc    Get all students with pagination and search
// @access  Private (Admin, Teacher)
// ============================================================
const getAllStudents = async (req, res) => {
  try {
    // Pagination params (defaults: page 1, 10 per page)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search query
    const search = req.query.search || '';
    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { studentId: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    // Filter by year or department
    const filters = { ...searchFilter, isActive: true };
    if (req.query.year) filters.year = req.query.year;
    if (req.query.department) filters.department = req.query.department;

    // Get total count for pagination
    const total = await Student.countDocuments(filters);

    // Get students with populated courses
    const students = await Student.find(filters)
      .populate('enrolledCourses', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalStudents: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @route   GET /api/students/:id
// @desc    Get single student by ID
// @access  Private
// ============================================================
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('enrolledCourses', 'name code teacher schedule')
      .populate('user', 'name email role lastLogin');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @route   POST /api/students
// @desc    Create a new student (Admin only)
// @access  Private (Admin)
// ============================================================
const createStudent = async (req, res) => {
  try {
    const { name, email, password, studentId, phone, department, year, gender, dateOfBirth } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ $or: [{ email }, { studentId }] });
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this email or student ID already exists' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create User account for login
    const user = await User.create({
      name,
      email,
      password: password || 'Student@123', // Default password
      role: 'student'
    });

    // Create Student profile
    const student = await Student.create({
      user: user._id,
      name,
      email,
      studentId,
      phone,
      department,
      year,
      gender,
      dateOfBirth
    });

    // Return student with user info
    const populatedStudent = await Student.findById(student._id).populate('user', 'name email role');

    res.status(201).json({
      message: 'Student created successfully',
      student: populatedStudent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @route   PUT /api/students/:id
// @desc    Update student information
// @access  Private (Admin)
// ============================================================
const updateStudent = async (req, res) => {
  try {
    const { name, phone, department, year, gender, dateOfBirth, address } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update fields
    if (name) student.name = name;
    if (phone) student.phone = phone;
    if (department) student.department = department;
    if (year) student.year = year;
    if (gender) student.gender = gender;
    if (dateOfBirth) student.dateOfBirth = dateOfBirth;
    if (address) student.address = address;

    await student.save();

    // Also update the User's name if changed
    if (name) {
      await User.findByIdAndUpdate(student.user, { name });
    }

    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// @route   DELETE /api/students/:id
// @desc    Delete a student (soft delete)
// @access  Private (Admin)
// ============================================================
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Soft delete - just deactivate instead of removing
    student.isActive = false;
    await student.save();

    // Also deactivate the user account
    await User.findByIdAndUpdate(student.user, { isActive: false });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
