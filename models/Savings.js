



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










// ============================================================
// MODELS / SAVINGS.JS
// ============================================================

const mongoose = require("mongoose");

const SavingsSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Savings category is required"],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },

    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [1, "Target amount must be greater than zero"],
      validate: {
        validator: Number.isFinite,
        message: "Target amount must be a valid number",
      },
    },

    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Current amount cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Current amount must be a valid number",
      },
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    deadline: {
      type: Date,
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
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
      index: true,
    },

    isCompleted: {
      type: Boolean,
      default: false,
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
// CALCULATE PROGRESS
// ============================================================

SavingsSchema.pre("save", function (next) {
  const target = Number(this.targetAmount) || 0;
  const current = Number(this.currentAmount) || 0;

  this.progress =
    target > 0
      ? Math.min(100, (current / target) * 100)
      : 0;

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

  next();
});

// ============================================================
// INDEXES
// ============================================================

SavingsSchema.index({
  userId: 1,
  currentAmount: -1,
});

SavingsSchema.index({
  userId: 1,
  isCompleted: 1,
});

SavingsSchema.index({
  email: 1,
  currentAmount: -1,
});

module.exports =
  mongoose.models.Savings ||
  mongoose.model("Savings", SavingsSchema);