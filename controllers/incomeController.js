const Income = require("../models/Income");
const Budget = require("../models/Budget");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// Helper function to create notification
const createNotification = require("../utils/createNotification");

// Helper function to update budget spent amounts
const updateBudgetSpent = async (email, category, amount, month, year) => {
  try {
    const budget = await Budget.findOne({
      email: email.toLowerCase(),
      category: category,
      month: month,
      year: year,
    });

    if (budget) {
      budget.spentAmount = (budget.spentAmount || 0) + amount;
      budget.remainingAmount = Math.max(
        0,
        budget.allocatedAmount - budget.spentAmount,
      );
      budget.percentageUsed =
        budget.allocatedAmount > 0
          ? Math.min(100, (budget.spentAmount / budget.allocatedAmount) * 100)
          : 0;

      // Update status based on percentage
      if (budget.percentageUsed > 100) {
        budget.status = "over-budget";
        // Create over-budget notification
        await createNotification(
          email,
          `⚠️ Budget Alert: ${category} Over Budget`,
          `You have exceeded your ${category} budget. Spent: $${budget.spentAmount.toFixed(2)} vs Budget: $${budget.allocatedAmount.toFixed(2)}`,
          "budget_alert",
          "high",
          budget._id,
          "Budget",
        );
      } else if (budget.percentageUsed > 80) {
        budget.status = "approaching-limit";
        // Create approaching limit notification
        await createNotification(
          email,
          `⚡ Budget Alert: ${category} Approaching Limit`,
          `You are approaching your ${category} budget limit. Used: ${budget.percentageUsed.toFixed(1)}% ($${budget.spentAmount.toFixed(2)} of $${budget.allocatedAmount.toFixed(2)})`,
          "budget_alert",
          "medium",
          budget._id,
          "Budget",
        );
      } else if (budget.percentageUsed < 50 && budget.spentAmount > 0) {
        budget.status = "under-budget";
      } else {
        budget.status = "on-track";
      }

      await budget.save();
      return budget;
    }
    return null;
  } catch (error) {
    console.error("Update budget spent error:", error);
    return null;
  }
};

// @desc    Get all incomes with budget summary
// @route   GET /api/incomes
// @access  Private
// exports.getIncomes = async (req, res) => {
//   try {
//     const { category, source, startDate, endDate, search, month, year } =
//       req.query;

//     // Build query
//     const query = {};

//     if (category && category !== "all") {
//       query.category = category;
//     }

//     if (source && source !== "all") {
//       query.source = source;
//     }

//     if (startDate || endDate) {
//       query.date = {};
//       if (startDate) query.date.$gte = new Date(startDate);
//       if (endDate) query.date.$lte = new Date(endDate);
//     }

//     if (search) {
//       query.$or = [
//         { description: { $regex: search, $options: "i" } },
//         { category: { $regex: search, $options: "i" } },
//         { source: { $regex: search, $options: "i" } },
//         { user: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//       ];
//     }

//     // Fetch all matching incomes
//     const incomes = await Income.find(query).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     // Current month/year
//     const currentMonth =
//       month !== undefined ? parseInt(month) : new Date().getMonth();
//     const currentYear = year ? parseInt(year) : new Date().getFullYear();

//     // Fetch ALL budgets (no email filter)
//     const budgets = await Budget.find({
//       month: currentMonth,
//       year: currentYear,
//     });

//     // Calculate monthly income
//     const monthIncomes = incomes.filter((inc) => {
//       const d = new Date(inc.date);
//       return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
//     });

//     const totalMonthlyIncome = monthIncomes.reduce(
//       (sum, inc) => sum + inc.amount,
//       0,
//     );

//     const totalBudgeted = budgets.reduce(
//       (sum, b) => sum + b.allocatedAmount,
//       0,
//     );

//     const totalSpent = budgets.reduce(
//       (sum, b) => sum + (b.spentAmount || 0),
//       0,
//     );

//     const remainingBudget = totalBudgeted - totalSpent;

//     const budgetSummary = budgets.map((budget) => ({
//       category: budget.category,
//       allocated: budget.allocatedAmount,
//       spent: budget.spentAmount || 0,
//       remaining: budget.remainingAmount || 0,
//       percentageUsed: budget.percentageUsed || 0,
//       status: budget.status || "on-track",
//     }));

