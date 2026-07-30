  // const mongoose = require('mongoose');

  // const BudgetSchema = new mongoose.Schema({
  //   category: {
  //     type: String,
  //     required: [true, 'Category is required'],
  //     trim: true,
  //     index: true,
  //   },
  //   allocatedAmount: {
  //     type: Number,
  //     required: [true, 'Allocated amount is required'],
  //     min: 0,
  //   },
  //   spentAmount: {
  //     type: Number,
  //     default: 0,
  //     min: 0,
  //   },
  //   remainingAmount: {
  //     type: Number,
  //     default: 0,
  //   },
  //   month: {
  //     type: Number,
  //     required: true,
  //     min: 0,
  //     max: 11,
  //   },
  //   year: {
  //     type: Number,
  //     required: true,
  //   },
  //   description: {
  //     type: String,
  //     trim: true,
  //   },
  //   email: {
  //     type: String,
  //     required: [true, 'Email is required'],
  //     trim: true,
  //     lowercase: true,
  //     index: true,
  //   },
  //   status: {
  //     type: String,
  //     enum: ['on-track', 'approaching-limit', 'over-budget', 'under-budget'],
  //     default: 'on-track',
  //   },
  //   percentageUsed: {
  //     type: Number,
  //     default: 0,
  //     min: 0,
  //     max: 100,
  //   },
  // }, {
  //   timestamps: true,
  // });

  // // Unique constraint for category per month/year per user
  // BudgetSchema.index({ email: 1, category: 1, month: 1, year: 1 }, { unique: true });

  // // Calculate remaining and percentage before saving
  // BudgetSchema.pre('save', function(next) {
  //   this.remainingAmount = Math.max(0, this.allocatedAmount - this.spentAmount);
  //   this.percentageUsed = this.allocatedAmount > 0 
  //     ? Math.min(100, (this.spentAmount / this.allocatedAmount) * 100) 
  //     : 0;
    
  //   if (this.percentageUsed > 100) {
  //     this.status = 'over-budget';
  //   } else if (this.percentageUsed > 80) {
  //     this.status = 'approaching-limit';
  //   } else if (this.percentageUsed < 50 && this.spentAmount > 0) {
  //     this.status = 'under-budget';
  //   } else {
  //     this.status = 'on-track';
  //   }
  //   next();
  // });

  // module.exports = mongoose.model('Budget', BudgetSchema);


  const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    allocatedAmount: {
      type: Number,
      required: [true, "Allocated amount is required"],
      min: [0, "Allocated amount cannot be negative"],
    },

    spentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    percentageUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "on-track",
        "approaching-limit",
        "over-budget",
        "under-budget",
      ],
      default: "on-track",
    },

    month: {
      type: Number,
      required: [true, "Month is required"],
      min: 0,
      max: 11,
    },

    year: {
      type: Number,
      required: [true, "Year is required"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// One budget per category per month/year for each user
BudgetSchema.index(
  {
    email: 1,
    category: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

// Automatically calculate values

BudgetSchema.pre("save", function () {
  this.allocatedAmount = Number(this.allocatedAmount) || 0;
  this.spentAmount = Number(this.spentAmount) || 0;

  this.remainingAmount = Math.max(
    this.allocatedAmount - this.spentAmount,
    0
  );

  this.percentageUsed =
    this.allocatedAmount > 0
      ? (this.spentAmount / this.allocatedAmount) * 100
      : 0;


  if (this.percentageUsed >= 100) {
    this.status = "over-budget";

  } else if (this.percentageUsed >= 80) {
    this.status = "approaching-limit";

  } else if (
    this.percentageUsed < 50 &&
    this.spentAmount > 0
  ) {
    this.status = "under-budget";

  } else {
    this.status = "on-track";
  }
});

// Recalculate when updating with findOneAndUpdate()
BudgetSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();

  const current = await this.model.findOne(this.getQuery());

  if (!current) return;

  const allocatedAmount =
    Number(update.allocatedAmount ?? current.allocatedAmount);

  const spentAmount =
    Number(update.spentAmount ?? current.spentAmount);


  update.remainingAmount = Math.max(
    allocatedAmount - spentAmount,
    0
  );


  update.percentageUsed =
    allocatedAmount > 0
      ? (spentAmount / allocatedAmount) * 100
      : 0;


  if (update.percentageUsed >= 100) {
    update.status = "over-budget";

  } else if (update.percentageUsed >= 80) {
    update.status = "approaching-limit";

  } else if (
    update.percentageUsed < 50 &&
    spentAmount > 0
  ) {
    update.status = "under-budget";

  } else {
    update.status = "on-track";
  }


  this.setUpdate(update);
});

module.exports =
  mongoose.models.Budget ||
  mongoose.model("Budget", BudgetSchema);