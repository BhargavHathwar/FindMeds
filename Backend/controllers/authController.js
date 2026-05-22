// controllers/authController.js
// Handles register and login with bcrypt + JWT.
// No Firebase — fully custom auth as per the new roadmap.

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import NGO from '../models/NGO.js';

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, pincode, darpanId, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'name, email, password and role are required.' });
    }

    const validRoles = ['donor', 'ngo', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `role must be one of: ${validRoles.join(', ')}` });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Create user — passwordHash field triggers bcrypt pre-save hook
    const user = await User.create({
      name,
      email,
      passwordHash: password, // gets hashed in model pre-save
      role,
      pincode: pincode || null,
    });

    // If NGO, create NGO document too
    if (role === 'ngo') {
      await NGO.create({
        userId: user._id,
        name,
        email,
        darpanId: darpanId || null,
        phone: phone || null,
        verified: false,
      });
    }

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[AuthController] register error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed.', error: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('[AuthController] login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed.', error: error.message });
  }
};

// GET /api/auth/me  (protected)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, user: user.toJSON() });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
};
