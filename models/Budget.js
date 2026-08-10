// // module.exports = mongoose.model('Budget', BudgetSchema);

// const mongoose = require("mongoose");

// const BudgetSchema = new mongoose.Schema(
//   {
//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       lowercase: true,
//     },

//     allocatedAmount: {
//       type: Number,
//       required: [true, "Allocated amount is required"],
//       min: [0, "Allocated amount cannot be negative"],
//     },

//     spentAmount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     remainingAmount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     percentageUsed: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     status: {
//       type: String,
//       enum: ["on-track", "approaching-limit", "over-budget", "under-budget"],
//       default: "on-track",
//     },

//     month: {
//       type: Number,
//       required: [true, "Month is required"],
//       min: 0,
//       max: 11,
//     },

//     year: {
//       type: Number,
//       required: [true, "Year is required"],
//     },

//     description: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// // One budget per category per month/year for each user
// BudgetSchema.index(
//   {
//     email: 1,
//     category: 1,
//     month: 1,
//     year: 1,
//   },
//   {
//     unique: true,
//   },
// );

// // Automatically calculate values

// BudgetSchema.pre("save", function () {
//   this.allocatedAmount = Number(this.allocatedAmount) || 0;
//   this.spentAmount = Number(this.spentAmount) || 0;

//   this.remainingAmount = Math.max(this.allocatedAmount - this.spentAmount, 0);

//   this.percentageUsed =
//     this.allocatedAmount > 0
//       ? (this.spentAmount / this.allocatedAmount) * 100
//       : 0;

//   if (this.percentageUsed >= 100) {
//     this.status = "over-budget";
//   } else if (this.percentageUsed >= 80) {
//     this.status = "approaching-limit";
//   } else if (this.percentageUsed < 50 && this.spentAmount > 0) {
//     this.status = "under-budget";
//   } else {
//     this.status = "on-track";
//   }
// });

// // Recalculate when updating with findOneAndUpdate()
// BudgetSchema.pre("findOneAndUpdate", async function () {
//   const update = this.getUpdate();

//   const current = await this.model.findOne(this.getQuery());

//   if (!current) return;

//   const allocatedAmount = Number(
//     update.allocatedAmount ?? current.allocatedAmount,
//   );

//   const spentAmount = Number(update.spentAmount ?? current.spentAmount);

//   update.remainingAmount = Math.max(allocatedAmount - spentAmount, 0);

//   update.percentageUsed =
//     allocatedAmount > 0 ? (spentAmount / allocatedAmount) * 100 : 0;

//   if (update.percentageUsed >= 100) {
//     update.status = "over-budget";
//   } else if (update.percentageUsed >= 80) {
//     update.status = "approaching-limit";
//   } else if (update.percentageUsed < 50 && spentAmount > 0) {
//     update.status = "under-budget";
//   } else {
//     update.status = "on-track";
//   }

//   this.setUpdate(update);
// });

// module.exports =
//   mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);

// // ============================================================
// // MODELS / BUDGET.JS
// // ============================================================

// const mongoose = require("mongoose");

// const BudgetSchema = new mongoose.Schema(
//   {
//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       lowercase: true,
//     },

//     allocatedAmount: {
//       type: Number,
//       required: [true, "Allocated amount is required"],
//       min: [0, "Allocated amount cannot be negative"],
//     },

//     spentAmount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     remainingAmount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     percentageUsed: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     status: {
//       type: String,
//       enum: [
//         "on-track",
//         "approaching-limit",
//         "over-budget",
//         "under-budget",
//       ],
//       default: "on-track",
//     },

//     month: {
//       type: Number,
//       required: [true, "Month is required"],
//       min: 0,
//       max: 11,
//     },

//     year: {
//       type: Number,
//       required: [true, "Year is required"],
//     },

//     description: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ============================================================
// // ONE BUDGET PER CATEGORY / MONTH / YEAR / USER
// // ============================================================

// BudgetSchema.index(
//   {
//     email: 1,
//     category: 1,
//     month: 1,
//     year: 1,
//   },
//   {
//     unique: true,
//   }
// );

// // ============================================================
// // AUTOMATICALLY CALCULATE BUDGET VALUES
// // ============================================================

// BudgetSchema.pre("save", function (next) {
//   this.category = String(this.category || "")
//     .trim()
//     .toLowerCase();

//   this.email = String(this.email || "")
//     .trim()
//     .toLowerCase();

//   this.allocatedAmount =
//     Number(this.allocatedAmount) || 0;

