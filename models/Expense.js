// const mongoose = require("mongoose");
// const Income = require("./Income");
// const Savings = require("./Savings");
// const Notification = require("./Notification");

// const expenseSchema = new mongoose.Schema(
//   {
//     description: {
//       type: String,
//       required: [true, "Description is required"],
//       trim: true,
//       maxlength: [200, "Description cannot exceed 200 characters"],
//     },
//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       enum: [
//         "Food",
//         "Utilities",
//         "Transport",
//         "Entertainment",
//         "Shopping",
//         "Healthcare",
//         "Education",
//         "Salary",
//         "Freelance",
//         "Investment",
//         "Rent",
//         "Insurance",
//         "Other",
//       ],
//     },
//     type: {
//       type: String,
//       enum: ["expense", "income"],
//       default: "expense",
//     },
//     amount: {
//       type: Number,
//       required: [true, "Amount is required"],
//       min: [1, "Amount must be greater than zero"],
//       validate: {
//         validator: Number.isInteger,
//         message: "Amount must be a whole number",
//       },
//     },
//     date: {
//       type: Date,
//       default: Date.now,
//     },
//     user: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// // 🔥 MAIN LOGIC
// expenseSchema.post("save", async function (doc) {
//   try {
//     const income = await Income.findOne({ email: doc.user }).sort({ createdAt: -1 });

//     if (!income) return;

//     let remainingExpense = doc.amount;

//     // ✅ STEP 1: USE INCOME FIRST
//     if (income.remainingAmount >= remainingExpense) {
//       income.remainingAmount -= remainingExpense;
//       remainingExpense = 0;
//     } else {
//       remainingExpense -= income.remainingAmount;
//       income.remainingAmount = 0;
//     }

//     await income.save();

//     let usedSavings = 0;

//     // ❗ STEP 2: USE SAVINGS IF NEEDED
//     if (remainingExpense > 0) {
//       const savingsList = await Savings.find({
//         email: doc.user,
//         isCompleted: false,
//       }).sort({ priority: -1 }); // high priority first

//       for (let saving of savingsList) {
//         if (remainingExpense <= 0) break;

//         if (saving.currentAmount > 0) {
//           let deduct = Math.min(saving.currentAmount, remainingExpense);

//           saving.currentAmount -= deduct;
//           remainingExpense -= deduct;
//           usedSavings += deduct;

//           await saving.save();
//         }
//       }
//     }

//     // 📊 CALCULATE %
//     const percentage = ((income.remainingAmount / income.amount) * 100).toFixed(1);

//     // 🔔 MESSAGE
//     let message = `Expense ${doc.amount} recorded. Remaining income: ${income.remainingAmount} (${percentage}%)`;

//     let type = "info";

//     if (percentage < 50) {
//       type = "warning";
//       message += " ⚠️ Income is getting low.";
//     }

//     if (percentage < 20) {
//       type = "alert";
//       message += " 🚨 Critical low income.";
//     }

//     if (usedSavings > 0) {
//       type = "alert";
//       message += ` Used ${usedSavings} from savings!`;
//     }

//     // 🔔 SAVE NOTIFICATION
//     await Notification.create({
//       userId: doc.userId,
//       message,
//       type,
//     });

//   } catch (err) {
//     console.error("Expense processing error:", err.message);
//   }
// });

// module.exports = mongoose.model("Expense", expenseSchema);

// ============================================================
// MODELS / EXPENSE.JS
// ============================================================

// const mongoose = require("mongoose");

// const expenseSchema = new mongoose.Schema(
//   {
//     description: {
//       type: String,
//       required: [true, "Description is required"],
//       trim: true,
//       maxlength: [200, "Description cannot exceed 200 characters"],
//     },

//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       enum: [
//         "Food",
//         "Utilities",
//         "Transport",
//         "Entertainment",
//         "Shopping",
//         "Healthcare",
//         "Education",
//         "Salary",
//         "Freelance",
//         "Investment",
//         "Rent",
//         "Insurance",
//         "Other",
//       ],
//     },

