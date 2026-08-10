
const mongoose = require("mongoose");
const Income = require("./Income");
const Savings = require("./Savings");
const Notification = require("./Notification");

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
      enum: ["expense", "income"],
      default: "expense",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than zero"],
      validate: {
        validator: Number.isInteger,
        message: "Amount must be a whole number",
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// 🔥 MAIN LOGIC
expenseSchema.post("save", async function (doc) {
  try {
    const income = await Income.findOne({ email: doc.user }).sort({ createdAt: -1 });

    if (!income) return;

    let remainingExpense = doc.amount;

    // ✅ STEP 1: USE INCOME FIRST
    if (income.remainingAmount >= remainingExpense) {
      income.remainingAmount -= remainingExpense;
      remainingExpense = 0;
    } else {
      remainingExpense -= income.remainingAmount;
      income.remainingAmount = 0;
    }

    await income.save();

    let usedSavings = 0;

    // ❗ STEP 2: USE SAVINGS IF NEEDED
    if (remainingExpense > 0) {
      const savingsList = await Savings.find({
        email: doc.user,
        isCompleted: false,
      }).sort({ priority: -1 }); // high priority first

      for (let saving of savingsList) {
        if (remainingExpense <= 0) break;

        if (saving.currentAmount > 0) {
          let deduct = Math.min(saving.currentAmount, remainingExpense);

          saving.currentAmount -= deduct;
          remainingExpense -= deduct;
          usedSavings += deduct;

          await saving.save();
        }
      }
    }

    // 📊 CALCULATE %
    const percentage = ((income.remainingAmount / income.amount) * 100).toFixed(1);

    // 🔔 MESSAGE
    let message = `Expense ${doc.amount} recorded. Remaining income: ${income.remainingAmount} (${percentage}%)`;

    let type = "info";

    if (percentage < 50) {
      type = "warning";
      message += " ⚠️ Income is getting low.";
    }

    if (percentage < 20) {
      type = "alert";
      message += " 🚨 Critical low income.";
    }

    if (usedSavings > 0) {
      type = "alert";
      message += ` Used ${usedSavings} from savings!`;
    }

    // 🔔 SAVE NOTIFICATION
    await Notification.create({
      userId: doc.userId,
      message,
      type,
    });

  } catch (err) {
    console.error("Expense processing error:", err.message);
  }
});

module.exports = mongoose.model("Expense", expenseSchema);