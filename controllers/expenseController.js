const Expense = require("../models/Expense");
const mongoose = require("mongoose");
const Income = require("../models/Income");
const Savings = require("../models/Savings");
const createNotification = require("../utils/createNotification");
const Budget = require("../models/Budget");

// exports.createExpense = async (req, res) => {
//   try {
//     const { description, category, type, amount, date, user, email, userId } =
//       req.body;

//     // validation...

//     const expense = await Expense.create({
//       description: description.trim(),
//       category,
//       type: type || "expense",
//       amount: Number(amount),
//       date,
//       user: user.trim(),
//       userId,
//       email: email.toLowerCase().trim(),
//     });

//     // ✅ MOVE IT HERE
//     await createNotification({
//       userId,
//       email,
//       title: "💸 Expense Recorded",
//       message: `You spent ${amount} on ${category}`,
//       type: "info",
//       referenceId: expense._id,
//       referenceModel: "Expense",
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Expense created successfully",
//       data: expense,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const { category, type, startDate, endDate, search } = req.query;

    const query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (startDate || endDate) {
      query.date = {};

      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { user: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const expenses = await Expense.find(query).sort({
      date: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error("Get expenses error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
};
// exports.createExpense = async (req, res) => {
//   try {
//     const {
//       description,
//       category,
//       type,
//       amount,
//       date,
//       user,
//       email,
//       userId,
//     } = req.body;

//     // validation...
//     if (!description || !category || !amount || !user || !email || !userId) {
//       return res.status(400).json({
//         success: false,
//         message: "Required fields are missing",
//       });
//     }

//     const expenseAmount = Number(amount);

//     if (isNaN(expenseAmount) || expenseAmount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Amount must be greater than 0",
//       });
//     }

//     // 1. Create expense
//     const expense = await Expense.create({
//       description: description.trim(),
//       category,
//       type: type || "expense",
//       amount: expenseAmount,
//       date,
//       user: user.trim(),
//       userId,
//       email: email.toLowerCase().trim(),
//     });

//     // 2. Subtract expense from income/balance
//     const income = await Income.findOneAndUpdate(
//       { userId },
//       {
//         $inc: {
//           balance: -expenseAmount,
//         },
//       },
//       {
//         new: true,
//       }
//     );

//     if (!income) {
//       console.warn("⚠️ Income record not found for userId:", userId);
//     }

//     // 3. Notification
//     await createNotification({
//       userId,
//       email,
//       title: "💸 Expense Recorded",
//       message: `You spent ${expenseAmount} on ${category}`,
//       type: "info",
//       referenceId: expense._id,
//       referenceModel: "Expense",
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Expense created successfully",
//       data: expense,
//       balance: income?.balance ?? null,
//     });
//   } catch (error) {
//     console.error("❌ Create expense error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// Make sure createNotification is imported
// const { createNotification } = require("../utils/notification");

exports.createExpense = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      description,
      category,
      type,
      amount,
      date,
      user,
      email,
      userId,
    } = req.body;

    // ============================================================
    // VALIDATION
    // ============================================================
    if (
      !description ||
      !category ||
      !amount ||
      !date ||
      !user ||
      !email ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const expenseAmount = Number(amount);

    if (!Number.isFinite(expenseAmount) || expenseAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Expense amount must be greater than 0",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCategory = category.trim();

    // ============================================================
    // DATE
    // ============================================================
    const expenseDate = new Date(date);

    if (isNaN(expenseDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense date",
      });
    }

    const budgetMonth = expenseDate.getMonth();
    const budgetYear = expenseDate.getFullYear();

    // ============================================================
    // START TRANSACTION
    // ============================================================
    session.startTransaction();

    // ============================================================
    // 1. FIND INCOME
    // ============================================================
    const income = await Income.findOne({
      userId,
    }).session(session);

    if (!income) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Income record not found",
      });
    }

    let incomeBalance = Number(income.balance) || 0;

    let remainingExpense = expenseAmount;
    let incomeUsed = 0;
    let savingsUsed = 0;

    // ============================================================
    // 2. USE INCOME FIRST
    // ============================================================
    if (incomeBalance > 0) {
      incomeUsed = Math.min(incomeBalance, remainingExpense);

      income.balance = incomeBalance - incomeUsed;

      await income.save({ session });

      remainingExpense -= incomeUsed;
    }

    // ============================================================
    // 3. USE SAVINGS ONLY AFTER INCOME REACHES ZERO
    // ============================================================
    if (remainingExpense > 0) {
      const savingsList = await Savings.find({
        email: normalizedEmail,
        currentAmount: { $gt: 0 },
      })
        .sort({ currentAmount: -1 })
        .session(session);

      for (const saving of savingsList) {
        if (remainingExpense <= 0) {
          break;
        }

        const availableSavings = Number(saving.currentAmount) || 0;

        if (availableSavings <= 0) {
          continue;
        }

        const amountFromSaving = Math.min(
          availableSavings,
          remainingExpense
        );

        saving.currentAmount -= amountFromSaving;

        if (saving.currentAmount < 0) {
          saving.currentAmount = 0;
        }

        // Your Savings pre-save middleware will
        // recalculate progress/isCompleted/completedDate.
        await saving.save({ session });

        savingsUsed += amountFromSaving;
        remainingExpense -= amountFromSaving;
      }
    }

    // ============================================================
    // 4. CHECK IF THERE IS ENOUGH MONEY
    // ============================================================
    if (remainingExpense > 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Insufficient income and savings to cover this expense",
        expenseAmount,
        incomeUsed,
        savingsUsed,
        remainingAmount: remainingExpense,
      });
    }

    // ============================================================
    // 5. CREATE EXPENSE
    // ============================================================
    const [expense] = await Expense.create(
      [
        {
          description: description.trim(),
          category: normalizedCategory,
          type: type || "expense",
          amount: expenseAmount,
          date: expenseDate,
          user: user.trim(),
          userId,
          email: normalizedEmail,
        },
      ],
      { session }
    );

    // ============================================================
    // 6. UPDATE BUDGET
    // ============================================================
    const budget = await Budget.findOne({
      email: normalizedEmail,
      category: normalizedCategory,
      month: budgetMonth,
      year: budgetYear,
    }).session(session);

    let budgetUpdated = false;

    if (budget) {
      budget.spentAmount =
        Number(budget.spentAmount || 0) + expenseAmount;

      await budget.save({ session });

      budgetUpdated = true;
    }

    // ============================================================
    // 7. CREATE NOTIFICATION
    // ============================================================
    await createNotification({
      userId,
      email: normalizedEmail,
      title: "💸 Expense Recorded",
      message: `You spent ${expenseAmount} on ${normalizedCategory}`,
      type: "info",
      referenceId: expense._id,
      referenceModel: "Expense",
    });

    // ============================================================
    // 8. COMMIT TRANSACTION
    // ============================================================
    await session.commitTransaction();

    // ============================================================
    // 9. RESPONSE
    // ============================================================
    return res.status(201).json({
      success: true,
      message: "Expense created successfully",

      data: expense,

      moneyUsed: {
        expenseAmount,
        incomeUsed,
        savingsUsed,
      },

      remainingIncomeBalance: income.balance,

      budget: budgetUpdated
        ? {
            category: budget.category,
            allocatedAmount: budget.allocatedAmount,
            spentAmount: budget.spentAmount,
            remainingAmount: budget.remainingAmount,
            percentageUsed: budget.percentageUsed,
            status: budget.status,
          }
        : null,
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error("❌ Transaction abort error:", abortError);
    }

    console.error("❌ Create expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create expense",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({}).sort({
      date: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error("Get expenses error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch expense",
      error: error.message,
    });
  }
};

// @desc    Get expenses by user email
// @route   GET /api/expenses/email/:email
// @access  Private
exports.getExpensesByEmail = async (req, res) => {
  try {
    const expenses = await Expense.find({
      email: req.params.email.toLowerCase(),
    }).sort({
      date: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private

// exports.createExpense = async (req, res) => {
//   try {
//     const {
//       description,
//       category,
//       type,
//       amount,
//       date,
//       user,
//       email,
//       userId,
//     } = req.body;

//     // Validate required fields
//     if (
//       !description ||
//       !category ||
//       !amount ||
//       !date ||
//       !user ||
//       !email ||
//       !userId
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Description, category, amount, date, user, email, and userId are required",
//       });
//     }

//     // Validate amount
// if (!Number.isInteger(Number(amount)) || Number(amount) <= 0) {
//   return res.status(400).json({
//     success: false,
//     message: "Amount must be a positive whole number (no decimals)",
//   });
// }

//     const expense = await Expense.create({
//       description: description.trim(),
//       category,
//       type: type || "expense",
//       amount: Number(amount),
//       date,
//       user: user.trim(),
//       userId,
//       email: email.toLowerCase().trim(),
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Expense created successfully",
//       data: expense,
//     });

//   } catch (error) {

//     console.error("Create expense error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create expense",
//       error: error.message,
//     });

//   }
// };

exports.createExpense = async (req, res) => {
  try {
    const { description, category, type, amount, date, user, email, userId } =
      req.body;

    // ✅ VALIDATION
    if (
      !description ||
      !category ||
      !amount ||
      !date ||
      !user ||
      !email ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!Number.isInteger(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive whole number",
      });
    }

    // ✅ CREATE EXPENSE
    const expense = await Expense.create({
      description: description.trim(),
      category,
      type: type || "expense",
      amount: Number(amount),
      date,
      user: user.trim(),
      userId,
      email: email.toLowerCase().trim(),
    });

    // ⚠️ NOTE:
    // Income deduction + savings fallback + notification
    // are already handled in Expense model (post save hook)

    return res.status(201).json({
      success: true,
      message: "Expense created & processed successfully",
      data: expense,
    });
  } catch (error) {
    console.error("Create expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create expense",
      error: error.message,
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update expense",
      error: error.message,
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete expense",
      error: error.message,
    });
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const stats = await Expense.getStats(req.user.id);

    // Get category breakdown
    const categoryStats = await Expense.aggregate([
      {
        $match: { userId: mongoose.Types.ObjectId(req.user.id) },
      },
      {
        $group: {
          _id: {
            category: "$category",
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.category",
          expenses: {
            $push: {
              type: "$_id.type",
              total: "$total",
              count: "$count",
            },
          },
          totalAmount: { $sum: "$total" },
        },
      },
    ]);

    // Get monthly summary (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyStats = await Expense.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(req.user.id),
          date: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0],
            },
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0],
            },
          },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats,
        categoryBreakdown: categoryStats,
        monthlySummary: monthlyStats,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

// @desc    Bulk delete expenses
// @route   DELETE /api/expenses/bulk
// @access  Private
exports.bulkDeleteExpenses = async (req, res) => {
  try {
    const { expenseIds } = req.body;

    if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of expense IDs",
      });
    }

    const result = await Expense.deleteMany({
      _id: { $in: expenseIds },
      userId: req.user.id,
    });

    // Get updated statistics
    const stats = await Expense.getStats(req.user.id);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} expenses deleted successfully`,
      deletedCount: result.deletedCount,
      stats,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete expenses",
      error: error.message,
    });
  }
};