//   this.spentAmount =
//     Number(this.spentAmount) || 0;

//   // ==========================================================
//   // REMAINING
//   // ==========================================================

//   this.remainingAmount = Math.max(
//     this.allocatedAmount - this.spentAmount,
//     0
//   );

//   // ==========================================================
//   // PERCENTAGE
//   // ==========================================================

//   this.percentageUsed =
//     this.allocatedAmount > 0
//       ? (this.spentAmount /
//           this.allocatedAmount) *
//         100
//       : 0;

//   // ==========================================================
//   // STATUS
//   // ==========================================================

//   if (this.percentageUsed >= 100) {
//     this.status = "over-budget";
//   } else if (this.percentageUsed >= 80) {
//     this.status = "approaching-limit";
//   } else if (
//     this.percentageUsed < 50 &&
//     this.spentAmount > 0
//   ) {
//     this.status = "under-budget";
//   } else {
//     this.status = "on-track";
//   }

//   next();
// });

// // ============================================================
// // RECALCULATE FINDONEANDUPDATE
// // ============================================================

// BudgetSchema.pre(
//   "findOneAndUpdate",
//   async function (next) {
//     try {
//       const update = this.getUpdate() || {};

//       const current =
//         await this.model.findOne(
//           this.getQuery()
//         );

//       if (!current) {
//         return next();
//       }

//       const allocatedAmount =
//         Number(
//           update.allocatedAmount ??
//             current.allocatedAmount
//         ) || 0;

//       const spentAmount =
//         Number(
//           update.spentAmount ??
//             current.spentAmount
//         ) || 0;

//       update.remainingAmount =
//         Math.max(
//           allocatedAmount -
//             spentAmount,
//           0
//         );

//       update.percentageUsed =
//         allocatedAmount > 0
//           ? (spentAmount /
//               allocatedAmount) *
//             100
//           : 0;

//       if (
//         update.percentageUsed >=
//         100
//       ) {
//         update.status =
//           "over-budget";
//       } else if (
//         update.percentageUsed >=
//         80
//       ) {
//         update.status =
//           "approaching-limit";
//       } else if (
//         update.percentageUsed < 50 &&
//         spentAmount > 0
//       ) {
//         update.status =
//           "under-budget";
//       } else {
//         update.status =
//           "on-track";
//       }

//       this.setUpdate(update);

//       next();
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// module.exports =
//   mongoose.models.Budget ||
//   mongoose.model(
//     "Budget",
//     BudgetSchema
//   );











// // ============================================================
// // MODELS / BUDGET.JS
// // ============================================================

// const mongoose = require("mongoose");

// const BudgetSchema = new mongoose.Schema(
//   {
//     // ==========================================================
//     // CATEGORY
//     // ==========================================================

//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       lowercase: true,
//     },

//     // ==========================================================
//     // ALLOCATED AMOUNT
//     // ==========================================================

//     allocatedAmount: {
//       type: Number,
//       required: [true, "Allocated amount is required"],
//       min: [0, "Allocated amount cannot be negative"],
//     },

//     // ==========================================================
//     // SPENT AMOUNT
//     // ==========================================================

//     spentAmount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     // ==========================================================
//     // REMAINING AMOUNT
//     // ==========================================================

//     remainingAmount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     // ==========================================================
//     // PERCENTAGE USED
//     // ==========================================================

//     percentageUsed: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     // ==========================================================
//     // STATUS
//     // ==========================================================

//     status: {
//       type: String,
//       enum: ["on-track", "approaching-limit", "over-budget", "under-budget"],
//       default: "on-track",
//     },

//     // ==========================================================
//     // MONTH
//     // ==========================================================

//     month: {
//       type: Number,
//       required: [true, "Month is required"],
//       min: 0,
//       max: 11,
//     },

//     // ==========================================================
//     // YEAR
//     // ==========================================================

//     year: {
//       type: Number,
//       required: [true, "Year is required"],
//     },

//     // ==========================================================
//     // DESCRIPTION
//     // ==========================================================

//     description: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     // ==========================================================
//     // USER EMAIL
//     // ==========================================================

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// // ============================================================
// // ONE BUDGET PER CATEGORY / MONTH / YEAR / USER
// // ============================================================

// BudgetSchema.index(
//   {
//     email: 1,
//     category: 1,
//     month: 1,
//     year: 1,
//   },
//   {
//     unique: true,
//   },
// );

// // ============================================================
// // AUTOMATICALLY CALCULATE BUDGET VALUES
// // ============================================================

