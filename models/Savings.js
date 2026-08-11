
// ============================================================
// MODELS / SAVINGS.JS
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// SAVINGS SCHEMA
// ============================================================

const SavingsSchema = new mongoose.Schema(
  {
    // ========================================================
    // CATEGORY
    // ========================================================

    category: {
      type: String,
      required: [
        true,
        "Savings category is required",
      ],
      trim: true,
      maxlength: [
        100,
        "Category cannot exceed 100 characters",
      ],
    },

    // ========================================================
    // TARGET AMOUNT
    // ========================================================

    targetAmount: {
      type: Number,
      required: [
        true,
        "Target amount is required",
      ],
      min: [
        1,
        "Target amount must be greater than zero",
      ],
      validate: {
        validator: (value) =>
          Number.isFinite(value) &&
          Number.isInteger(value) &&
          value >= 1,
        message:
          "Target amount must be a valid whole number",
      },
    },

    // ========================================================
    // CURRENT SAVINGS
    //
    // THIS is the amount available to spend.
    //
    // Expenses may deduct from this ONLY after
    // available income has been exhausted.
    // ========================================================

    currentAmount: {
      type: Number,
      default: 0,
      min: [
        0,
        "Current amount cannot be negative",
      ],
      validate: {
        validator: (value) =>
          Number.isFinite(value) &&
          Number.isInteger(value) &&
          value >= 0,
        message:
          "Current amount must be a valid whole number",
      },
    },

    // ========================================================
    // PROGRESS
    // ========================================================

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      validate: {
        validator: (value) =>
          Number.isFinite(value),
        message:
          "Progress must be a valid number",
      },
    },

    // ========================================================
    // DEADLINE
    // ========================================================

    deadline: {
      type: Date,
      default: null,
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
    // PRIORITY
    // ========================================================

    priority: {
      type: String,
      enum: {
        values: [
          "low",
          "medium",
          "high",
          "critical",
        ],
        message:
          "Invalid savings priority",
      },
      default: "medium",
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

    // ========================================================
    // COMPLETION STATUS
    // ========================================================

    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ========================================================
    // COMPLETION DATE
    // ========================================================

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
// CALCULATE SAVINGS VALUES
// ============================================================

SavingsSchema.methods.calculateValues =
  function () {
    const target =
      Number(this.targetAmount) || 0;

    let current =
      Number(this.currentAmount) || 0;

    // --------------------------------------------------------
    // VALIDATE CURRENT
    // --------------------------------------------------------

    if (
      !Number.isFinite(current) ||
      current < 0
    ) {
      current = 0;
    }

    current = Math.trunc(current);

    // --------------------------------------------------------
    // SAVINGS CANNOT EXCEED TARGET
    // --------------------------------------------------------

    if (
      target > 0 &&
      current > target
    ) {
      current = target;
    }

    this.currentAmount =
      current;

    // --------------------------------------------------------
    // CALCULATE PROGRESS
    // --------------------------------------------------------

    if (target > 0) {
      this.progress = Number(
        (
          (current / target) *
          100
        ).toFixed(2)
      );

      this.progress =
        Math.min(
          100,
          Math.max(
            0,
            this.progress
          )
        );
    } else {
      this.progress = 0;
    }

    // --------------------------------------------------------
    // COMPLETION
    // --------------------------------------------------------

    if (
      this.progress >= 100
    ) {
      this.progress = 100;
      this.isCompleted = true;

      if (!this.completedDate) {
        this.completedDate =
          new Date();
      }
    } else {
      this.isCompleted = false;
      this.completedDate = null;
    }
  };

// ============================================================
// PRE-SAVE
// ============================================================

SavingsSchema.pre("save", function () {
  // ----------------------------------------------------------
  // NORMALIZE EMAIL
  // ----------------------------------------------------------

  this.email = String(
    this.email || ""
  )
    .trim()
    .toLowerCase();

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
  // VALIDATE TARGET
  // ----------------------------------------------------------

  const target =
    Number(this.targetAmount);

  if (
    !Number.isFinite(target) ||
    !Number.isInteger(target) ||
    target <= 0
  ) {
    throw new Error(
      "Target amount must be a positive whole number"
    );
  }

  this.targetAmount =
    target;

  // ----------------------------------------------------------
  // CALCULATE VALUES
  // ----------------------------------------------------------

  this.calculateValues();
});

// ============================================================
// GET AVAILABLE SAVINGS
// ============================================================

SavingsSchema.methods.getAvailableAmount =
  function () {
    const current =
      Number(this.currentAmount);

    if (
      !Number.isFinite(current)
    ) {
      return 0;
    }

    return Math.max(
      0,
      Math.trunc(current)
    );
  };

// ============================================================
// CHECK AVAILABLE SAVINGS
// ============================================================

SavingsSchema.methods.hasAvailableAmount =
  function () {
    return (
      this.getAvailableAmount() > 0
    );
  };

// ============================================================
// USE SAVINGS
// ============================================================

SavingsSchema.methods.useAmount =
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
        "Insufficient savings"
      );
    }

    this.currentAmount =
      available - numericAmount;

    if (
      this.currentAmount < 0
    ) {
      this.currentAmount = 0;
    }

    // Recalculate progress/status
    this.calculateValues();

    return this.currentAmount;
  };

// ============================================================
// RESTORE SAVINGS
// ============================================================

SavingsSchema.methods.restoreAmount =
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

    this.currentAmount =
      Math.min(
        this.targetAmount,
        current + numericAmount
      );

    this.calculateValues();

    return this.currentAmount;
  };

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

SavingsSchema.index({
  email: 1,
  isCompleted: 1,
});

SavingsSchema.index({
  userId: 1,
  createdAt: -1,
});

// ============================================================
// MODEL
// ============================================================

module.exports =
  mongoose.models.Savings ||
  mongoose.model(
    "Savings",
    SavingsSchema
  );