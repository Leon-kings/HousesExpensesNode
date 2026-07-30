// const mongoose = require('mongoose');

// const IncomeNotificationSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     trim: true,
//     lowercase: true,
//     index: true,
//   },

//   title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true,
//   },

//   message: {
//     type: String,
//     required: [true, 'Message is required'],
//     trim: true,
//   },

//   type: {
//     type: String,
//     enum: [
//       'info',
//       'warning',
//       'success',
//       'error',
//       'budget_alert',
//       'savings_milestone',
//       'income_recorded'
//     ],
//     default: 'income_recorded',
//   },

//   severity: {
//     type: String,
//     enum: ['low', 'medium', 'high'],
//     default: 'low',
//   },

//   isRead: {
//     type: Boolean,
//     default: false,
//   },

//   readAt: {
//     type: Date,
//   },

//   relatedId: {
//     type: mongoose.Schema.Types.ObjectId,
//     refPath: 'relatedModel',
//   },

//   relatedModel: {
//     type: String,
//     enum: ['Income', 'Budget', 'Savings', 'Expense'],
//   },

//   actionLink: {
//     type: String,
//   },

//   expiresAt: {
//     type: Date,
//   },

// }, {
//   timestamps: true,
// });


// IncomeNotificationSchema.index({
//   email: 1,
//   isRead: 1,
//   createdAt: -1
// });


// IncomeNotificationSchema.index(
//   { expiresAt: 1 },
//   { expireAfterSeconds: 0 }
// );


// module.exports = mongoose.model(
//   'IncomeNotification',
//   IncomeNotificationSchema
// );


const mongoose = require('mongoose');

const IncomeNotificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    index: true,
  },

  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },

  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
  },

  type: {
    type: String,
    enum: [
      'info',
      'warning',
      'success',
      'error',
      'budget_alert',
      'savings_milestone',
      'income_recorded'
    ],
    default: 'income_recorded',
  },

  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },

  isRead: {
    type: Boolean,
    default: false,
  },

  readAt: {
    type: Date,
  },

  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel',
  },

  relatedModel: {
    type: String,
    enum: ['Income', 'Budget', 'Savings', 'Expense'],
  },

  actionLink: {
    type: String,
  },

  expiresAt: {
    type: Date,
  },

}, {
  timestamps: true,
});


IncomeNotificationSchema.index({
  email: 1,
  isRead: 1,
  createdAt: -1
});


IncomeNotificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);


// Prevent OverwriteModelError
module.exports =
  mongoose.models.IncomeNotification ||
  mongoose.model(
    'IncomeNotification',
    IncomeNotificationSchema
  );