// BudgetSchema.pre("save", function () {
//   // ==========================================================
//   // NORMALIZE CATEGORY
//   // ==========================================================

//   this.category = String(this.category || "")
//     .trim()
//     .toLowerCase();

//   // ==========================================================
//   // NORMALIZE EMAIL
//   // ==========================================================

//   this.email = String(this.email || "")
//     .trim()
//     .toLowerCase();

//   // ==========================================================
//   // NORMALIZE NUMBERS
//   // ==========================================================

//   this.allocatedAmount = Number(this.allocatedAmount) || 0;

//   this.spentAmount = Number(this.spentAmount) || 0;

//   // ==========================================================
//   // REMAINING AMOUNT
//   // ==========================================================

//   this.remainingAmount = Math.max(this.allocatedAmount - this.spentAmount, 0);

//   // ==========================================================
//   // PERCENTAGE USED
//   // ==========================================================

//   this.percentageUsed =
//     this.allocatedAmount > 0
//       ? (this.spentAmount / this.allocatedAmount) * 100
//       : 0;

//   // ==========================================================
//   // STATUS
//   // ==========================================================

//   if (this.percentageUsed >= 100) {
//     this.status = "over-budget";
//   } else if (this.percentageUsed >= 80) {
//     this.status = "approaching-limit";
//   } else if (this.percentageUsed < 50 && this.spentAmount > 0) {
//     this.status = "under-budget";
//   } else {
//     this.status = "on-track";
//   }
// });

// // ============================================================
// // RECALCULATE FINDONEANDUPDATE
// // ============================================================

// BudgetSchema.pre("findOneAndUpdate", async function () {
//   const update = this.getUpdate() || {};

//   const current = await this.model.findOne(this.getQuery());

//   if (!current) {
//     return;
//   }

//   // ========================================================
//   // HANDLE $SET
//   // ========================================================

//   const setUpdate = update.$set || update;

//   // ========================================================
//   // ALLOCATED
//   // ========================================================

//   const allocatedAmount =
//     Number(setUpdate.allocatedAmount ?? current.allocatedAmount) || 0;

//   // ========================================================
//   // SPENT
//   // ========================================================

//   const spentAmount = Number(setUpdate.spentAmount ?? current.spentAmount) || 0;

//   // ========================================================
//   // REMAINING
//   // ========================================================

//   const remainingAmount = Math.max(allocatedAmount - spentAmount, 0);

//   // ========================================================
//   // PERCENTAGE
//   // ========================================================

//   const percentageUsed =
//     allocatedAmount > 0 ? (spentAmount / allocatedAmount) * 100 : 0;

//   // ========================================================
//   // STATUS
//   // ========================================================

//   let status = "on-track";

//   if (percentageUsed >= 100) {
//     status = "over-budget";
//   } else if (percentageUsed >= 80) {
//     status = "approaching-limit";
//   } else if (percentageUsed < 50 && spentAmount > 0) {
//     status = "under-budget";
//   }

//   // ========================================================
//   // UPDATE VALUES
//   // ========================================================

//   if (update.$set) {
//     update.$set.remainingAmount = remainingAmount;

//     update.$set.percentageUsed = percentageUsed;

//     update.$set.status = status;
//   } else {
//     update.remainingAmount = remainingAmount;

//     update.percentageUsed = percentageUsed;

//     update.status = status;
//   }

//   this.setUpdate(update);
// });

// // ============================================================
// // EXPORT MODEL
// // ============================================================

// module.exports =
//   mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);












// // ============================================================
// // MODELS / BUDGET.JS
// // ============================================================

// const mongoose = require("mongoose");

// const BudgetSchema = new mongoose.Schema(
//   {
//     // ==========================================================
//     // CATEGORY
//     // ==========================================================

//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       lowercase: true,
//     },

//     // ==========================================================
//     // ALLOCATED AMOUNT
//     // ==========================================================

//     allocatedAmount: {
//       type: Number,
//       required: [true, "Allocated amount is required"],
//       min: [0, "Allocated amount cannot be negative"],
//     },

//     // ==========================================================
//     // SPENT AMOUNT
//     // ==========================================================

//     spentAmount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     // ==========================================================
//     // REMAINING AMOUNT
//     // ==========================================================

//     remainingAmount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     // ==========================================================
//     // PERCENTAGE USED
//     // ==========================================================

//     percentageUsed: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     // ==========================================================
//     // STATUS
//     // ==========================================================

