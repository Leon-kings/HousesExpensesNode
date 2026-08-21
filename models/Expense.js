// // ============================================================
// // MODELS / EXPENSE.JS
// // ============================================================

// const mongoose = require("mongoose");

// // ============================================================
// // INCOME ALLOCATION SUB-SCHEMA
// // ============================================================

// const incomeAllocationSchema =
//   new mongoose.Schema(
//     {
//       incomeId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Income",
//         required: true,
//       },

//       amount: {
//         type: Number,
//         required: true,
//         min: [
//           1,
//           "Income allocation must be greater than zero",
//         ],
//         validate: {
//           validator: (value) =>
//             Number.isFinite(value) &&
//             Number.isInteger(value) &&
//             value > 0,
//           message:
//             "Income allocation must be a valid whole number",
//         },
//       },
//     },
//     {
//       _id: false,
//     }
//   );

// // ============================================================
// // SAVINGS ALLOCATION SUB-SCHEMA
// // ============================================================

// const savingsAllocationSchema =
//   new mongoose.Schema(
//     {
//       savingsId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Savings",
//         required: true,
//       },

//       amount: {
//         type: Number,
//         required: true,
//         min: [
//           1,
//           "Savings allocation must be greater than zero",
//         ],
//         validate: {
//           validator: (value) =>
//             Number.isFinite(value) &&
//             Number.isInteger(value) &&
//             value > 0,
//           message:
//             "Savings allocation must be a valid whole number",
//         },
//       },
//     },
//     {
//       _id: false,
//     }
//   );

// // ============================================================
// // EXPENSE SCHEMA
// // ============================================================

// const expenseSchema =
//   new mongoose.Schema(
//     {
//       // ======================================================
//       // DESCRIPTION
//       // ======================================================

//       description: {
//         type: String,
//         required: [
//           true,
//           "Description is required",
//         ],
//         trim: true,
//         maxlength: [
//           200,
//           "Description cannot exceed 200 characters",
//         ],
//       },

//       // ======================================================
//       // CATEGORY
//       // ======================================================

//       category: {
//         type: String,
//         required: [
//           true,
//           "Category is required",
//         ],
//         trim: true,
//         enum: {
//           values: [
//             "Food",
//             "Utilities",
//             "Transport",
//             "Entertainment",
//             "Shopping",
//             "Healthcare",
//             "Education",
//             "Salary",
//             "Freelance",
//             "Investment",
//             "Rent",
//             "Insurance",
//             "Other",
//           ],
//           message:
//             "Invalid expense category",
//         },
//       },

//       // ======================================================
//       // TYPE
//       // ======================================================

//       type: {
//         type: String,
//         enum: {
//           values: [
//             "expense",
//             "income",
//           ],
//           message:
//             "Type must be either expense or income",
//         },
//         default: "expense",
//       },

//       // ======================================================
//       // AMOUNT
//       // ======================================================

//       amount: {
//         type: Number,
//         required: [
//           true,
//           "Amount is required",
//         ],
//         min: [
//           1,
//           "Amount must be greater than zero",
//         ],
//         validate: {
//           validator: (value) =>
//             Number.isFinite(value) &&
//             Number.isInteger(value) &&
//             value > 0,
//           message:
//             "Amount must be a positive whole number",
//         },
//       },

//       // ======================================================
//       // DATE
//       // ======================================================

//       date: {
//         type: Date,
//         required: [
//           true,
//           "Date is required",
//         ],
//         default: Date.now,
//       },

//       // ======================================================
//       // USER DISPLAY NAME
//       // ======================================================

//       user: {
//         type: String,
//         required: [
//           true,
//           "User is required",
//         ],
//         trim: true,
//         maxlength: [
//           100,
//           "User cannot exceed 100 characters",
//         ],
//       },

//       // ======================================================
//       // USER ID
//       // ======================================================

//       userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: [
//           true,
//           "User ID is required",
//         ],
//         index: true,
//       },

//       // ======================================================
//       // EMAIL
//       // ======================================================

//       email: {
//         type: String,
//         required: [
//           true,
//           "Email is required",
//         ],
//         trim: true,
//         lowercase: true,
//         index: true,
//       },

//       // ======================================================
//       // TOTAL USED FROM INCOME
//       // ======================================================

//       incomeUsed: {
//         type: Number,
//         default: 0,
//         min: [
//           0,
//           "Income used cannot be negative",
//         ],
//         validate: {
//           validator: (value) =>
//             Number.isFinite(value) &&
//             Number.isInteger(value) &&
//             value >= 0,
//           message:
//             "Income used must be a valid whole number",
//         },
//       },

//       // ======================================================
//       // TOTAL USED FROM SAVINGS
//       // ======================================================

//       savingsUsed: {
//         type: Number,
//         default: 0,
//         min: [
//           0,
//           "Savings used cannot be negative",
//         ],
//         validate: {
//           validator: (value) =>
//             Number.isFinite(value) &&
//             Number.isInteger(value) &&
//             value >= 0,
//           message:
//             "Savings used must be a valid whole number",
//         },
//       },