//     // An Expense should always be an expense.
//     type: {
//       type: String,
//       enum: ["expense"],
//       default: "expense",
//       immutable: true,
//     },

//     amount: {
//       type: Number,
//       required: [true, "Amount is required"],
//       min: [1, "Amount must be greater than zero"],
//       validate: {
//         validator: Number.isFinite,
//         message: "Amount must be a valid number",
//       },
//     },

//     date: {
//       type: Date,
//       default: Date.now,
//     },

//     user: {
//       type: String,
//       required: [true, "User is required"],
//       trim: true,
//       maxlength: [100, "User cannot exceed 100 characters"],
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
//       required: [true, "User ID is required"],
//       index: true,
//     },

//     // ========================================================
//     // MONEY FUNDING TRACKING
//     // ========================================================

//     incomeUsed: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     savingsUsed: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     savingsAllocations: [
//       {
//         savingsId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Savings",
//           required: true,
//         },

//         amount: {
//           type: Number,
//           required: true,
//           min: 0,
//         },
//       },
//     ],

//     budgetId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Budget",
//       default: null,
//     },

//     budgetAmountUsed: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// // ============================================================
// // INDEXES
// // ============================================================

// expenseSchema.index({
//   userId: 1,
//   date: -1,
// });

// expenseSchema.index({
//   userId: 1,
//   category: 1,
// });

// expenseSchema.index({
//   email: 1,
//   date: -1,
// });

// module.exports =
//   mongoose.models.Expense || mongoose.model("Expense", expenseSchema);














// // ============================================================
// // MODELS / EXPENSE.JS
// // ============================================================

// const mongoose = require("mongoose");

// const expenseSchema = new mongoose.Schema(
//   {
//     // ----------------------------------------------------------
//     // DESCRIPTION
//     // ----------------------------------------------------------

//     description: {
//       type: String,
//       required: [true, "Description is required"],
//       trim: true,
//       maxlength: [
//         200,
//         "Description cannot exceed 200 characters",
//       ],
//     },

//     // ----------------------------------------------------------
//     // CATEGORY
//     // ----------------------------------------------------------

//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       enum: [
//         "Food",
//         "Utilities",
//         "Transport",
//         "Entertainment",
//         "Shopping",
//         "Healthcare",
//         "Education",
//         "Salary",
//         "Freelance",
//         "Investment",
//         "Rent",
//         "Insurance",
//         "Other",
//       ],
//     },

//     // ----------------------------------------------------------
//     // TYPE
//     // ----------------------------------------------------------

//     type: {
//       type: String,
//       enum: ["expense", "income"],
//       default: "expense",
//     },

//     // ----------------------------------------------------------
//     // AMOUNT
//     // ----------------------------------------------------------

//     amount: {
//       type: Number,
//       required: [true, "Amount is required"],
//       min: [1, "Amount must be greater than zero"],
//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) && Number.isInteger(value),
//         message: "Amount must be a positive whole number",
//       },
//     },

//     // ----------------------------------------------------------
//     // DATE
//     // ----------------------------------------------------------

//     date: {
//       type: Date,
//       default: Date.now,
//     },

//     // ----------------------------------------------------------
//     // USER DISPLAY NAME
//     // ----------------------------------------------------------

//     user: {
//       type: String,
//       required: [true, "User is required"],
//       trim: true,
//       maxlength: [
//         100,
//         "User cannot exceed 100 characters",
//       ],
//     },

//     // ----------------------------------------------------------
//     // PRIMARY USER OWNERSHIP
//     // ----------------------------------------------------------

//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "User ID is required"],
//       index: true,
//     },

//     // ----------------------------------------------------------
//     // EMAIL
//     //
//     // Kept because your existing controllers use email.
//     // ----------------------------------------------------------

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//       index: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ============================================================
// // NORMALIZE BEFORE SAVE
// // ============================================================