//     status: {
//       type: String,
//       enum: [
//         "on-track",
//         "approaching-limit",
//         "over-budget",
//         "under-budget",
//       ],
//       default: "on-track",
//     },

//     // ==========================================================
//     // MONTH
//     //
//     // JavaScript:
//     // January = 0
//     // February = 1
//     // ...
//     // August = 7
//     // December = 11
//     // ==========================================================

//     month: {
//       type: Number,
//       required: [true, "Month is required"],
//       min: 0,
//       max: 11,
//     },

//     // ==========================================================
//     // YEAR
//     // ==========================================================

//     year: {
//       type: Number,
//       required: [true, "Year is required"],
//     },

//     // ==========================================================
//     // DESCRIPTION
//     // ==========================================================

//     description: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     // ==========================================================
//     // USER EMAIL
//     // ==========================================================

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
// // ONE BUDGET PER CATEGORY / MONTH / YEAR / USER
// // ============================================================

// BudgetSchema.index(
//   {
//     email: 1,
//     category: 1,
//     month: 1,
//     year: 1,
//   },
//   {
//     unique: true,
//   }
// );

// // ============================================================
// // CALCULATE BUDGET VALUES
// // ============================================================

// function calculateBudgetValues(budget) {
//   budget.allocatedAmount =
//     Number(budget.allocatedAmount) || 0;

//   budget.spentAmount =
//     Number(budget.spentAmount) || 0;

//   // ==========================================================
//   // REMAINING
//   // ==========================================================

//   budget.remainingAmount = Math.max(
//     budget.allocatedAmount -
//       budget.spentAmount,
//     0
//   );

//   // ==========================================================
//   // PERCENTAGE
//   //
//   // Important:
//   // percentage can be greater than 100 when over budget.
//   // ==========================================================

//   budget.percentageUsed =
//     budget.allocatedAmount > 0
//       ? (budget.spentAmount /
//           budget.allocatedAmount) *
//         100
//       : 0;

//   // ==========================================================
//   // STATUS
//   // ==========================================================

//   if (budget.percentageUsed >= 100) {
//     budget.status = "over-budget";
//   } else if (budget.percentageUsed >= 80) {
//     budget.status = "approaching-limit";
//   } else if (
//     budget.spentAmount > 0 &&
//     budget.percentageUsed < 50
//   ) {
//     budget.status = "under-budget";
//   } else {
//     budget.status = "on-track";
//   }
// }

// // ============================================================
// // BEFORE SAVE
// // ============================================================
// //
// // No "next" argument.
// // This prevents the "next is not a function" problem.
// // ============================================================

// BudgetSchema.pre("save", function () {
//   this.category = String(this.category || "")
//     .trim()
//     .toLowerCase();

//   this.email = String(this.email || "")
//     .trim()
//     .toLowerCase();

//   calculateBudgetValues(this);
// });

// // ============================================================
// // BEFORE FINDONEANDUPDATE
// // ============================================================
// //
// // This is useful if another controller updates a budget using
// // findOneAndUpdate().
// // ============================================================

// BudgetSchema.pre(
//   "findOneAndUpdate",
//   async function () {
//     const update = this.getUpdate() || {};

//     const current = await this.model.findOne(
//       this.getQuery()
//     );

//     if (!current) {
//       return;
//     }

//     // --------------------------------------------------------
//     // Support both:
//     //
//     // { spentAmount: 5000 }
//     //
//     // and:
//     //
//     // { $set: { spentAmount: 5000 } }
//     // --------------------------------------------------------

//     const setData = update.$set || {};

//     const allocatedAmount =
//       Number(
//         setData.allocatedAmount ??
//           update.allocatedAmount ??
//           current.allocatedAmount
//       ) || 0;

//     const spentAmount =
//       Number(
//         setData.spentAmount ??
//           update.spentAmount ??
//           current.spentAmount
//       ) || 0;

//     // --------------------------------------------------------
//     // CALCULATE
//     // --------------------------------------------------------

//     const remainingAmount = Math.max(
//       allocatedAmount -
//         spentAmount,
//       0
//     );

//     const percentageUsed =
//       allocatedAmount > 0
//         ? (spentAmount /
//             allocatedAmount) *
//           100
//         : 0;

//     let status = "on-track";

//     if (percentageUsed >= 100) {
//       status = "over-budget";
//     } else if (percentageUsed >= 80) {
//       status = "approaching-limit";
//     } else if (
//       spentAmount > 0 &&
//       percentageUsed < 50
//     ) {
//       status = "under-budget";
//     }

