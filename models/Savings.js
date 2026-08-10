



// const mongoose = require("mongoose");

// const SavingsSchema = new mongoose.Schema(
//   {
//     category: {
//       type: String,
//       required: [true, "Savings category is required"],
//       trim: true,
//       index: true,
//     },
//     targetAmount: {
//       type: Number,
//       required: [true, "Target amount is required"],
//       min: 0,
//     },
//     currentAmount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//     progress: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 100,
//     },
//     deadline: {
//       type: Date,
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     priority: {
//       type: String,
//       enum: ["low", "medium", "high", "critical"],
//       default: "medium",
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//       index: true,
//     },
//     isCompleted: {
//       type: Boolean,
//       default: false,
//     },
//     completedDate: {
//       type: Date,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Calculate progress before saving
// SavingsSchema.pre("save", function () {
//   const target = Number(this.targetAmount) || 0;
//   const current = Number(this.currentAmount) || 0;

//   this.progress =
//     target > 0 ? Math.min(100, (current / target) * 100) : 0;

//   if (this.progress >= 100) {
//     this.isCompleted = true;

//     if (!this.completedDate) {
//       this.completedDate = new Date();
//     }
//   } else {
//     this.isCompleted = false;
//     this.completedDate = undefined;
//   }
// });

// SavingsSchema.index({ email: 1, category: 1 });
// SavingsSchema.index({ email: 1, isCompleted: 1 });

// module.exports = mongoose.model("Savings", SavingsSchema);










// // ============================================================
// // MODELS / SAVINGS.JS
// // ============================================================

// const mongoose = require("mongoose");

// const SavingsSchema = new mongoose.Schema(
//   {
//     category: {
//       type: String,
//       required: [true, "Savings category is required"],
//       trim: true,
//       maxlength: [100, "Category cannot exceed 100 characters"],
//     },

//     targetAmount: {
//       type: Number,
//       required: [true, "Target amount is required"],
//       min: [1, "Target amount must be greater than zero"],
//       validate: {
//         validator: Number.isFinite,
//         message: "Target amount must be a valid number",
//       },
//     },

//     currentAmount: {
//       type: Number,
//       default: 0,
//       min: [0, "Current amount cannot be negative"],
//       validate: {
//         validator: Number.isFinite,
//         message: "Current amount must be a valid number",
//       },
//     },

//     progress: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 100,
//     },

//     deadline: {
//       type: Date,
//       default: null,
//     },

//     description: {
//       type: String,
//       trim: true,
//       maxlength: [500, "Description cannot exceed 500 characters"],
//     },

//     priority: {
//       type: String,
//       enum: ["low", "medium", "high", "critical"],
//       default: "medium",
//     },

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//       index: true,
//     },

//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       index: true,
//     },

//     isCompleted: {
//       type: Boolean,
//       default: false,
//     },

//     completedDate: {
//       type: Date,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ============================================================
// // CALCULATE PROGRESS
// // ============================================================

// SavingsSchema.pre("save", function (next) {
//   const target = Number(this.targetAmount) || 0;
//   const current = Number(this.currentAmount) || 0;

//   this.progress =
//     target > 0
//       ? Math.min(100, (current / target) * 100)
//       : 0;

//   if (this.progress >= 100) {
//     this.progress = 100;
//     this.isCompleted = true;

//     if (!this.completedDate) {
//       this.completedDate = new Date();
//     }
//   } else {
//     this.isCompleted = false;
//     this.completedDate = null;
//   }

//   next();
// });

// // ============================================================
// // INDEXES
// // ============================================================

// SavingsSchema.index({
//   userId: 1,
//   currentAmount: -1,
// });

// SavingsSchema.index({
//   userId: 1,
//   isCompleted: 1,
// });

// SavingsSchema.index({
//   email: 1,
//   currentAmount: -1,
// });

// module.exports =
//   mongoose.models.Savings ||
//   mongoose.model("Savings", SavingsSchema);













// ============================================================
// MODELS / SAVINGS.JS
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// SAVINGS SCHEMA
// ============================================================

const SavingsSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // CATEGORY
    // ----------------------------------------------------------
    category: {
      type: String,
      required: [true, "Savings category is required"],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },

    // ----------------------------------------------------------
    // TARGET AMOUNT
    // ----------------------------------------------------------
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [1, "Target amount must be greater than zero"],
      validate: {
        validator: Number.isFinite,
        message: "Target amount must be a valid number",
      },
    },

    // ----------------------------------------------------------
    // CURRENT SAVINGS
    // ----------------------------------------------------------
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Current amount cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Current amount must be a valid number",
      },
    },

    // ----------------------------------------------------------
    // PROGRESS
    // Automatically calculated before save
    // ----------------------------------------------------------
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be negative"],
      max: [100, "Progress cannot exceed 100"],
    },

    // ----------------------------------------------------------
    // DEADLINE
    // ----------------------------------------------------------
    deadline: {
      type: Date,
      default: null,
    },

    // ----------------------------------------------------------
    // DESCRIPTION
    // ----------------------------------------------------------
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    // ----------------------------------------------------------
    // PRIORITY
    // ----------------------------------------------------------
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "critical"],
        message: "Invalid savings priority",
      },
      default: "medium",
    },

    // ----------------------------------------------------------
    // USER EMAIL
    // Kept for compatibility with existing controllers
    // ----------------------------------------------------------
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },

    // ----------------------------------------------------------
    // USER ID
    // Primary ownership identifier
    // ----------------------------------------------------------
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    // ----------------------------------------------------------
    // COMPLETION
    // ----------------------------------------------------------
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    completedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// PRE-SAVE CALCULATION
// IMPORTANT:
// No `next` argument.
// This prevents:
// "next is not a function"
// ============================================================

