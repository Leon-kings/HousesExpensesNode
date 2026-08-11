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

// const mongoose = require("mongoose");

// const IncomeSchema = new mongoose.Schema(
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
//       maxlength: [100, "Category cannot exceed 100 characters"],
//     },

//     source: {
//       type: String,
//       trim: true,
//       maxlength: [100, "Source cannot exceed 100 characters"],
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

//     remainingAmount: {
//       type: Number,
//       default: function () {
//         return this.amount;
//       },
//       min: [0, "Remaining amount cannot be negative"],
//       validate: {
//         validator: Number.isFinite,
//         message: "Remaining amount must be a valid number",
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
//   {
//     timestamps: true,
//   },
// );

// // ============================================================
// // INDEXES
// // ============================================================

// IncomeSchema.index({
//   userId: 1,
//   remainingAmount: 1,
//   date: -1,
// });

// IncomeSchema.index({
//   userId: 1,
//   date: -1,
// });

// IncomeSchema.index({
//   email: 1,
//   date: -1,
// });

// module.exports =
//   mongoose.models.Income || mongoose.model("Income", IncomeSchema);

// // ============================================================
// // MODELS / INCOME.JS
// // ============================================================

// const mongoose = require("mongoose");

// const IncomeSchema = new mongoose.Schema(
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
//       maxlength: [100, "Category cannot exceed 100 characters"],
//     },

//     source: {
//       type: String,
//       trim: true,
//       maxlength: [100, "Source cannot exceed 100 characters"],
//       default: "",
//     },

//     // ----------------------------------------------------------
//     // ORIGINAL INCOME AMOUNT
//     // ----------------------------------------------------------

//     amount: {
//       type: Number,
//       required: [true, "Amount is required"],
//       min: [0, "Amount cannot be negative"],
//       validate: {
//         validator: Number.isFinite,
//         message: "Amount must be a valid number",
//       },
//     },

//     // ----------------------------------------------------------
//     // CURRENT AVAILABLE INCOME
//     //
//     // Expenses should deduct from this field.
//     // Never use `balance` because this model uses
//     // `remainingAmount` consistently.
//     // ----------------------------------------------------------

//     remainingAmount: {
//       type: Number,
//       default: 0,
//       min: [0, "Remaining amount cannot be negative"],
//       validate: {
//         validator: Number.isFinite,
//         message: "Remaining amount must be a valid number",
//       },
//     },

//     date: {
//       type: Date,
//       required: [true, "Date is required"],
//       default: Date.now,
//     },

//     // User display/name
//     user: {
//       type: String,
//       required: [true, "User is required"],
//       trim: true,
//       maxlength: [100, "User cannot exceed 100 characters"],
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

//     // Kept for compatibility with your existing frontend,
//     // controllers and notification system.
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
//       enum: [
//         "weekly",
//         "biweekly",
//         "monthly",
//         "quarterly",
//         "annually",
//       ],
//       default: "monthly",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ============================================================
// // NORMALIZE INCOME BEFORE SAVE
// // ============================================================

// IncomeSchema.pre("save", function () {
//   this.email = String(this.email || "")
//     .trim()
//     .toLowerCase();

//   this.user = String(this.user || "").trim();

//   this.category = String(this.category || "").trim();

//   this.description = String(this.description || "").trim();

//   this.source = String(this.source || "").trim();

//   this.amount = Number(this.amount) || 0;

//   // Only initialize remainingAmount when the document is new
//   // or when it has never been initialized.
//   if (this.isNew) {
//     this.remainingAmount = this.amount;
//   } else {
//     this.remainingAmount = Number(this.remainingAmount) || 0;

//     if (this.remainingAmount > this.amount) {
//       this.remainingAmount = this.amount;
//     }

//     if (this.remainingAmount < 0) {
//       this.remainingAmount = 0;
//     }
//   }
// });

// // ============================================================
// // INDEXES
// // ============================================================

// IncomeSchema.index({
//   userId: 1,
//   date: -1,
// });

// IncomeSchema.index({
//   userId: 1,
//   category: 1,
// });

// IncomeSchema.index({
//   email: 1,
//   date: -1,
// });

// // ============================================================
// // MODEL
// // ============================================================

// module.exports =
//   mongoose.models.Income ||
//   mongoose.model("Income", IncomeSchema);

// // ============================================================
// // MODELS / INCOME.JS
// // ============================================================

