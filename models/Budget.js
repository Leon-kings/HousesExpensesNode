// // ============================================================
// // MODELS / BUDGET.JS
// // ============================================================

// const mongoose = require("mongoose");

// // ============================================================
// // BUDGET SCHEMA
// // ============================================================

// const budgetSchema = new mongoose.Schema(
//   {
//     // ========================================================
//     // CATEGORY
//     // ========================================================

//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       lowercase: true,
//       maxlength: [100, "Category cannot exceed 100 characters"],
//     },

//     // ========================================================
//     // ALLOCATED AMOUNT
//     // ========================================================

//     allocatedAmount: {
//       type: Number,
//       required: [true, "Allocated amount is required"],
//       min: [0, "Allocated amount cannot be negative"],
//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) && Number.isInteger(value) && value >= 0,
//         message: "Allocated amount must be a valid whole number",
//       },
//     },

//     // ========================================================
//     // SPENT AMOUNT
//     // ========================================================

//     spentAmount: {
//       type: Number,
//       default: 0,
//       min: [0, "Spent amount cannot be negative"],
//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) && Number.isInteger(value) && value >= 0,
//         message: "Spent amount must be a valid whole number",
//       },
//     },

//     // ========================================================
//     // REMAINING AMOUNT
//     //
//     // calculated:
//     //
//     // allocated - spent
//     //
//     // minimum = 0
//     // ========================================================

//     remainingAmount: {
//       type: Number,
//       default: 0,
//       min: [0, "Remaining amount cannot be negative"],
//     },

//     // ========================================================
//     // PERCENTAGE USED
//     // ========================================================

//     percentageUsed: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     // ========================================================
//     // STATUS
//     // ========================================================

//     status: {
//       type: String,
//       enum: ["on-track", "approaching-limit", "over-budget"],
//       default: "on-track",
//     },

//     // ========================================================
//     // MONTH
//     //
//     // 0 = January
//     // 11 = December
//     // ========================================================

//     month: {
//       type: Number,
//       required: [true, "Month is required"],
//       min: [0, "Month must be between 0 and 11"],
//       max: [11, "Month must be between 0 and 11"],
//       validate: {
//         validator: (value) => Number.isInteger(value),
//         message: "Month must be an integer between 0 and 11",
//       },
//     },

//     // ========================================================
//     // YEAR
//     // ========================================================

//     year: {
//       type: Number,
//       required: [true, "Year is required"],
//       min: [2000, "Year must be 2000 or later"],
//       validate: {
//         validator: (value) => Number.isInteger(value),
//         message: "Year must be a valid integer",
//       },
//     },

//     // ========================================================
//     // DESCRIPTION
//     // ========================================================

//     description: {
//       type: String,
//       trim: true,
//       maxlength: [500, "Description cannot exceed 500 characters"],
//       default: "",
//     },

//     // ========================================================
//     // EMAIL
//     // ========================================================

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//       index: true,
//     },

//     // ========================================================
//     // USER ID
//     // ========================================================

//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "User ID is required"],
//       index: true,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// // ============================================================
// // CALCULATE BUDGET VALUES
// // ============================================================

// budgetSchema.methods.calculateValues = function () {
//   const allocated = Number(this.allocatedAmount) || 0;

//   const spent = Number(this.spentAmount) || 0;

//   // --------------------------------------------------------
//   // REMAINING
//   // --------------------------------------------------------

//   this.remainingAmount = Math.max(allocated - spent, 0);

//   // --------------------------------------------------------
//   // PERCENTAGE
//   // --------------------------------------------------------

//   if (allocated > 0) {
//     this.percentageUsed = Number(((spent / allocated) * 100).toFixed(2));
//   } else {
//     this.percentageUsed = 0;
//   }

//   // --------------------------------------------------------
//   // STATUS
//   // --------------------------------------------------------

//   if (allocated > 0 && spent > allocated) {
//     this.status = "over-budget";
//   } else if (allocated > 0 && this.percentageUsed >= 80) {
//     this.status = "approaching-limit";
//   } else {
//     this.status = "on-track";
//   }
// };

