// ============================================================
// controllers/auth.controller.js - Authentication Logic
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// Helper: Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  });
};

// ============================================================
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ============================================================
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Only allow admin to register teachers/admins
    // Regular registration defaults to 'student'
    const userRole = role === 'admin' || role === 'teacher' ? role : 'student';

    // Create the user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole
    });

    // If registering as student, create a Student profile automatically
    if (userRole === 'student') {
      const studentCount = await Student.countDocuments();
      await Student.create({
        user: user._id,
        name: user.name,
        email: user.email,
        studentId: `STU${String(studentCount + 1).padStart(4, '0')}`,
        year: '1st Year'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// ============================================================
// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
// ============================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and include password (it's excluded by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Your account has been deactivated. Contact admin.' });
    }

    // Compare passwords
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login time
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ============================================================
// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
// ============================================================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get role-specific profile
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id }).populate('enrolledCourses', 'name code');
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ user: user._id }).populate('assignedCourses', 'name code');
    }

    res.json({ user, profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================
// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
// ============================================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe, changePassword };
