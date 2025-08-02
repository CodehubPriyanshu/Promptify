import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['subscription', 'prompt_purchase', 'one_time'],
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  prompt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt'
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String,
    subscriptionId: String,
    customerId: String
  },
  billing: {
    period: {
      type: String,
      enum: ['monthly', 'yearly', 'one_time'],
      default: 'one_time'
    },
    startDate: Date,
    endDate: Date,
    nextBillingDate: Date
  },
  metadata: {
    description: String,
    invoice: {
      number: String,
      url: String
    },
    receipt: {
      number: String,
      url: String
    },
    tax: {
      amount: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    discount: {
      amount: { type: Number, default: 0 },
      code: String,
      percentage: { type: Number, default: 0 }
    }
  },
  refund: {
    amount: { type: Number, default: 0 },
    reason: String,
    refundId: String,
    refundedAt: Date,
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  failureReason: String,
  attempts: {
    type: Number,
    default: 0
  },
  webhookEvents: [{
    event: String,
    data: mongoose.Schema.Types.Mixed,
    receivedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ 'razorpay.orderId': 1 });
paymentSchema.index({ 'razorpay.paymentId': 1 });
paymentSchema.index({ 'razorpay.subscriptionId': 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for net amount (after tax and discount)
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.metadata.discount.amount + this.metadata.tax.amount;
});

// Static method to get revenue for date range
paymentSchema.statics.getRevenueByDateRange = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        subscriptionRevenue: {
          $sum: {
            $cond: [{ $eq: ['$type', 'subscription'] }, '$amount', 0]
          }
        },
        promptRevenue: {
          $sum: {
            $cond: [{ $eq: ['$type', 'prompt_purchase'] }, '$amount', 0]
          }
        },
        totalTransactions: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get monthly revenue
paymentSchema.statics.getMonthlyRevenue = function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return this.getRevenueByDateRange(startDate, endDate);
};

// Method to mark payment as completed
paymentSchema.methods.markCompleted = function(paymentDetails = {}) {
  this.status = 'completed';
  if (paymentDetails.paymentId) {
    this.razorpay.paymentId = paymentDetails.paymentId;
  }
  if (paymentDetails.signature) {
    this.razorpay.signature = paymentDetails.signature;
  }
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.attempts += 1;
  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = function(amount, reason, refundedBy) {
  this.status = 'refunded';
  this.refund.amount = amount || this.amount;
  this.refund.reason = reason;
  this.refund.refundedAt = new Date();
  this.refund.refundedBy = refundedBy;
  return this.save();
};

export default mongoose.model('Payment', paymentSchema);

// Subscription tracking schema
const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  razorpaySubscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['created', 'authenticated', 'active', 'paused', 'halted', 'cancelled', 'completed'],
    default: 'created'
  },
  currentPeriod: {
    start: Date,
    end: Date
  },
  billing: {
    cycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    nextBillingAt: Date
  },
  trial: {
    isActive: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date
  },
  cancelledAt: Date,
  cancelReason: String
}, {
  timestamps: true
});

subscriptionSchema.index({ user: 1 });
// razorpaySubscriptionId already indexed via unique: true
subscriptionSchema.index({ status: 1 });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