// expenseSchema.pre("save", function () {
//   this.description = String(this.description || "").trim();

//   this.user = String(this.user || "").trim();

//   this.email = String(this.email || "")
//     .trim()
//     .toLowerCase();

//   // Keep the amount safe.
//   this.amount = Number(this.amount);

//   // Normalize expense type.
//   this.type = this.type || "expense";
// });

// // ============================================================
// // INDEXES
// // ============================================================

// expenseSchema.index({
//   userId: 1,
//   date: -1,
// });

// expenseSchema.index({
//   userId: 1,
//   category: 1,
// });

// expenseSchema.index({
//   email: 1,
//   date: -1,
// });

// expenseSchema.index({
//   email: 1,
//   category: 1,
// });

// // ============================================================
// // MODEL
// // ============================================================

// module.exports =
//   mongoose.models.Expense ||
//   mongoose.model("Expense", expenseSchema);















// ============================================================
// MODELS / EXPENSE.JS
// ============================================================

const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // DESCRIPTION
    // ----------------------------------------------------------

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [
        200,
        "Description cannot exceed 200 characters",
      ],
    },

    // ----------------------------------------------------------
    // CATEGORY
    //
    // IMPORTANT:
    // Keep these capitalized because your createExpense
    // controller validates the same values.
    // ----------------------------------------------------------

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: {
        values: [
          "Food",
          "Utilities",
          "Transport",
          "Entertainment",
          "Shopping",
          "Healthcare",
          "Education",
          "Salary",
          "Freelance",
          "Investment",
          "Rent",
          "Insurance",
          "Other",
        ],
        message: "Invalid expense category",
      },
    },

    // ----------------------------------------------------------
    // TYPE
    // ----------------------------------------------------------

    type: {
      type: String,
      enum: {
        values: ["expense", "income"],
        message: "Type must be either expense or income",
      },
      default: "expense",
    },

    // ----------------------------------------------------------
    // AMOUNT
    // ----------------------------------------------------------

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than zero"],
      validate: {
        validator: (value) =>
          Number.isFinite(value) &&
          Number.isInteger(value) &&
          value > 0,
        message:
          "Amount must be a positive whole number",
      },
    },

    // ----------------------------------------------------------
    // DATE
    // ----------------------------------------------------------

    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },

    // ----------------------------------------------------------
    // USER DISPLAY NAME
    // ----------------------------------------------------------

    user: {
      type: String,
      required: [true, "User is required"],
      trim: true,
      maxlength: [
        100,
        "User cannot exceed 100 characters",
      ],
    },

    // ----------------------------------------------------------
    // PRIMARY USER OWNERSHIP
    // ----------------------------------------------------------

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    // ----------------------------------------------------------
    // EMAIL
    //
    // Kept for compatibility with existing controllers,
    // notifications, and frontend code.
    // ----------------------------------------------------------

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },

    // ----------------------------------------------------------
    // MONEY USED FROM INCOME
    // ----------------------------------------------------------

    incomeUsed: {
      type: Number,
      default: 0,
      min: [
        0,
        "Income used cannot be negative",
      ],
      validate: {
        validator: (value) =>
          Number.isFinite(value) &&
          Number.isInteger(value),
        message:
          "Income used must be a valid whole number",
      },
    },

    // ----------------------------------------------------------
    // MONEY USED FROM SAVINGS
    // ----------------------------------------------------------

    savingsUsed: {
      type: Number,
      default: 0,
      min: [
        0,
        "Savings used cannot be negative",
      ],
      validate: {
        validator: (value) =>
          Number.isFinite(value) &&
          Number.isInteger(value),
        message:
          "Savings used must be a valid whole number",
      },
    },

    // ----------------------------------------------------------
    // SAVINGS ALLOCATIONS
    //
    // Records exactly which savings accounts were used
    // to fund this expense.
    // ----------------------------------------------------------

    // savingsAllocations: [
    //   {
    //     savingsId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Savings",
    //       required: true,
    //     },

    //     amount: {
    //       type: Number,
    //       required: true,
    //       min: [
    //         1,
    //         "Savings allocation must be greater than zero",
    //       ],
    //       validate: {
    //         validator: (value) =>
    //           Number.isFinite(value) &&
    //           Number.isInteger(value),
    //         message:
    //           "Savings allocation must be a valid whole number",
    //       },
    //     },
    //   },
    // ],

    savingsAllocations: {
  type: [
    {
      savingsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Savings",
        required: true,
      },

      amount: {
        type: Number,
        required: true,
        min: [1, "Savings allocation must be greater than zero"],
        validate: {
          validator: (value) =>
            Number.isFinite(value) &&
            Number.isInteger(value),
          message:
            "Savings allocation must be a valid whole number",
        },
      },
    },
  ],
  default: [],
},

    // ----------------------------------------------------------
    // BUDGET REFERENCE
    // ----------------------------------------------------------

    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
      index: true,
    },

    // ----------------------------------------------------------
    // AMOUNT APPLIED TO BUDGET
    // ----------------------------------------------------------

    budgetAmountUsed: {
      type: Number,
      default: 0,
      min: [
        0,
        "Budget amount used cannot be negative",
      ],
      validate: {
        validator: (value) =>
          Number.isFinite(value) &&
          Number.isInteger(value),
        message:
          "Budget amount used must be a valid whole number",
      },
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// NORMALIZE BEFORE SAVE
// ============================================================

expenseSchema.pre("save", function () {
  // ----------------------------------------------------------
  // DESCRIPTION
  // ----------------------------------------------------------

  this.description = String(
    this.description || ""
  ).trim();

  // ----------------------------------------------------------
  // USER
  // ----------------------------------------------------------

  this.user = String(
    this.user || ""
  ).trim();

  // ----------------------------------------------------------
  // EMAIL
  // ----------------------------------------------------------

  this.email = String(
    this.email || ""
  )
    .trim()
    .toLowerCase();

  // ----------------------------------------------------------
  // TYPE
  // ----------------------------------------------------------

  this.type = this.type || "expense";

  // ----------------------------------------------------------
  // AMOUNT
  // ----------------------------------------------------------

  const numericAmount = Number(this.amount);

  if (
    !Number.isFinite(numericAmount) ||
    !Number.isInteger(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Amount must be a positive whole number"
    );
  }

  this.amount = numericAmount;

  // ----------------------------------------------------------
  // INCOME USED
  // ----------------------------------------------------------

  const numericIncomeUsed =
    Number(this.incomeUsed) || 0;

  this.incomeUsed = Math.max(
    0,
    Math.trunc(numericIncomeUsed)
  );

  // ----------------------------------------------------------
  // SAVINGS USED
  // ----------------------------------------------------------

  const numericSavingsUsed =
    Number(this.savingsUsed) || 0;

  this.savingsUsed = Math.max(
    0,
    Math.trunc(numericSavingsUsed)
  );

  // ----------------------------------------------------------
  // BUDGET AMOUNT USED
  // ----------------------------------------------------------

  const numericBudgetAmount =
    Number(this.budgetAmountUsed) || 0;

  this.budgetAmountUsed = Math.max(
    0,
    Math.trunc(numericBudgetAmount)
  );
});

// ============================================================
// INDEXES
// ============================================================

// User expenses ordered by newest date.

expenseSchema.index({
  userId: 1,
  date: -1,
});

// User expenses by category.

expenseSchema.index({
  userId: 1,
  category: 1,
});

// Email-based compatibility query.

expenseSchema.index({
  email: 1,
  date: -1,
});

// Email + category query.

expenseSchema.index({
  email: 1,
  category: 1,
});

// Budget-related expense lookup.

expenseSchema.index({
  userId: 1,
  budgetId: 1,
});

// ============================================================
// MODEL
// ============================================================

module.exports =
  mongoose.models.Expense ||
  mongoose.model("Expense", expenseSchema);