// // ============================================================
// // PRE-SAVE
// // ============================================================

// budgetSchema.pre("save", function () {
//   // ----------------------------------------------------------
//   // CATEGORY
//   // ----------------------------------------------------------

//   this.category = String(this.category || "")
//     .trim()
//     .toLowerCase();

//   // ----------------------------------------------------------
//   // EMAIL
//   // ----------------------------------------------------------

//   this.email = String(this.email || "")
//     .trim()
//     .toLowerCase();

//   // ----------------------------------------------------------
//   // DESCRIPTION
//   // ----------------------------------------------------------

//   this.description = String(this.description || "").trim();

//   // ----------------------------------------------------------
//   // ALLOCATED
//   // ----------------------------------------------------------

//   const allocated = Number(this.allocatedAmount);

//   if (
//     !Number.isFinite(allocated) ||
//     !Number.isInteger(allocated) ||
//     allocated < 0
//   ) {
//     throw new Error("Allocated amount must be a valid whole number");
//   }

//   this.allocatedAmount = allocated;

//   // ----------------------------------------------------------
//   // SPENT
//   // ----------------------------------------------------------

//   const spent = Number(this.spentAmount) || 0;

//   if (!Number.isFinite(spent) || !Number.isInteger(spent) || spent < 0) {
//     throw new Error("Spent amount must be a valid whole number");
//   }

//   this.spentAmount = spent;

//   // ----------------------------------------------------------
//   // CALCULATE
//   // ----------------------------------------------------------

//   this.calculateValues();
// });

// // ============================================================
// // ADD SPENDING TO BUDGET
// // ============================================================

// budgetSchema.methods.addExpense = function (amount) {
//   const numericAmount = Number(amount);

//   if (
//     !Number.isFinite(numericAmount) ||
//     !Number.isInteger(numericAmount) ||
//     numericAmount <= 0
//   ) {
//     throw new Error("Budget expense amount must be a positive whole number");
//   }

//   this.spentAmount += numericAmount;

//   this.calculateValues();

//   return this;
// };

// // ============================================================
// // REMOVE SPENDING FROM BUDGET
// //
// // Useful when deleting an expense.
// // ============================================================

// budgetSchema.methods.removeExpense = function (amount) {
//   const numericAmount = Number(amount);

//   if (
//     !Number.isFinite(numericAmount) ||
//     !Number.isInteger(numericAmount) ||
//     numericAmount <= 0
//   ) {
//     throw new Error("Budget restore amount must be a positive whole number");
//   }

//   this.spentAmount = Math.max(0, this.spentAmount - numericAmount);

//   this.calculateValues();

//   return this;
// };

// // ============================================================
// // UNIQUE BUDGET
// //
// // One budget per:
// // user + category + month + year
// // ============================================================

// budgetSchema.index(
//   {
//     userId: 1,
//     category: 1,
//     month: 1,
//     year: 1,
//   },
//   {
//     unique: true,
//   },
// );

// // ============================================================
// // QUERY INDEXES
// // ============================================================

// budgetSchema.index({
//   userId: 1,
//   year: -1,
//   month: -1,
// });

// budgetSchema.index({
//   userId: 1,
//   category: 1,
// });

// budgetSchema.index({
//   email: 1,
//   year: -1,
//   month: -1,
// });

// budgetSchema.index({
//   email: 1,
//   category: 1,
// });

// // ============================================================
// // MODEL
// // ============================================================

// module.exports =
//   mongoose.models.Budget || mongoose.model("Budget", budgetSchema);

// // ============================================================
// // MODELS / BUDGET.JS
// // ============================================================

// const mongoose = require("mongoose");

// // ============================================================
// // BUDGET SCHEMA
// // ============================================================

// const budgetSchema = new mongoose.Schema(
//   {
//     // ========================================================
//     // CATEGORY
//     // ========================================================

//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       lowercase: true,
//       maxlength: [100, "Category cannot exceed 100 characters"],
//     },

