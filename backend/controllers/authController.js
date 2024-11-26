// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const { getUser, createNew } = require('../models/userModel');

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const existingUser = await getUser(email);

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await createNew(email, hashedPassword);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

const loginUser = (req, res) => {
  res.json({ message: 'Logged in successfully' });
};

const logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Error logging out' });
    res.json({ message: 'Logged out successfully' });
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