//     res.status(200).json({
//       success: true,
//       count: incomes.length,
//       data: incomes,
//       budgetSummary: {
//         totalBudgeted,
//         totalSpent,
//         remainingBudget,
//         totalMonthlyIncome,
//         savingsRate:
//           totalMonthlyIncome > 0
//             ? ((totalMonthlyIncome - totalSpent) / totalMonthlyIncome) * 100
//             : 0,
//         categories: budgetSummary,
//       },
//     });
//   } catch (error) {
//     console.error("Get incomes error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch incomes",
//       error: error.message,
//     });
//   }
// };

exports.getIncomes = async (req, res) => {
  try {
    const {
      category,
      source,
      startDate,
      endDate,
      search,
      month,
      year,
    } = req.query;

    // ============================================================
    // BUILD INCOME QUERY
    // ============================================================
    const query = {};

    if (
      category &&
      category !== "all"
    ) {
      query.category = category;
    }

    if (
      source &&
      source !== "all"
    ) {
      query.source = source;
    }

    // ============================================================
    // DATE FILTER
    // ============================================================
    if (startDate || endDate) {
      query.date = {};

      if (startDate) {
        query.date.$gte =
          new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);

        // Include the entire end date
        end.setHours(
          23,
          59,
          59,
          999
        );

        query.date.$lte = end;
      }
    }

    // ============================================================
    // SEARCH
    // ============================================================
    if (search) {
      query.$or = [
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },

        {
          category: {
            $regex: search,
            $options: "i",
          },
        },

        {
          source: {
            $regex: search,
            $options: "i",
          },
        },

        {
          user: {
            $regex: search,
            $options: "i",
          },
        },

        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ============================================================
    // FETCH INCOMES
    // ============================================================
    const incomes = await Income.find(
      query
    ).sort({
      date: -1,
      createdAt: -1,
    });

    // ============================================================
    // CURRENT / REQUESTED MONTH AND YEAR
    //
    // JavaScript:
    // January = 0
    // December = 11
    // ============================================================
    const currentMonth =
      month !== undefined
        ? parseInt(month, 10)
        : new Date().getMonth();

    const currentYear =
      year !== undefined
        ? parseInt(year, 10)
        : new Date().getFullYear();

    // ============================================================
    // FETCH ALL BUDGETS FOR MONTH/YEAR
    //
    // No email filter here, as requested.
    // ============================================================
    const budgets = await Budget.find({
      month: currentMonth,
      year: currentYear,
    });

    // ============================================================
    // CALCULATE MONTHLY INCOME
    // ============================================================
    const monthIncomes =
      incomes.filter((income) => {
        const incomeDate =
          new Date(income.date);

        return (
          incomeDate.getMonth() ===
            currentMonth &&
          incomeDate.getFullYear() ===
            currentYear
        );
      });

    const totalMonthlyIncome =
      monthIncomes.reduce(
        (sum, income) =>
          sum +
          Number(income.amount || 0),
        0
      );

    // ============================================================
    // CALCULATE BUDGET TOTALS
    // ============================================================
    const totalBudgeted =
      budgets.reduce(
        (sum, budget) =>
          sum +
          Number(
            budget.allocatedAmount || 0
          ),
        0
      );

    const totalSpent =
      budgets.reduce(
        (sum, budget) =>
          sum +
          Number(
            budget.spentAmount || 0
          ),
        0
      );

    const remainingBudget =
      totalBudgeted - totalSpent;

    // ============================================================
    // BUDGET CATEGORY SUMMARY
    // ============================================================
    const budgetSummary =
      budgets.map((budget) => ({
        id: budget._id,

        category:
          budget.category,

        allocated:
          Number(
            budget.allocatedAmount || 0
          ),

        spent:
          Number(
            budget.spentAmount || 0
          ),

        remaining:
          Number(
            budget.remainingAmount || 0
          ),

        percentageUsed:
          Number(
            budget.percentageUsed || 0
          ),

        status:
          budget.status ||
          "on-track",

        month:
          budget.month,

        year:
          budget.year,
      }));

    // ============================================================
    // SAVINGS RATE
    // ============================================================
    const savingsRate =
      totalMonthlyIncome > 0
        ? ((totalMonthlyIncome -
            totalSpent) /
            totalMonthlyIncome) *
          100
        : 0;

    // ============================================================
    // RESPONSE
    // ============================================================
    return res.status(200).json({
      success: true,

      count: incomes.length,

      data: incomes,

      budgetSummary: {
        totalBudgeted,

        totalSpent,

        remainingBudget,

        totalMonthlyIncome,

        savingsRate:
          Number(
            savingsRate.toFixed(2)
          ),

        categories:
          budgetSummary,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get incomes error:",
      error
    );

    return res.status(500).json({
      success: false,

      message: "Failed to fetch incomes",

      error: error.message,
    });
  }
};

// @desc    Get single income
// @route   GET /api/incomes/:id
// @access  Private
exports.getIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    res.status(200).json({
      success: true,
      data: income,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch income",
      error: error.message,
    });
  }
};