//     // --------------------------------------------------------
//     // UPDATE
//     // --------------------------------------------------------

//     if (update.$set) {
//       update.$set.remainingAmount =
//         remainingAmount;

//       update.$set.percentageUsed =
//         percentageUsed;

//       update.$set.status = status;

//       if (update.$set.category) {
//         update.$set.category = String(
//           update.$set.category
//         )
//           .trim()
//           .toLowerCase();
//       }

//       if (update.$set.email) {
//         update.$set.email = String(
//           update.$set.email
//         )
//           .trim()
//           .toLowerCase();
//       }
//     } else {
//       update.remainingAmount =
//         remainingAmount;

//       update.percentageUsed =
//         percentageUsed;

//       update.status = status;

//       if (update.category) {
//         update.category = String(
//           update.category
//         )
//           .trim()
//           .toLowerCase();
//       }

//       if (update.email) {
//         update.email = String(
//           update.email
//         )
//           .trim()
//           .toLowerCase();
//       }
//     }

//     this.setUpdate(update);
//   }
// );

// // ============================================================
// // EXPORT
// // ============================================================

// module.exports =
//   mongoose.models.Budget ||
//   mongoose.model("Budget", BudgetSchema);










// // ============================================================
// // MODELS / BUDGET.JS
// // ============================================================

// const mongoose = require("mongoose");

// const BudgetSchema = new mongoose.Schema(
//   {
//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       lowercase: true,
//     },

//     allocatedAmount: {
//       type: Number,
//       required: [true, "Allocated amount is required"],
//       min: [0, "Allocated amount cannot be negative"],
//     },

//     spentAmount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     remainingAmount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     percentageUsed: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     status: {
//       type: String,
//       enum: [
//         "on-track",
//         "approaching-limit",
//         "over-budget",
//         "under-budget",
//       ],
//       default: "on-track",
//     },

//     month: {
//       type: Number,
//       required: [true, "Month is required"],
//       min: 0,
//       max: 11,
//     },

//     year: {
//       type: Number,
//       required: [true, "Year is required"],
//     },

//     description: {
//       type: String,
//       trim: true,
//       default: "",
//     },

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
// // ONE BUDGET PER CATEGORY / MONTH / YEAR / USER
// // ============================================================

// BudgetSchema.index(
//   {
//     email: 1,
//     category: 1,
//     month: 1,
//     year: 1,
//   },
//   {
//     unique: true,
//   }
// );

// // ============================================================
// // CALCULATE BUDGET VALUES
// // ============================================================

// BudgetSchema.methods.calculateValues = function () {
//   this.allocatedAmount = Number(this.allocatedAmount) || 0;

//   this.spentAmount = Number(this.spentAmount) || 0;

//   // ----------------------------------------------------------
//   // REMAINING
//   // ----------------------------------------------------------

//   this.remainingAmount = Math.max(
//     this.allocatedAmount - this.spentAmount,
//     0
//   );

//   // ----------------------------------------------------------
//   // PERCENTAGE
//   // ----------------------------------------------------------

//   this.percentageUsed =
//     this.allocatedAmount > 0
//       ? (this.spentAmount / this.allocatedAmount) * 100
//       : 0;

//   // ----------------------------------------------------------
//   // STATUS
//   // ----------------------------------------------------------

//   if (this.percentageUsed >= 100) {
//     this.status = "over-budget";
//   } else if (this.percentageUsed >= 80) {
//     this.status = "approaching-limit";
//   } else if (
//     this.spentAmount > 0 &&
//     this.percentageUsed < 50
//   ) {
//     this.status = "under-budget";
//   } else {
//     this.status = "on-track";
//   }
// };

// // ============================================================
// // PRE SAVE
// //
// // IMPORTANT:
// // No `next` argument.
// // This avoids:
// // "next is not a function"
// // ============================================================

// BudgetSchema.pre("save", function () {
//   this.category = String(this.category || "")
//     .trim()
//     .toLowerCase();

//   this.email = String(this.email || "")
//     .trim()
//     .toLowerCase();

//   this.calculateValues();
// });

// // ============================================================
// // MODEL
// // ============================================================

// module.exports =
//   mongoose.models.Budget ||
//   mongoose.model("Budget", BudgetSchema);











// // ============================================================
// // MODELS / BUDGET.JS
// // ============================================================

// const mongoose = require("mongoose");

// const BudgetSchema = new mongoose.Schema(
//   {
//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       lowercase: true,
//     },