// const mongoose = require("mongoose");

// const IncomeSchema = new mongoose.Schema(
//   {
//     // ----------------------------------------------------------
//     // DESCRIPTION
//     // ----------------------------------------------------------

//     description: {
//       type: String,
//       required: [true, "Description is required"],
//       trim: true,
//       maxlength: [200, "Description cannot exceed 200 characters"],
//     },

//     // ----------------------------------------------------------
//     // CATEGORY
//     // ----------------------------------------------------------

//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//       maxlength: [100, "Category cannot exceed 100 characters"],
//     },

//     // ----------------------------------------------------------
//     // SOURCE
//     // ----------------------------------------------------------

//     source: {
//       type: String,
//       trim: true,
//       maxlength: [100, "Source cannot exceed 100 characters"],
//       default: "",
//     },

//     // ----------------------------------------------------------
//     // ORIGINAL INCOME AMOUNT
//     // ----------------------------------------------------------

//     amount: {
//       type: Number,
//       required: [true, "Amount is required"],
//       min: [0, "Amount cannot be negative"],
//       validate: {
//         validator: Number.isFinite,
//         message: "Amount must be a valid number",
//       },
//     },

//     // ----------------------------------------------------------
//     // CURRENT AVAILABLE INCOME
//     //
//     // Expenses deduct from this field.
//     // The original `amount` remains unchanged.
//     // ----------------------------------------------------------

//     remainingAmount: {
//       type: Number,
//       default: 0,
//       min: [0, "Remaining amount cannot be negative"],
//       validate: {
//         validator: Number.isFinite,
//         message: "Remaining amount must be a valid number",
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
//       maxlength: [100, "User cannot exceed 100 characters"],
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
//     // USER EMAIL
//     //
//     // Kept for compatibility with existing frontend,
//     // controllers and notifications.
//     // ----------------------------------------------------------

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//       index: true,
//     },

//     // ----------------------------------------------------------
//     // RECURRING INCOME
//     // ----------------------------------------------------------

//     isRecurring: {
//       type: Boolean,
//       default: false,
//     },

//     // ----------------------------------------------------------
//     // RECURRING FREQUENCY
//     // ----------------------------------------------------------

//     frequency: {
//       type: String,
//       enum: {
//         values: ["weekly", "biweekly", "monthly", "quarterly", "annually"],
//         message: "Invalid income frequency",
//       },
//       default: "monthly",
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// // ============================================================
// // NORMALIZE INCOME BEFORE SAVE
// // ============================================================

// IncomeSchema.pre("save", function () {
//   // ----------------------------------------------------------
//   // NORMALIZE EMAIL
//   // ----------------------------------------------------------

//   this.email = String(this.email || "")
//     .trim()
//     .toLowerCase();

//   // ----------------------------------------------------------
//   // NORMALIZE USER
//   // ----------------------------------------------------------

//   this.user = String(this.user || "").trim();

//   // ----------------------------------------------------------
//   // NORMALIZE CATEGORY
//   // ----------------------------------------------------------

//   this.category = String(this.category || "").trim();

//   // ----------------------------------------------------------
//   // NORMALIZE DESCRIPTION
//   // ----------------------------------------------------------

//   this.description = String(this.description || "").trim();

//   // ----------------------------------------------------------
//   // NORMALIZE SOURCE
//   // ----------------------------------------------------------

//   this.source = String(this.source || "").trim();

//   // ----------------------------------------------------------
//   // VALIDATE ORIGINAL AMOUNT
//   // ----------------------------------------------------------

//   const numericAmount = Number(this.amount);

//   if (!Number.isFinite(numericAmount)) {
//     throw new Error("Amount must be a valid number");
//   }

//   if (numericAmount < 0) {
//     throw new Error("Amount cannot be negative");
//   }

//   this.amount = numericAmount;

//   // ----------------------------------------------------------
//   // INITIALIZE REMAINING AMOUNT
//   //
//   // New income starts with the full amount available.
//   // ----------------------------------------------------------

//   if (this.isNew) {
//     this.remainingAmount = this.amount;
//   } else {
//     const numericRemaining = Number(this.remainingAmount);

//     if (!Number.isFinite(numericRemaining)) {
//       this.remainingAmount = 0;
//     } else {
//       this.remainingAmount = numericRemaining;
//     }

//     // Never allow remaining income above original income.

