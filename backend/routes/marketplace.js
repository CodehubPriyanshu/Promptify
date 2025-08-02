import express from 'express';
import Prompt from '../models/Prompt.js';
import User from '../models/User.js';
import { authenticateToken, optionalAuth } from '../middlewares/auth.js';
import { validatePromptCreation } from '../middlewares/validation.js';
import { formatResponse, calculatePagination } from '../utils/helpers.js';

const router = express.Router();

// @route   GET /api/marketplace/prompts
// @desc    Get marketplace prompts
// @access  Public
router.get('/prompts', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      type = 'all',
      sort = 'latest' 
    } = req.query;
    
    const { page: pageNum, limit: limitNum, skip } = calculatePagination(page, limit);

    // Build query
    const query = { 
      status: 'published',
      visibility: 'public'
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (type === 'free') {
      query.type = 'free';
    } else if (type === 'premium') {
      query.type = 'premium';
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortQuery = {};
    switch (sort) {
      case 'popular':
        sortQuery = { 'analytics.views': -1, 'analytics.downloads': -1 };
        break;
      case 'rating':
        sortQuery = { 'analytics.rating.average': -1 };
        break;
      case 'price_low':
        sortQuery = { price: 1 };
        break;
      case 'price_high':
        sortQuery = { price: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    // Get prompts
    const prompts = await Prompt.find(query)
      .populate('author', 'name avatar')
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .select('-content'); // Don't send full content in list

    const total = await Prompt.countDocuments(query);

    // Increment views for each prompt (async, don't wait)
    prompts.forEach(prompt => {
      Prompt.findByIdAndUpdate(prompt._id, {
        $inc: { 'analytics.views': 1 }
      }).exec();
    });

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
    console.error('Get marketplace prompts error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get prompts')
    );
  }
});

// @route   GET /api/marketplace/prompts/:id
// @desc    Get single prompt details
// @access  Public
router.get('/prompts/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const prompt = await Prompt.findById(id)
      .populate('author', 'name avatar analytics')
      .populate('reviews.user', 'name avatar');

    if (!prompt) {
      return res.status(404).json(
        formatResponse(false, 'Prompt not found')
      );
    }

    // Check if user can access this prompt
    if (prompt.status !== 'published' || prompt.visibility !== 'public') {
      // Only author or admin can access unpublished prompts
      if (!req.user || (req.user._id.toString() !== prompt.author._id.toString() && req.user.role !== 'admin')) {
        return res.status(403).json(
          formatResponse(false, 'Access denied')
        );
      }
    }

    // Increment view count
    await prompt.incrementViews();

    res.json(
      formatResponse(true, 'Prompt retrieved successfully', { prompt })
    );
  } catch (error) {
    console.error('Get prompt error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get prompt')
    );
  }
});

// @route   POST /api/marketplace/prompts
// @desc    Create new prompt
// @access  Private
router.post('/prompts', authenticateToken, validatePromptCreation, async (req, res) => {
  try {
    const { title, description, content, category, tags, isPaid, price } = req.body;

    const prompt = new Prompt({
      title,
      description,
      content,
      category,
      tags: Array.isArray(tags) ? tags : tags?.split(',').map(tag => tag.trim()) || [],
      author: req.user._id,
      type: isPaid ? 'premium' : 'free',
      price: isPaid ? price : 0,
      status: 'published' // Auto-publish for now, can add review process later
    });

    await prompt.save();

    // Update user's prompt count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'usage.promptsCreated': 1 }
    });

    const populatedPrompt = await Prompt.findById(prompt._id)
      .populate('author', 'name avatar');

    res.status(201).json(
      formatResponse(true, 'Prompt created successfully', { prompt: populatedPrompt })
    );
  } catch (error) {
    console.error('Create prompt error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create prompt')
    );
  }
});

// @route   PUT /api/marketplace/prompts/:id
// @desc    Update prompt
// @access  Private
router.put('/prompts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, category, tags, isPaid, price } = req.body;

    const prompt = await Prompt.findById(id);

    if (!prompt) {
      return res.status(404).json(
        formatResponse(false, 'Prompt not found')
      );
    }

    // Check if user owns this prompt or is admin
    if (prompt.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, 'Access denied')
      );
    }

    // Update fields
    if (title) prompt.title = title;
    if (description) prompt.description = description;
    if (content) prompt.content = content;
    if (category) prompt.category = category;
    if (tags) prompt.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    if (typeof isPaid === 'boolean') {
      prompt.type = isPaid ? 'premium' : 'free';
      prompt.price = isPaid ? price : 0;
    }

    await prompt.save();

    const updatedPrompt = await Prompt.findById(id)
      .populate('author', 'name avatar');

    res.json(
      formatResponse(true, 'Prompt updated successfully', { prompt: updatedPrompt })
    );
  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to update prompt')
    );
  }
});

// @route   DELETE /api/marketplace/prompts/:id
// @desc    Delete prompt
// @access  Private
router.delete('/prompts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const prompt = await Prompt.findById(id);

    if (!prompt) {
      return res.status(404).json(
        formatResponse(false, 'Prompt not found')
      );
    }

    // Check if user owns this prompt or is admin
    if (prompt.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, 'Access denied')
      );
    }

    await Prompt.findByIdAndDelete(id);

    res.json(
      formatResponse(true, 'Prompt deleted successfully')
    );
  } catch (error) {
    console.error('Delete prompt error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to delete prompt')
    );
  }
});

// @route   POST /api/marketplace/prompts/:id/like
// @desc    Like/unlike a prompt
// @access  Private
router.post('/prompts/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const prompt = await Prompt.findById(id);

    if (!prompt) {
      return res.status(404).json(
        formatResponse(false, 'Prompt not found')
      );
    }

    // For simplicity, just increment likes (in real app, track user likes)
    await prompt.addLike();

    res.json(
      formatResponse(true, 'Prompt liked successfully', { 
        likes: prompt.analytics.likes 
      })
    );
  } catch (error) {
    console.error('Like prompt error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to like prompt')
    );
  }
});

// @route   GET /api/marketplace/categories
// @desc    Get available categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'writing', label: 'Writing', count: 0 },
      { value: 'development', label: 'Development', count: 0 },
      { value: 'marketing', label: 'Marketing', count: 0 },
      { value: 'education', label: 'Education', count: 0 },
      { value: 'business', label: 'Business', count: 0 },
      { value: 'analytics', label: 'Analytics', count: 0 }
    ];

    // Get counts for each category
    const categoryCounts = await Prompt.aggregate([
      { $match: { status: 'published', visibility: 'public' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Update counts
    categoryCounts.forEach(({ _id, count }) => {
      const category = categories.find(cat => cat.value === _id);
      if (category) category.count = count;
    });

    res.json(
      formatResponse(true, 'Categories retrieved successfully', { categories })
    );
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get categories')
    );
  }
});

export default router;
