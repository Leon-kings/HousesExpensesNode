
// // module.exports = mongoose.model("Notification", notificationSchema);

// const mongoose = require("mongoose");

// const notificationSchema = new mongoose.Schema(
//   {
//     userEmail: {
//       type: String,
//       required: true,
//       trim: true,
//       lowercase: true,
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
//       trim: true,
//     },

//     message: {
//       type: String,
//       required: true,
//       trim: true,
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
//         "savings_milestone",
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

//     readAt: Date,

//     relatedId: {
//       type: mongoose.Schema.Types.ObjectId,
//     },

//     relatedType: {
//       type: String,
//       enum: ["expense", "income", "budget", "savings", "system"],
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

// // Indexes
// notificationSchema.index({
//   userEmail: 1,
//   createdAt: -1,
// });

// notificationSchema.index({
//   userEmail: 1,
//   isRead: 1,
// });

// notificationSchema.index({
//   userId: 1,
//   isRead: 1,
// });

// // Expense / Income notification
// notificationSchema.statics.createExpenseNotification = async function (data) {
//   const { userEmail, userId, expense, action, amount, category, description } =
//     data;

//   const value = Number(amount) || 0;

//   let title = "📊 Transaction Update";
//   let message = `Transaction ${action} successfully.`;
//   let type = "system";

//   if (action === "created") {
//     if (expense.type === "income") {
//       title = "💰 Income Added";
//       message = `New income of $${value.toFixed(2)} from ${category} recorded successfully.`;

//       type = "income";
//     } else {
//       title = "💳 Expense Added";
//       message = `New expense of $${value.toFixed(2)} for ${category} recorded.`;

//       type = "expense";
//     }
//   }

//   if (action === "updated") {
//     title = "✏️ Transaction Updated";

//     message = `Transaction "${description}" was updated. Amount: $${value.toFixed(2)}`;
//   }

//   if (action === "deleted") {
//     title = "🗑️ Transaction Deleted";

//     message = `Transaction "${description}" ($${value.toFixed(2)}) was deleted.`;
//   }

//   return this.create({
//     userEmail,
//     userId,

//     title,
//     message,

//     type,

//     severity: "low",

//     relatedId: expense?._id,

//     relatedType: expense?.type === "income" ? "income" : "expense",

//     actionLink: expense?._id ? `/expenses/${expense._id}` : "/expenses",

//     metadata: {
//       expenseId: expense?._id,
//       amount: value,
//       category,
//       description,
//       action,
//     },
//   });
// };

// // Budget notification
// notificationSchema.statics.createBudgetAlert = async function (data) {
//   const { userEmail, userId, category, spent, budget, percentage } = data;

//   let severity = "medium";

//   let title = `📊 ${category} Budget Alert`;

//   let message = `You've used ${percentage.toFixed(1)}% of your ${category} budget.`;

//   if (percentage > 100) {
//     severity = "high";

//     title = `🚨 ${category} Budget Exceeded`;

//     message = `You exceeded your ${category} budget.`;
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

// // Mark as read
// notificationSchema.methods.markAsRead = function () {
//   this.isRead = true;

//   this.readAt = new Date();

//   return this.save();
// };

// // Delete old notifications
// notificationSchema.statics.cleanOldNotifications = async function (days = 30) {
//   const cutoff = new Date();

//   cutoff.setDate(cutoff.getDate() - days);

//   return this.deleteMany({
//     isRead: true,

//     createdAt: {
//       $lt: cutoff,
//     },
//   });
// };

// // Statistics
// notificationSchema.statics.getUserStats = async function (userEmail) {
//   const [total, unread, read, byType] = await Promise.all([
//     this.countDocuments({
//       userEmail,
//     }),

//     this.countDocuments({
//       userEmail,
//       isRead: false,
//     }),

//     this.countDocuments({
//       userEmail,
//       isRead: true,
//     }),

//     this.aggregate([
//       {
//         $match: {
//           userEmail,
//         },
//       },
//       {
//         $group: {
//           _id: "$type",
//           count: {
//             $sum: 1,
//           },
//           unread: {
//             $sum: {
//               $cond: [
//                 {
//                   $eq: ["$isRead", false],
//                 },
//                 1,
//                 0,
//               ],
//             },
//           },
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












// const mongoose = require("mongoose");

