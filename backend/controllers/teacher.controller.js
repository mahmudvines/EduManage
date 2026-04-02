// ============================================================
// controllers/teacher.controller.js - Teacher CRUD Operations
// ============================================================

const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Course = require('../models/Course');

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Private (Admin)
const getAllTeachers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { department: { $regex: search, $options: 'i' } },
            { teacherId: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const filters = { ...searchFilter, isActive: true };
    const total = await Teacher.countDocuments(filters);

    const teachers = await Teacher.find(filters)
      .populate('assignedCourses', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      teachers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTeachers: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/teachers/:id
const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('assignedCourses', 'name code students');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/teachers
// @desc    Create a new teacher (Admin only)
const createTeacher = async (req, res) => {
  try {
    const { name, email, password, teacherId, phone, department, specialization, qualification } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingTeacher = await Teacher.findOne({ $or: [{ email }, { teacherId }] });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Teacher with this email or ID already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Teacher@123',
      role: 'teacher'
    });

    const teacher = await Teacher.create({
      user: user._id,
      name,
      email,
      teacherId,
      phone,
      department,
      specialization,
      qualification
    });

    res.status(201).json({
      message: 'Teacher created successfully',
      teacher
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/teachers/:id
const updateTeacher = async (req, res) => {
  try {
    const { name, phone, department, specialization, qualification } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (name) teacher.name = name;
    if (phone) teacher.phone = phone;
    if (department) teacher.department = department;
    if (specialization) teacher.specialization = specialization;
    if (qualification) teacher.qualification = qualification;

    await teacher.save();
    if (name) await User.findByIdAndUpdate(teacher.user, { name });

    res.json({ message: 'Teacher updated successfully', teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/teachers/:id
const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    teacher.isActive = false;
    await teacher.save();
    await User.findByIdAndUpdate(teacher.user, { isActive: false });

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher };
