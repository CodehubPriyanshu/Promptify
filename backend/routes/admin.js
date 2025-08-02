import express from 'express';
import User from '../models/User.js';
import Prompt from '../models/Prompt.js';
import Plan from '../models/Plan.js';
import Payment from '../models/Payment.js';
import Analytics from '../models/Analytics.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { validatePlanCreation, validatePromptCreation } from '../middlewares/validation.js';
import { formatResponse, calculatePagination, calculateGrowth } from '../utils/helpers.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken, requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard overview
// @access  Admin
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get current period stats
    const currentStats = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ 'subscription.status': 'active' }),
      Prompt.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Payment.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Get previous period stats for comparison
    const previousStats = await Promise.all([
      User.countDocuments({ 
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
      }),
      Payment.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const dashboard = {
      users: {
        total: await User.countDocuments(),
        new: currentStats[0],
        premium: currentStats[1],
        growth: calculateGrowth(currentStats[0], previousStats[0])
      },
      prompts: {
        total: await Prompt.countDocuments(),
        published: await Prompt.countDocuments({ status: 'published' }),
        pending: await Prompt.countDocuments({ status: 'draft' }),
        new: currentStats[2]
      },
      revenue: {
        total: currentStats[3][0]?.total || 0,
        previous: previousStats[1][0]?.total || 0,
        growth: calculateGrowth(
          currentStats[3][0]?.total || 0,
          previousStats[1][0]?.total || 0
        )
      },
      analytics: {
        totalViews: await Prompt.aggregate([
          { $group: { _id: null, total: { $sum: '$analytics.views' } } }
        ]).then(result => result[0]?.total || 0),
        totalDownloads: await Prompt.aggregate([
          { $group: { _id: null, total: { $sum: '$analytics.downloads' } } }
        ]).then(result => result[0]?.total || 0)
      }
    };

    res.json(
      formatResponse(true, 'Dashboard data retrieved successfully', dashboard)
    );
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get dashboard data')
    );
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const { page: pageNum, limit: limitNum, skip } = calculatePagination(page, limit);

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';

    const users = await User.find(query)
      .populate('plan', 'name price')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.json(
      formatResponse(true, 'Users retrieved successfully', {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      })
    );
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get users')
    );
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (role, status, etc.)
// @access  Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive, plan } = req.body;

    const updateData = {};
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (plan) updateData.plan = plan;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('plan').select('-password');

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    res.json(
      formatResponse(true, 'User updated successfully', { user })
    );
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update user')
    );
  }
});

// @route   GET /api/admin/prompts
// @desc    Get all prompts for admin management
// @access  Admin
router.get('/prompts', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const { page: pageNum, limit: limitNum, skip } = calculatePagination(page, limit);

    // Build query
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const prompts = await Prompt.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Prompt.countDocuments(query);

    res.json(
      formatResponse(true, 'Prompts retrieved successfully', {
        prompts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      })
    );
  } catch (error) {
    console.error('Get admin prompts error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get prompts')
    );
  }
});

// @route   POST /api/admin/prompts
// @desc    Create marketplace prompt (admin)
// @access  Admin
router.post('/prompts', validatePromptCreation, async (req, res) => {
  try {
    const { title, description, content, category, tags, type, price } = req.body;

    const prompt = new Prompt({
      title,
      description,
      content,
      category,
      tags: Array.isArray(tags) ? tags : tags?.split(',').map(tag => tag.trim()) || [],
      author: req.user._id, // Admin is the author
      type: type || 'free',
      price: type === 'premium' ? price : 0,
      status: 'published',
      adminNotes: {
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        notes: 'Created by admin'
      }
    });

    await prompt.save();

    const populatedPrompt = await Prompt.findById(prompt._id)
      .populate('author', 'name email');

    res.status(201).json(
      formatResponse(true, 'Prompt created successfully', { prompt: populatedPrompt })
    );
  } catch (error) {
    console.error('Create admin prompt error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create prompt')
    );
  }
});

// @route   PUT /api/admin/prompts/:id
// @desc    Update prompt status/details
// @access  Admin
router.put('/prompts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, featured, trending, rejectionReason } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (typeof featured === 'boolean') updateData['metadata.featured'] = featured;
    if (typeof trending === 'boolean') updateData['metadata.trending'] = trending;

    // Add admin notes
    updateData['adminNotes.reviewedBy'] = req.user._id;
    updateData['adminNotes.reviewedAt'] = new Date();
    if (rejectionReason) updateData['adminNotes.rejectionReason'] = rejectionReason;

    const prompt = await Prompt.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('author', 'name email');

    if (!prompt) {
      return res.status(404).json(
        formatResponse(false, 'Prompt not found')
      );
    }

    res.json(
      formatResponse(true, 'Prompt updated successfully', { prompt })
    );
  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update prompt')
    );
  }
});