//       // ======================================================
//       // INCOME ALLOCATIONS
//       // ======================================================

//       incomeAllocations: {
//         type: [
//           incomeAllocationSchema,
//         ],
//         default: [],
//       },

//       // ======================================================
//       // SAVINGS ALLOCATIONS
//       // ======================================================

//       savingsAllocations: {
//         type: [
//           savingsAllocationSchema,
//         ],
//         default: [],
//       },

//       // ======================================================
//       // MATCHED BUDGET
//       // ======================================================

//       budgetId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Budget",
//         default: null,
//         index: true,
//       },

//       // ======================================================
//       // AMOUNT APPLIED TO BUDGET
//       // ======================================================

//       budgetAmountUsed: {
//         type: Number,
//         default: 0,
//         min: [
//           0,
//           "Budget amount used cannot be negative",
//         ],
//         validate: {
//           validator: (value) =>
//             Number.isFinite(value) &&
//             Number.isInteger(value) &&
//             value >= 0,
//           message:
//             "Budget amount used must be a valid whole number",
//         },
//       },
//     },
//     {
//       timestamps: true,
//     }
//   );

// // ============================================================
// // PRE-SAVE VALIDATION
// // ============================================================

// expenseSchema.pre("save", function () {
//   // ----------------------------------------------------------
//   // DESCRIPTION
//   // ----------------------------------------------------------

//   this.description =
//     String(
//       this.description || ""
//     ).trim();

//   // ----------------------------------------------------------
//   // USER
//   // ----------------------------------------------------------

//   this.user =
//     String(
//       this.user || ""
//     ).trim();

//   // ----------------------------------------------------------
//   // EMAIL
//   // ----------------------------------------------------------

//   this.email =
//     String(
//       this.email || ""
//     )
//       .trim()
//       .toLowerCase();

//   // ----------------------------------------------------------
//   // TYPE
//   // ----------------------------------------------------------

//   this.type =
//     this.type || "expense";

//   // ----------------------------------------------------------
//   // CATEGORY
//   // ----------------------------------------------------------

//   this.category =
//     String(
//       this.category || ""
//     ).trim();

//   // ----------------------------------------------------------
//   // AMOUNT
//   // ----------------------------------------------------------

//   const numericAmount =
//     Number(this.amount);

//   if (
//     !Number.isFinite(numericAmount) ||
//     !Number.isInteger(numericAmount) ||
//     numericAmount <= 0
//   ) {
//     throw new Error(
//       "Amount must be a positive whole number"
//     );
//   }

//   this.amount =
//     numericAmount;

//   // ----------------------------------------------------------
//   // INCOME USED
//   // ----------------------------------------------------------

//   const numericIncomeUsed =
//     Number(this.incomeUsed) || 0;

//   if (
//     !Number.isFinite(
//       numericIncomeUsed
//     ) ||
//     !Number.isInteger(
//       numericIncomeUsed
//     ) ||
//     numericIncomeUsed < 0
//   ) {
//     throw new Error(
//       "Income used must be a valid whole number"
//     );
//   }

//   this.incomeUsed =
//     numericIncomeUsed;

//   // ----------------------------------------------------------
//   // SAVINGS USED
//   // ----------------------------------------------------------

//   const numericSavingsUsed =
//     Number(this.savingsUsed) || 0;

//   if (
//     !Number.isFinite(
//       numericSavingsUsed
//     ) ||
//     !Number.isInteger(
//       numericSavingsUsed
//     ) ||
//     numericSavingsUsed < 0
//   ) {
//     throw new Error(
//       "Savings used must be a valid whole number"
//     );
//   }

//   this.savingsUsed =
//     numericSavingsUsed;

//   // ==========================================================
//   // FUNDING TOTAL
//   // ==========================================================

//   const totalUsed =
//     this.incomeUsed +
//     this.savingsUsed;

//   if (
//     totalUsed !==
//     this.amount
//   ) {
//     throw new Error(
//       `Expense funding mismatch: incomeUsed (${this.incomeUsed}) + savingsUsed (${this.savingsUsed}) must equal amount (${this.amount})`
//     );
//   }

//   // ==========================================================
//   // INCOME ALLOCATION TOTAL
//   // ==========================================================

//   const incomeAllocationTotal =
//     this.incomeAllocations.reduce(
//       (total, allocation) => {
//         return (
//           total +
//           Number(
//             allocation.amount
//           )
//         );
//       },
//       0
//     );

//   if (
//     incomeAllocationTotal !==
//     this.incomeUsed
//   ) {
//     throw new Error(
//       `Income allocation mismatch: allocations (${incomeAllocationTotal}) must equal incomeUsed (${this.incomeUsed})`
//     );
//   }

//   // ==========================================================
//   // SAVINGS ALLOCATION TOTAL
//   // ==========================================================

//   const savingsAllocationTotal =
//     this.savingsAllocations.reduce(
//       (total, allocation) => {
//         return (
//           total +
//           Number(
//             allocation.amount
//           )
//         );
//       },
//       0
//     );