//     if (this.remainingAmount > this.amount) {
//       this.remainingAmount = this.amount;
//     }

//     // Never allow negative remaining income.

//     if (this.remainingAmount < 0) {
//       this.remainingAmount = 0;
//     }
//   }
// });

// // ============================================================
// // INDEXES
// // ============================================================

// // User income ordered by date.

// IncomeSchema.index({
//   userId: 1,
//   date: -1,
// });

// // User income by category.

// IncomeSchema.index({
//   userId: 1,
//   category: 1,
// });

// // Email-based compatibility query.

// IncomeSchema.index({
//   email: 1,
//   date: -1,
// });

// // ============================================================
// // MODEL
// // ============================================================

// module.exports =
//   mongoose.models.Income || mongoose.model("Income", IncomeSchema);










// // ============================================================
// // MODELS / INCOME.JS
// // ============================================================

// const mongoose = require("mongoose");

// // ============================================================
// // INCOME SCHEMA
// // ============================================================

// const IncomeSchema = new mongoose.Schema(
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
//       maxlength: [
//         100,
//         "Category cannot exceed 100 characters",
//       ],
//     },

//     // ----------------------------------------------------------
//     // SOURCE
//     // ----------------------------------------------------------

//     source: {
//       type: String,
//       trim: true,
//       maxlength: [
//         100,
//         "Source cannot exceed 100 characters",
//       ],
//       default: "",
//     },

//     // ----------------------------------------------------------
//     // ORIGINAL INCOME AMOUNT
//     //
//     // This NEVER changes when an expense is created.
//     //
//     // Example:
//     //
//     // amount = 100000
//     // remainingAmount = 100000
//     //
//     // After a 30000 expense:
//     //
//     // amount = 100000
//     // remainingAmount = 70000
//     // ----------------------------------------------------------

//     amount: {
//       type: Number,
//       required: [true, "Amount is required"],
//       min: [0, "Amount cannot be negative"],
//       validate: {
//         validator: Number.isFinite,
//         message: "Amount must be a valid number",
//       },
//     },

//     // ----------------------------------------------------------
//     // CURRENT AVAILABLE INCOME
//     //
//     // Expenses deduct from this field.
//     //
//     // The Expense controller uses this field FIRST.
//     //
//     // When this reaches 0:
//     // - income is exhausted
//     // - future expenses can use savings
//     // ----------------------------------------------------------

//     remainingAmount: {
//       type: Number,
//       default: 0,
//       min: [
//         0,
//         "Remaining amount cannot be negative",
//       ],
//       validate: {
//         validator: Number.isFinite,
//         message:
//           "Remaining amount must be a valid number",
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
//     // USER EMAIL
//     //
//     // Kept for compatibility with:
//     // - frontend
//     // - controllers
//     // - notifications
//     // ----------------------------------------------------------

//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//       index: true,
//     },

//     // ----------------------------------------------------------
//     // RECURRING INCOME
//     // ----------------------------------------------------------

//     isRecurring: {
//       type: Boolean,
//       default: false,
//     },

//     // ----------------------------------------------------------
//     // RECURRING FREQUENCY
//     // ----------------------------------------------------------

//     frequency: {
//       type: String,
//       enum: {
//         values: [
//           "weekly",
//           "biweekly",
//           "monthly",
//           "quarterly",
//           "annually",
//         ],
//         message:
//           "Invalid income frequency",
//       },
//       default: "monthly",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ============================================================
// // CALCULATE / NORMALIZE INCOME
// // ============================================================
// //
// // IMPORTANT:
// //
// // We use a `pre("save")` hook rather than a query middleware.
// //
// // This means the following works correctly:
// //
// //   income.remainingAmount -= expenseAmount;
// //   await income.save();
// //
// // The original `amount` is preserved.
// // ============================================================

// IncomeSchema.pre("save", function () {
//   // ----------------------------------------------------------
//   // NORMALIZE EMAIL
//   // ----------------------------------------------------------

//   this.email = String(this.email || "")
//     .trim()
//     .toLowerCase();

//   // ----------------------------------------------------------
//   // NORMALIZE USER
//   // ----------------------------------------------------------

//   this.user = String(this.user || "")
//     .trim();

//   // ----------------------------------------------------------
//   // NORMALIZE CATEGORY
//   // ----------------------------------------------------------

//   this.category = String(this.category || "")
//     .trim();

//   // ----------------------------------------------------------
//   // NORMALIZE DESCRIPTION
//   // ----------------------------------------------------------