//     // ========================================================
//     // ALLOCATED AMOUNT
//     // ========================================================

//     allocatedAmount: {
//       type: Number,
//       required: [true, "Allocated amount is required"],
//       min: [0, "Allocated amount cannot be negative"],
//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) && Number.isInteger(value) && value >= 0,
//         message: "Allocated amount must be a valid whole number",
//       },
//     },

//     // ========================================================
//     // SPENT AMOUNT
//     // ========================================================

//     spentAmount: {
//       type: Number,
//       default: 0,
//       min: [0, "Spent amount cannot be negative"],
//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) && Number.isInteger(value) && value >= 0,
//         message: "Spent amount must be a valid whole number",
//       },
//     },

//     // ========================================================
//     // REMAINING AMOUNT
//     // ========================================================

//     remainingAmount: {
//       type: Number,
//       default: 0,
//       min: [0, "Remaining amount cannot be negative"],
//     },

//     // ========================================================
//     // PERCENTAGE USED
//     // ========================================================

//     percentageUsed: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     // ========================================================
//     // STATUS
//     // ========================================================

//     status: {
//       type: String,
//       enum: ["on-track", "approaching-limit", "over-budget", "under-budget"],
//       default: "on-track",
//     },

//     // ========================================================
//     // MONTH
//     // ========================================================

//     month: {
//       type: Number,
//       required: [true, "Month is required"],
//       min: [0, "Month must be between 0 and 11"],
//       max: [11, "Month must be between 0 and 11"],
//       validate: {
//         validator: (value) => Number.isInteger(value),
//         message: "Month must be an integer between 0 and 11",
//       },
//     },

//     // ========================================================
//     // YEAR
//     // ========================================================

//     year: {
//       type: Number,
//       required: [true, "Year is required"],
//       min: [2000, "Year must be 2000 or later"],
//       validate: {
//         validator: (value) => Number.isInteger(value),
//         message: "Year must be a valid integer",
//       },
//     },

//     // ========================================================
//     // DESCRIPTION
//     // ========================================================

//     description: {
//       type: String,
//       trim: true,
//       maxlength: [500, "Description cannot exceed 500 characters"],
//       default: "",
//     },

//     // ========================================================
//     // EMAIL
//     // ========================================================

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//       index: true,
//     },

//     // ========================================================
//     // USER ID
//     // ========================================================

//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "User ID is required"],
//       index: true,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// // ============================================================
// // CALCULATE BUDGET VALUES
// // ============================================================

// budgetSchema.methods.calculateValues = function () {
//   const allocated = Number(this.allocatedAmount) || 0;
//   const spent = Number(this.spentAmount) || 0;

//   // ----------------------------------------------------------
//   // REMAINING
//   // ----------------------------------------------------------

//   this.remainingAmount = Math.max(allocated - spent, 0);

//   // ----------------------------------------------------------
//   // PERCENTAGE
//   // ----------------------------------------------------------

//   if (allocated > 0) {
//     this.percentageUsed = Number(((spent / allocated) * 100).toFixed(2));
//   } else {
//     this.percentageUsed = 0;
//   }

//   // ----------------------------------------------------------
//   // STATUS
//   // ----------------------------------------------------------

//   if (spent > allocated) {
//     this.status = "over-budget";
//   } else if (allocated === 0) {
//     this.status = "under-budget";
//   } else if (this.percentageUsed >= 80) {
//     this.status = "approaching-limit";
//   } else {
//     this.status = "on-track";
//   }
// };

// // ============================================================
// // PRE-SAVE
// // ============================================================

// budgetSchema.pre("save", function () {
//   this.category = String(this.category || "")
//     .trim()
//     .toLowerCase();

//   this.email = String(this.email || "")
//     .trim()
//     .toLowerCase();

//   this.description = String(this.description || "").trim();

//   const allocated = Number(this.allocatedAmount);

//   if (
//     !Number.isFinite(allocated) ||
//     !Number.isInteger(allocated) ||
//     allocated < 0
//   ) {
//     throw new Error("Allocated amount must be a valid whole number");
//   }

