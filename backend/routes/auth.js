import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import { hashPassword, comparePassword, generateToken, formatResponse } from '../utils/helpers.js';
import { validateUserRegistration, validateUserLogin } from '../middlewares/validation.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(
        formatResponse(false, 'User with this email already exists')
      );
    }

    // Get the free plan
    const freePlan = await Plan.findOne({ name: 'Free' });

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      plan: freePlan?._id || null
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(
      formatResponse(true, 'User registered successfully', {
        user: userResponse,
        token
      })
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(
      formatResponse(false, 'Registration failed')
    );
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).populate('plan');
    if (!user) {
      return res.status(401).json(
        formatResponse(false, 'Invalid email or password')
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json(
        formatResponse(false, 'Account has been deactivated')
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(
        formatResponse(false, 'Invalid email or password')
      );
    }

    // Update last active
    user.analytics.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(
      formatResponse(true, 'Login successful', {
        user: userResponse,
        token
      })
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(
      formatResponse(false, 'Login failed')
    );
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('plan')
      .select('-password');

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    res.json(
      formatResponse(true, 'User data retrieved successfully', { user })
    );
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get user data')
    );
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).populate('plan').select('-password');

    res.json(
      formatResponse(true, 'Profile updated successfully', { user })
    );
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update profile')
    );
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json(
        formatResponse(false, 'Current password and new password are required')
      );
    }

    if (newPassword.length < 6) {
      return res.status(400).json(
        formatResponse(false, 'New password must be at least 6 characters long')
      );
    }

    // Get user with password
    const user = await User.findById(userId);
    
    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json(
        formatResponse(false, 'Current password is incorrect')
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);
    
    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json(
      formatResponse(true, 'Password changed successfully')
    );
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to change password')
    );
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Update last active time
    await User.findByIdAndUpdate(req.user._id, {
      'analytics.lastActive': new Date()
    });

    res.json(
      formatResponse(true, 'Logged out successfully')
    );
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(
      formatResponse(false, 'Logout failed')
    );
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json(
        formatResponse(false, 'Email is required')
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json(
        formatResponse(true, 'If an account with that email exists, a password reset link has been sent')
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token and set expiry (1 hour)
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    // Create reset URL
    const resetURL = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

    // Email content
    const message = `
      You are receiving this email because you (or someone else) has requested a password reset for your account.

      Please click on the following link to reset your password:
      ${resetURL}

      If you did not request this, please ignore this email and your password will remain unchanged.

      This link will expire in 1 hour.
    `;

    try {
      // In a real application, you would send an email here
      // For now, we'll just log it to console for development
      console.log('Password reset email would be sent to:', email);
      console.log('Reset URL:', resetURL);
      console.log('Message:', message);

      // TODO: Implement actual email sending
      // await sendEmail({
      //   email: user.email,
      //   subject: 'Password Reset Request',
      //   message
      // });

      res.json(
        formatResponse(true, 'Password reset link has been sent to your email')
      );
    } catch (emailError) {
      console.error('Email sending error:', emailError);

      // Clear reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.status(500).json(
        formatResponse(false, 'Email could not be sent. Please try again later.')
      );
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to process password reset request')
    );
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    // Validate input
    if (!token || !password) {
      return res.status(400).json(
        formatResponse(false, 'Token and new password are required')
      );
    }

    if (password.length < 6) {
      return res.status(400).json(
        formatResponse(false, 'Password must be at least 6 characters long')
      );
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json(
        formatResponse(false, 'Invalid or expired password reset token')
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json(
      formatResponse(true, 'Password has been reset successfully')
    );
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to reset password')
    );
  }
});

// @route   POST /api/auth/admin/login
// @desc    Admin login
// @access  Public
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json(
        formatResponse(false, 'Email and password are required')
      );
    }

    // Check admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@promptify.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (email.toLowerCase().trim() === adminEmail.toLowerCase() && password === adminPassword) {
      // Create admin user object
      const adminUser = {
        _id: 'admin-1',
        id: 'admin-1',
        name: 'Admin User',
        email: adminEmail,
        role: 'admin',
        isActive: true,
        subscription: {
          plan: 'Admin',
          status: 'active'
        },
        usage: {
          playgroundSessions: {
            current: 0,
            limit: 999999
          },
          promptsCreated: 0
        },
        analytics: {
          lastActive: new Date()
        }
      };

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: adminUser._id,
          email: adminUser.email,
          role: adminUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.json(
        formatResponse(true, 'Admin login successful', {
          token,
          user: adminUser
        })
      );
    } else {
      return res.status(401).json(
        formatResponse(false, 'Invalid admin credentials')
      );
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json(
      formatResponse(false, 'Admin login failed', { error: error.message })
    );
  }
});

// @route   GET /api/auth/userInfo
// @desc    Get current user info (works for both regular users and admin)
// @access  Private
router.get('/userInfo', authenticateToken, async (req, res) => {
  try {
    // Handle admin user
    if (req.user.role === 'admin') {
      const adminUser = {
        _id: req.user.userId || req.user._id,
        id: req.user.userId || req.user._id,
        name: 'Admin User',
        email: req.user.email,
        role: 'admin',
        isActive: true,
        subscription: {
          plan: 'Admin',
          status: 'active'
        },
        usage: {
          playgroundSessions: {
            current: 0,
            limit: 999999
          },
          promptsCreated: 0
        },
        analytics: {
          lastActive: new Date()
        }
      };

      return res.json(
        formatResponse(true, 'Admin user info retrieved successfully', { user: adminUser })
      );
    }

    // Handle regular user
    const user = await User.findById(req.user._id)
      .populate('plan')
      .select('-password');

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    res.json(
      formatResponse(true, 'User info retrieved successfully', { user })
    );
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get user info')
    );
  }
});

// @route   GET /api/auth/admin/userInfo
// @desc    Get admin user info
// @access  Private (Admin)
router.get('/admin/userInfo', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, 'Access denied. Admin role required.')
      );
    }

    // Return admin user info
    const adminUser = {
      _id: req.user.userId,
      id: req.user.userId,
      name: 'Admin User',
      email: req.user.email,
      role: 'admin',
      isActive: true,
      subscription: {
        plan: 'Admin',
        status: 'active'
      },
      usage: {
        playgroundSessions: {
          current: 0,
          limit: 999999
        },
        promptsCreated: 0
      },
      analytics: {
        lastActive: new Date()
      }
    };

    res.json(
      formatResponse(true, 'Admin user info retrieved successfully', { user: adminUser })
    );
  } catch (error) {
    console.error('Get admin user info error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get admin user info')
    );
  }
});

export default router;
