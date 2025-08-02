import express from 'express';
import User from '../models/User.js';
import Prompt from '../models/Prompt.js';
import { authenticateToken } from '../middlewares/auth.js';
import { formatResponse, calculatePagination } from '../utils/helpers.js';

const router = express.Router();

// @route   GET /api/user/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's prompts with analytics
    const userPrompts = await Prompt.find({ author: userId })
      .select('title category status analytics createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate user analytics
    const totalViews = userPrompts.reduce((sum, prompt) => sum + prompt.analytics.views, 0);
    const totalLikes = userPrompts.reduce((sum, prompt) => sum + prompt.analytics.likes, 0);
    const totalRevenue = userPrompts.reduce((sum, prompt) => sum + prompt.analytics.revenue, 0);
    const publishedPrompts = userPrompts.filter(p => p.status === 'published').length;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPrompts = await Prompt.find({
      author: userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).countDocuments();

    const dashboardData = {
      analytics: {
        totalViews,
        totalLikes,
        totalRevenue,
        publishedPrompts,
        recentPrompts
      },
      prompts: userPrompts,
      usage: {
        playgroundSessions: req.user.usage.playgroundSessions,
        plan: req.user.plan
      }
    };

    res.json(
      formatResponse(true, 'Dashboard data retrieved successfully', dashboardData)
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get dashboard data')
    );
  }
});

// @route   GET /api/user/prompts
// @desc    Get user's prompts
// @access  Private
router.get('/prompts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status, category } = req.query;
    const { page: pageNum, limit: limitNum, skip } = calculatePagination(page, limit);

    // Build query
    const query = { author: userId };
    if (status) query.status = status;
    if (category) query.category = category;

    // Get prompts with pagination
    const prompts = await Prompt.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('author', 'name email');

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
    console.error('Get prompts error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get prompts')
    );
  }
});

// @route   GET /api/user/analytics
// @desc    Get user analytics
// @access  Private
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    // Calculate date range based on period
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

    // Get prompts analytics for the period
    const promptsAnalytics = await Prompt.aggregate([
      {
        $match: {
          author: userId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$analytics.views' },
          totalDownloads: { $sum: '$analytics.downloads' },
          totalLikes: { $sum: '$analytics.likes' },
          totalRevenue: { $sum: '$analytics.revenue' },
          averageRating: { $avg: '$analytics.rating.average' },
          totalPrompts: { $sum: 1 }
        }
      }
    ]);

    // Get daily breakdown
    const dailyAnalytics = await Prompt.aggregate([
      {
        $match: {
          author: userId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          views: { $sum: '$analytics.views' },
          downloads: { $sum: '$analytics.downloads' },
          likes: { $sum: '$analytics.likes' },
          revenue: { $sum: '$analytics.revenue' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const analytics = promptsAnalytics[0] || {
      totalViews: 0,
      totalDownloads: 0,
      totalLikes: 0,
      totalRevenue: 0,
      averageRating: 0,
      totalPrompts: 0
    };

    res.json(
      formatResponse(true, 'Analytics retrieved successfully', {
        summary: analytics,
        daily: dailyAnalytics,
        period
      })
    );
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get analytics')
    );
  }
});

// @route   GET /api/user/usage
// @desc    Get user usage statistics
// @access  Private
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('plan');
    
    const usage = {
      playgroundSessions: user.usage.playgroundSessions,
      promptsCreated: user.usage.promptsCreated,
      promptsDownloaded: user.usage.promptsDownloaded,
      plan: user.plan,
      subscription: user.subscription,
      canUsePlayground: user.canUsePlayground()
    };

    res.json(
      formatResponse(true, 'Usage data retrieved successfully', usage)
    );
  } catch (error) {
    console.error('Usage error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get usage data')
    );
  }
});

// @route   POST /api/user/increment-usage
// @desc    Increment user usage (playground sessions)
// @access  Private
router.post('/increment-usage', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body;
    const user = await User.findById(req.user._id);

    if (type === 'playground') {
      if (!user.canUsePlayground()) {
        return res.status(403).json(
          formatResponse(false, 'Playground session limit reached')
        );
      }
      await user.incrementPlaygroundUsage();
    }

    res.json(
      formatResponse(true, 'Usage updated successfully')
    );
  } catch (error) {
    console.error('Increment usage error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update usage')
    );
  }
});

export default router;
