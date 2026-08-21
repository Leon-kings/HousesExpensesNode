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
//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) && Number.isInteger(value) && value >= 0,
//         message: "Remaining amount must be a valid whole number",
//       },
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
// // CALCULATE VALUES
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
//     this.percentageUsed = spent > 0 ? 100 : 0;
//   }

//   // ----------------------------------------------------------
//   // STATUS
//   // ----------------------------------------------------------

//   if (spent > allocated) {
//     this.status = "over-budget";
//   } else if (allocated > 0 && this.percentageUsed >= 80) {
//     this.status = "approaching-limit";
//   } else {
//     this.status = "on-track";
//   }
// };

// // ============================================================
// // PRE SAVE
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
// // ADD EXPENSE
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
// // REMOVE EXPENSE
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
//       maxlength: [
//         100,
//         "Category cannot exceed 100 characters",
//       ],
//     },

//     // ========================================================
//     // ALLOCATED AMOUNT
//     //
//     // This is the amount the user planned for this category.
//     // It is NOT money stored separately from Income.
//     // ========================================================

//     allocatedAmount: {
//       type: Number,

//       required: [
//         true,
//         "Allocated amount is required",
//       ],

//       min: [
//         0,
//         "Allocated amount cannot be negative",
//       ],

//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) &&
//           Number.isInteger(value) &&
//           value >= 0,

//         message:
//           "Allocated amount must be a valid whole number",
//       },
//     },

//     // ========================================================
//     // SPENT AMOUNT
//     //
//     // This records how much has actually been spent
//     // against this budget.
//     //
//     // IMPORTANT:
//     // The actual money still comes ONLY from Income.
//     // ========================================================

//     spentAmount: {
//       type: Number,

//       default: 0,

//       min: [
//         0,
//         "Spent amount cannot be negative",
//       ],

//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) &&
//           Number.isInteger(value) &&
//           value >= 0,

//         message:
//           "Spent amount must be a valid whole number",
//       },
//     },

//     // ========================================================
//     // REMAINING AMOUNT
//     //
//     // IMPORTANT:
//     // This is allowed to become NEGATIVE.
//     //
//     // Example:
//     //
//     // allocated = 35,000
//     // spent     = 45,000
//     // remaining = -10,000
//     //
//     // This means the budget was exceeded by 10,000.
//     // ========================================================

//     remainingAmount: {
//       type: Number,

//       default: 0,

//       validate: {
//         validator: (value) =>
//           Number.isFinite(value) &&
//           Number.isInteger(value),

//         message:
//           "Remaining amount must be a valid whole number",
//       },
//     },

//     // ========================================================
//     // PERCENTAGE USED
//     //
//     // Example:
//     //
//     // allocated = 100,000
//     // spent     = 125,000
//     //
//     // percentageUsed = 125%
//     // ========================================================

//     percentageUsed: {
//       type: Number,

//       default: 0,

//       min: [
//         0,
//         "Percentage used cannot be negative",
//       ],

//       validate: {
//         validator: (value) =>
//           Number.isFinite(value),

//         message:
//           "Percentage used must be a valid number",
//       },
//     },

//     // ========================================================
//     // STATUS
//     // ========================================================

//     status: {
//       type: String,

//       enum: [
//         "on-track",
//         "approaching-limit",
//         "over-budget",
//       ],

//       default: "on-track",
//     },

//     // ========================================================
//     // MONTH
//     //
//     // 0 = January
//     // 1 = February
//     // ...
//     // 11 = December
//     // ========================================================

//     month: {
//       type: Number,

//       required: [
//         true,
//         "Month is required",
//       ],

//       min: [
//         0,
//         "Month must be between 0 and 11",
//       ],

//       max: [
//         11,
//         "Month must be between 0 and 11",
//       ],

//       validate: {
//         validator: (value) =>
//           Number.isInteger(value),

//         message:
//           "Month must be an integer between 0 and 11",
//       },
//     },

//     // ========================================================
//     // YEAR
//     // ========================================================

//     year: {
//       type: Number,

//       required: [
//         true,
//         "Year is required",
//       ],

//       min: [
//         2000,
//         "Year must be 2000 or later",
//       ],

//       validate: {
//         validator: (value) =>
//           Number.isInteger(value),

