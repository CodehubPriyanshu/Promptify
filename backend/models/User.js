import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    default: null
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'inactive'
    },
    startDate: Date,
    endDate: Date,
    razorpaySubscriptionId: String,
    razorpayCustomerId: String
  },
  usage: {
    playgroundSessions: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 10 },
      resetDate: { type: Date, default: Date.now }
    },
    promptsCreated: { type: Number, default: 0 },
    promptsDownloaded: { type: Number, default: 0 }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    }
  },
  analytics: {
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's prompts
userSchema.virtual('prompts', {
  ref: 'Prompt',
  localField: '_id',
  foreignField: 'author'
});

// Virtual for full name (if needed later)
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Index for better query performance (email already indexed via unique: true)
userSchema.index({ role: 1 });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to reset usage monthly
userSchema.pre('save', function(next) {
  const now = new Date();
  const resetDate = new Date(this.usage.playgroundSessions.resetDate);
  
  // Reset monthly usage if a month has passed
  if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    this.usage.playgroundSessions.current = 0;
    this.usage.playgroundSessions.resetDate = now;
  }
  
  next();
});

// Method to check if user can use playground
userSchema.methods.canUsePlayground = function() {
  if (this.subscription.status === 'active') {
    return true; // Premium users have unlimited access
  }
  return this.usage.playgroundSessions.current < this.usage.playgroundSessions.limit;
};

// Method to increment playground usage
userSchema.methods.incrementPlaygroundUsage = function() {
  if (this.subscription.status !== 'active') {
    this.usage.playgroundSessions.current += 1;
  }
  this.analytics.lastActive = new Date();
  return this.save();
};

export default mongoose.model('User', userSchema);