//     allocatedAmount: {
//       type: Number,
//       required: [true, "Allocated amount is required"],
//       min: [0, "Allocated amount cannot be negative"],
//     },

//     spentAmount: {
//       type: Number,
//       default: 0,
//       min: [0, "Spent amount cannot be negative"],
//     },

//     remainingAmount: {
//       type: Number,
//       default: 0,
//       min: [0, "Remaining amount cannot be negative"],
//     },

//     percentageUsed: {
//       type: Number,
//       default: 0,
//       min: [0, "Percentage used cannot be negative"],
//     },

//     status: {
//       type: String,
//       enum: [
//         "on-track",
//         "approaching-limit",
//         "over-budget",
//         "under-budget",
//       ],
//       default: "on-track",
//     },

//     month: {
//       type: Number,
//       required: [true, "Month is required"],
//       min: [0, "Month must be between 0 and 11"],
//       max: [11, "Month must be between 0 and 11"],
//     },

//     year: {
//       type: Number,
//       required: [true, "Year is required"],
//     },

//     description: {
//       type: String,
//       trim: true,
//       default: "",
//       maxlength: [500, "Description cannot exceed 500 characters"],
//     },

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
// // ONE BUDGET PER CATEGORY / MONTH / YEAR / USER
// // ============================================================

// BudgetSchema.index(
//   {
//     email: 1,
//     category: 1,
//     month: 1,
//     year: 1,
//   },
//   {
//     unique: true,
//   }
// );

// // ============================================================
// // CALCULATE BUDGET VALUES
// // ============================================================

// BudgetSchema.methods.calculateValues = function () {
//   this.allocatedAmount = Number(this.allocatedAmount) || 0;
//   this.spentAmount = Number(this.spentAmount) || 0;

//   // Remaining amount
//   this.remainingAmount = Math.max(
//     this.allocatedAmount - this.spentAmount,
//     0
//   );

//   // Percentage used
//   this.percentageUsed =
//     this.allocatedAmount > 0
//       ? (this.spentAmount / this.allocatedAmount) * 100
//       : 0;

//   // Status
//   if (this.percentageUsed >= 100) {
//     this.status = "over-budget";
//   } else if (this.percentageUsed >= 80) {
//     this.status = "approaching-limit";
//   } else if (this.spentAmount > 0 && this.percentageUsed < 50) {
//     this.status = "under-budget";
//   } else {
//     this.status = "on-track";
//   }
// };

// // ============================================================
// // PRE SAVE
// // ============================================================

// BudgetSchema.pre("save", function () {
//   this.category = String(this.category || "")
//     .trim()
//     .toLowerCase();

//   this.email = String(this.email || "")
//     .trim()
//     .toLowerCase();

//   this.calculateValues();
// });

// // ============================================================
// // MODEL
// // ============================================================

// module.exports =
//   mongoose.models.Budget ||
//   mongoose.model("Budget", BudgetSchema);














// // ============================================================
// // MODELS / BUDGET.JS
// // ============================================================

// const mongoose = require("mongoose");

// const BudgetSchema = new mongoose.Schema(
//   {
//     // ----------------------------------------------------------
//     // CATEGORY
//     // ----------------------------------------------------------

//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       lowercase: true,
//       maxlength: [100, "Category cannot exceed 100 characters"],
//     },

//     // ----------------------------------------------------------
//     // BUDGET AMOUNT
//     // ----------------------------------------------------------

//     allocatedAmount: {
//       type: Number,
//       required: [true, "Allocated amount is required"],
//       min: [0, "Allocated amount cannot be negative"],
//       validate: {
//         validator: Number.isFinite,
//         message: "Allocated amount must be a valid number",
//       },
//     },

//     // ----------------------------------------------------------
//     // AMOUNT ALREADY SPENT
//     // ----------------------------------------------------------

//     spentAmount: {
//       type: Number,
//       default: 0,
//       min: [0, "Spent amount cannot be negative"],
//       validate: {
//         validator: Number.isFinite,
//         message: "Spent amount must be a valid number",
//       },
//     },

//     // ----------------------------------------------------------
//     // REMAINING BUDGET
//     // ----------------------------------------------------------

//     remainingAmount: {
//       type: Number,
//       default: 0,
//       min: [0, "Remaining amount cannot be negative"],
//     },

//     // ----------------------------------------------------------
//     // PERCENTAGE USED
//     // ----------------------------------------------------------