//         message:
//           "Year must be a valid integer",
//       },
//     },

//     // ========================================================
//     // DESCRIPTION
//     // ========================================================

//     description: {
//       type: String,

//       trim: true,

//       maxlength: [
//         500,
//         "Description cannot exceed 500 characters",
//       ],

//       default: "",
//     },

//     // ========================================================
//     // EMAIL
//     // ========================================================

//     email: {
//       type: String,

//       required: [
//         true,
//         "Email is required",
//       ],

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

//       required: [
//         true,
//         "User ID is required",
//       ],

//       index: true,
//     },
//   },

//   {
//     timestamps: true,
//   },
// );

// // ============================================================
// // CALCULATE VALUES
// // ============================================================

// budgetSchema.methods.calculateValues = function () {
//   const allocated =
//     Number(this.allocatedAmount) || 0;

//   const spent =
//     Number(this.spentAmount) || 0;

//   // ==========================================================
//   // REMAINING
//   //
//   // DO NOT USE Math.max(..., 0)
//   //
//   // Negative values are intentional and indicate that the
//   // user has exceeded the budget.
//   // ==========================================================

//   this.remainingAmount =
//     allocated - spent;

//   // ==========================================================
//   // PERCENTAGE USED
//   // ==========================================================

//   if (allocated > 0) {
//     this.percentageUsed = Number(
//       (
//         (spent / allocated) *
//         100
//       ).toFixed(2),
//     );
//   } else {
//     this.percentageUsed =
//       spent > 0 ? 100 : 0;
//   }

//   // ==========================================================
//   // STATUS
//   // ==========================================================

//   if (spent > allocated) {
//     this.status = "over-budget";
//   } else if (
//     allocated > 0 &&
//     this.percentageUsed >= 80
//   ) {
//     this.status =
//       "approaching-limit";
//   } else {
//     this.status = "on-track";
//   }

//   return this;
// };

// // ============================================================
// // PRE SAVE
// // ============================================================

// budgetSchema.pre("save", function (next) {
//   try {
//     // ========================================================
//     // NORMALIZE STRINGS
//     // ========================================================

//     this.category = String(
//       this.category || "",
//     )
//       .trim()
//       .toLowerCase();

//     this.email = String(
//       this.email || "",
//     )
//       .trim()
//       .toLowerCase();

//     this.description = String(
//       this.description || "",
//     ).trim();

//     // ========================================================
//     // VALIDATE ALLOCATED AMOUNT
//     // ========================================================

//     const allocated =
//       Number(this.allocatedAmount);

//     if (
//       !Number.isFinite(
//         allocated,
//       ) ||
//       !Number.isInteger(
//         allocated,
//       ) ||
//       allocated < 0
//     ) {
//       throw new Error(
//         "Allocated amount must be a valid whole number",
//       );
//     }

//     this.allocatedAmount =
//       allocated;

//     // ========================================================
//     // VALIDATE SPENT AMOUNT
//     // ========================================================

//     const spent =
//       Number(this.spentAmount) || 0;

//     if (
//       !Number.isFinite(spent) ||
//       !Number.isInteger(spent) ||
//       spent < 0
//     ) {
//       throw new Error(
//         "Spent amount must be a valid whole number",
//       );
//     }

//     this.spentAmount =
//       spent;

//     // ========================================================
//     // CALCULATE ALL DERIVED VALUES
//     // ========================================================

//     this.calculateValues();

//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // ============================================================
// // ADD EXPENSE
// //
// // This does NOT take money from the budget.
// //
// // It only records that an expense was made against the budget.
// //
// // The actual money is deducted from Income by expenseController.
// // ============================================================

// budgetSchema.methods.addExpense = function (
//   amount,
// ) {
//   const numericAmount =
//     Number(amount);

//   if (
//     !Number.isFinite(
//       numericAmount,
//     ) ||
//     !Number.isInteger(
//       numericAmount,
//     ) ||
//     numericAmount <= 0
//   ) {
//     throw new Error(
//       "Budget expense amount must be a positive whole number",
//     );
//   }

//   this.spentAmount +=
//     numericAmount;

//   this.calculateValues();

//   return this;
// };

// // ============================================================
// // REMOVE EXPENSE
// //
// // Used when an expense is deleted or reversed.
// //
// // It reduces the amount tracked against the budget.
// // ============================================================

