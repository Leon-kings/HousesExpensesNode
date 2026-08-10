
// const mongoose = require("mongoose");

// const IncomeSchema = new mongoose.Schema(
//   {
//     description: {
//       type: String,
//       required: [true, "Description is required"],
//       trim: true,
//     },
//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//     },
//     source: {
//       type: String,
//       trim: true,
//     },
//     amount: {
//       type: Number,
//       required: [true, "Amount is required"],
//       min: 0,
//     },
//     remainingAmount: {
//       type: Number,
//       default: function () {
//         return this.amount;
//       },
//     },
//     date: {
//       type: Date,
//       required: [true, "Date is required"],
//       default: Date.now,
//     },
//     user: {
//       type: String,
//       required: [true, "User name is required"],
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//       index: true,
//     },
//     isRecurring: {
//       type: Boolean,
//       default: false,
//     },
//     frequency: {
//       type: String,
//       enum: ["weekly", "biweekly", "monthly", "quarterly", "annually"],
//       default: "monthly",
//     },
//   },
//   { timestamps: true }
// );

// // Indexes
// IncomeSchema.index({ email: 1, date: -1 });
// IncomeSchema.index({ email: 1, category: 1 });

// module.exports = mongoose.model("Income", IncomeSchema);










// ============================================================
// MODELS / INCOME.JS
// ============================================================

const mongoose = require("mongoose");

const IncomeSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },

    source: {
      type: String,
      trim: true,
      maxlength: [100, "Source cannot exceed 100 characters"],
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than zero"],
      validate: {
        validator: Number.isFinite,
        message: "Amount must be a valid number",
      },
    },

    remainingAmount: {
      type: Number,
      default: function () {
        return this.amount;
      },
      min: [0, "Remaining amount cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Remaining amount must be a valid number",
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
      maxlength: [100, "User cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    isRecurring: {
      type: Boolean,
      default: false,
    },

    frequency: {
      type: String,
      enum: [
        "weekly",
        "biweekly",
        "monthly",
        "quarterly",
        "annually",
      ],
      default: "monthly",
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// INDEXES
// ============================================================

IncomeSchema.index({
  userId: 1,
  remainingAmount: 1,
  date: -1,
});

IncomeSchema.index({
  userId: 1,
  date: -1,
});

IncomeSchema.index({
  email: 1,
  date: -1,
});

module.exports =
  mongoose.models.Income ||
  mongoose.model("Income", IncomeSchema);