//   this.description = String(
//     this.description || ""
//   ).trim();

//   // ----------------------------------------------------------
//   // NORMALIZE SOURCE
//   // ----------------------------------------------------------

//   this.source = String(
//     this.source || ""
//   ).trim();

//   // ----------------------------------------------------------
//   // VALIDATE ORIGINAL AMOUNT
//   // ----------------------------------------------------------

//   const numericAmount =
//     Number(this.amount);

//   if (!Number.isFinite(numericAmount)) {
//     throw new Error(
//       "Amount must be a valid number"
//     );
//   }

//   if (numericAmount < 0) {
//     throw new Error(
//       "Amount cannot be negative"
//     );
//   }

//   this.amount = numericAmount;

//   // ----------------------------------------------------------
//   // INITIALIZE REMAINING AMOUNT
//   //
//   // A newly created income starts with the full amount
//   // available.
//   // ----------------------------------------------------------

//   if (this.isNew) {
//     this.remainingAmount =
//       numericAmount;
//   } else {
//     // --------------------------------------------------------
//     // EXISTING INCOME
//     // --------------------------------------------------------

//     const numericRemaining =
//       Number(this.remainingAmount);

//     if (
//       !Number.isFinite(
//         numericRemaining
//       )
//     ) {
//       this.remainingAmount = 0;
//     } else {
//       this.remainingAmount =
//         numericRemaining;
//     }

//     // --------------------------------------------------------
//     // NEVER ALLOW REMAINING > ORIGINAL AMOUNT
//     // --------------------------------------------------------

//     if (
//       this.remainingAmount >
//       this.amount
//     ) {
//       this.remainingAmount =
//         this.amount;
//     }

//     // --------------------------------------------------------
//     // NEVER ALLOW NEGATIVE REMAINING
//     // --------------------------------------------------------

//     if (
//       this.remainingAmount < 0
//     ) {
//       this.remainingAmount = 0;
//     }
//   }
// });

// // ============================================================
// // HELPER METHOD
// // ============================================================
// //
// // Returns the amount currently available to spend.
// //
// // Example:
// //
// // income.amount = 100000
// // income.remainingAmount = 65000
// //
// // income.getAvailableAmount()
// // -> 65000
// // ============================================================

// IncomeSchema.methods.getAvailableAmount =
//   function () {
//     const remaining =
//       Number(
//         this.remainingAmount
//       );

//     if (
//       !Number.isFinite(
//         remaining
//       )
//     ) {
//       return 0;
//     }

//     return Math.max(
//       0,
//       remaining
//     );
//   };

// // ============================================================
// // HELPER METHOD
// // ============================================================
// //
// // Checks whether this income still has money available.
// // ============================================================

// IncomeSchema.methods.hasAvailableAmount =
//   function () {
//     return (
//       this.getAvailableAmount() > 0
//     );
//   };

// // ============================================================
// // HELPER METHOD
// // ============================================================
// //
// // Deduct money from this income.
// //
// // This is useful from controllers/services.
// //
// // Example:
// //
// // income.useAmount(30000);
// //
// // If remainingAmount was 100000:
// //
// // remainingAmount becomes 70000.
// // ============================================================

// IncomeSchema.methods.useAmount =
//   function (amount) {
//     const numericAmount =
//       Number(amount);

//     if (
//       !Number.isFinite(
//         numericAmount
//       ) ||
//       numericAmount <= 0
//     ) {
//       throw new Error(
//         "Amount to use must be greater than zero"
//       );
//     }

//     const available =
//       this.getAvailableAmount();

//     if (
//       numericAmount > available
//     ) {
//       throw new Error(
//         "Insufficient remaining income"
//       );
//     }

//     this.remainingAmount =
//       available - numericAmount;

//     if (
//       this.remainingAmount < 0
//     ) {
//       this.remainingAmount = 0;
//     }

//     return this.remainingAmount;
//   };

// // ============================================================
// // HELPER METHOD
// // ============================================================
// //
// // Restore money to this income.
// //
// // This is especially important when an expense is deleted.
// //
// // Example:
// //
// // income.remainingAmount = 70000
// // income.restoreAmount(30000)
// //
// // result:
// // income.remainingAmount = 100000
// // ============================================================

// IncomeSchema.methods.restoreAmount =
//   function (amount) {
//     const numericAmount =
//       Number(amount);

