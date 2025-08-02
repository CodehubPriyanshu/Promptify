import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  users: {
    total: { type: Number, default: 0 },
    new: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    premium: { type: Number, default: 0 }
  },
  prompts: {
    total: { type: Number, default: 0 },
    published: { type: Number, default: 0 },
    free: { type: Number, default: 0 },
    premium: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 }
  },
  playground: {
    sessions: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    averageSessionTime: { type: Number, default: 0 }, // in minutes
    totalMessages: { type: Number, default: 0 }
  },
  revenue: {
    total: { type: Number, default: 0 },
    subscriptions: { type: Number, default: 0 },
    promptSales: { type: Number, default: 0 },
    refunds: { type: Number, default: 0 }
  },
  traffic: {
    pageViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 }, // percentage
    averageSessionDuration: { type: Number, default: 0 }, // in minutes
    topPages: [{
      path: String,
      views: Number
    }]
  },
  engagement: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    ratings: {
      total: { type: Number, default: 0 },
      average: { type: Number, default: 0 }
    }
  },
  conversion: {
    signups: { type: Number, default: 0 },
    subscriptions: { type: Number, default: 0 },
    rate: { type: Number, default: 0 } // percentage
  }
}, {
  timestamps: true
});

// Indexes for better query performance
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ 'users.total': -1 });
analyticsSchema.index({ 'revenue.total': -1 });

// Static method to get analytics for date range
analyticsSchema.statics.getDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ date: 1 });
};

// Static method to get latest analytics
analyticsSchema.statics.getLatest = function() {
  return this.findOne().sort({ date: -1 });
};

// Static method to aggregate monthly data
analyticsSchema.statics.getMonthlyData = function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: '$users.total' },
        newUsers: { $sum: '$users.new' },
        totalRevenue: { $sum: '$revenue.total' },
        totalSessions: { $sum: '$playground.sessions' },
        totalViews: { $sum: '$prompts.views' },
        totalDownloads: { $sum: '$prompts.downloads' }
      }
    }
  ]);
};

export default mongoose.model('Analytics', analyticsSchema);

// Session tracking schema for real-time analytics
const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['playground', 'marketplace', 'dashboard'],
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // in seconds
  actions: [{
    type: {
      type: String,
      enum: ['view', 'click', 'download', 'like', 'share', 'create', 'edit', 'delete']
    },
    target: String, // prompt ID, page name, etc.
    timestamp: { type: Date, default: Date.now }
  }],
  metadata: {
    userAgent: String,
    ip: String,
    referrer: String,
    device: String,
    browser: String,
    os: String
  }
}, {
  timestamps: true
});

sessionSchema.index({ user: 1, startTime: -1 });
// sessionId already indexed via unique: true
sessionSchema.index({ type: 1, startTime: -1 });

export const Session = mongoose.model('Session', sessionSchema);
