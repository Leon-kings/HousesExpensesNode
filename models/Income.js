
// ============================================================
// MODELS / INCOME.JS
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// INCOME SCHEMA
// ============================================================

const IncomeSchema = new mongoose.Schema(
  {
    // ========================================================
    // DESCRIPTION
    // ========================================================

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [
        200,
        "Description cannot exceed 200 characters",
      ],
    },

    // ========================================================
    // CATEGORY
    // ========================================================

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [
        100,
        "Category cannot exceed 100 characters",
      ],
    },

    // ========================================================
    // SOURCE
    // ========================================================

    source: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "Source cannot exceed 100 characters",
      ],
      default: "",
    },

    // ========================================================
    // ORIGINAL INCOME AMOUNT
    //
    // NEVER decrease this when an expense is created.
    //
    // Example:
    //
    // amount = 100000
    // remainingAmount = 100000
    //
    // After expense of 30000:
    //
    // amount = 100000
    // remainingAmount = 70000
    // ========================================================

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
      validate: {
        validator: (value) =>
          Number.isFinite(value) &&
          Number.isInteger(value) &&
          value >= 0,
        message:
          "Amount must be a valid whole number",
      },
    },

    // ========================================================
    // CURRENT AVAILABLE INCOME
    //
    // THIS is the amount available for expenses.
    // ========================================================

    remainingAmount: {
      type: Number,
      default: 0,
      min: [
        0,
        "Remaining amount cannot be negative",
      ],
      validate: {
        validator: (value) =>
          Number.isFinite(value) &&
          Number.isInteger(value) &&
          value >= 0,
        message:
          "Remaining amount must be a valid whole number",
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
    // USER DISPLAY NAME
    // ========================================================

    user: {
      type: String,
      required: [true, "User is required"],
      trim: true,
      maxlength: [
        100,
        "User cannot exceed 100 characters",
      ],
    },

    // ========================================================
    // PRIMARY USER OWNERSHIP
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
    // RECURRING INCOME
    // ========================================================

    isRecurring: {
      type: Boolean,
      default: false,
    },

    // ========================================================
    // RECURRING FREQUENCY
    // ========================================================

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
// PRE-SAVE
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

  this.category = String(
    this.category || ""
  ).trim();

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

  const numericAmount =
    Number(this.amount);

  if (
    !Number.isFinite(numericAmount) ||
    !Number.isInteger(numericAmount) ||
    numericAmount < 0
  ) {
    throw new Error(
      "Amount must be a valid whole number"
    );
  }

  this.amount = numericAmount;

  // ----------------------------------------------------------
  // NEW INCOME
  //
  // Automatically make entire income available.
  // ----------------------------------------------------------

  if (this.isNew) {
    this.remainingAmount =
      numericAmount;

    return;
  }

  // ----------------------------------------------------------
  // EXISTING INCOME
  // ----------------------------------------------------------

  const numericRemaining =
    Number(this.remainingAmount);

  if (
    !Number.isFinite(numericRemaining) ||
    !Number.isInteger(numericRemaining)
  ) {
    this.remainingAmount = 0;
  } else {
    this.remainingAmount =
      numericRemaining;
  }

  // ----------------------------------------------------------
  // NEVER EXCEED ORIGINAL INCOME
  // ----------------------------------------------------------

  if (
    this.remainingAmount >
    this.amount
  ) {
    this.remainingAmount =
      this.amount;
  }

  // ----------------------------------------------------------
  // NEVER GO BELOW ZERO
  // ----------------------------------------------------------

  if (
    this.remainingAmount < 0
  ) {
    this.remainingAmount = 0;
  }
});

// ============================================================
// GET AVAILABLE INCOME
// ============================================================

IncomeSchema.methods.getAvailableAmount =
  function () {
    const remaining =
      Number(this.remainingAmount);

    if (!Number.isFinite(remaining)) {
      return 0;
    }

    return Math.max(
      0,
      Math.trunc(remaining)
    );
  };

// ============================================================
// CHECK AVAILABLE INCOME
// ============================================================

IncomeSchema.methods.hasAvailableAmount =
  function () {
    return (
      this.getAvailableAmount() > 0
    );
  };

// ============================================================
// USE INCOME
// ============================================================

IncomeSchema.methods.useAmount =
  function (amount) {
    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      !Number.isInteger(numericAmount) ||
      numericAmount <= 0
    ) {
      throw new Error(
        "Amount to use must be a positive whole number"
      );
    }

    const available =
      this.getAvailableAmount();

    if (
      numericAmount > available
    ) {
      throw new Error(
        "Insufficient remaining income"
      );
    }

    this.remainingAmount =
      available - numericAmount;

    if (
      this.remainingAmount < 0
    ) {
      this.remainingAmount = 0;
    }

    return this.remainingAmount;
  };

// ============================================================
// RESTORE INCOME
// ============================================================

IncomeSchema.methods.restoreAmount =
  function (amount) {
    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      !Number.isInteger(numericAmount) ||
      numericAmount <= 0
    ) {
      throw new Error(
        "Amount to restore must be a positive whole number"
      );
    }

    const current =
      this.getAvailableAmount();

    this.remainingAmount =
      Math.min(
        this.amount,
        current + numericAmount
      );

    return this.remainingAmount;
  };

// ============================================================
// INDEXES
// ============================================================

IncomeSchema.index({
  userId: 1,
  date: -1,
});

IncomeSchema.index({
  userId: 1,
  category: 1,
});

IncomeSchema.index({
  userId: 1,
  remainingAmount: -1,
});

IncomeSchema.index({
  userId: 1,
  remainingAmount: -1,
  date: 1,
});

IncomeSchema.index({
  email: 1,
  date: -1,
});

IncomeSchema.index({
  userId: 1,
  isRecurring: 1,
});

// ============================================================
// MODEL
// ============================================================

module.exports =
  mongoose.models.Income ||
  mongoose.model(
    "Income",
    IncomeSchema
  );