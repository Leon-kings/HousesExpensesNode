//     const mongoose = require('mongoose');

// const IncomeSchema = new mongoose.Schema({
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     trim: true,
//   },
//   category: {
//     type: String,
//     required: [true, 'Category is required'],
//     trim: true,
//   },
//   source: {
//     type: String,
//     trim: true,
//   },
//   amount: {
//     type: Number,
//     required: [true, 'Amount is required'],
//     min: 0,
//   },
//   date: {
//     type: Date,
//     required: [true, 'Date is required'],
//     default: Date.now,
//   },
//   user: {
//     type: String,
//     required: [true, 'User name is required'],
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     trim: true,
//     lowercase: true,
//     index: true,
//   },
//   isRecurring: {
//     type: Boolean,
//     default: false,
//   },
//   frequency: {
//     type: String,
//     enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'annually'],
//     default: 'monthly',
//   },
// }, {
//   timestamps: true,
// });

// // Indexes for faster queries
// IncomeSchema.index({ email: 1, date: -1 });
// IncomeSchema.index({ email: 1, category: 1 });
// IncomeSchema.index({ email: 1, createdAt: -1 });

// module.exports = mongoose.model('Income', IncomeSchema);









const mongoose = require("mongoose");

const IncomeSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    source: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    remainingAmount: {
      type: Number,
      default: function () {
        return this.amount;
      },
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    user: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ["weekly", "biweekly", "monthly", "quarterly", "annually"],
      default: "monthly",
    },
  },
  { timestamps: true }
);

// Indexes
IncomeSchema.index({ email: 1, date: -1 });
IncomeSchema.index({ email: 1, category: 1 });

module.exports = mongoose.model("Income", IncomeSchema);