//     if (
//       !Number.isFinite(
//         numericAmount
//       ) ||
//       numericAmount <= 0
//     ) {
//       throw new Error(
//         "Amount to restore must be greater than zero"
//       );
//     }

//     const current =
//       this.getAvailableAmount();

//     this.remainingAmount =
//       Math.min(
//         this.amount,
//         current + numericAmount
//       );

//     return this.remainingAmount;
//   };

// // ============================================================
// // INDEXES
// // ============================================================

// // User income ordered by date.

// IncomeSchema.index({
//   userId: 1,
//   date: -1,
// });

// // User income by category.

// IncomeSchema.index({
//   userId: 1,
//   category: 1,
// });

// // User income ordered by remaining money.
// //
// // Useful when the expense controller needs to find
// // income records that still contain money.

// IncomeSchema.index({
//   userId: 1,
//   remainingAmount: -1,
// });

// // User income ordered by available money and date.

// IncomeSchema.index({
//   userId: 1,
//   remainingAmount: -1,
//   date: 1,
// });

// // Email-based compatibility query.

// IncomeSchema.index({
//   email: 1,
//   date: -1,
// });

// // Recurring income lookup.

// IncomeSchema.index({
//   userId: 1,
//   isRecurring: 1,
// });

// // ============================================================
// // MODEL
// // ============================================================

// module.exports =
//   mongoose.models.Income ||
//   mongoose.model(
//     "Income",
//     IncomeSchema
//   );





















// ============================================================
// MODELS / INCOME.JS
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// INCOME SCHEMA
// ============================================================

