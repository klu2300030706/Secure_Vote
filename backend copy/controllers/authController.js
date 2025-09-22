const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { validateUserData } = require('../utils/validators');

// Generate JWT with user id and role
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate input
  const errors = validateUserData({ name, email, password });
  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(', '));
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Handle admin registration
  let userRole = role || 'user';
  if (role === 'admin') {
    const adminSecret = req.headers['admin-secret'];
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      res.status(401);
      throw new Error('Not authorized to create admin account');
    }
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
  });

  if (user) {
    res.status(201).json({
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

module.exports = {
  registerUser,
  loginUser,
};