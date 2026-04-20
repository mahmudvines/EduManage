const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'edumanage-secret-key-2024';

// Create admin immediately when server starts
const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ email: 'admin@edumanage.com' });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await new User({
        name: 'Administrator',
        email: 'admin@edumanage.com',
        password: hashedPassword,
        role: 'admin'
      }).save();
      console.log('Default admin created: admin@edumanage.com / admin123');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};
seedAdmin();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name: name || email.split('@')[0], 
      email, 
      password: hashedPassword, 
      role: role || 'student' 
    });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Login - accepts multiple field names
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt body:', JSON.stringify(req.body));
    
    // Handle whatever field names frontend sends
    const loginId = req.body.email || req.body.username || req.body.userEmail || req.body.userName || req.body.emailAddress;
    const password = req.body.password || req.body.userPassword || req.body.pass;
    
    console.log('Parsed loginId:', loginId, '| password exists:', !!password);

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Email/username and password required' });
    }

    // Find by email OR name
    let user = await User.findOne({ email: loginId });
    if (!user) {
      user = await User.findOne({ name: loginId });
    }
    
    console.log('User lookup result:', user ? 'FOUND - ' + user.email : 'NOT FOUND');

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    console.log('Login SUCCESS for:', user.email);
    
    res.json({ 
      success: true,
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Debug: list all users (no passwords)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