// budgetSchema.methods.removeExpense =
//   function (amount) {
//     const numericAmount =
//       Number(amount);

//     if (
//       !Number.isFinite(
//         numericAmount,
//       ) ||
//       !Number.isInteger(
//         numericAmount,
//       ) ||
//       numericAmount <= 0
//     ) {
//       throw new Error(
//         "Budget restore amount must be a positive whole number",
//       );
//     }

//     this.spentAmount =
//       Math.max(
//         0,
//         this.spentAmount -
//           numericAmount,
//       );

//     this.calculateValues();

//     return this;
//   };

// // ============================================================
// // CHECK IF EXPENSE EXCEEDS BUDGET
// //
// // This method DOES NOT modify the budget.
// //
// // It is useful before creating an expense.
// //
// // Returns:
// //
// // {
// //   exceeds: true,
// //   remainingAmount: 20000,
// //   expenseAmount: 50000,
// //   exceededBy: 30000
// // }
// // ============================================================

// budgetSchema.methods.checkExpense =
//   function (amount) {
//     const numericAmount =
//       Number(amount);

//     if (
//       !Number.isFinite(
//         numericAmount,
//       ) ||
//       !Number.isInteger(
//         numericAmount,
//       ) ||
//       numericAmount <= 0
//     ) {
//       throw new Error(
//         "Budget expense amount must be a positive whole number",
//       );
//     }

//     const allocated =
//       Number(
//         this.allocatedAmount,
//       ) || 0;

//     const spent =
//       Number(
//         this.spentAmount,
//       ) || 0;

//     const remaining =
//       allocated - spent;

//     const exceeds =
//       numericAmount >
//       remaining;

//     const exceededBy =
//       exceeds
//         ? numericAmount -
//           remaining
//         : 0;

//     return {
//       exceeds,

//       allocatedAmount:
//         allocated,

//       spentAmount:
//         spent,

//       remainingAmount:
//         remaining,

//       expenseAmount:
//         numericAmount,

//       exceededBy,

//       afterExpenseRemaining:
//         remaining -
//         numericAmount,

//       afterExpenseSpent:
//         spent +
//         numericAmount,

//       afterExpensePercentageUsed:
//         allocated > 0
//           ? Number(
//               (
//                 (
//                   (spent +
//                     numericAmount) /
//                   allocated
//                 ) *
//                 100
//               ).toFixed(2),
//             )
//           : 100,

