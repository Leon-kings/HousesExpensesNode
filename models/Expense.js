const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
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
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["expense", "income"],
      default: "expense",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than zero"],
      validate: {
        validator: Number.isInteger,
        message: "Amount must be a whole number without decimals",
      },
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    user: {
      type: String,
      required: [true, "User is required"],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, type: 1 });

// Virtual for formatted amount
expenseSchema.virtual("formattedAmount").get(function () {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(this.amount);
});

// Static method to calculate statistics
expenseSchema.statics.getStats = async function (userId) {
  const objectId =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const result = await this.aggregate([
    {
      $match: { userId: objectId },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = {
    totalExpenses: 0,
    totalIncome: 0,
    expenseCount: 0,
    incomeCount: 0,
    netBalance: 0,
  };

  result.forEach((item) => {
    if (item._id === "expense") {
      stats.totalExpenses = item.total;
      stats.expenseCount = item.count;
    } else if (item._id === "income") {
      stats.totalIncome = item.total;
      stats.incomeCount = item.count;
    }
  });

  stats.netBalance = stats.totalIncome - stats.totalExpenses;

  return stats;
};

// Update timestamp before saving
expenseSchema.pre("save", function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model("Expense", expenseSchema);
