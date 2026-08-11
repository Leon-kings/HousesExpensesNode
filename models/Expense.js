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
//     //
//     // IMPORTANT:
//     // Keep these capitalized because your createExpense
//     // controller validates the same values.
//     // ----------------------------------------------------------

//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       enum: {
//         values: [
//           "Food",
//           "Utilities",
//           "Transport",
//           "Entertainment",
//           "Shopping",
//           "Healthcare",
//           "Education",
//           "Salary",
//           "Freelance",
//           "Investment",
//           "Rent",
//           "Insurance",
//           "Other",
//         ],
//         message: "Invalid expense category",
//       },
//     },

//     // ----------------------------------------------------------
//     // TYPE
//     // ----------------------------------------------------------

//     type: {
//       type: String,
//       enum: {
//         values: ["expense", "income"],
//         message: "Type must be either expense or income",
//       },
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
//           Number.isFinite(value) &&
//           Number.isInteger(value) &&
//           value > 0,
//         message:
//           "Amount must be a positive whole number",
//       },
//     },

//     // ----------------------------------------------------------
//     // DATE
//     // ----------------------------------------------------------

//     date: {
//       type: Date,
//       required: [true, "Date is required"],
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
//     // Kept for compatibility with existing controllers,
//     // notifications, and frontend code.
//     // ----------------------------------------------------------

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//       index: true,
//     },

//     // ----------------------------------------------------------
//     // MONEY USED FROM INCOME
//     // ----------------------------------------------------------

//     incomeUsed: {
//       type: Number,
//       default: 0,
//       min: [
//         0,
//         "Income used cannot be negative",
//       ],
//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) &&
//           Number.isInteger(value),
//         message:
//           "Income used must be a valid whole number",
//       },
//     },

//     // ----------------------------------------------------------
//     // MONEY USED FROM SAVINGS
//     // ----------------------------------------------------------

//     savingsUsed: {
//       type: Number,
//       default: 0,
//       min: [
//         0,
//         "Savings used cannot be negative",
//       ],
//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) &&
//           Number.isInteger(value),
//         message:
//           "Savings used must be a valid whole number",
//       },
//     },

//     // ----------------------------------------------------------
//     // SAVINGS ALLOCATIONS
//     //
//     // Records exactly which savings accounts were used
//     // to fund this expense.
//     // ----------------------------------------------------------

//     // savingsAllocations: [
//     //   {
//     //     savingsId: {
//     //       type: mongoose.Schema.Types.ObjectId,
//     //       ref: "Savings",
//     //       required: true,
//     //     },

//     //     amount: {
//     //       type: Number,
//     //       required: true,
//     //       min: [
//     //         1,
//     //         "Savings allocation must be greater than zero",
//     //       ],
//     //       validate: {
//     //         validator: (value) =>
//     //           Number.isFinite(value) &&
//     //           Number.isInteger(value),
//     //         message:
//     //           "Savings allocation must be a valid whole number",
//     //       },
//     //     },
//     //   },
//     // ],

//     savingsAllocations: {
//   type: [
//     {
//       savingsId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Savings",
//         required: true,
//       },

//       amount: {
//         type: Number,
//         required: true,
//         min: [1, "Savings allocation must be greater than zero"],
//         validate: {
//           validator: (value) =>
//             Number.isFinite(value) &&
//             Number.isInteger(value),
//           message:
//             "Savings allocation must be a valid whole number",
//         },
//       },
//     },
//   ],
//   default: [],
// },

//     // ----------------------------------------------------------
//     // BUDGET REFERENCE
//     // ----------------------------------------------------------

//     budgetId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Budget",
//       default: null,
//       index: true,
//     },

//     // ----------------------------------------------------------
//     // AMOUNT APPLIED TO BUDGET
//     // ----------------------------------------------------------

//     budgetAmountUsed: {
//       type: Number,
//       default: 0,
//       min: [
//         0,
//         "Budget amount used cannot be negative",
//       ],
//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) &&
//           Number.isInteger(value),
//         message:
//           "Budget amount used must be a valid whole number",
//       },
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
//   // ----------------------------------------------------------
//   // DESCRIPTION
//   // ----------------------------------------------------------