//   if (
//     savingsAllocationTotal !==
//     this.savingsUsed
//   ) {
//     throw new Error(
//       `Savings allocation mismatch: allocations (${savingsAllocationTotal}) must equal savingsUsed (${this.savingsUsed})`
//     );
//   }

//   // ==========================================================
//   // BUDGET VALIDATION
//   // ==========================================================

//   const numericBudgetAmount =
//     Number(
//       this.budgetAmountUsed
//     ) || 0;

//   if (
//     !Number.isFinite(
//       numericBudgetAmount
//     ) ||
//     !Number.isInteger(
//       numericBudgetAmount
//     ) ||
//     numericBudgetAmount < 0
//   ) {
//     throw new Error(
//       "Budget amount used must be a valid whole number"
//     );
//   }

//   this.budgetAmountUsed =
//     numericBudgetAmount;

//   if (
//     this.budgetAmountUsed >
//     this.amount
//   ) {
//     throw new Error(
//       "Budget amount used cannot exceed expense amount"
//     );
//   }

//   // ==========================================================
//   // ONLY EXPENSES CAN USE MONEY
//   // ==========================================================

//   if (
//     this.type !== "expense" &&
//     (
//       this.incomeUsed > 0 ||
//       this.savingsUsed > 0
//     )
//   ) {
//     throw new Error(
//       "Income and savings allocations can only be used by expense records"
//     );
//   }
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
//   userId: 1,
//   type: 1,
// });

// expenseSchema.index({
//   email: 1,
//   date: -1,
// });

// expenseSchema.index({
//   email: 1,
//   category: 1,
// });

// expenseSchema.index({
//   userId: 1,
//   budgetId: 1,
// });

// expenseSchema.index({
//   "incomeAllocations.incomeId": 1,
// });

// expenseSchema.index({
//   "savingsAllocations.savingsId": 1,
// });

// // ============================================================
// // MODEL
// // ============================================================

// module.exports =
//   mongoose.models.Expense ||
//   mongoose.model(
//     "Expense",
//     expenseSchema
//   );

// // ============================================================
// // MODELS / EXPENSE.JS
// // ============================================================

// const mongoose = require("mongoose");

// // ============================================================
// // INCOME ALLOCATION SUB-SCHEMA
// // ============================================================

// const incomeAllocationSchema = new mongoose.Schema(
//   {
//     incomeId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Income",
//       required: true,
//     },

//     amount: {
//       type: Number,
//       required: true,
//       min: [1, "Income allocation must be greater than zero"],
//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) && Number.isInteger(value) && value > 0,

//         message: "Income allocation must be a valid whole number",
//       },
//     },
//   },
//   {
//     _id: false,
//   },
// );

// // ============================================================
// // SAVINGS ALLOCATION SUB-SCHEMA
// // ============================================================

// const savingsAllocationSchema = new mongoose.Schema(
//   {
//     savingsId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Savings",
//       required: true,
//     },

//     amount: {
//       type: Number,
//       required: true,
//       min: [1, "Savings allocation must be greater than zero"],
//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) && Number.isInteger(value) && value > 0,

//         message: "Savings allocation must be a valid whole number",
//       },
//     },
//   },
//   {
//     _id: false,
//   },
// );

// // ============================================================
// // EXPENSE SCHEMA
// // ============================================================

// const expenseSchema = new mongoose.Schema(
//   {
//     // ======================================================
//     // DESCRIPTION
//     // ======================================================

//     description: {
//       type: String,

//       required: [true, "Description is required"],

//       trim: true,

//       maxlength: [200, "Description cannot exceed 200 characters"],
//     },

//     // ======================================================
//     // CATEGORY
//     //
//     // IMPORTANT:
//     // Categories are stored lowercase so they match Budget.
//     // ======================================================

//     category: {
//       type: String,

//       required: [true, "Category is required"],

//       trim: true,

//       lowercase: true,

//       enum: {
//         values: [
//           "food",
//           "utilities",
//           "transport",
//           "entertainment",
//           "shopping",
//           "healthcare",
//           "education",
//           "salary",
//           "freelance",
//           "investment",
//           "rent",
//           "insurance",
//           "other",
//         ],

//         message: "Invalid expense category",
//       },
//     },

//     // ======================================================
//     // TYPE
//     // ======================================================

//     type: {
//       type: String,

//       enum: {
//         values: ["expense", "income"],

//         message: "Type must be either expense or income",
//       },

//       default: "expense",
//     },

//     // ======================================================
//     // AMOUNT
//     // ======================================================

//     amount: {
//       type: Number,

//       required: [true, "Amount is required"],

//       min: [1, "Amount must be greater than zero"],

//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) && Number.isInteger(value) && value > 0,

//         message: "Amount must be a positive whole number",
//       },
//     },

//     // ======================================================
//     // DATE
//     // ======================================================

//     date: {
//       type: Date,

//       required: [true, "Date is required"],

//       default: Date.now,
//     },

//     // ======================================================
//     // USER DISPLAY NAME
//     // ======================================================

//     user: {
//       type: String,

//       required: [true, "User is required"],

//       trim: true,

//       maxlength: [100, "User cannot exceed 100 characters"],
//     },

