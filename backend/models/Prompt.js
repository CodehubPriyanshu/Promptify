import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Prompt content is required'],
    trim: true,
    minlength: [10, 'Content must be at least 10 characters'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['writing', 'development', 'marketing', 'education', 'business', 'analytics'],
    lowercase: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'rejected'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },
  analytics: {
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    }
  },
  metadata: {
    slug: {
      type: String,
      unique: true,
      sparse: true
    },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    estimatedTime: String, // e.g., "5 minutes", "1 hour"
    language: {
      type: String,
      default: 'en'
    }
  },
  versions: [{
    version: { type: String, required: true },
    content: { type: String, required: true },
    changelog: String,
    createdAt: { type: Date, default: Date.now }
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    createdAt: { type: Date, default: Date.now }
  }],
  adminNotes: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    notes: String,
    rejectionReason: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
promptSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

// Virtual for total revenue
promptSchema.virtual('totalRevenue').get(function() {
  return this.analytics.revenue;
});

// Indexes for better query performance
promptSchema.index({ category: 1, status: 1 });
promptSchema.index({ author: 1, status: 1 });
promptSchema.index({ tags: 1 });
promptSchema.index({ 'metadata.featured': 1 });
promptSchema.index({ 'metadata.trending': 1 });
promptSchema.index({ 'analytics.views': -1 });
promptSchema.index({ 'analytics.downloads': -1 });
promptSchema.index({ createdAt: -1 });
promptSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Pre-save middleware to generate slug
promptSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.metadata.slug) {
    this.metadata.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') + '-' + Date.now();
  }
  next();
});

// Method to increment views
promptSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

// Method to increment downloads
promptSchema.methods.incrementDownloads = function() {
  this.analytics.downloads += 1;
  return this.save();
};

// Method to add like
promptSchema.methods.addLike = function() {
  this.analytics.likes += 1;
  return this.save();
};

// Method to remove like
promptSchema.methods.removeLike = function() {
  this.analytics.likes = Math.max(0, this.analytics.likes - 1);
  return this.save();
};

export default mongoose.model('Prompt', promptSchema);