// @desc    Create income
// @route   POST /api/incomes
// @access  Private
// exports.createIncome = async (req, res) => {
//   try {
//     const {
//       description,
//       category,
//       source,
//       amount,
//       date,
//       user,
//       email,
//       isRecurring,
//       frequency,
//     } = req.body;

//     if (!description || !category || !amount || !date || !user || !email) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const income = await Income.create({
//       description,
//       category,
//       source: source || category,
//       amount,
//       date,
//       user,
//       email: email.toLowerCase(),
//       isRecurring: isRecurring || false,
//       frequency: frequency || 'monthly',
//     });

//     // Update budget spent amount
//     const incomeDate = new Date(date);
//     await updateBudgetSpent(
//       email,
//       category,
//       amount,
//       incomeDate.getMonth(),
//       incomeDate.getFullYear()
//     );

//     // Create notification for new income
//     await createNotification(
//       email,
//       `💰 Income Recorded: ${description}`,
//       `You have recorded ${category} income of $${amount.toFixed(2)}.`,
//       'income_recorded',
//       'low',
//       income._id,
//       'Income'
//     );

//     res.status(201).json({
//       success: true,
//       message: "Income created successfully",
//       data: income,
//     });
//   } catch (error) {
//     console.error('Create income error:', error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create income",
//       error: error.message,
//     });
//   }
// };

exports.createIncome = async (req, res) => {
  try {
    const {
      description,
      category,
      source,
      amount,
      date,
      user,
      email,
      isRecurring,
      frequency,
    } = req.body;

    if (!description || !category || !amount || !date || !user || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const income = await Income.create({
      description,
      category,
      source: source || category,
      amount: Number(amount),
      remainingAmount: Number(amount),
      date,
      user,
      email: email.toLowerCase(),
      isRecurring: isRecurring || false,
      frequency: frequency || "monthly",
    });

    // ✅ CORRECT PLACE FOR NOTIFICATION
    await createNotification({
      email,
      title: "💰 Income Added",
      message: `You received ${amount} from ${source || category}`,
      type: "info",
      referenceId: income._id,
      referenceModel: "Income",
    });

    res.status(201).json({
      success: true,
      message: "Income created successfully",
      data: income,
    });
  } catch (error) {
    console.error("Create income error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create income",
      error: error.message,
    });
  }
};

// Get Incomes By Email
exports.getIncomesByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const incomes = await Income.find({
      email: email.toLowerCase(),
    }).sort({
      date: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Incomes retrieved successfully",
      count: incomes.length,
      data: incomes,
    });
  } catch (error) {
    console.error("Get incomes by email error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve incomes",
      error: error.message,
    });
  }
};

// @desc    Update income
// @route   PUT /api/incomes/:id
// @access  Private
exports.updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    // If amount or category changed, update budget
    const oldAmount = income.amount;
    const oldCategory = income.category;
    const oldDate = new Date(income.date);

    const updatedIncome = await Income.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    // If amount or category changed, update budget
    if (
      oldAmount !== updatedIncome.amount ||
      oldCategory !== updatedIncome.category
    ) {
      // Remove old amount from old category
      await updateBudgetSpent(
        income.email,
        oldCategory,
        -oldAmount,
        oldDate.getMonth(),
        oldDate.getFullYear(),
      );

      // Add new amount to new category
      const newDate = new Date(updatedIncome.date);
      await updateBudgetSpent(
        updatedIncome.email,
        updatedIncome.category,
        updatedIncome.amount,
        newDate.getMonth(),
        newDate.getFullYear(),
      );
    }

    // Create notification for updated income
    await createNotification(
      income.email,
      `📝 Income Updated: ${updatedIncome.description}`,
      `Your ${updatedIncome.category} income has been updated to $${updatedIncome.amount.toFixed(2)}.`,
      "info",
      "low",
      updatedIncome._id,
      "Income",
    );

    res.status(200).json({
      success: true,
      message: "Income updated successfully",
      data: updatedIncome,
    });
  } catch (error) {
    console.error("Update income error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update income",
      error: error.message,
    });
  }
};