//     // ======================================================
//     // USER ID
//     // ======================================================

//     userId: {
//       type: mongoose.Schema.Types.ObjectId,

//       ref: "User",

//       required: [true, "User ID is required"],

//       index: true,
//     },

//     // ======================================================
//     // EMAIL
//     // ======================================================

//     email: {
//       type: String,

//       required: [true, "Email is required"],

//       trim: true,

//       lowercase: true,

//       index: true,
//     },

//     // ======================================================
//     // TOTAL USED FROM INCOME
//     // ======================================================

//     incomeUsed: {
//       type: Number,

//       default: 0,

//       min: [0, "Income used cannot be negative"],

//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) && Number.isInteger(value) && value >= 0,

//         message: "Income used must be a valid whole number",
//       },
//     },

//     // ======================================================
//     // TOTAL USED FROM SAVINGS
//     // ======================================================

//     savingsUsed: {
//       type: Number,

//       default: 0,

//       min: [0, "Savings used cannot be negative"],

//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) && Number.isInteger(value) && value >= 0,

//         message: "Savings used must be a valid whole number",
//       },
//     },

//     // ======================================================
//     // INCOME ALLOCATIONS
//     // ======================================================

//     incomeAllocations: {
//       type: [incomeAllocationSchema],

//       default: [],
//     },

//     // ======================================================
//     // SAVINGS ALLOCATIONS
//     // ======================================================

//     savingsAllocations: {
//       type: [savingsAllocationSchema],

//       default: [],
//     },

//     // ======================================================
//     // MATCHED BUDGET
//     //
//     // null means the expense was created before
//     // a matching budget existed.
//     // ======================================================

//     budgetId: {
//       type: mongoose.Schema.Types.ObjectId,

//       ref: "Budget",

//       default: null,

//       index: true,
//     },

//     // ======================================================
//     // AMOUNT APPLIED TO BUDGET
//     //
//     // 0 means this expense was not connected to a budget
//     // when it was created.
//     // ======================================================

//     budgetAmountUsed: {
//       type: Number,

//       default: 0,

//       min: [0, "Budget amount used cannot be negative"],

//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) && Number.isInteger(value) && value >= 0,

//         message: "Budget amount used must be a valid whole number",
//       },
//     },
//   },

//   {
//     timestamps: true,
//   },
// );

// // ============================================================
// // PRE-SAVE VALIDATION
// // ============================================================

// expenseSchema.pre("save", function () {
//   // --------------------------------------------------------
//   // DESCRIPTION
//   // --------------------------------------------------------

//   this.description = String(this.description || "").trim();

//   // --------------------------------------------------------
//   // USER
//   // --------------------------------------------------------

//   this.user = String(this.user || "").trim();

//   // --------------------------------------------------------
//   // EMAIL
//   // --------------------------------------------------------

//   this.email = String(this.email || "")
//     .trim()
//     .toLowerCase();

//   // --------------------------------------------------------
//   // TYPE
//   // --------------------------------------------------------

//   this.type = this.type || "expense";

//   // --------------------------------------------------------
//   // CATEGORY
//   // --------------------------------------------------------

//   this.category = String(this.category || "")
//     .trim()
//     .toLowerCase();

//   // --------------------------------------------------------
//   // AMOUNT
//   // --------------------------------------------------------

//   const numericAmount = Number(this.amount);

//   if (
//     !Number.isFinite(numericAmount) ||
//     !Number.isInteger(numericAmount) ||
//     numericAmount <= 0
//   ) {
//     throw new Error("Amount must be a positive whole number");
//   }

//   this.amount = numericAmount;

//   // --------------------------------------------------------
//   // INCOME USED
//   // --------------------------------------------------------

//   const numericIncomeUsed = Number(this.incomeUsed) || 0;

//   if (
//     !Number.isFinite(numericIncomeUsed) ||
//     !Number.isInteger(numericIncomeUsed) ||
//     numericIncomeUsed < 0
//   ) {
//     throw new Error("Income used must be a valid whole number");
//   }

//   this.incomeUsed = numericIncomeUsed;

//   // --------------------------------------------------------
//   // SAVINGS USED
//   // --------------------------------------------------------

//   const numericSavingsUsed = Number(this.savingsUsed) || 0;

//   if (
//     !Number.isFinite(numericSavingsUsed) ||
//     !Number.isInteger(numericSavingsUsed) ||
//     numericSavingsUsed < 0
//   ) {
//     throw new Error("Savings used must be a valid whole number");
//   }

//   this.savingsUsed = numericSavingsUsed;

//   // ========================================================
//   // FUNDING TOTAL
//   // ========================================================

//   const totalUsed = this.incomeUsed + this.savingsUsed;

//   if (totalUsed !== this.amount) {
//     throw new Error(
//       `Expense funding mismatch: incomeUsed (${this.incomeUsed}) + savingsUsed (${this.savingsUsed}) must equal amount (${this.amount})`,
//     );
//   }

//   // ========================================================
//   // INCOME ALLOCATION TOTAL
//   // ========================================================

//   const incomeAllocationTotal = this.incomeAllocations.reduce(
//     (total, allocation) => {
//       return total + Number(allocation.amount);
//     },
//     0,
//   );

