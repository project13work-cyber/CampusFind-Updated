const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Helper to validate password strength
const validatePasswordStrength = (password) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character (e.g. !@#$%^&*).';
  }
  return null;
};

const isStr = (v) => typeof v === 'string';

// Turns Mongo/Mongoose errors into friendly 4xx replies instead of a generic 500
const sendAuthError = (res, error, fallbackMessage) => {
  if (error && error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'An account with this Gmail address already exists.'
    });
  }
  if (error && error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: Object.values(error.errors).map((e) => e.message).join(' ')
    });
  }
  console.error(`[Auth] ${fallbackMessage}:`, error);
  return res.status(500).json({
    success: false,
    message: fallbackMessage,
    error: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, studentId, phone, password, confirmPassword } = req.body || {};

    if (![name, email, studentId, phone, password].every(isStr) ||
        ![name, email, studentId, phone, password].every((v) => v.trim())) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Name, Gmail, Student ID, Phone, Password) are required.'
      });
    }

    const cleanName = name.trim().replace(/\s+/g, ' ');
    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({ success: false, message: 'Name must be between 2 and 100 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@gmail\.com$/i.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please use a Gmail address ending with @gmail.com.' });
    }

    const cleanStudentId = studentId.trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9\-_/.]{1,29}$/.test(cleanStudentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student ID may only contain letters, numbers, - _ / . (2-30 characters).'
      });
    }

    const cleanPhone = phone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (!/^[+\d][\d\s()-]*$/.test(cleanPhone) || phoneDigits.length < 10 || phoneDigits.length > 15) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number (10-15 digits).' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this Gmail address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: cleanName,
      email: normalizedEmail,
      studentId: cleanStudentId,
      phone: cleanPhone,
      passwordHash,
      role: 'STUDENT',
      isEmailVerified: true
    });

    const token = user.generateAuthToken();

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to CampusFind.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    return sendAuthError(res, error, 'Server error during registration');
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!isStr(email) || !isStr(password) || !email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if valid gmail domain format
    if (!normalizedEmail.endsWith('@gmail.com')) {
      return res.status(400).json({
        success: false,
        message: 'Please use a Gmail address ending with @gmail.com.'
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Prevent account enumeration by returning standard message
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = user.generateAuthToken();

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
      error: error.message
    });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered Gmail address.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Standard safe response to avoid enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this Gmail address, password reset instructions have been generated.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset token generated successfully. In production, this is emailed.',
      resetToken // Returned for local testing convenience
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error processing password reset request',
      error: error.message
    });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error resetting password',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword
};
