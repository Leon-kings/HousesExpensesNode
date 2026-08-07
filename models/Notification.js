// const mongoose = require("mongoose");

// const notificationSchema = new mongoose.Schema(
// {
//     userEmail:{
//         type:String,
//         required:true
//     },

//     title:{
//         type:String,
//         required:true
//     },

//     message:{
//         type:String,
//         required:true
//     },

//     type:{
//         type:String,
//         enum:["contact","system","account"],
//         default:"contact"
//     },

//     isRead:{
//         type:Boolean,
//         default:false
//     }

// },
// {
//     timestamps:true
// });

// module.exports = mongoose.model("Notification",notificationSchema);

// const mongoose = require("mongoose");

// const notificationSchema = new mongoose.Schema(
//   {
//     userEmail: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       index: true,
//     },
//     title: {
//       type: String,
//       required: true,
//     },
//     message: {
//       type: String,
//       required: true,
//     },
//     type: {
//       type: String,
//       enum: [
//         "contact",
//         "system",
//         "account",
//         "expense",
//         "income",
//         "warning",
//         "alert",
//       ],
//       default: "system",
//     },
//     severity: {
//       type: String,
//       enum: ["low", "medium", "high"],
//       default: "low",
//     },
//     isRead: {
//       type: Boolean,
//       default: false,
//     },
//     readAt: {
//       type: Date,
//     },
//     relatedId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Expense",
//     },
//     relatedType: {
//       type: String,
//       enum: ["expense", "income", "budget", "system"],
//     },
//     actionLink: {
//       type: String,
//     },
//     metadata: {
//       type: mongoose.Schema.Types.Mixed,
//       default: {},
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// // Indexes for performance
// notificationSchema.index({ userEmail: 1, createdAt: -1 });
// notificationSchema.index({ userEmail: 1, isRead: 1 });
// notificationSchema.index({ userId: 1, isRead: 1 });

// // Static method to create expense notification
// notificationSchema.statics.createExpenseNotification = async function (data) {
//   const { userEmail, userId, expense, action, amount, category, description } =
//     data;

//   let title, message, type, severity;

//   switch (action) {
//     case "created":
//       if (expense.type === "income") {
//         title = "💰 Income Added";
//         message = `New income of $${amount.toFixed(2)} from ${category} recorded successfully.`;
//         type = "income";
//         severity = "low";
//       } else {
//         title = "💳 Expense Added";
//         message = `New expense of $${amount.toFixed(2)} for ${category} (${description}) recorded.`;
//         type = "expense";
//         severity = "low";
//       }
//       break;

//     case "updated":
//       title = "✏️ Transaction Updated";
//       message = `Transaction "${description}" was updated. Amount: $${amount.toFixed(2)}, Category: ${category}`;
//       type = "system";
//       severity = "low";
//       break;

//     case "deleted":
//       title = "🗑️ Transaction Deleted";
//       message = `Transaction "${description}" ($${amount.toFixed(2)}) was deleted.`;
//       type = "system";
//       severity = "low";
//       break;

//     default:
//       title = "📊 Transaction Update";
//       message = `Transaction ${action} successfully.`;
//       type = "system";
//       severity = "low";
//   }

//   return this.create({
//     userEmail,
//     userId,
//     title,
//     message,
//     type,
//     severity,
//     relatedId: expense._id,
//     relatedType: expense.type || "expense",
//     actionLink: `/expenses/${expense._id}`,
//     metadata: {
//       expenseId: expense._id,
//       amount: amount,
//       category: category,
//       description: description,
//       action: action,
//     },
//   });
// };

// // Static method to create budget alert
// notificationSchema.statics.createBudgetAlert = async function (data) {
//   const { userEmail, userId, category, spent, budget, percentage } = data;

//   let severity = "medium";
//   let title = `📊 ${category} Budget Alert`;
//   let message = `You've used ${percentage.toFixed(1)}% of your ${category} budget ($${spent.toFixed(2)} of $${budget.toFixed(2)}).`;

//   if (percentage > 100) {
//     severity = "high";
//     title = `🚨 ${category} Budget Exceeded`;
//     message = `You've exceeded your ${category} budget by $${(spent - budget).toFixed(2)} (${percentage.toFixed(1)}%).`;
//   } else if (percentage > 80) {
//     severity = "medium";
//     title = `⚠️ ${category} Budget Warning`;
//     message = `You're approaching your ${category} budget limit. Used ${percentage.toFixed(1)}% of $${budget.toFixed(2)}.`;
//   }

//   return this.create({
//     userEmail,
//     userId,
//     title,
//     message,
//     type: "warning",
//     severity,
//     relatedType: "budget",
//     actionLink: `/expenses?category=${category}`,
//     metadata: {
//       category,
//       spent,
//       budget,
//       percentage,
//     },
//   });
// };

// // Static method to create spending alert
// notificationSchema.statics.createSpendingAlert = async function (data) {
//   const { userEmail, userId, totalSpent, dailyLimit, date } = data;

//   const title = "📊 Daily Spending Alert";
//   const message = `Today's spending ($${totalSpent.toFixed(2)}) has exceeded the daily limit of $${dailyLimit.toFixed(2)}.`;

//   return this.create({
//     userEmail,
//     userId,
//     title,
//     message,
//     type: "alert",
//     severity: "medium",
//     relatedType: "budget",
//     actionLink: "/expenses",
//     metadata: {
//       totalSpent,
//       dailyLimit,
//       date,
//     },
//   });
// };