//   if (incomeAllocationTotal !== this.incomeUsed) {
//     throw new Error(
//       `Income allocation mismatch: allocations (${incomeAllocationTotal}) must equal incomeUsed (${this.incomeUsed})`,
//     );
//   }

//   // ========================================================
//   // SAVINGS ALLOCATION TOTAL
//   // ========================================================

//   const savingsAllocationTotal = this.savingsAllocations.reduce(
//     (total, allocation) => {
//       return total + Number(allocation.amount);
//     },
//     0,
//   );

//   if (savingsAllocationTotal !== this.savingsUsed) {
//     throw new Error(
//       `Savings allocation mismatch: allocations (${savingsAllocationTotal}) must equal savingsUsed (${this.savingsUsed})`,
//     );
//   }

//   // ========================================================
//   // BUDGET VALIDATION
//   // ========================================================

//   const numericBudgetAmount = Number(this.budgetAmountUsed) || 0;

//   if (
//     !Number.isFinite(numericBudgetAmount) ||
//     !Number.isInteger(numericBudgetAmount) ||
//     numericBudgetAmount < 0
//   ) {
//     throw new Error("Budget amount used must be a valid whole number");
//   }

//   this.budgetAmountUsed = numericBudgetAmount;

//   // --------------------------------------------------------
//   // BUDGET AMOUNT CANNOT EXCEED EXPENSE
//   // --------------------------------------------------------

//   if (this.budgetAmountUsed > this.amount) {
//     throw new Error("Budget amount used cannot exceed expense amount");
//   }

//   // --------------------------------------------------------
//   // BUDGET CONSISTENCY
//   //
//   // If budgetId exists, budgetAmountUsed must be > 0.
//   //
//   // If no budget exists, budgetAmountUsed must be 0.
//   // --------------------------------------------------------

//   if (this.budgetId && this.budgetAmountUsed <= 0) {
//     throw new Error(
//       "Budget amount used must be greater than zero when budgetId is provided",
//     );
//   }

//   if (!this.budgetId && this.budgetAmountUsed !== 0) {
//     throw new Error(
//       "Budget amount used must be zero when no budget is assigned",
//     );
//   }

//   // ========================================================
//   // ONLY EXPENSES CAN USE MONEY
//   // ========================================================

//   if (
//     this.type !== "expense" &&
//     (this.incomeUsed > 0 || this.savingsUsed > 0)
//   ) {
//     throw new Error(
//       "Income and savings allocations can only be used by expense records",
//     );
//   }

//   // ========================================================
//   // ONLY EXPENSES CAN USE A BUDGET
//   // ========================================================

//   if (this.type !== "expense" && (this.budgetId || this.budgetAmountUsed > 0)) {
//     throw new Error("Only expense records can be assigned to a budget");
//   }
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
//   userId: 1,
//   type: 1,
// });

// expenseSchema.index({
//   email: 1,
//   date: -1,
// });

// expenseSchema.index({
//   email: 1,
//   category: 1,
// });

// expenseSchema.index({
//   userId: 1,
//   budgetId: 1,
// });

// expenseSchema.index({
//   "incomeAllocations.incomeId": 1,
// });

// expenseSchema.index({
//   "savingsAllocations.savingsId": 1,
// });

// // ============================================================
// // MODEL
// // ============================================================

// module.exports =
//   mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

// // ============================================================
// // MODELS / EXPENSE.JS
// // ============================================================

// const mongoose = require("mongoose");

// // ============================================================
// // INCOME ALLOCATION SUB-SCHEMA
// // ============================================================

// const incomeAllocationSchema = new mongoose.Schema(
//   {
//     incomeId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Income",
//       required: true,
//     },

//     amount: {
//       type: Number,
//       required: true,
//       min: [1, "Income allocation must be greater than zero"],
//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) &&
//           Number.isInteger(value) &&
//           value > 0,
//         message:
//           "Income allocation must be a valid whole number",
//       },
//     },
//   },
//   {
//     _id: false,
//   }
// );

// // ============================================================
// // SAVINGS ALLOCATION SUB-SCHEMA
// // ============================================================

// const savingsAllocationSchema = new mongoose.Schema(
//   {
//     savingsId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Savings",
//       required: true,
//     },

//     amount: {
//       type: Number,
//       required: true,
//       min: [1, "Savings allocation must be greater than zero"],
//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) &&
//           Number.isInteger(value) &&
//           value > 0,
//         message:
//           "Savings allocation must be a valid whole number",
//       },
//     },
//   },
//   {
//     _id: false,
//   }
// );

// // ============================================================
// // EXPENSE SCHEMA
// // ============================================================

// const expenseSchema = new mongoose.Schema(
//   {
//     // ========================================================
//     // DESCRIPTION
//     // ========================================================

//     description: {
//       type: String,
//       required: [true, "Description is required"],
//       trim: true,
//       maxlength: [
//         200,
//         "Description cannot exceed 200 characters",
//       ],
//     },