//       afterExpenseStatus:
//         spent +
//           numericAmount >
//         allocated
//           ? "over-budget"
//           : allocated > 0 &&
//               (
//                 (
//                   (spent +
//                     numericAmount) /
//                   allocated
//                 ) *
//                   100
//               ) >=
//                 80
//             ? "approaching-limit"
//             : "on-track",
//     };
//   };

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
//   mongoose.models.Budget ||
//   mongoose.model(
//     "Budget",
//     budgetSchema,
//   );














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
      maxlength: [
        100,
        "Category cannot exceed 100 characters",
      ],
    },

    // ========================================================
    // ALLOCATED AMOUNT
    //
    // Amount planned for this budget category.
    //
    // IMPORTANT:
    // This does NOT store or reserve money.
    // Actual money comes from Income.
    // ========================================================

    allocatedAmount: {
      type: Number,

      required: [
        true,
        "Allocated amount is required",
      ],

      min: [
        0,
        "Allocated amount cannot be negative",
      ],

      validate: {
        validator: function (value) {
          return (
            Number.isFinite(value) &&
            Number.isInteger(value) &&
            value >= 0
          );
        },

        message:
          "Allocated amount must be a valid whole number",
      },
    },

    // ========================================================
    // SPENT AMOUNT
    //
    // Amount already spent against this budget.
    //
    // IMPORTANT:
    // This is only budget tracking.
    // It does NOT deduct money from Income.
    // ========================================================

    spentAmount: {
      type: Number,

      default: 0,

      min: [
        0,
        "Spent amount cannot be negative",
      ],

      validate: {
        validator: function (value) {
          return (
            Number.isFinite(value) &&
            Number.isInteger(value) &&
            value >= 0
          );
        },

        message:
          "Spent amount must be a valid whole number",
      },
    },

    // ========================================================
    // REMAINING AMOUNT
    //
    // Negative values are intentionally allowed.
    //
    // Example:
    //
    // allocated = 35,000
    // spent     = 45,000
    // remaining = -10,000
    //
    // This means the budget was exceeded by 10,000.
    // ========================================================

    remainingAmount: {
      type: Number,

      default: 0,

      validate: {
        validator: function (value) {
          return (
            Number.isFinite(value) &&
            Number.isInteger(value)
          );
        },

        message:
          "Remaining amount must be a valid whole number",
      },
    },

    // ========================================================
    // PERCENTAGE USED
    //
    // Example:
    //
    // allocated = 100,000
    // spent     = 125,000
    // percentageUsed = 125
    // ========================================================

    percentageUsed: {
      type: Number,

      default: 0,

      min: [
        0,
        "Percentage used cannot be negative",
      ],

      validate: {
        validator: function (value) {
          return Number.isFinite(value);
        },

        message:
          "Percentage used must be a valid number",
      },
    },

    // ========================================================
    // STATUS
    // ========================================================

    status: {
      type: String,

      enum: {
        values: [
          "on-track",
          "approaching-limit",
          "over-budget",
        ],

        message:
          "Invalid budget status",
      },

      default: "on-track",
    },

    // ========================================================
    // MONTH
    //
    // 0  = January
    // 1  = February
    // ...
    // 11 = December
    // ========================================================

    month: {
      type: Number,

      required: [
        true,
        "Month is required",
      ],

      min: [
        0,
        "Month must be between 0 and 11",
      ],

      max: [
        11,
        "Month must be between 0 and 11",
      ],

      validate: {
        validator: function (value) {
          return Number.isInteger(value);
        },

        message:
          "Month must be an integer between 0 and 11",
      },
    },

    // ========================================================
    // YEAR
    // ========================================================

    year: {
      type: Number,

      required: [
        true,
        "Year is required",
      ],

      min: [
        2000,
        "Year must be 2000 or later",
      ],

      validate: {
        validator: function (value) {
          return Number.isInteger(value);
        },

        message:
          "Year must be a valid integer",
      },
    },

    // ========================================================
    // DESCRIPTION
    // ========================================================

    description: {
      type: String,

      trim: true,

      maxlength: [
        500,
        "Description cannot exceed 500 characters",
      ],

      default: "",
    },

    // ========================================================
    // EMAIL
    // ========================================================

    email: {
      type: String,

      required: [
        true,
        "Email is required",
      ],

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

      required: [
        true,
        "User ID is required",
      ],

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
  const allocated =
    Number(this.allocatedAmount) || 0;

  const spent =
    Number(this.spentAmount) || 0;

  // ==========================================================
  // REMAINING AMOUNT
  //
  // Negative values are intentional.
  // ==========================================================

  this.remainingAmount =
    allocated - spent;

  // ==========================================================
  // PERCENTAGE USED
  // ==========================================================

  if (allocated > 0) {
    this.percentageUsed = Number(
      (
        (spent / allocated) *
        100
      ).toFixed(2),
    );
  } else {
    this.percentageUsed =
      spent > 0 ? 100 : 0;
  }

  // ==========================================================
  // STATUS
  // ==========================================================

  if (spent > allocated) {
    this.status = "over-budget";
  } else if (
    allocated > 0 &&
    this.percentageUsed >= 80
  ) {
    this.status =
      "approaching-limit";
  } else {
    this.status = "on-track";
  }

  return this;
};

// ============================================================
// PRE SAVE
//
// IMPORTANT:
//
// DO NOT USE:
//
// budgetSchema.pre("save", function (next) {})
//
// because that is what is causing:
//
// "next is not a function"
//
// This middleware uses async and throws errors instead.
// ============================================================