//   this.allocatedAmount = allocated;

//   const spent = Number(this.spentAmount) || 0;

//   if (!Number.isFinite(spent) || !Number.isInteger(spent) || spent < 0) {
//     throw new Error("Spent amount must be a valid whole number");
//   }

//   this.spentAmount = spent;

//   this.calculateValues();
// });

// // ============================================================
// // ADD EXPENSE TO BUDGET
// // ============================================================

// budgetSchema.methods.addExpense = function (amount) {
//   const numericAmount = Number(amount);

//   if (
//     !Number.isFinite(numericAmount) ||
//     !Number.isInteger(numericAmount) ||
//     numericAmount <= 0
//   ) {
//     throw new Error("Budget expense amount must be a positive whole number");
//   }

//   this.spentAmount += numericAmount;

//   this.calculateValues();

//   return this;
// };

// // ============================================================
// // REMOVE EXPENSE FROM BUDGET
// // ============================================================

// budgetSchema.methods.removeExpense = function (amount) {
//   const numericAmount = Number(amount);

//   if (
//     !Number.isFinite(numericAmount) ||
//     !Number.isInteger(numericAmount) ||
//     numericAmount <= 0
//   ) {
//     throw new Error("Budget restore amount must be a positive whole number");
//   }

//   this.spentAmount = Math.max(0, this.spentAmount - numericAmount);

//   this.calculateValues();

//   return this;
// };

// // ============================================================
// // UNIQUE BUDGET
// // ============================================================

// budgetSchema.index(
//   {
//     userId: 1,
//     category: 1,
//     month: 1,
//     year: 1,
//   },
//   {
//     unique: true,
//   },
// );

// // ============================================================
// // QUERY INDEXES
// // ============================================================

// budgetSchema.index({
//   userId: 1,
//   year: -1,
//   month: -1,
// });

// budgetSchema.index({
//   userId: 1,
//   category: 1,
// });

// budgetSchema.index({
//   email: 1,
//   year: -1,
//   month: -1,
// });

// budgetSchema.index({
//   email: 1,
//   category: 1,
// });

// // ============================================================
// // MODEL
// // ============================================================

// module.exports =
//   mongoose.models.Budget || mongoose.model("Budget", budgetSchema);

// ============================================================
// MODELS / BUDGET.JS
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// BUDGET SCHEMA
// ============================================================

const budgetSchema = new mongoose.Schema(
  {
    // ========================================================
    // CATEGORY
    // ========================================================

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },

    // ========================================================
    // ALLOCATED AMOUNT
    // ========================================================

    allocatedAmount: {
      type: Number,
      required: [true, "Allocated amount is required"],
      min: [0, "Allocated amount cannot be negative"],
      validate: {
        validator: (value) =>
          Number.isFinite(value) && Number.isInteger(value) && value >= 0,

        message: "Allocated amount must be a valid whole number",
      },
    },

    // ========================================================
    // SPENT AMOUNT
    // ========================================================

    spentAmount: {
      type: Number,
      default: 0,
      min: [0, "Spent amount cannot be negative"],
      validate: {
        validator: (value) =>
          Number.isFinite(value) && Number.isInteger(value) && value >= 0,

        message: "Spent amount must be a valid whole number",
      },
    },

    // ========================================================
    // REMAINING AMOUNT
    // ========================================================

    remainingAmount: {
      type: Number,
      default: 0,
      min: [0, "Remaining amount cannot be negative"],
    },

    // ========================================================
    // PERCENTAGE USED
    // ========================================================

    percentageUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ========================================================
    // STATUS
    // ========================================================

    status: {
      type: String,

      enum: ["on-track", "approaching-limit", "over-budget"],

      default: "on-track",
    },

    // ========================================================
    // MONTH
    // ========================================================

    month: {
      type: Number,
      required: [true, "Month is required"],
      min: [0, "Month must be between 0 and 11"],
      max: [11, "Month must be between 0 and 11"],

      validate: {
        validator: (value) => Number.isInteger(value),

        message: "Month must be an integer between 0 and 11",
      },
    },

    // ========================================================
    // YEAR
    // ========================================================

    year: {
      type: Number,
      required: [true, "Year is required"],

      min: [2000, "Year must be 2000 or later"],

      validate: {
        validator: (value) => Number.isInteger(value),

        message: "Year must be a valid integer",
      },
    },

    // ========================================================
    // DESCRIPTION
    // ========================================================

    description: {
      type: String,

      trim: true,

      maxlength: [500, "Description cannot exceed 500 characters"],

      default: "",
    },

    // ========================================================
    // EMAIL
    // ========================================================

    email: {
      type: String,

      required: [true, "Email is required"],

      trim: true,

      lowercase: true,

      index: true,
    },

    // ========================================================
    // USER ID
    // ========================================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: [true, "User ID is required"],

      index: true,
    },
  },

  {
    timestamps: true,
  },
);