// const notificationSchema = new mongoose.Schema(
//   {
//     userEmail: {
//       type: String,
//       required: true,
//       trim: true,
//       lowercase: true,
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
//       trim: true,
//     },

//     message: {
//       type: String,
//       required: true,
//       trim: true,
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
//         "savings_milestone",
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

//     readAt: Date,

//     relatedId: {
//       type: mongoose.Schema.Types.ObjectId,
//     },

//     relatedType: {
//       type: String,
//       enum: [
//         "expense",
//         "income",
//         "budget",
//         "savings",
//         "system",
//       ],
//     },

//     // Added to match existing controllers
//     relatedModel: {
//       type: String,
//       trim: true,
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
//   }
// );

// // ============================================================
// // INDEXES
// // ============================================================

// notificationSchema.index({
//   userEmail: 1,
//   createdAt: -1,
// });

// notificationSchema.index({
//   userEmail: 1,
//   isRead: 1,
// });

// notificationSchema.index({
//   userId: 1,
//   isRead: 1,
// });

// // ============================================================
// // EXPENSE / INCOME NOTIFICATION
// // ============================================================

// notificationSchema.statics.createExpenseNotification =
//   async function (data) {
//     const {
//       userEmail,
//       userId,
//       expense,
//       action,
//       amount,
//       category,
//       description,
//     } = data;

//     const value = Number(amount) || 0;

//     let title = "📊 Transaction Update";
//     let message = `Transaction ${action} successfully.`;
//     let type = "system";

//     if (action === "created") {
//       if (expense.type === "income") {
//         title = "💰 Income Added";

//         message = `New income of $${value.toFixed(
//           2
//         )} from ${category} recorded successfully.`;

//         type = "income";
//       } else {
//         title = "💳 Expense Added";

//         message = `New expense of $${value.toFixed(
//           2
//         )} for ${category} recorded.`;

//         type = "expense";
//       }
//     }

//     if (action === "updated") {
//       title = "✏️ Transaction Updated";

//       message = `Transaction "${description}" was updated. Amount: $${value.toFixed(
//         2
//       )}`;
//     }

//     if (action === "deleted") {
//       title = "🗑️ Transaction Deleted";

//       message = `Transaction "${description}" ($${value.toFixed(
//         2
//       )}) was deleted.`;
//     }

//     return this.create({
//       userEmail,
//       userId,

//       title,
//       message,

//       type,

//       severity: "low",

//       relatedId: expense?._id,

//       relatedType:
//         expense?.type === "income"
//           ? "income"
//           : "expense",

//       relatedModel:
//         expense?.type === "income"
//           ? "Income"
//           : "Expense",

//       actionLink: expense?._id
//         ? `/expenses/${expense._id}`
//         : "/expenses",

//       metadata: {
//         expenseId: expense?._id,
//         amount: value,
//         category,
//         description,
//         action,
//       },
//     });
//   };

// // ============================================================
// // BUDGET NOTIFICATION
// // ============================================================

// notificationSchema.statics.createBudgetAlert =
//   async function (data) {
//     const {
//       userEmail,
//       userId,
//       category,
//       spent,
//       budget,
//       percentage,
//     } = data;

//     let severity = "medium";

//     let title = `📊 ${category} Budget Alert`;

//     let message = `You've used ${percentage.toFixed(
//       1
//     )}% of your ${category} budget.`;

//     if (percentage > 100) {
//       severity = "high";

//       title = `🚨 ${category} Budget Exceeded`;

//       message = `You exceeded your ${category} budget.`;
//     }

//     return this.create({
//       userEmail,
//       userId,

//       title,
//       message,

//       type: "warning",

//       severity,

//       relatedType: "budget",

//       relatedModel: "Budget",

//       actionLink: `/expenses?category=${category}`,

//       metadata: {
//         category,
//         spent,
//         budget,
//         percentage,
//       },
//     });
//   };

// // ============================================================
// // MARK AS READ
// // ============================================================

// notificationSchema.methods.markAsRead =
//   function () {
//     this.isRead = true;

//     this.readAt = new Date();

//     return this.save();
//   };

// // ============================================================
// // DELETE OLD NOTIFICATIONS
// // ============================================================

// notificationSchema.statics.cleanOldNotifications =
//   async function (days = 30) {
//     const cutoff = new Date();

