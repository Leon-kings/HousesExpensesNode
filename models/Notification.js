

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

// module.exports =
//   mongoose.models.Notification ||
//   mongoose.model("Notification", notificationSchema);












// ============================================================
// MODELS / NOTIFICATION.JS
// ============================================================

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
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },

    type: {
      type: String,
      enum: [
        "contact",
        "system",
        "account",
        "expense",
        "income",
        "budget",
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
      trim: true,
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

// ============================================================
// INDEXES
// ============================================================

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