// // Method to mark as read
// notificationSchema.methods.markAsRead = function () {
//   this.isRead = true;
//   this.readAt = new Date();
//   return this.save();
// };

// // Static method to clean old notifications
// notificationSchema.statics.cleanOldNotifications = async function (days = 30) {
//   const cutoffDate = new Date();
//   cutoffDate.setDate(cutoffDate.getDate() - days);

//   const result = await this.deleteMany({
//     isRead: true,
//     createdAt: { $lt: cutoffDate },
//   });

//   return result;
// };

// // Static method to get statistics for a user
// notificationSchema.statics.getUserStats = async function (userEmail) {
//   const [total, unread, read, byType] = await Promise.all([
//     this.countDocuments({ userEmail }),
//     this.countDocuments({ userEmail, isRead: false }),
//     this.countDocuments({ userEmail, isRead: true }),
//     this.aggregate([
//       { $match: { userEmail } },
//       {
//         $group: {
//           _id: "$type",
//           count: { $sum: 1 },
//           unread: { $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } },
//         },
//       },
//     ]),
//   ]);

//   const typeBreakdown = {};
//   byType.forEach((item) => {
//     typeBreakdown[item._id] = {
//       total: item.count,
//       unread: item.unread,
//     };
//   });

//   return {
//     total,
//     read,
//     unread,
//     typeBreakdown,
//   };
// };

// module.exports = mongoose.model("Notification", notificationSchema);

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "contact",
        "system",
        "account",
        "expense",
        "income",
        "warning",
        "alert",
        "savings_milestone",
      ],
      default: "system",
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: Date,

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    relatedType: {
      type: String,
      enum: ["expense", "income", "budget", "savings", "system"],
    },

    actionLink: {
      type: String,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
notificationSchema.index({
  userEmail: 1,
  createdAt: -1,
});

notificationSchema.index({
  userEmail: 1,
  isRead: 1,
});

notificationSchema.index({
  userId: 1,
  isRead: 1,
});

// Expense / Income notification
notificationSchema.statics.createExpenseNotification = async function (data) {
  const { userEmail, userId, expense, action, amount, category, description } =
    data;

  const value = Number(amount) || 0;

  let title = "📊 Transaction Update";
  let message = `Transaction ${action} successfully.`;
  let type = "system";

  if (action === "created") {
    if (expense.type === "income") {
      title = "💰 Income Added";
      message = `New income of $${value.toFixed(2)} from ${category} recorded successfully.`;

      type = "income";
    } else {
      title = "💳 Expense Added";
      message = `New expense of $${value.toFixed(2)} for ${category} recorded.`;

      type = "expense";
    }
  }

  if (action === "updated") {
    title = "✏️ Transaction Updated";

    message = `Transaction "${description}" was updated. Amount: $${value.toFixed(2)}`;
  }

  if (action === "deleted") {
    title = "🗑️ Transaction Deleted";

    message = `Transaction "${description}" ($${value.toFixed(2)}) was deleted.`;
  }

  return this.create({
    userEmail,
    userId,

    title,
    message,

    type,

    severity: "low",

    relatedId: expense?._id,

    relatedType: expense?.type === "income" ? "income" : "expense",

    actionLink: expense?._id ? `/expenses/${expense._id}` : "/expenses",

    metadata: {
      expenseId: expense?._id,
      amount: value,
      category,
      description,
      action,
    },
  });
};

// Budget notification
notificationSchema.statics.createBudgetAlert = async function (data) {
  const { userEmail, userId, category, spent, budget, percentage } = data;

  let severity = "medium";

  let title = `📊 ${category} Budget Alert`;

  let message = `You've used ${percentage.toFixed(1)}% of your ${category} budget.`;

  if (percentage > 100) {
    severity = "high";

    title = `🚨 ${category} Budget Exceeded`;

    message = `You exceeded your ${category} budget.`;
  }

  return this.create({
    userEmail,
    userId,

    title,
    message,

    type: "warning",

    severity,

    relatedType: "budget",

    actionLink: `/expenses?category=${category}`,

    metadata: {
      category,
      spent,
      budget,
      percentage,
    },
  });
};

// Mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;

  this.readAt = new Date();

  return this.save();
};

// Delete old notifications
notificationSchema.statics.cleanOldNotifications = async function (days = 30) {
  const cutoff = new Date();

  cutoff.setDate(cutoff.getDate() - days);

  return this.deleteMany({
    isRead: true,

    createdAt: {
      $lt: cutoff,
    },
  });
};

// Statistics
notificationSchema.statics.getUserStats = async function (userEmail) {
  const [total, unread, read, byType] = await Promise.all([
    this.countDocuments({
      userEmail,
    }),

    this.countDocuments({
      userEmail,
      isRead: false,
    }),

    this.countDocuments({
      userEmail,
      isRead: true,
    }),

    this.aggregate([
      {
        $match: {
          userEmail,
        },
      },
      {
        $group: {
          _id: "$type",
          count: {
            $sum: 1,
          },
          unread: {
            $sum: {
              $cond: [
                {
                  $eq: ["$isRead", false],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const typeBreakdown = {};

  byType.forEach((item) => {
    typeBreakdown[item._id] = {
      total: item.count,
      unread: item.unread,
    };
  });

  return {
    total,

    read,

    unread,

    typeBreakdown,
  };
};

module.exports = mongoose.model("Notification", notificationSchema);