const IncomeSchema = new mongoose.Schema(
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
    // ----------------------------------------------------------

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [
        100,
        "Category cannot exceed 100 characters",
      ],
    },

    // ----------------------------------------------------------
    // SOURCE
    // ----------------------------------------------------------

    source: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "Source cannot exceed 100 characters",
      ],
      default: "",
    },

    // ----------------------------------------------------------
    // ORIGINAL INCOME AMOUNT
    //
    // This value represents the original income.
    // It should NOT decrease when expenses are created.
    //
    // Example:
    //
    // amount = 100000
    // remainingAmount = 100000
    //
    // After a 30000 expense:
    //
    // amount = 100000
    // remainingAmount = 70000
    // ----------------------------------------------------------

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Amount must be a valid number",
      },
    },

    // ----------------------------------------------------------
    // CURRENT AVAILABLE INCOME
    //
    // Expenses deduct from this field first.
    //
    // When this reaches 0, the expense controller can
    // use savings.
    // ----------------------------------------------------------

    remainingAmount: {
      type: Number,
      default: 0,
      min: [
        0,
        "Remaining amount cannot be negative",
      ],
      validate: {
        validator: Number.isFinite,
        message: "Remaining amount must be a valid number",
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
    // Kept for compatibility with the frontend,
    // controllers, and notifications.
    // ----------------------------------------------------------

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },

    // ----------------------------------------------------------
    // RECURRING INCOME
    // ----------------------------------------------------------

    isRecurring: {
      type: Boolean,
      default: false,
    },

    // ----------------------------------------------------------
    // RECURRING FREQUENCY
    // ----------------------------------------------------------

    frequency: {
      type: String,
      enum: {
        values: [
          "weekly",
          "biweekly",
          "monthly",
          "quarterly",
          "annually",
        ],
        message: "Invalid income frequency",
      },
      default: "monthly",
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// PRE-SAVE MIDDLEWARE
// ============================================================
//
// This middleware:
//
// 1. Normalizes text fields.
// 2. Validates amount.
// 3. Initializes remainingAmount for new income.
// 4. Protects remainingAmount from invalid values.
//
// IMPORTANT:
//
// `amount` remains the ORIGINAL income.
// `remainingAmount` is the CURRENT AVAILABLE income.
// ============================================================

IncomeSchema.pre("save", function () {
  // ----------------------------------------------------------
  // NORMALIZE EMAIL
  // ----------------------------------------------------------

  this.email = String(this.email || "")
    .trim()
    .toLowerCase();

  // ----------------------------------------------------------
  // NORMALIZE USER
  // ----------------------------------------------------------

  this.user = String(this.user || "").trim();

  // ----------------------------------------------------------
  // NORMALIZE CATEGORY
  // ----------------------------------------------------------

  this.category = String(this.category || "").trim();

  // ----------------------------------------------------------
  // NORMALIZE DESCRIPTION
  // ----------------------------------------------------------

  this.description = String(
    this.description || ""
  ).trim();

  // ----------------------------------------------------------
  // NORMALIZE SOURCE
  // ----------------------------------------------------------

  this.source = String(
    this.source || ""
  ).trim();

  // ----------------------------------------------------------
  // VALIDATE ORIGINAL AMOUNT
  // ----------------------------------------------------------

  const numericAmount = Number(this.amount);

  if (!Number.isFinite(numericAmount)) {
    throw new Error("Amount must be a valid number");
  }

  if (numericAmount < 0) {
    throw new Error("Amount cannot be negative");
  }

  this.amount = numericAmount;

  // ----------------------------------------------------------
  // INITIALIZE REMAINING AMOUNT FOR NEW INCOME
  // ----------------------------------------------------------

  if (this.isNew) {
    this.remainingAmount = numericAmount;
    return;
  }

  // ----------------------------------------------------------
  // EXISTING INCOME
  // ----------------------------------------------------------

  const numericRemaining = Number(
    this.remainingAmount
  );

  if (!Number.isFinite(numericRemaining)) {
    this.remainingAmount = 0;
  } else {
    this.remainingAmount = numericRemaining;
  }

  // ----------------------------------------------------------
  // NEVER ALLOW REMAINING AMOUNT ABOVE ORIGINAL AMOUNT
  // ----------------------------------------------------------

  if (this.remainingAmount > this.amount) {
    this.remainingAmount = this.amount;
  }

  // ----------------------------------------------------------
  // NEVER ALLOW NEGATIVE REMAINING AMOUNT
  // ----------------------------------------------------------

  if (this.remainingAmount < 0) {
    this.remainingAmount = 0;
  }
});

// ============================================================
// GET AVAILABLE AMOUNT
// ============================================================
//
// Returns the amount currently available to spend.
// ============================================================

IncomeSchema.methods.getAvailableAmount = function () {
  const remaining = Number(
    this.remainingAmount
  );

  if (!Number.isFinite(remaining)) {
    return 0;
  }

  return Math.max(0, remaining);
};

// ============================================================
// CHECK AVAILABLE AMOUNT
// ============================================================

IncomeSchema.methods.hasAvailableAmount = function () {
  return this.getAvailableAmount() > 0;
};

// ============================================================
// USE INCOME
// ============================================================
//
// Deducts an amount from remainingAmount.
//
// Example:
//
// remainingAmount = 100000
// useAmount(30000)
//
// remainingAmount = 70000
// ============================================================

IncomeSchema.methods.useAmount = function (amount) {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Amount to use must be greater than zero"
    );
  }

  const available = this.getAvailableAmount();

  if (numericAmount > available) {
    throw new Error(
      "Insufficient remaining income"
    );
  }

  this.remainingAmount =
    available - numericAmount;

  if (this.remainingAmount < 0) {
    this.remainingAmount = 0;
  }

  return this.remainingAmount;
};

// ============================================================
// RESTORE INCOME
// ============================================================
//
// Useful when an expense is deleted.
//
// Example:
//
// remainingAmount = 70000
// restoreAmount(30000)
//
// remainingAmount = 100000
// ============================================================

IncomeSchema.methods.restoreAmount = function (amount) {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Amount to restore must be greater than zero"
    );
  }

  const current = this.getAvailableAmount();

  this.remainingAmount = Math.min(
    this.amount,
    current + numericAmount
  );

  return this.remainingAmount;
};

// ============================================================
// INDEXES
// ============================================================

// User income ordered by date.

IncomeSchema.index({
  userId: 1,
  date: -1,
});

// User income by category.

IncomeSchema.index({
  userId: 1,
  category: 1,
});

// User income ordered by remaining amount.

IncomeSchema.index({
  userId: 1,
  remainingAmount: -1,
});

// User income ordered by available amount and date.

IncomeSchema.index({
  userId: 1,
  remainingAmount: -1,
  date: 1,
});

// Email-based compatibility query.

IncomeSchema.index({
  email: 1,
  date: -1,
});

// Recurring income lookup.

IncomeSchema.index({
  userId: 1,
  isRecurring: 1,
});

// ============================================================
// MODEL
// ============================================================

module.exports =
  mongoose.models.Income ||
  mongoose.model("Income", IncomeSchema);

