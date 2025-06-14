const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken, protect, admin } = require('../auth');

const router = express.Router();

// @desc    Auth user & get token
// @route   POST /api/auth/login

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  // Set response headers
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Log the incoming request
  console.log('Login request body:', req.body);
  
  const { email, password } = req.body;
  
  // Validate request body
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Please provide both email and password' 
    });
  }
  
  try {
    console.log('Login attempt for email:', email);
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    console.log('Login successful for user:', user.email);
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
