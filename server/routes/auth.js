import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      const token = generateToken(user._id);
      
      res.cookie('token', token, {
        httpOnly: false,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'None',
        secure:false
      });

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });
    
    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id);
      
      res.cookie('token', token, {
        httpOnly: false,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'None'
      });

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user / clear cookie
// @access  Private
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// @route   GET /api/auth/me
// @desc    Get user profile
// @access  Private
router.get('/me', async (req, res) => {
  try {
    let token;
    if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized' });
  }
});

export default router;