//     // ========================================================
//     // CATEGORY
//     //
//     // IMPORTANT:
//     // Categories are stored in lowercase because the controller
//     // and Budget model also use lowercase.
//     // ========================================================

//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       lowercase: true,
//       enum: {
//         values: [
//           "food",
//           "utilities",
//           "transport",
//           "entertainment",
//           "shopping",
//           "healthcare",
//           "education",
//           "salary",
//           "freelance",
//           "investment",
//           "rent",
//           "insurance",
//           "other",
//         ],
//         message: "Invalid expense category",
//       },
//     },

//     // ========================================================
//     // TYPE
//     // ========================================================

//     type: {
//       type: String,
//       enum: {
//         values: ["expense"],
//         message: "Type must be expense",
//       },
//       default: "expense",
//     },

//     // ========================================================
//     // AMOUNT
//     // ========================================================

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

//     // ========================================================
//     // DATE
//     // ========================================================

//     date: {
//       type: Date,
//       required: [true, "Date is required"],
//       default: Date.now,
//     },

//     // ========================================================
//     // USER
//     // ========================================================

//     user: {
//       type: String,
//       required: [true, "User is required"],
//       trim: true,
//       maxlength: [
//         100,
//         "User cannot exceed 100 characters",
//       ],
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
//     // INCOME USED
//     // ========================================================

//     incomeUsed: {
//       type: Number,
//       default: 0,
//       min: [0, "Income used cannot be negative"],
//     },

//     // ========================================================
//     // SAVINGS USED
//     // ========================================================

//     savingsUsed: {
//       type: Number,
//       default: 0,
//       min: [0, "Savings used cannot be negative"],
//     },

//     // ========================================================
//     // INCOME ALLOCATIONS
//     // ========================================================

//     incomeAllocations: {
//       type: [incomeAllocationSchema],
//       default: [],
//     },

//     // ========================================================
//     // SAVINGS ALLOCATIONS
//     // ========================================================

//     savingsAllocations: {
//       type: [savingsAllocationSchema],
//       default: [],
//     },

//     // ========================================================
//     // BUDGET ID
//     // ========================================================

//     budgetId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Budget",
//       default: null,
//       index: true,
//     },

//     // ========================================================
//     // AMOUNT USED FROM BUDGET
//     // ========================================================

//     budgetAmountUsed: {
//       type: Number,
//       default: 0,
//       min: [0, "Budget amount used cannot be negative"],
//     },
//   },

//   {
//     timestamps: true,
//   }
// );

// // ============================================================
// // PRE SAVE
// // ============================================================

// expenseSchema.pre("save", function (next) {
//   try {
//     // --------------------------------------------------------
//     // NORMALIZE
//     // --------------------------------------------------------

//     this.description = String(
//       this.description || ""
//     ).trim();

//     this.user = String(
//       this.user || ""
//     ).trim();

//     this.email = String(
//       this.email || ""
//     )
//       .trim()
//       .toLowerCase();

//     this.category = String(
//       this.category || ""
//     )
//       .trim()
//       .toLowerCase();

//     this.type = "expense";

//     // --------------------------------------------------------
//     // AMOUNT
//     // --------------------------------------------------------

//     const amount = Number(this.amount);

//     if (
//       !Number.isFinite(amount) ||
//       !Number.isInteger(amount) ||
//       amount <= 0
//     ) {
//       throw new Error(
//         "Amount must be a positive whole number"
//       );
//     }

//     this.amount = amount;

//     // --------------------------------------------------------
//     // INCOME USED
//     // --------------------------------------------------------

//     const incomeUsed =
//       Number(this.incomeUsed) || 0;

//     if (
//       !Number.isFinite(incomeUsed) ||
//       !Number.isInteger(incomeUsed) ||
//       incomeUsed < 0
//     ) {
//       throw new Error(
//         "Income used must be a valid whole number"
//       );
//     }

//     this.incomeUsed = incomeUsed;

//     // --------------------------------------------------------
//     // SAVINGS USED
//     // --------------------------------------------------------

//     const savingsUsed =
//       Number(this.savingsUsed) || 0;

//     if (
//       !Number.isFinite(savingsUsed) ||
//       !Number.isInteger(savingsUsed) ||
//       savingsUsed < 0
//     ) {
//       throw new Error(
//         "Savings used must be a valid whole number"
//       );
//     }

//     this.savingsUsed = savingsUsed;

//     // --------------------------------------------------------
//     // FUNDING CHECK
//     // --------------------------------------------------------

//     if (
//       incomeUsed + savingsUsed !== amount
//     ) {
//       throw new Error(
//         `Expense funding mismatch: incomeUsed (${incomeUsed}) + savingsUsed (${savingsUsed}) must equal amount (${amount})`
//       );
//     }

//     // --------------------------------------------------------
//     // INCOME ALLOCATION CHECK
//     // --------------------------------------------------------

//     const incomeAllocationTotal =
//       this.incomeAllocations.reduce(
//         (total, allocation) =>
//           total + Number(allocation.amount || 0),
//         0
//       );

