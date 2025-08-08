import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    unique: true,
    minlength: [2, 'Plan name must be at least 2 characters'],
    maxlength: [50, 'Plan name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Plan description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  price: {
    monthly: {
      type: Number,
      required: [true, 'Monthly price is required'],
      min: [0, 'Price cannot be negative']
    },
    yearly: {
      type: Number,
      min: [0, 'Price cannot be negative']
    }
  },
  features: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    included: {
      type: Boolean,
      default: true
    }
  }],
  limits: {
    playgroundSessions: {
      type: Number,
      default: -1, // -1 means unlimited
      min: [-1, 'Sessions limit cannot be less than -1']
    },
    promptsPerMonth: {
      type: Number,
      default: -1, // -1 means unlimited
      min: [-1, 'Prompts limit cannot be less than -1']
    },
    teamMembers: {
      type: Number,
      default: 1,
      min: [1, 'Team members must be at least 1']
    },
    apiCalls: {
      type: Number,
      default: -1, // -1 means unlimited
      min: [-1, 'API calls limit cannot be less than -1']
    },
    storageGB: {
      type: Number,
      default: 1,
      min: [0, 'Storage cannot be negative']
    }
  },
  permissions: {
    accessPremiumPrompts: { type: Boolean, default: false },
    createPaidPrompts: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false },
    customIntegrations: { type: Boolean, default: false }
  },
  metadata: {
    color: {
      type: String,
      default: '#3B82F6' // Blue color
    },
    icon: {
      type: String,
      default: 'zap'
    },
    popular: { type: Boolean, default: false },
    recommended: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  },
  billing: {
    razorpayPlanId: {
      monthly: String,
      yearly: String
    },
    trialDays: {
      type: Number,
      default: 0,
      min: [0, 'Trial days cannot be negative']
    },
    setupFee: {
      type: Number,
      default: 0,
      min: [0, 'Setup fee cannot be negative']
    }
  },
  analytics: {
    totalSubscribers: { type: Number, default: 0 },
    activeSubscribers: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAdminCreated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for yearly discount percentage
planSchema.virtual('yearlyDiscount').get(function() {
  if (!this.price.yearly || !this.price.monthly) return 0;
  const monthlyYearly = this.price.monthly * 12;
  return Math.round(((monthlyYearly - this.price.yearly) / monthlyYearly) * 100);
});

// Virtual for effective monthly price when paid yearly
planSchema.virtual('effectiveMonthlyPrice').get(function() {
  if (!this.price.yearly) return this.price.monthly;
  return (this.price.yearly / 12).toFixed(2);
});

// Indexes for better query performance
planSchema.index({ isActive: 1, isVisible: 1 });
planSchema.index({ 'metadata.order': 1 });
planSchema.index({ 'metadata.popular': 1 });
planSchema.index({ price: 1 });

// Static method to get all active plans
planSchema.statics.getActivePlans = function() {
  return this.find({ isActive: true, isVisible: true })
    .sort({ 'metadata.order': 1, 'price.monthly': 1 });
};

// Static method to get popular plan
planSchema.statics.getPopularPlan = function() {
  return this.findOne({ 
    isActive: true, 
    isVisible: true, 
    'metadata.popular': true 
  });
};

// Method to check if plan has feature
planSchema.methods.hasFeature = function(featureName) {
  return this.features.some(feature => 
    feature.name.toLowerCase() === featureName.toLowerCase() && feature.included
  );
};

// Method to check if plan has permission
planSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Method to increment subscriber count
planSchema.methods.addSubscriber = function() {
  this.analytics.totalSubscribers += 1;
  this.analytics.activeSubscribers += 1;
  return this.save();
};

// Method to decrement active subscriber count
planSchema.methods.removeSubscriber = function() {
  this.analytics.activeSubscribers = Math.max(0, this.analytics.activeSubscribers - 1);
  return this.save();
};

export default mongoose.model('Plan', planSchema);