//   this.description = String(
//     this.description || ""
//   ).trim();

//   // ----------------------------------------------------------
//   // USER
//   // ----------------------------------------------------------

//   this.user = String(
//     this.user || ""
//   ).trim();

//   // ----------------------------------------------------------
//   // EMAIL
//   // ----------------------------------------------------------

//   this.email = String(
//     this.email || ""
//   )
//     .trim()
//     .toLowerCase();

//   // ----------------------------------------------------------
//   // TYPE
//   // ----------------------------------------------------------

//   this.type = this.type || "expense";

//   // ----------------------------------------------------------
//   // AMOUNT
//   // ----------------------------------------------------------

//   const numericAmount = Number(this.amount);

//   if (
//     !Number.isFinite(numericAmount) ||
//     !Number.isInteger(numericAmount) ||
//     numericAmount <= 0
//   ) {
//     throw new Error(
//       "Amount must be a positive whole number"
//     );
//   }

//   this.amount = numericAmount;

//   // ----------------------------------------------------------
//   // INCOME USED
//   // ----------------------------------------------------------

//   const numericIncomeUsed =
//     Number(this.incomeUsed) || 0;

//   this.incomeUsed = Math.max(
//     0,
//     Math.trunc(numericIncomeUsed)
//   );

//   // ----------------------------------------------------------
//   // SAVINGS USED
//   // ----------------------------------------------------------

//   const numericSavingsUsed =
//     Number(this.savingsUsed) || 0;

//   this.savingsUsed = Math.max(
//     0,
//     Math.trunc(numericSavingsUsed)
//   );

//   // ----------------------------------------------------------
//   // BUDGET AMOUNT USED
//   // ----------------------------------------------------------

//   const numericBudgetAmount =
//     Number(this.budgetAmountUsed) || 0;

//   this.budgetAmountUsed = Math.max(
//     0,
//     Math.trunc(numericBudgetAmount)
//   );
// });

// // ============================================================
// // INDEXES
// // ============================================================

// // User expenses ordered by newest date.

// expenseSchema.index({
//   userId: 1,
//   date: -1,
// });

// // User expenses by category.

// expenseSchema.index({
//   userId: 1,
//   category: 1,
// });

// // Email-based compatibility query.

// expenseSchema.index({
//   email: 1,
//   date: -1,
// });

// // Email + category query.

// expenseSchema.index({
//   email: 1,
//   category: 1,
// });

// // Budget-related expense lookup.

// expenseSchema.index({
//   userId: 1,
//   budgetId: 1,
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

// ============================================================
// ALLOCATION SUB-SCHEMAS
// ============================================================
//
// These records allow the Expense controller to know exactly
// where the money came from.
//
// Example:
//
// Expense = 150000
//
// incomeAllocations:
// [
//   {
//     incomeId: "...",
//     amount: 100000
//   }
// ]
//
// savingsAllocations:
// [
//   {
//     savingsId: "...",
//     amount: 50000
//   }
// ]
//
// This is extremely important when an expense is deleted,
// because the exact money can be returned to the original
// Income and Savings records.
// ============================================================

const incomeAllocationSchema =
  new mongoose.Schema(
    {
      // --------------------------------------------------------
      // INCOME RECORD USED
      // --------------------------------------------------------

      incomeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Income",
        required: true,
      },

      // --------------------------------------------------------
      // AMOUNT USED FROM THIS INCOME
      // --------------------------------------------------------

      amount: {
        type: Number,
        required: true,
        min: [
          1,
          "Income allocation must be greater than zero",
        ],
        validate: {
          validator: (value) =>
            Number.isFinite(value) &&
            Number.isInteger(value) &&
            value > 0,
          message:
            "Income allocation must be a valid whole number",
        },
      },
    },
    {
      _id: false,
    }
  );

