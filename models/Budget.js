const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true,
  },
  allocatedAmount: {
    type: Number,
    required: [true, 'Allocated amount is required'],
    min: 0,
  },
  spentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  remainingAmount: {
    type: Number,
    default: 0,
  },
  month: {
    type: Number,
    required: true,
    min: 0,
    max: 11,
  },
  year: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['on-track', 'approaching-limit', 'over-budget', 'under-budget'],
    default: 'on-track',
  },
  percentageUsed: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

// Unique constraint for category per month/year per user
BudgetSchema.index({ email: 1, category: 1, month: 1, year: 1 }, { unique: true });

// Calculate remaining and percentage before saving
BudgetSchema.pre('save', function(next) {
  this.remainingAmount = Math.max(0, this.allocatedAmount - this.spentAmount);
  this.percentageUsed = this.allocatedAmount > 0 
    ? Math.min(100, (this.spentAmount / this.allocatedAmount) * 100) 
    : 0;
  
  if (this.percentageUsed > 100) {
    this.status = 'over-budget';
  } else if (this.percentageUsed > 80) {
    this.status = 'approaching-limit';
  } else if (this.percentageUsed < 50 && this.spentAmount > 0) {
    this.status = 'under-budget';
  } else {
    this.status = 'on-track';
  }
  next();
});

module.exports = mongoose.model('Budget', BudgetSchema);