// @route   GET /api/admin/plans
// @desc    Get all subscription plans
// @access  Admin
router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find().sort({ 'metadata.order': 1 });

    res.json(
      formatResponse(true, 'Plans retrieved successfully', { plans })
    );
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get plans')
    );
  }
});

// @route   POST /api/admin/plans
// @desc    Create new subscription plan
// @access  Admin
router.post('/plans', validatePlanCreation, async (req, res) => {
  try {
    const planData = req.body;

    const plan = new Plan(planData);
    await plan.save();

    res.status(201).json(
      formatResponse(true, 'Plan created successfully', { plan })
    );
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create plan')
    );
  }
});

// @route   PUT /api/admin/plans/:id
// @desc    Update subscription plan
// @access  Admin
router.put('/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const plan = await Plan.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json(
        formatResponse(false, 'Plan not found')
      );
    }

    res.json(
      formatResponse(true, 'Plan updated successfully', { plan })
    );
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update plan')
    );
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Admin
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get analytics data
    const analytics = await Analytics.getDateRange(startDate, endDate);

    // Get revenue breakdown
    const revenueData = await Payment.getRevenueByDateRange(startDate, endDate);

    // Get user growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(
      formatResponse(true, 'Analytics retrieved successfully', {
        analytics,
        revenue: revenueData[0] || { totalRevenue: 0, subscriptionRevenue: 0, promptRevenue: 0 },
        userGrowth,
        period
      })
    );
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get analytics')
    );
  }
});

// @route   GET /api/admin/payments
// @desc    Get payment transactions
// @access  Admin
router.get('/payments', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const { page: pageNum, limit: limitNum, skip } = calculatePagination(page, limit);

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('plan', 'name')
      .populate('prompt', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Payment.countDocuments(query);

    res.json(
      formatResponse(true, 'Payments retrieved successfully', {
        payments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      })
    );
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get payments')
    );
  }
});

// @route   GET /api/admin/recent-activity
// @desc    Get recent platform activity
// @access  Admin
router.get('/recent-activity', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = Math.min(parseInt(limit), 50); // Max 50 items

    // Get recent activities from different collections
    const [recentUsers, recentPrompts, recentPayments] = await Promise.all([
      // Recent user registrations
      User.find()
        .select('name email createdAt subscription.plan')
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limitNum / 3)),

      // Recent prompt submissions
      Prompt.find()
        .populate('author', 'name')
        .select('title author createdAt status category')
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limitNum / 3)),

      // Recent payments/upgrades
      Payment.find({ status: 'completed' })
        .populate('user', 'name email')
        .populate('plan', 'name')
        .select('user plan amount createdAt')
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limitNum / 3))
    ]);

    // Combine and format activities
    const activities = [];

    // Add user registrations
    recentUsers.forEach(user => {
      activities.push({
        id: user._id,
        type: 'user_registration',
        title: 'New User Registration',
        description: `${user.name} joined the platform`,
        user: {
          name: user.name,
          email: user.email,
          plan: user.subscription?.plan || 'Free'
        },
        timestamp: user.createdAt,
        icon: 'user-plus'
      });
    });

    // Add prompt submissions
    recentPrompts.forEach(prompt => {
      activities.push({
        id: prompt._id,
        type: 'prompt_submission',
        title: 'New Prompt Submitted',
        description: `"${prompt.title}" by ${prompt.author?.name || 'Unknown'}`,
        prompt: {
          title: prompt.title,
          category: prompt.category,
          status: prompt.status
        },
        user: {
          name: prompt.author?.name || 'Unknown'
        },
        timestamp: prompt.createdAt,
        icon: 'file-text'
      });
    });

    // Add plan upgrades
    recentPayments.forEach(payment => {
      activities.push({
        id: payment._id,
        type: 'plan_upgrade',
        title: 'Plan Upgrade',
        description: `${payment.user?.name || 'User'} upgraded to ${payment.plan?.name || 'Premium'}`,
        user: {
          name: payment.user?.name || 'Unknown',
          email: payment.user?.email
        },
        payment: {
          plan: payment.plan?.name || 'Premium',
          amount: payment.amount
        },
        timestamp: payment.createdAt,
        icon: 'credit-card'
      });
    });

    // Sort by timestamp and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limitNum);

    res.json(
      formatResponse(true, 'Recent activity retrieved successfully', sortedActivities)
    );
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get recent activity')
    );
  }
});

export default router;