budgetSchema.pre(
  "save",
  async function () {
    // ========================================================
    // NORMALIZE STRINGS
    // ========================================================

    this.category = String(
      this.category || "",
    )
      .trim()
      .toLowerCase();

    this.email = String(
      this.email || "",
    )
      .trim()
      .toLowerCase();

    this.description = String(
      this.description || "",
    ).trim();

    // ========================================================
    // VALIDATE ALLOCATED AMOUNT
    // ========================================================

    const allocated =
      Number(this.allocatedAmount);

    if (
      !Number.isFinite(
        allocated,
      ) ||
      !Number.isInteger(
        allocated,
      ) ||
      allocated < 0
    ) {
      throw new Error(
        "Allocated amount must be a valid whole number",
      );
    }

    this.allocatedAmount =
      allocated;

    // ========================================================
    // VALIDATE SPENT AMOUNT
    // ========================================================

    const spent =
      Number(this.spentAmount) || 0;

    if (
      !Number.isFinite(spent) ||
      !Number.isInteger(spent) ||
      spent < 0
    ) {
      throw new Error(
        "Spent amount must be a valid whole number",
      );
    }

    this.spentAmount =
      spent;

    // ========================================================
    // CALCULATE DERIVED VALUES
    // ========================================================

    this.calculateValues();
  },
);

// ============================================================
// ADD EXPENSE
//
// This ONLY updates budget tracking.
//
// It does NOT deduct money from Income.
//
// The actual money deduction must be handled by
// expenseController.
// ============================================================

budgetSchema.methods.addExpense =
  function (amount) {
    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount,
      ) ||
      !Number.isInteger(
        numericAmount,
      ) ||
      numericAmount <= 0
    ) {
      throw new Error(
        "Budget expense amount must be a positive whole number",
      );
    }

    this.spentAmount +=
      numericAmount;

    this.calculateValues();

    return this;
  };

// ============================================================
// REMOVE EXPENSE
//
// Used when an expense is deleted/reversed.
//
// This reduces budget tracking only.
// ============================================================

budgetSchema.methods.removeExpense =
  function (amount) {
    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount,
      ) ||
      !Number.isInteger(
        numericAmount,
      ) ||
      numericAmount <= 0
    ) {
      throw new Error(
        "Budget restore amount must be a positive whole number",
      );
    }

    this.spentAmount =
      Math.max(
        0,
        this.spentAmount -
          numericAmount,
      );

    this.calculateValues();

    return this;
  };

// ============================================================
// CHECK EXPENSE
//
// Does NOT modify the budget.
//
// Useful before creating an expense.
// ============================================================

budgetSchema.methods.checkExpense =
  function (amount) {
    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount,
      ) ||
      !Number.isInteger(
        numericAmount,
      ) ||
      numericAmount <= 0
    ) {
      throw new Error(
        "Budget expense amount must be a positive whole number",
      );
    }

    const allocated =
      Number(
        this.allocatedAmount,
      ) || 0;

    const spent =
      Number(
        this.spentAmount,
      ) || 0;

    const remaining =
      allocated - spent;

    const exceeds =
      numericAmount >
      remaining;

    const exceededBy =
      exceeds
        ? numericAmount -
          remaining
        : 0;

    const afterExpenseSpent =
      spent +
      numericAmount;

    const afterExpenseRemaining =
      remaining -
      numericAmount;

    let afterExpensePercentageUsed;

    if (allocated > 0) {
      afterExpensePercentageUsed =
        Number(
          (
            (afterExpenseSpent /
              allocated) *
            100
          ).toFixed(2),
        );
    } else {
      afterExpensePercentageUsed =
        afterExpenseSpent > 0
          ? 100
          : 0;
    }

    let afterExpenseStatus;

    if (
      afterExpenseSpent >
      allocated
    ) {
      afterExpenseStatus =
        "over-budget";
    } else if (
      allocated > 0 &&
      afterExpensePercentageUsed >=
        80
    ) {
      afterExpenseStatus =
        "approaching-limit";
    } else {
      afterExpenseStatus =
        "on-track";
    }

    return {
      exceeds,

      allocatedAmount:
        allocated,

      spentAmount:
        spent,

      remainingAmount:
        remaining,

      expenseAmount:
        numericAmount,

      exceededBy,

      afterExpenseRemaining,

      afterExpenseSpent,

      afterExpensePercentageUsed,

      afterExpenseStatus,
    };
  };

// ============================================================
// UNIQUE BUDGET INDEX
//
// One budget per:
//
// user + category + month + year
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

const Budget =
  mongoose.models.Budget ||
  mongoose.model(
    "Budget",
    budgetSchema,
  );

// ============================================================
// EXPORT
// ============================================================

module.exports = Budget;