import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Payment from '../models/Payment.js';
import { authenticateToken } from '../middlewares/auth.js';
import { formatResponse } from '../utils/helpers.js';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id_12345',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_key_for_development'
});

// @route   GET /api/payment/plans
// @desc    Get available subscription plans
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.getActivePlans();

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

// @route   POST /api/payment/create-order
// @desc    Create Razorpay order for subscription
// @access  Private
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { planId, billing = 'monthly' } = req.body;
    const userId = req.user._id;

    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json(
        formatResponse(false, 'Plan not found or inactive')
      );
    }

    // Calculate amount based on billing cycle
    const amount = billing === 'yearly' ? plan.price.yearly : plan.price.monthly;
    
    if (!amount || amount <= 0) {
      return res.status(400).json(
        formatResponse(false, 'Invalid plan pricing')
      );
    }

    // Create Razorpay order
    const orderOptions = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        planId: planId.toString(),
        userId: userId.toString(),
        billing
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    // Create payment record
    const payment = new Payment({
      user: userId,
      type: 'subscription',
      plan: planId,
      amount,
      currency: 'INR',
      status: 'pending',
      razorpay: {
        orderId: order.id
      },
      billing: {
        period: billing,
        startDate: new Date(),
        endDate: new Date(Date.now() + (billing === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
      },
      metadata: {
        description: `${plan.name} - ${billing} subscription`
      }
    });

    await payment.save();

    res.json(
      formatResponse(true, 'Order created successfully', {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id
      })
    );
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to create order')
    );
  }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      paymentId 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json(
        formatResponse(false, 'Invalid payment signature')
      );
    }

    // Update payment record
    const payment = await Payment.findById(paymentId)
      .populate('plan')
      .populate('user');

    if (!payment) {
      return res.status(404).json(
        formatResponse(false, 'Payment record not found')
      );
    }

    // Mark payment as completed
    await payment.markCompleted({
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    // Update user subscription
    const user = payment.user;
    user.plan = payment.plan._id;
    user.subscription = {
      status: 'active',
      startDate: payment.billing.startDate,
      endDate: payment.billing.endDate,
      razorpaySubscriptionId: razorpay_payment_id
    };

    await user.save();

    // Update plan analytics
    await payment.plan.addSubscriber();

    res.json(
      formatResponse(true, 'Payment verified successfully', {
        subscription: user.subscription,
        plan: payment.plan
      })
    );
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json(
      formatResponse(false, 'Payment verification failed')
    );
  }
});

// @route   POST /api/payment/webhook
// @desc    Handle Razorpay webhooks
// @access  Public (but verified)
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @route   POST /api/payment/cancel-subscription
// @desc    Cancel user subscription
// @access  Private
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { reason } = req.body;

    const user = await User.findById(userId).populate('plan');
    
    if (user.subscription.status !== 'active') {
      return res.status(400).json(
        formatResponse(false, 'No active subscription found')
      );
    }

    // Update user subscription status
    user.subscription.status = 'cancelled';
    await user.save();

    // Update plan analytics
    if (user.plan) {
      await user.plan.removeSubscriber();
    }

    // Create cancellation record (optional)
    const payment = new Payment({
      user: userId,
      type: 'subscription',
      plan: user.plan?._id,
      amount: 0,
      status: 'cancelled',
      metadata: {
        description: 'Subscription cancellation',
        cancelReason: reason
      }
    });

    await payment.save();

    res.json(
      formatResponse(true, 'Subscription cancelled successfully')
    );
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json(
      formatResponse(false, 'Failed to cancel subscription')
    );
  }
});

// Helper functions for webhook handling
async function handlePaymentCaptured(payment) {
  try {
    const paymentRecord = await Payment.findOne({
      'razorpay.orderId': payment.order_id
    });

    if (paymentRecord) {
      await paymentRecord.markCompleted({
        paymentId: payment.id
      });
    }
  } catch (error) {
    console.error('Handle payment captured error:', error);
  }
}

async function handlePaymentFailed(payment) {
  try {
    const paymentRecord = await Payment.findOne({
      'razorpay.orderId': payment.order_id
    });

    if (paymentRecord) {
      await paymentRecord.markFailed(payment.error_description);
    }
  } catch (error) {
    console.error('Handle payment failed error:', error);
  }
}

async function handleSubscriptionCancelled(subscription) {
  try {
    const user = await User.findOne({
      'subscription.razorpaySubscriptionId': subscription.id
    });

    if (user) {
      user.subscription.status = 'cancelled';
      await user.save();
    }
  } catch (error) {
    console.error('Handle subscription cancelled error:', error);
  }
}

export default router;