//     if (
//       incomeAllocationTotal !== incomeUsed
//     ) {
//       throw new Error(
//         `Income allocation mismatch: allocations (${incomeAllocationTotal}) must equal incomeUsed (${incomeUsed})`
//       );
//     }

//     // --------------------------------------------------------
//     // SAVINGS ALLOCATION CHECK
//     // --------------------------------------------------------

//     const savingsAllocationTotal =
//       this.savingsAllocations.reduce(
//         (total, allocation) =>
//           total + Number(allocation.amount || 0),
//         0
//       );

//     if (
//       savingsAllocationTotal !== savingsUsed
//     ) {
//       throw new Error(
//         `Savings allocation mismatch: allocations (${savingsAllocationTotal}) must equal savingsUsed (${savingsUsed})`
//       );
//     }

//     // --------------------------------------------------------
//     // BUDGET AMOUNT
//     // --------------------------------------------------------

//     const budgetAmountUsed =
//       Number(this.budgetAmountUsed) || 0;

//     if (
//       !Number.isFinite(budgetAmountUsed) ||
//       !Number.isInteger(budgetAmountUsed) ||
//       budgetAmountUsed < 0
//     ) {
//       throw new Error(
//         "Budget amount used must be a valid whole number"
//       );
//     }

//     if (
//       budgetAmountUsed > amount
//     ) {
//       throw new Error(
//         "Budget amount used cannot exceed expense amount"
//       );
//     }

//     this.budgetAmountUsed =
//       budgetAmountUsed;

//     // --------------------------------------------------------
//     // DATE
//     // --------------------------------------------------------

//     if (
//       !this.date ||
//       Number.isNaN(
//         new Date(this.date).getTime()
//       )
//     ) {
//       throw new Error(
//         "Invalid expense date"
//       );
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
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
//   userId: 1,
//   type: 1,
// });

// expenseSchema.index({
//   email: 1,
//   date: -1,
// });

// expenseSchema.index({
//   email: 1,
//   category: 1,
// });

// expenseSchema.index({
//   userId: 1,
//   budgetId: 1,
// });

// expenseSchema.index({
//   "incomeAllocations.incomeId": 1,
// });

// expenseSchema.index({
//   "savingsAllocations.savingsId": 1,
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
// INCOME ALLOCATION SUB-SCHEMA
// ============================================================

const incomeAllocationSchema = new mongoose.Schema(
  {
    incomeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Income",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1, "Income allocation must be greater than zero"],
      validate: {
        validator: (value) =>
          Number.isFinite(value) && Number.isInteger(value) && value > 0,
        message: "Income allocation must be a valid whole number",
      },
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// LEGACY SAVINGS ALLOCATION SUB-SCHEMA
//
// IMPORTANT:
// Savings are NO LONGER used for new expenses.
//
// These fields are retained temporarily so old expense records
// containing savings allocation information do not break when
// they are read from MongoDB.
//
// New expenses MUST always have:
// savingsUsed = 0
// savingsAllocations = []
// ============================================================

const savingsAllocationSchema = new mongoose.Schema(
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
          Number.isFinite(value) && Number.isInteger(value) && value > 0,
        message: "Savings allocation must be a valid whole number",
      },
    },
  },
  {
    _id: false,
  },
);

// ============================================================
// EXPENSE SCHEMA
// ============================================================

const expenseSchema = new mongoose.Schema(
  {
    // ========================================================
    // DESCRIPTION
    // ========================================================

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },

    // ========================================================
    // CATEGORY
    // ========================================================

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,

      enum: {
        values: [
          "food",
          "utilities",
          "transport",
          "entertainment",
          "shopping",
          "healthcare",
          "education",
          "salary",
          "freelance",
          "investment",
          "rent",
          "insurance",
          "other",
        ],

        message: "Invalid expense category",
      },
    },

    // ========================================================
    // TYPE
    // ========================================================

    type: {
      type: String,

      enum: {
        values: ["expense"],
        message: "Type must be expense",
      },

      default: "expense",
    },

    // ========================================================
    // AMOUNT
    // ========================================================

    amount: {
      type: Number,

      required: [true, "Amount is required"],

      min: [1, "Amount must be greater than zero"],

      validate: {
        validator: (value) =>
          Number.isFinite(value) && Number.isInteger(value) && value > 0,

        message: "Amount must be a positive whole number",
      },
    },

    // ========================================================
    // DATE
    // ========================================================

    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },

    // ========================================================
    // USER
    // ========================================================

    user: {
      type: String,

      required: [true, "User is required"],

      trim: true,

      maxlength: [100, "User cannot exceed 100 characters"],
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
    // INCOME USED
    //
    // THIS IS THE ONLY VALID FUNDING SOURCE
    // ========================================================

    incomeUsed: {
      type: Number,

      required: true,

      default: 0,

      min: [0, "Income used cannot be negative"],

      validate: {
        validator: (value) =>
          Number.isFinite(value) && Number.isInteger(value) && value >= 0,

        message: "Income used must be a valid whole number",
      },
    },

    // ========================================================
    // SAVINGS USED
    //
    // LEGACY ONLY
    //
    // New expenses MUST always save this as 0.
    // ========================================================

    savingsUsed: {
      type: Number,

      default: 0,

      min: [0, "Savings used cannot be negative"],
    },

    // ========================================================
    // INCOME ALLOCATIONS
    // ========================================================

    incomeAllocations: {
      type: [incomeAllocationSchema],

      default: [],
    },

    // ========================================================
    // SAVINGS ALLOCATIONS
    //
    // LEGACY ONLY
    //
    // New expenses MUST always use [].
    // ========================================================

    savingsAllocations: {
      type: [savingsAllocationSchema],

      default: [],
    },

    // ========================================================
    // BUDGET ID
    // ========================================================

    budgetId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Budget",

      default: null,

      index: true,
    },

    // ========================================================
    // AMOUNT USED FROM BUDGET
    //
    // This is the expense amount tracked against the budget.
    //
    // IMPORTANT:
    // This does NOT mean the budget funded the expense.
    // Income funded the expense.
    // ========================================================

    budgetAmountUsed: {
      type: Number,

      default: 0,

      min: [0, "Budget amount used cannot be negative"],

      validate: {
        validator: (value) =>
          Number.isFinite(value) && Number.isInteger(value) && value >= 0,

        message: "Budget amount used must be a valid whole number",
      },
    },
  },

  {
    timestamps: true,
  },
);

