import express from 'express';
import axios from 'axios';
import User from '../models/User.js';
import { Session } from '../models/Analytics.js';
import { authenticateToken } from '../middlewares/auth.js';
import { formatResponse, generateRandomString } from '../utils/helpers.js';
import aiManager from '../services/aiManager.js';

const router = express.Router();

// @route   POST /api/playground/chat
// @desc    Send message to AI and get response
// @access  Private
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, sessionId, model = 'claude' } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json(
        formatResponse(false, 'Message is required')
      );
    }

    // Check if user can use playground
    const user = await User.findById(userId);
    if (!user.canUsePlayground()) {
      return res.status(403).json(
        formatResponse(false, 'Playground session limit reached. Please upgrade your plan.')
      );
    }

    // Increment usage if not premium
    if (user.subscription.status !== 'active') {
      await user.incrementPlaygroundUsage();
    }

    // Use AI Manager for AI response
    let aiResponse;

    try {
      // Get AI response from selected model
      const aiResult = await aiManager.sendMessage(message, {
        model,
        sessionId,
        temperature: 0.7,
        maxTokens: 1000
      });

      if (!aiResult.success) {
        throw new Error(aiResult.error || 'Failed to get AI response');
      }

      aiResponse = {
        response: aiResult.response,
        sessionId: aiResult.sessionId,
        usage: aiResult.usage,
        model: aiResult.model,
        aiModel: aiResult.aiModel
      };

      // Update session ID if this is a new session
      const finalSessionId = aiResult.sessionId || sessionId;
    } catch (apiError) {
      console.error('AI API error:', apiError);
      aiResponse = "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment.";
    }

    // Track session
    if (finalSessionId) {
      await Session.findOneAndUpdate(
        { sessionId: finalSessionId, user: userId },
        {
          $push: {
            actions: {
              type: 'chat',
              target: 'playground',
              timestamp: new Date(),
              data: {
                message: message.substring(0, 100), // Store first 100 chars for reference
                responseLength: aiResponse.response ? aiResponse.response.length : 0,
                model: aiResponse.aiModel || 'unknown'
              }
            }
          },
          $setOnInsert: {
            type: 'playground',
            startTime: new Date()
          }
        },
        { upsert: true }
      );
    }

    res.json(
      formatResponse(true, 'Message processed successfully', {
        response: aiResponse,
        sessionId: finalSessionId,
        usage: {
          current: user.usage.playgroundSessions.current + (user.subscription.status !== 'active' ? 1 : 0),
          limit: user.usage.playgroundSessions.limit,
          unlimited: user.subscription.status === 'active'
        }
      })
    );
  } catch (error) {
    console.error('Playground chat error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to process message')
    );
  }
});

// @route   POST /api/playground/session/start
// @desc    Start a new playground session
// @access  Private
router.post('/session/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const sessionId = generateRandomString(32);

    // Create new session
    const session = new Session({
      user: userId,
      sessionId,
      type: 'playground',
      startTime: new Date(),
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    });

    await session.save();

    res.json(
      formatResponse(true, 'Session started successfully', { sessionId })
    );
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to start session')
    );
  }
});

// @route   POST /api/playground/session/end
// @desc    End a playground session
// @access  Private
router.post('/session/end', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;

    if (!sessionId) {
      return res.status(400).json(
        formatResponse(false, 'Session ID is required')
      );
    }

    // Update session end time
    const session = await Session.findOneAndUpdate(
      { sessionId, user: userId },
      {
        endTime: new Date(),
        $set: {
          duration: Math.floor((new Date() - new Date()) / 1000) // Will be calculated properly
        }
      }
    );

    if (!session) {
      return res.status(404).json(
        formatResponse(false, 'Session not found')
      );
    }

    res.json(
      formatResponse(true, 'Session ended successfully')
    );
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to end session')
    );
  }
});

// @route   GET /api/playground/sessions
// @desc    Get user's playground sessions
// @access  Private
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const sessions = await Session.find({
      user: userId,
      type: 'playground'
    })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('sessionId startTime endTime duration actions');

    const total = await Session.countDocuments({
      user: userId,
      type: 'playground'
    });

    res.json(
      formatResponse(true, 'Sessions retrieved successfully', {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      })
    );
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get sessions')
    );
  }
});

// @route   GET /api/playground/history
// @desc    Get user's playground history
// @access  Private
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const sessions = await Session.find({
      user: userId,
      type: 'playground'
    })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('sessionId startTime endTime duration actions');

    const total = await Session.countDocuments({
      user: userId,
      type: 'playground'
    });

    res.json(
      formatResponse(true, 'History retrieved successfully', {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      })
    );
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get history')
    );
  }
});

// @route   GET /api/playground/usage
// @desc    Get user's playground usage stats
// @access  Private
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('plan');
    
    const usage = {
      current: user.usage.playgroundSessions.current,
      limit: user.usage.playgroundSessions.limit,
      resetDate: user.usage.playgroundSessions.resetDate,
      unlimited: user.subscription.status === 'active',
      canUse: user.canUsePlayground(),
      plan: user.plan?.name || 'Free'
    };

    res.json(
      formatResponse(true, 'Usage retrieved successfully', usage)
    );
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get usage')
    );
  }
});

// Helper function to generate mock AI response
async function generateMockAIResponse(message) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const responses = [
    `Thank you for your message: "${message}". This is a simulated AI response to demonstrate the playground functionality. In a production environment, this would be connected to a real AI service like CatGPT.`,
    
    `I understand you're asking about: "${message}". Here's a thoughtful response: This playground allows you to test and refine your prompts in real-time. The AI integration would provide intelligent responses based on your input.`,
    
    `Regarding "${message}" - This is an example of how the AI would respond to your prompt. The system tracks your usage and provides analytics on your interactions.`,
    
    `Your prompt "${message}" is interesting! In a real implementation, this would be processed by an advanced AI model that could help with creative writing, code review, marketing copy, and much more.`,
    
    `Processing your input: "${message}". The Promptify platform is designed to help you create, test, and share amazing AI prompts. This response demonstrates the interactive nature of the playground.`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// @route   GET /api/playground/models
// @desc    Get available AI models
// @access  Private
router.get('/models', authenticateToken, async (req, res) => {
  try {
    const models = await aiManager.getAvailableModels();
    res.json(formatResponse(true, 'Models retrieved successfully', models));
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to get available models')
    );
  }
});

// @route   GET /api/playground/health
// @desc    Get AI services health status
// @access  Private
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const health = await aiManager.healthCheck();
    res.json(formatResponse(true, 'Health check completed', health));
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json(
      formatResponse(false, 'Health check failed')
    );
  }
});

export default router;