const savingsAllocationSchema =
  new mongoose.Schema(
    {
      // --------------------------------------------------------
      // SAVINGS RECORD USED
      // --------------------------------------------------------

      savingsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Savings",
        required: true,
      },

      // --------------------------------------------------------
      // AMOUNT USED FROM THIS SAVINGS RECORD
      // --------------------------------------------------------

      amount: {
        type: Number,
        required: true,
        min: [
          1,
          "Savings allocation must be greater than zero",
        ],
        validate: {
          validator: (value) =>
            Number.isFinite(value) &&
            Number.isInteger(value) &&
            value > 0,
          message:
            "Savings allocation must be a valid whole number",
        },
      },
    },
    {
      _id: false,
    }
  );

// ============================================================
// EXPENSE SCHEMA
// ============================================================

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
    // Keep these values synchronized with the frontend and
    // Expense controller.
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
    //
    // This model is primarily used for expenses, but the field
    // is retained for compatibility with your existing system.
    // ----------------------------------------------------------

    type: {
      type: String,
      enum: {
        values: [
          "expense",
          "income",
        ],
        message:
          "Type must be either expense or income",
      },
      default: "expense",
    },

    // ----------------------------------------------------------
    // AMOUNT
    // ----------------------------------------------------------

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [
        1,
        "Amount must be greater than zero",
      ],
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
    // USER EMAIL
    //
    // Kept for compatibility with:
    // - frontend
    // - controllers
    // - notifications
    // ----------------------------------------------------------

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },

    // ==========================================================
    // MONEY SOURCE INFORMATION
    // ==========================================================

    // ----------------------------------------------------------
    // TOTAL MONEY USED FROM INCOME
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
          Number.isInteger(value) &&
          value >= 0,
        message:
          "Income used must be a valid whole number",
      },
    },

    // ----------------------------------------------------------
    // TOTAL MONEY USED FROM SAVINGS
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
          Number.isInteger(value) &&
          value >= 0,
        message:
          "Savings used must be a valid whole number",
      },
    },

    // ----------------------------------------------------------
    // INCOME ALLOCATIONS
    //
    // Records exactly which Income documents funded the expense.
    //
    // Example:
    //
    // Expense = 150000
    //
    // incomeAllocations:
    // [
    //   {
    //     incomeId: "income1",
    //     amount: 100000
    //   },
    //   {
    //     incomeId: "income2",
    //     amount: 50000
    //   }
    // ]
    // ----------------------------------------------------------

    incomeAllocations: {
      type: [
        incomeAllocationSchema,
      ],
      default: [],
    },

    // ----------------------------------------------------------
    // SAVINGS ALLOCATIONS
    //
    // Records exactly which Savings documents funded the
    // expense.
    // ----------------------------------------------------------

    savingsAllocations: {
      type: [
        savingsAllocationSchema,
      ],
      default: [],
    },

    // ==========================================================
    // BUDGET INFORMATION
    // ==========================================================

    // ----------------------------------------------------------
    // MATCHED BUDGET
    //
    // If an expense category matches a budget for the same
    // user/month/year, this contains that Budget ID.
    //
    // Otherwise it remains null.
    // ----------------------------------------------------------

    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
      index: true,
    },

    // ----------------------------------------------------------
    // AMOUNT APPLIED TO BUDGET
    //
    // Normally this will equal the expense amount when the
    // expense belongs to the budget category.
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
          Number.isInteger(value) &&
          value >= 0,
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
// VALIDATE MONEY ALLOCATIONS
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

  this.type =
    this.type || "expense";

  // ----------------------------------------------------------
  // AMOUNT
  // ----------------------------------------------------------

  const numericAmount =
    Number(this.amount);

  if (
    !Number.isFinite(
      numericAmount
    ) ||
    !Number.isInteger(
      numericAmount
    ) ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Amount must be a positive whole number"
    );
  }

  this.amount =
    numericAmount;

  // ----------------------------------------------------------
  // INCOME USED
  // ----------------------------------------------------------

  const numericIncomeUsed =
    Number(this.incomeUsed) || 0;

  if (
    numericIncomeUsed < 0 ||
    !Number.isFinite(
      numericIncomeUsed
    )
  ) {
    throw new Error(
      "Income used cannot be negative"
    );
  }

  this.incomeUsed =
    Math.trunc(
      numericIncomeUsed
    );

  // ----------------------------------------------------------
  // SAVINGS USED
  // ----------------------------------------------------------

  const numericSavingsUsed =
    Number(this.savingsUsed) || 0;

  if (
    numericSavingsUsed < 0 ||
    !Number.isFinite(
      numericSavingsUsed
    )
  ) {
    throw new Error(
      "Savings used cannot be negative"
    );
  }

  this.savingsUsed =
    Math.trunc(
      numericSavingsUsed
    );

  // ----------------------------------------------------------
  // BUDGET AMOUNT USED
  // ----------------------------------------------------------

  const numericBudgetAmount =
    Number(
      this.budgetAmountUsed
    ) || 0;

  if (
    numericBudgetAmount < 0 ||
    !Number.isFinite(
      numericBudgetAmount
    )
  ) {
    throw new Error(
      "Budget amount used cannot be negative"
    );
  }

  this.budgetAmountUsed =
    Math.trunc(
      numericBudgetAmount
    );

  // ==========================================================
  // VALIDATE SOURCE TOTAL
  // ==========================================================
  //
  // The money used from income + savings must equal the
  // expense amount.
  //
  // Example:
  //
  // amount = 100000
  // incomeUsed = 70000
  // savingsUsed = 30000
  //
  // 70000 + 30000 = 100000
  //
  // If this doesn't match, the controller has created an
  // invalid expense.
  // ==========================================================

  const totalUsed =
    this.incomeUsed +
    this.savingsUsed;

  if (
    totalUsed !==
    this.amount
  ) {
    throw new Error(
      `Expense funding mismatch: incomeUsed (${this.incomeUsed}) + savingsUsed (${this.savingsUsed}) must equal amount (${this.amount})`
    );
  }

  // ==========================================================
  // VALIDATE INCOME ALLOCATIONS
  // ==========================================================

  const incomeAllocationTotal =
    this.incomeAllocations.reduce(
      (total, allocation) => {
        const allocationAmount =
          Number(
            allocation.amount
          ) || 0;

        return (
          total +
          allocationAmount
        );
      },
      0
    );

  if (
    incomeAllocationTotal !==
    this.incomeUsed
  ) {
    throw new Error(
      `Income allocation mismatch: allocations (${incomeAllocationTotal}) must equal incomeUsed (${this.incomeUsed})`
    );
  }

  // ==========================================================
  // VALIDATE SAVINGS ALLOCATIONS
  // ==========================================================

  const savingsAllocationTotal =
    this.savingsAllocations.reduce(
      (total, allocation) => {
        const allocationAmount =
          Number(
            allocation.amount
          ) || 0;

        return (
          total +
          allocationAmount
        );
      },
      0
    );

  if (
    savingsAllocationTotal !==
    this.savingsUsed
  ) {
    throw new Error(
      `Savings allocation mismatch: allocations (${savingsAllocationTotal}) must equal savingsUsed (${this.savingsUsed})`
    );
  }

  // ==========================================================
  // VALIDATE BUDGET AMOUNT
  // ==========================================================

  if (
    this.budgetAmountUsed >
    this.amount
  ) {
    throw new Error(
      "Budget amount used cannot exceed expense amount"
    );
  }

  // ==========================================================
  // PREVENT NON-EXPENSE MONEY ALLOCATION
  // ==========================================================

  if (
    this.type !== "expense" &&
    (
      this.incomeUsed > 0 ||
      this.savingsUsed > 0
    )
  ) {
    throw new Error(
      "Income and savings allocations can only be used by expense records"
    );
  }
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

// User expenses by type.

expenseSchema.index({
  userId: 1,
  type: 1,
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

// Expense lookup by income allocation.

expenseSchema.index({
  "incomeAllocations.incomeId": 1,
});

// Expense lookup by savings allocation.

expenseSchema.index({
  "savingsAllocations.savingsId": 1,
});

// ============================================================
// MODEL
// ============================================================

module.exports =
  mongoose.models.Expense ||
  mongoose.model(
    "Expense",
    expenseSchema
  );