// ============================================================
// PRE SAVE
// ============================================================

expenseSchema.pre("save", function (next) {
  try {
    // ========================================================
    // NORMALIZE
    // ========================================================

    this.description = String(this.description || "").trim();

    this.user = String(this.user || "").trim();

    this.email = String(this.email || "")
      .trim()
      .toLowerCase();

    this.category = String(this.category || "")
      .trim()
      .toLowerCase();

    this.type = "expense";

    // ========================================================
    // AMOUNT
    // ========================================================

    const amount = Number(this.amount);

    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) {
      throw new Error("Amount must be a positive whole number");
    }

    this.amount = amount;

    // ========================================================
    // INCOME USED
    // ========================================================

    const incomeUsed = Number(this.incomeUsed) || 0;

    if (
      !Number.isFinite(incomeUsed) ||
      !Number.isInteger(incomeUsed) ||
      incomeUsed < 0
    ) {
      throw new Error("Income used must be a valid whole number");
    }

    this.incomeUsed = incomeUsed;

    // ========================================================
    // SAVINGS USED
    //
    // NEW RULE:
    // SAVINGS CAN NEVER FUND AN EXPENSE.
    // ========================================================

    this.savingsUsed = 0;

    // ========================================================
    // FUNDING CHECK
    //
    // 100% OF EXPENSE MUST COME FROM INCOME.
    // ========================================================

    if (incomeUsed !== amount) {
      throw new Error(
        `Expense funding mismatch: incomeUsed (${incomeUsed}) must equal amount (${amount}). Expenses can only use income.`,
      );
    }

    // ========================================================
    // INCOME ALLOCATION CHECK
    // ========================================================

    const incomeAllocationTotal = (this.incomeAllocations || []).reduce(
      (total, allocation) => total + Number(allocation.amount || 0),
      0,
    );

    if (incomeAllocationTotal !== incomeUsed) {
      throw new Error(
        `Income allocation mismatch: allocations (${incomeAllocationTotal}) must equal incomeUsed (${incomeUsed})`,
      );
    }

    // ========================================================
    // SAVINGS ALLOCATION CHECK
    //
    // NEW EXPENSES MUST HAVE NO SAVINGS ALLOCATIONS.
    // ========================================================

    this.savingsAllocations = [];

    // ========================================================
    // BUDGET AMOUNT
    // ========================================================

    const budgetAmountUsed = Number(this.budgetAmountUsed) || 0;

    if (
      !Number.isFinite(budgetAmountUsed) ||
      !Number.isInteger(budgetAmountUsed) ||
      budgetAmountUsed < 0
    ) {
      throw new Error("Budget amount used must be a valid whole number");
    }

    if (budgetAmountUsed > amount) {
      throw new Error("Budget amount used cannot exceed expense amount");
    }

    this.budgetAmountUsed = budgetAmountUsed;

    // ========================================================
    // DATE
    // ========================================================

    if (!this.date || Number.isNaN(new Date(this.date).getTime())) {
      throw new Error("Invalid expense date");
    }

    next();
  } catch (error) {
    next(error);
  }
});

// ============================================================
// INDEXES
// ============================================================

expenseSchema.index({
  userId: 1,
  date: -1,
});

expenseSchema.index({
  userId: 1,
  category: 1,
});

expenseSchema.index({
  userId: 1,
  type: 1,
});

expenseSchema.index({
  email: 1,
  date: -1,
});

expenseSchema.index({
  email: 1,
  category: 1,
});

expenseSchema.index({
  userId: 1,
  budgetId: 1,
});

expenseSchema.index({
  "incomeAllocations.incomeId": 1,
});

// Keep this index temporarily for old records.
// It does NOT mean new expenses can use savings.
expenseSchema.index({
  "savingsAllocations.savingsId": 1,
});

// ============================================================
// MODEL
// ============================================================

module.exports =
  mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
