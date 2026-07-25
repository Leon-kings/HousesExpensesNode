const mongoose = require('mongoose');

const SavingsSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Savings category is required'],
    trim: true,
    index: true,
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: 0,
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  deadline: {
    type: Date,
  },
  description: {
    type: String,
    trim: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    index: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Calculate progress before saving
SavingsSchema.pre('save', function(next) {
  this.progress = this.targetAmount > 0 
    ? Math.min(100, (this.currentAmount / this.targetAmount) * 100) 
    : 0;
  
  if (this.progress >= 100 && !this.isCompleted) {
    this.isCompleted = true;
    this.completedDate = new Date();
  }
  next();
});

SavingsSchema.index({ email: 1, category: 1 });
SavingsSchema.index({ email: 1, isCompleted: 1 });

module.exports = mongoose.model('Savings', SavingsSchema);