// ============================================================
// CALCULATE BUDGET VALUES
// ============================================================

budgetSchema.methods.calculateValues = function () {
  const allocated = Number(this.allocatedAmount) || 0;

  const spent = Number(this.spentAmount) || 0;

  // --------------------------------------------------------
  // REMAINING
  // --------------------------------------------------------

  this.remainingAmount = Math.max(allocated - spent, 0);

  // --------------------------------------------------------
  // PERCENTAGE
  // --------------------------------------------------------

  if (allocated > 0) {
    this.percentageUsed = Number(((spent / allocated) * 100).toFixed(2));
  } else {
    this.percentageUsed = 0;
  }

  // --------------------------------------------------------
  // STATUS
  // --------------------------------------------------------

  if (allocated > 0 && spent > allocated) {
    this.status = "over-budget";
  } else if (allocated > 0 && this.percentageUsed >= 80) {
    this.status = "approaching-limit";
  } else {
    this.status = "on-track";
  }

  return this;
};

// ============================================================
// PRE SAVE
// ============================================================

budgetSchema.pre("save", function () {
  this.category = String(this.category || "")
    .trim()
    .toLowerCase();

  this.email = String(this.email || "")
    .trim()
    .toLowerCase();

  this.description = String(this.description || "").trim();

  const allocated = Number(this.allocatedAmount);

  if (
    !Number.isFinite(allocated) ||
    !Number.isInteger(allocated) ||
    allocated < 0
  ) {
    throw new Error("Allocated amount must be a valid whole number");
  }

  this.allocatedAmount = allocated;

  const spent = Number(this.spentAmount) || 0;

  if (!Number.isFinite(spent) || !Number.isInteger(spent) || spent < 0) {
    throw new Error("Spent amount must be a valid whole number");
  }

  this.spentAmount = spent;

  this.calculateValues();
});

// ============================================================
// ADD EXPENSE TO BUDGET
// ============================================================

budgetSchema.methods.addExpense = function (amount) {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    !Number.isInteger(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error("Budget expense amount must be a positive whole number");
  }

  this.spentAmount += numericAmount;

  this.calculateValues();

  return this;
};

// ============================================================
// REMOVE EXPENSE FROM BUDGET
// ============================================================

budgetSchema.methods.removeExpense = function (amount) {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    !Number.isInteger(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error("Budget restore amount must be a positive whole number");
  }

  this.spentAmount = Math.max(0, this.spentAmount - numericAmount);

  this.calculateValues();

  return this;
};

// ============================================================
// UNIQUE INDEX
// ============================================================

budgetSchema.index(
  {
    userId: 1,
    category: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  },
);

// ============================================================
// QUERY INDEXES
// ============================================================

budgetSchema.index({
  userId: 1,
  year: -1,
  month: -1,
});

budgetSchema.index({
  userId: 1,
  category: 1,
});

budgetSchema.index({
  email: 1,
  year: -1,
  month: -1,
});

budgetSchema.index({
  email: 1,
  category: 1,
});

// ============================================================
// MODEL
// ============================================================

module.exports =
  mongoose.models.Budget || mongoose.model("Budget", budgetSchema);