//     cutoff.setDate(
//       cutoff.getDate() - days
//     );

//     return this.deleteMany({
//       isRead: true,

//       createdAt: {
//         $lt: cutoff,
//       },
//     });
//   };

// // ============================================================
// // STATISTICS
// // ============================================================

// notificationSchema.statics.getUserStats =
//   async function (userEmail) {
//     const [
//       total,
//       unread,
//       read,
//       byType,
//     ] = await Promise.all([
//       this.countDocuments({
//         userEmail,
//       }),

//       this.countDocuments({
//         userEmail,
//         isRead: false,
//       }),

//       this.countDocuments({
//         userEmail,
//         isRead: true,
//       }),

//       this.aggregate([
//         {
//           $match: {
//             userEmail,
//           },
//         },

//         {
//           $group: {
//             _id: "$type",

//             count: {
//               $sum: 1,
//             },

//             unread: {
//               $sum: {
//                 $cond: [
//                   {
//                     $eq: [
//                       "$isRead",
//                       false,
//                     ],
//                   },
//                   1,
//                   0,
//                 ],
//               },
//             },
//           },
//         },
//       ]),
//     ]);

//     const typeBreakdown = {};

//     byType.forEach((item) => {
//       typeBreakdown[item._id] = {
//         total: item.count,
//         unread: item.unread,
//       };
//     });

//     return {
//       total,
//       read,
//       unread,
//       typeBreakdown,
//     };
//   };

// module.exports =
//   mongoose.models.Notification ||
//   mongoose.model(
//     "Notification",
//     notificationSchema
//   );












// const mongoose = require("mongoose");

// const notificationSchema = new mongoose.Schema(
//   {
//     userEmail: {
//       type: String,
//       required: true,
//       trim: true,
//       lowercase: true,
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
//       trim: true,
//     },

//     message: {
//       type: String,
//       required: true,
//       trim: true,
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
//         "savings_milestone",
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
//       default: null,
//     },

//     relatedId: {
//       type: mongoose.Schema.Types.ObjectId,
//       default: null,
//     },

//     relatedType: {
//       type: String,
//       enum: [
//         "expense",
//         "income",
//         "budget",
//         "savings",
//         "system",
//       ],
//       default: "system",
//     },

//     actionLink: {
//       type: String,
//       default: "",
//     },

//     metadata: {
//       type: mongoose.Schema.Types.Mixed,
//       default: {},
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ============================================================
// // INDEXES
// // ============================================================

// notificationSchema.index({
//   userEmail: 1,
//   createdAt: -1,
// });

// notificationSchema.index({
//   userEmail: 1,
//   isRead: 1,
// });

// notificationSchema.index({
//   userId: 1,
//   isRead: 1,
// });

// // ============================================================
// // MARK AS READ
// // ============================================================

// notificationSchema.methods.markAsRead = function () {
//   this.isRead = true;
//   this.readAt = new Date();

//   return this.save();
// };

// // ============================================================
// // USER STATISTICS
// // ============================================================

// notificationSchema.statics.getUserStats = async function (userEmail) {
//   const normalizedEmail = userEmail.toLowerCase().trim();

//   const [total, unread, read] = await Promise.all([
//     this.countDocuments({
//       userEmail: normalizedEmail,
//     }),

//     this.countDocuments({
//       userEmail: normalizedEmail,
//       isRead: false,
//     }),

//     this.countDocuments({
//       userEmail: normalizedEmail,
//       isRead: true,
//     }),
//   ]);

//   return {
//     total,
//     unread,
//     read,
//   };
// };

// // ============================================================
// // DELETE OLD READ NOTIFICATIONS
// // ============================================================

// notificationSchema.statics.cleanOldNotifications = async function (
//   days = 30
// ) {
//   const cutoff = new Date();

//   cutoff.setDate(cutoff.getDate() - days);

//   return this.deleteMany({
//     isRead: true,
//     createdAt: {
//       $lt: cutoff,
//     },
//   });
// };

// module.exports =
//   mongoose.models.Notification ||
//   mongoose.model("Notification", notificationSchema);















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

    readAt: {
      type: Date,
      default: null,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    relatedType: {
      type: String,
      enum: [
        "expense",
        "income",
        "budget",
        "savings",
        "system",
      ],
      default: "system",
    },

    actionLink: {
      type: String,
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

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

module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);