//     percentageUsed: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     // ----------------------------------------------------------
//     // STATUS
//     // ----------------------------------------------------------

//     status: {
//       type: String,
//       enum: [
//         "on-track",
//         "approaching-limit",
//         "over-budget",
//         "under-budget",
//       ],
//       default: "on-track",
//     },

//     // ----------------------------------------------------------
//     // MONTH
//     //
//     // JavaScript:
//     // January = 0
//     // December = 11
//     // ----------------------------------------------------------

//     month: {
//       type: Number,
//       required: [true, "Month is required"],
//       min: [0, "Month must be between 0 and 11"],
//       max: [11, "Month must be between 0 and 11"],
//     },

//     year: {
//       type: Number,
//       required: [true, "Year is required"],
//       min: [2000, "Invalid year"],
//     },

//     description: {
//       type: String,
//       trim: true,
//       maxlength: [300, "Description cannot exceed 300 characters"],
//       default: "",
//     },

//     // ----------------------------------------------------------
//     // USER EMAIL
//     // ----------------------------------------------------------

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//       index: true,
//     },

//     // ----------------------------------------------------------
//     // USER ID
//     //
//     // Primary ownership identifier.
//     // ----------------------------------------------------------

//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "User ID is required"],
//       index: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ============================================================
// // CALCULATE BUDGET VALUES
// // ============================================================

// BudgetSchema.methods.calculateValues = function () {
//   const allocated = Number(this.allocatedAmount) || 0;
//   const spent = Number(this.spentAmount) || 0;

//   this.allocatedAmount = Math.max(allocated, 0);
//   this.spentAmount = Math.max(spent, 0);

//   // ----------------------------------------------------------
//   // REMAINING
//   //
//   // IMPORTANT:
//   // We don't allow this value to become negative.
//   // An over-budget amount is represented by percentageUsed/status.
//   // ----------------------------------------------------------

//   this.remainingAmount = Math.max(
//     this.allocatedAmount - this.spentAmount,
//     0
//   );

//   // ----------------------------------------------------------
//   // PERCENTAGE
//   // ----------------------------------------------------------

//   this.percentageUsed =
//     this.allocatedAmount > 0
//       ? Number(
//           (
//             (this.spentAmount / this.allocatedAmount) *
//             100
//           ).toFixed(2)
//         )
//       : 0;

//   // ----------------------------------------------------------
//   // STATUS
//   // ----------------------------------------------------------

//   if (this.spentAmount > this.allocatedAmount) {
//     this.status = "over-budget";
//   } else if (this.percentageUsed >= 80) {
//     this.status = "approaching-limit";
//   } else if (
//     this.spentAmount > 0 &&
//     this.percentageUsed < 50
//   ) {
//     this.status = "under-budget";
//   } else {
//     this.status = "on-track";
//   }
// };

// // ============================================================
// // PRE SAVE
// //
// // IMPORTANT:
// // No `next` argument.
// // This prevents:
// // "next is not a function"
// // ============================================================

// BudgetSchema.pre("save", function () {
//   this.category = String(this.category || "")
//     .trim()
//     .toLowerCase();

//   this.email = String(this.email || "")
//     .trim()
//     .toLowerCase();

//   this.description = String(this.description || "").trim();

//   this.calculateValues();
// });

// // ============================================================
// // INDEXES
// // ============================================================

// // One budget per user/category/month/year.
// BudgetSchema.index(
//   {
//     userId: 1,
//     category: 1,
//     month: 1,
//     year: 1,
//   },
//   {
//     unique: true,
//   }
// );

// // Useful for email-based queries.
// BudgetSchema.index({
//   email: 1,
//   month: 1,
//   year: 1,
// });

// // ============================================================
// // MODEL
// // ============================================================

// module.exports =
//   mongoose.models.Budget ||
//   mongoose.model("Budget", BudgetSchema);













// ============================================================
// MODELS / BUDGET.JS
// ============================================================