// @desc    Delete income
// @route   DELETE /api/incomes/:id
// @access  Private
exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    // Remove from budget
    const incomeDate = new Date(income.date);
    await updateBudgetSpent(
      income.email,
      income.category,
      -income.amount,
      incomeDate.getMonth(),
      incomeDate.getFullYear(),
    );

    await Income.findByIdAndDelete(req.params.id);

    // Create notification for deleted income
    await createNotification(
      income.email,
      `🗑️ Income Deleted: ${income.description}`,
      `Your ${income.category} income of $${income.amount.toFixed(2)} has been deleted.`,
      "warning",
      "medium",
    );

    res.status(200).json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    console.error("Delete income error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete income",
      error: error.message,
    });
  }
};

// @desc    Get budget summary with used and left
// @route   GET /api/incomes/budget-summary
// @access  Private
exports.getBudgetSummary = async (req, res) => {
  try {
    const { email, month, year } = req.query;

    if (!email && (!req.user || !req.user.email)) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const userEmail = email || req.user.email;
    const currentMonth =
      month !== undefined ? parseInt(month) : new Date().getMonth();
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Get all budgets for the month
    const budgets = await Budget.find({
      email: userEmail.toLowerCase(),
      month: currentMonth,
      year: currentYear,
    });

    // Get all incomes for the month
    const incomes = await Income.find({
      email: userEmail.toLowerCase(),
      date: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1),
      },
    });

    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalBudgeted = budgets.reduce(
      (sum, b) => sum + b.allocatedAmount,
      0,
    );
    const totalSpent = budgets.reduce(
      (sum, b) => sum + (b.spentAmount || 0),
      0,
    );
    const totalRemaining = totalBudgeted - totalSpent;
    const overallPercentage =
      totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    // Category breakdown
    const categoryBreakdown = budgets.map((budget) => {
      const categoryIncome = incomes
        .filter((inc) => inc.category === budget.category)
        .reduce((sum, inc) => sum + inc.amount, 0);

      return {
        category: budget.category,
        budgeted: budget.allocatedAmount,
        spent: budget.spentAmount || 0,
        remaining: budget.remainingAmount || 0,
        percentageUsed: budget.percentageUsed || 0,
        status: budget.status || "on-track",
        income: categoryIncome,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        month: currentMonth,
        year: currentYear,
        totalIncome,
        totalBudgeted,
        totalSpent,
        totalRemaining,
        overallPercentage,
        status:
          overallPercentage > 100
            ? "over-budget"
            : overallPercentage > 80
              ? "approaching-limit"
              : overallPercentage < 50 && totalSpent > 0
                ? "under-budget"
                : "on-track",
        categories: categoryBreakdown,
      },
    });
  } catch (error) {
    console.error("Get budget summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch budget summary",
      error: error.message,
    });
  }
};

// @desc    Get income statistics
// @route   GET /api/incomes/stats
// @access  Private
exports.getIncomeStats = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email && (!req.user || !req.user.email)) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const userEmail = email || req.user.email;
    const query = { email: userEmail.toLowerCase() };

    // Get total income
    const totalIncome = await Income.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    // Get income by category
    const categoryStats = await Income.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Get monthly income (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyStats = await Income.aggregate([
      {
        $match: {
          ...query,
          date: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    // Get current month budget status
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const budgets = await Budget.find({
      email: userEmail.toLowerCase(),
      month: currentMonth,
      year: currentYear,
    });

    const totalBudgeted = budgets.reduce(
      (sum, b) => sum + b.allocatedAmount,
      0,
    );
    const totalSpent = budgets.reduce(
      (sum, b) => sum + (b.spentAmount || 0),
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        totalIncome: totalIncome.length > 0 ? totalIncome[0].total : 0,
        totalCount: totalIncome.length > 0 ? totalIncome[0].count : 0,
        categoryBreakdown: categoryStats,
        monthlyBreakdown: monthlyStats,
        currentMonthBudget: {
          month: currentMonth,
          year: currentYear,
          totalBudgeted,
          totalSpent,
          remainingBudget: totalBudgeted - totalSpent,
          percentageUsed:
            totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
        },
      },
    });
  } catch (error) {
    console.error("Get income stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch income statistics",
      error: error.message,
    });
  }
};