SavingsSchema.pre("save", function () {
  // ----------------------------------------------------------
  // NORMALIZE EMAIL
  // ----------------------------------------------------------

  this.email = String(this.email || "")
    .trim()
    .toLowerCase();

  // ----------------------------------------------------------
  // NORMALIZE CATEGORY
  // ----------------------------------------------------------

  this.category = String(this.category || "")
    .trim();

  // ----------------------------------------------------------
  // SAFE NUMBERS
  // ----------------------------------------------------------

  const target = Number(this.targetAmount) || 0;

  let current = Number(this.currentAmount) || 0;

  // ----------------------------------------------------------
  // NEVER ALLOW NEGATIVE CURRENT AMOUNT
  // ----------------------------------------------------------

  if (current < 0) {
    current = 0;
  }

  // ----------------------------------------------------------
  // NEVER ALLOW CURRENT > TARGET
  // ----------------------------------------------------------

  if (target > 0 && current > target) {
    current = target;
  }

  this.currentAmount = current;

  // ----------------------------------------------------------
  // CALCULATE PROGRESS
  // ----------------------------------------------------------

  if (target > 0) {
    this.progress = Math.min(
      100,
      Math.max(0, (current / target) * 100)
    );
  } else {
    this.progress = 0;
  }

  // ----------------------------------------------------------
  // COMPLETION STATUS
  // ----------------------------------------------------------

  if (this.progress >= 100) {
    this.progress = 100;

    this.isCompleted = true;

    if (!this.completedDate) {
      this.completedDate = new Date();
    }
  } else {
    this.isCompleted = false;
    this.completedDate = null;
  }
});

// ============================================================
// INDEXES
// ============================================================

// User savings ordered by current amount
SavingsSchema.index({
  userId: 1,
  currentAmount: -1,
});

// User savings by completion status
SavingsSchema.index({
  userId: 1,
  isCompleted: 1,
});

// User savings ordered by amount
SavingsSchema.index({
  email: 1,
  currentAmount: -1,
});

// User savings by completion status using email
SavingsSchema.index({
  email: 1,
  isCompleted: 1,
});

// ============================================================
// MODEL
// ============================================================

module.exports =
  mongoose.models.Savings ||
  mongoose.model("Savings", SavingsSchema);