const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // CATEGORY
    // ----------------------------------------------------------

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      lowercase: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },

    // ----------------------------------------------------------
    // BUDGET AMOUNT
    // ----------------------------------------------------------

    allocatedAmount: {
      type: Number,
      required: [true, "Allocated amount is required"],
      min: [0, "Allocated amount cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Allocated amount must be a valid number",
      },
    },

    // ----------------------------------------------------------
    // AMOUNT ALREADY SPENT
    // ----------------------------------------------------------

    spentAmount: {
      type: Number,
      default: 0,
      min: [0, "Spent amount cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Spent amount must be a valid number",
      },
    },

    // ----------------------------------------------------------
    // REMAINING BUDGET
    // ----------------------------------------------------------

    remainingAmount: {
      type: Number,
      default: 0,
      min: [0, "Remaining amount cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Remaining amount must be a valid number",
      },
    },

    // ----------------------------------------------------------
    // PERCENTAGE USED
    // ----------------------------------------------------------

    percentageUsed: {
      type: Number,
      default: 0,
      min: [0, "Percentage used cannot be negative"],
      max: [100, "Percentage used cannot exceed 100"],
      validate: {
        validator: Number.isFinite,
        message: "Percentage used must be a valid number",
      },
    },

    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------

    status: {
      type: String,
      enum: {
        values: [
          "on-track",
          "approaching-limit",
          "over-budget",
          "under-budget",
        ],
        message: "Invalid budget status",
      },
      default: "on-track",
    },

    // ----------------------------------------------------------
    // MONTH
    //
    // JavaScript:
    // January = 0
    // December = 11
    // ----------------------------------------------------------

    month: {
      type: Number,
      required: [true, "Month is required"],
      min: [0, "Month must be between 0 and 11"],
      max: [11, "Month must be between 0 and 11"],
      validate: {
        validator: Number.isInteger,
        message: "Month must be a whole number",
      },
    },

    // ----------------------------------------------------------
    // YEAR
    // ----------------------------------------------------------

    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [2000, "Invalid year"],
      validate: {
        validator: Number.isInteger,
        message: "Year must be a whole number",
      },
    },

    // ----------------------------------------------------------
    // DESCRIPTION
    // ----------------------------------------------------------

    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: "",
    },

    // ----------------------------------------------------------
    // USER EMAIL
    //
    // Kept for compatibility with existing controllers.
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
    //
    // Primary ownership identifier.
    // ----------------------------------------------------------

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// CALCULATE BUDGET VALUES
// ============================================================

BudgetSchema.methods.calculateValues = function () {
  const allocated = Number(this.allocatedAmount) || 0;
  const spent = Number(this.spentAmount) || 0;

  this.allocatedAmount = Math.max(allocated, 0);
  this.spentAmount = Math.max(spent, 0);

  // ----------------------------------------------------------
  // REMAINING
  //
  // IMPORTANT:
  // Remaining budget never becomes negative.
  // Over-budget is represented through status/percentage.
  // ----------------------------------------------------------

  this.remainingAmount = Math.max(
    this.allocatedAmount - this.spentAmount,
    0
  );

  // ----------------------------------------------------------
  // PERCENTAGE
  // ----------------------------------------------------------

  this.percentageUsed =
    this.allocatedAmount > 0
      ? Number(
          (
            (this.spentAmount / this.allocatedAmount) *
            100
          ).toFixed(2)
        )
      : 0;

  // ----------------------------------------------------------
  // STATUS
  // ----------------------------------------------------------

  if (this.spentAmount > this.allocatedAmount) {
    this.status = "over-budget";
  } else if (this.percentageUsed >= 80) {
    this.status = "approaching-limit";
  } else if (
    this.spentAmount > 0 &&
    this.percentageUsed < 50
  ) {
    this.status = "under-budget";
  } else {
    this.status = "on-track";
  }
};

// ============================================================
// PRE SAVE
//
// IMPORTANT:
// No `next` argument.
// ============================================================

BudgetSchema.pre("save", function () {
  // ----------------------------------------------------------
  // NORMALIZE CATEGORY
  // ----------------------------------------------------------

  this.category = String(this.category || "")
    .trim()
    .toLowerCase();

  // ----------------------------------------------------------
  // NORMALIZE EMAIL
  // ----------------------------------------------------------

  this.email = String(this.email || "")
    .trim()
    .toLowerCase();

  // ----------------------------------------------------------
  // NORMALIZE DESCRIPTION
  // ----------------------------------------------------------

  this.description = String(
    this.description || ""
  ).trim();

  // ----------------------------------------------------------
  // CALCULATE VALUES
  // ----------------------------------------------------------

  this.calculateValues();
});

// ============================================================
// INDEXES
// ============================================================

// One budget per user/category/month/year.

BudgetSchema.index(
  {
    userId: 1,
    category: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

// Useful for email-based queries.

BudgetSchema.index({
  email: 1,
  month: 1,
  year: 1,
});

// ============================================================
// MODEL
// ============================================================

module.exports =
  mongoose.models.Budget ||
  mongoose.model("Budget", BudgetSchema);