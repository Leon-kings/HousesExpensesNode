// const Income = require("../models/Income");
// const Budget = require("../models/Budget");
// const Notification = require("../models/Notification");
// const mongoose = require("mongoose");

// // Helper function to create notification
// const createNotification = require("../utils/createNotification");

// // Helper function to update budget spent amounts
// const updateBudgetSpent = async (email, category, amount, month, year) => {
//   try {
//     const budget = await Budget.findOne({
//       email: email.toLowerCase(),
//       category: category,
//       month: month,
//       year: year,
//     });

//     if (budget) {
//       budget.spentAmount = (budget.spentAmount || 0) + amount;
//       budget.remainingAmount = Math.max(
//         0,
//         budget.allocatedAmount - budget.spentAmount,
//       );
//       budget.percentageUsed =
//         budget.allocatedAmount > 0
//           ? Math.min(100, (budget.spentAmount / budget.allocatedAmount) * 100)
//           : 0;

//       // Update status based on percentage
//       if (budget.percentageUsed > 100) {
//         budget.status = "over-budget";
//         // Create over-budget notification
//         await createNotification(
//           email,
//           `⚠️ Budget Alert: ${category} Over Budget`,
//           `You have exceeded your ${category} budget. Spent: $${budget.spentAmount.toFixed(2)} vs Budget: $${budget.allocatedAmount.toFixed(2)}`,
//           "budget_alert",
//           "high",
//           budget._id,
//           "Budget",
//         );
//       } else if (budget.percentageUsed > 80) {
//         budget.status = "approaching-limit";
//         // Create approaching limit notification
//         await createNotification(
//           email,
//           `⚡ Budget Alert: ${category} Approaching Limit`,
//           `You are approaching your ${category} budget limit. Used: ${budget.percentageUsed.toFixed(1)}% ($${budget.spentAmount.toFixed(2)} of $${budget.allocatedAmount.toFixed(2)})`,
//           "budget_alert",
//           "medium",
//           budget._id,
//           "Budget",
//         );
//       } else if (budget.percentageUsed < 50 && budget.spentAmount > 0) {
//         budget.status = "under-budget";
//       } else {
//         budget.status = "on-track";
//       }

//       await budget.save();
//       return budget;
//     }
//     return null;
//   } catch (error) {
//     console.error("Update budget spent error:", error);
//     return null;
//   }
// };

// // @desc    Get all incomes with budget summary
// // @route   GET /api/incomes
// // @access  Private


// exports.getIncomes = async (req, res) => {
//   try {
//     const {
//       category,
//       source,
//       startDate,
//       endDate,
//       search,
//       month,
//       year,
//     } = req.query;

//     // ============================================================
//     // BUILD INCOME QUERY
//     // ============================================================
//     const query = {};

//     if (
//       category &&
//       category !== "all"
//     ) {
//       query.category = category;
//     }

//     if (
//       source &&
//       source !== "all"
//     ) {
//       query.source = source;
//     }

//     // ============================================================
//     // DATE FILTER
//     // ============================================================
//     if (startDate || endDate) {
//       query.date = {};

//       if (startDate) {
//         query.date.$gte =
//           new Date(startDate);
//       }

//       if (endDate) {
//         const end = new Date(endDate);

//         // Include the entire end date
//         end.setHours(
//           23,
//           59,
//           59,
//           999
//         );

//         query.date.$lte = end;
//       }
//     }

//     // ============================================================
//     // SEARCH
//     // ============================================================
//     if (search) {
//       query.$or = [
//         {
//           description: {
//             $regex: search,
//             $options: "i",
//           },
//         },

//         {
//           category: {
//             $regex: search,
//             $options: "i",
//           },
//         },

//         {
//           source: {
//             $regex: search,
//             $options: "i",
//           },
//         },

//         {
//           user: {
//             $regex: search,
//             $options: "i",
//           },
//         },

//         {
//           email: {
//             $regex: search,
//             $options: "i",
//           },
//         },
//       ];
//     }

//     // ============================================================
//     // FETCH INCOMES
//     // ============================================================
//     const incomes = await Income.find(
//       query
//     ).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     // ============================================================
//     // CURRENT / REQUESTED MONTH AND YEAR
//     //
//     // JavaScript:
//     // January = 0
//     // December = 11
//     // ============================================================
//     const currentMonth =
//       month !== undefined
//         ? parseInt(month, 10)
//         : new Date().getMonth();

//     const currentYear =
//       year !== undefined
//         ? parseInt(year, 10)
//         : new Date().getFullYear();

//     // ============================================================
//     // FETCH ALL BUDGETS FOR MONTH/YEAR
//     //
//     // No email filter here, as requested.
//     // ============================================================
//     const budgets = await Budget.find({
//       month: currentMonth,
//       year: currentYear,
//     });

//     // ============================================================
//     // CALCULATE MONTHLY INCOME
//     // ============================================================
//     const monthIncomes =
//       incomes.filter((income) => {
//         const incomeDate =
//           new Date(income.date);

//         return (
//           incomeDate.getMonth() ===
//             currentMonth &&
//           incomeDate.getFullYear() ===
//             currentYear
//         );
//       });

//     const totalMonthlyIncome =
//       monthIncomes.reduce(
//         (sum, income) =>
//           sum +
//           Number(income.amount || 0),
//         0
//       );

//     // ============================================================
//     // CALCULATE BUDGET TOTALS
//     // ============================================================
//     const totalBudgeted =
//       budgets.reduce(
//         (sum, budget) =>
//           sum +
//           Number(
//             budget.allocatedAmount || 0
//           ),
//         0
//       );

//     const totalSpent =
//       budgets.reduce(
//         (sum, budget) =>
//           sum +
//           Number(
//             budget.spentAmount || 0
//           ),
//         0
//       );

//     const remainingBudget =
//       totalBudgeted - totalSpent;

//     // ============================================================
//     // BUDGET CATEGORY SUMMARY
//     // ============================================================
//     const budgetSummary =
//       budgets.map((budget) => ({
//         id: budget._id,

//         category:
//           budget.category,

//         allocated:
//           Number(
//             budget.allocatedAmount || 0
//           ),

//         spent:
//           Number(
//             budget.spentAmount || 0
//           ),

//         remaining:
//           Number(
//             budget.remainingAmount || 0
//           ),

//         percentageUsed:
//           Number(
//             budget.percentageUsed || 0
//           ),

//         status:
//           budget.status ||
//           "on-track",

//         month:
//           budget.month,

//         year:
//           budget.year,
//       }));

//     // ============================================================
//     // SAVINGS RATE
//     // ============================================================
//     const savingsRate =
//       totalMonthlyIncome > 0
//         ? ((totalMonthlyIncome -
//             totalSpent) /
//             totalMonthlyIncome) *
//           100
//         : 0;

//     // ============================================================
//     // RESPONSE
//     // ============================================================
//     return res.status(200).json({
//       success: true,

//       count: incomes.length,

//       data: incomes,

//       budgetSummary: {
//         totalBudgeted,

//         totalSpent,

//         remainingBudget,

//         totalMonthlyIncome,

//         savingsRate:
//           Number(
//             savingsRate.toFixed(2)
//           ),

//         categories:
//           budgetSummary,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get incomes error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,

//       message: "Failed to fetch incomes",

//       error: error.message,
//     });
//   }
// };

// // @desc    Get single income
// // @route   GET /api/incomes/:id
// // @access  Private
// exports.getIncome = async (req, res) => {
//   try {
//     const income = await Income.findById(req.params.id);

//     if (!income) {
//       return res.status(404).json({
//         success: false,
//         message: "Income not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: income,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch income",
//       error: error.message,
//     });
//   }
// };

// // @desc    Create income
// // @route   POST /api/incomes
// // @access  Private

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
//       amount: Number(amount),
//       remainingAmount: Number(amount),
//       date,
//       user,
//       email: email.toLowerCase(),
//       isRecurring: isRecurring || false,
//       frequency: frequency || "monthly",
//     });

//     // ✅ CORRECT PLACE FOR NOTIFICATION
//     await createNotification({
//       email,
//       title: "💰 Income Added",
//       message: `You received ${amount} from ${source || category}`,
//       type: "info",
//       referenceId: income._id,
//       referenceModel: "Income",
//     });

//     res.status(201).json({
//       success: true,
//       message: "Income created successfully",
//       data: income,
//     });
//   } catch (error) {
//     console.error("Create income error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to create income",
//       error: error.message,
//     });
//   }
// };

// // Get Incomes By Email
// exports.getIncomesByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const incomes = await Income.find({
//       email: email.toLowerCase(),
//     }).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Incomes retrieved successfully",
//       count: incomes.length,
//       data: incomes,
//     });
//   } catch (error) {
//     console.error("Get incomes by email error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to retrieve incomes",
//       error: error.message,
//     });
//   }
// };

// // @desc    Update income
// // @route   PUT /api/incomes/:id
// // @access  Private
// exports.updateIncome = async (req, res) => {
//   try {
//     const income = await Income.findById(req.params.id);

//     if (!income) {
//       return res.status(404).json({
//         success: false,
//         message: "Income not found",
//       });
//     }

//     // If amount or category changed, update budget
//     const oldAmount = income.amount;
//     const oldCategory = income.category;
//     const oldDate = new Date(income.date);

//     const updatedIncome = await Income.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       },
//     );

//     // If amount or category changed, update budget
//     if (
//       oldAmount !== updatedIncome.amount ||
//       oldCategory !== updatedIncome.category
//     ) {
//       // Remove old amount from old category
//       await updateBudgetSpent(
//         income.email,
//         oldCategory,
//         -oldAmount,
//         oldDate.getMonth(),
//         oldDate.getFullYear(),
//       );

//       // Add new amount to new category
//       const newDate = new Date(updatedIncome.date);
//       await updateBudgetSpent(
//         updatedIncome.email,
//         updatedIncome.category,
//         updatedIncome.amount,
//         newDate.getMonth(),
//         newDate.getFullYear(),
//       );
//     }

//     // Create notification for updated income
//     await createNotification(
//       income.email,
//       `📝 Income Updated: ${updatedIncome.description}`,
//       `Your ${updatedIncome.category} income has been updated to $${updatedIncome.amount.toFixed(2)}.`,
//       "info",
//       "low",
//       updatedIncome._id,
//       "Income",
//     );

//     res.status(200).json({
//       success: true,
//       message: "Income updated successfully",
//       data: updatedIncome,
//     });
//   } catch (error) {
//     console.error("Update income error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update income",
//       error: error.message,
//     });
//   }
// };

// // @desc    Delete income
// // @route   DELETE /api/incomes/:id
// // @access  Private
// exports.deleteIncome = async (req, res) => {
//   try {
//     const income = await Income.findById(req.params.id);

//     if (!income) {
//       return res.status(404).json({
//         success: false,
//         message: "Income not found",
//       });
//     }

//     // Remove from budget
//     const incomeDate = new Date(income.date);
//     await updateBudgetSpent(
//       income.email,
//       income.category,
//       -income.amount,
//       incomeDate.getMonth(),
//       incomeDate.getFullYear(),
//     );

//     await Income.findByIdAndDelete(req.params.id);

//     // Create notification for deleted income
//     await createNotification(
//       income.email,
//       `🗑️ Income Deleted: ${income.description}`,
//       `Your ${income.category} income of $${income.amount.toFixed(2)} has been deleted.`,
//       "warning",
//       "medium",
//     );

//     res.status(200).json({
//       success: true,
//       message: "Income deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete income error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete income",
//       error: error.message,
//     });
//   }
// };

// // @desc    Get budget summary with used and left
// // @route   GET /api/incomes/budget-summary
// // @access  Private
// exports.getBudgetSummary = async (req, res) => {
//   try {
//     const { email, month, year } = req.query;

//     if (!email && (!req.user || !req.user.email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const userEmail = email || req.user.email;
//     const currentMonth =
//       month !== undefined ? parseInt(month) : new Date().getMonth();
//     const currentYear = year ? parseInt(year) : new Date().getFullYear();

//     // Get all budgets for the month
//     const budgets = await Budget.find({
//       email: userEmail.toLowerCase(),
//       month: currentMonth,
//       year: currentYear,
//     });

//     // Get all incomes for the month
//     const incomes = await Income.find({
//       email: userEmail.toLowerCase(),
//       date: {
//         $gte: new Date(currentYear, currentMonth, 1),
//         $lt: new Date(currentYear, currentMonth + 1, 1),
//       },
//     });

//     const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
//     const totalBudgeted = budgets.reduce(
//       (sum, b) => sum + b.allocatedAmount,
//       0,
//     );
//     const totalSpent = budgets.reduce(
//       (sum, b) => sum + (b.spentAmount || 0),
//       0,
//     );
//     const totalRemaining = totalBudgeted - totalSpent;
//     const overallPercentage =
//       totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

//     // Category breakdown
//     const categoryBreakdown = budgets.map((budget) => {
//       const categoryIncome = incomes
//         .filter((inc) => inc.category === budget.category)
//         .reduce((sum, inc) => sum + inc.amount, 0);

//       return {
//         category: budget.category,
//         budgeted: budget.allocatedAmount,
//         spent: budget.spentAmount || 0,
//         remaining: budget.remainingAmount || 0,
//         percentageUsed: budget.percentageUsed || 0,
//         status: budget.status || "on-track",
//         income: categoryIncome,
//       };
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         month: currentMonth,
//         year: currentYear,
//         totalIncome,
//         totalBudgeted,
//         totalSpent,
//         totalRemaining,
//         overallPercentage,
//         status:
//           overallPercentage > 100
//             ? "over-budget"
//             : overallPercentage > 80
//               ? "approaching-limit"
//               : overallPercentage < 50 && totalSpent > 0
//                 ? "under-budget"
//                 : "on-track",
//         categories: categoryBreakdown,
//       },
//     });
//   } catch (error) {
//     console.error("Get budget summary error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch budget summary",
//       error: error.message,
//     });
//   }
// };

// // @desc    Get income statistics
// // @route   GET /api/incomes/stats
// // @access  Private
// exports.getIncomeStats = async (req, res) => {
//   try {
//     const { email } = req.query;

//     if (!email && (!req.user || !req.user.email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const userEmail = email || req.user.email;
//     const query = { email: userEmail.toLowerCase() };

//     // Get total income
//     const totalIncome = await Income.aggregate([
//       { $match: query },
//       { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
//     ]);

//     // Get income by category
//     const categoryStats = await Income.aggregate([
//       { $match: query },
//       {
//         $group: {
//           _id: "$category",
//           total: { $sum: "$amount" },
//           count: { $sum: 1 },
//         },
//       },
//       { $sort: { total: -1 } },
//     ]);

//     // Get monthly income (last 12 months)
//     const twelveMonthsAgo = new Date();
//     twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

//     const monthlyStats = await Income.aggregate([
//       {
//         $match: {
//           ...query,
//           date: { $gte: twelveMonthsAgo },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             year: { $year: "$date" },
//             month: { $month: "$date" },
//           },
//           total: { $sum: "$amount" },
//           count: { $sum: 1 },
//         },
//       },
//       { $sort: { "_id.year": -1, "_id.month": -1 } },
//     ]);

//     // Get current month budget status
//     const currentMonth = new Date().getMonth();
//     const currentYear = new Date().getFullYear();

//     const budgets = await Budget.find({
//       email: userEmail.toLowerCase(),
//       month: currentMonth,
//       year: currentYear,
//     });

//     const totalBudgeted = budgets.reduce(
//       (sum, b) => sum + b.allocatedAmount,
//       0,
//     );
//     const totalSpent = budgets.reduce(
//       (sum, b) => sum + (b.spentAmount || 0),
//       0,
//     );

//     res.status(200).json({
//       success: true,
//       data: {
//         totalIncome: totalIncome.length > 0 ? totalIncome[0].total : 0,
//         totalCount: totalIncome.length > 0 ? totalIncome[0].count : 0,
//         categoryBreakdown: categoryStats,
//         monthlyBreakdown: monthlyStats,
//         currentMonthBudget: {
//           month: currentMonth,
//           year: currentYear,
//           totalBudgeted,
//           totalSpent,
//           remainingBudget: totalBudgeted - totalSpent,
//           percentageUsed:
//             totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Get income stats error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch income statistics",
//       error: error.message,
//     });
//   }
// };













// ============================================================
// CONTROLLERS / INCOME.CONTROLLER.JS
// ============================================================

const Income = require("../models/Income");
const Budget = require("../models/Budget");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// ============================================================
// NOTIFICATION HELPER
// ============================================================

const createNotification = require("../utils/createNotification");

// ============================================================
// GET ALL INCOMES
//
// Supports:
// ?userId=...
// ?email=...
// ?category=...
// ?source=...
// ?startDate=...
// ?endDate=...
// ?search=...
// ?month=...
// ?year=...
// ============================================================

exports.getIncomes = async (req, res) => {
  try {
    const {
      userId,
      email,
      category,
      source,
      startDate,
      endDate,
      search,
      month,
      year,
    } = req.query;

    // ============================================================
    // BUILD QUERY
    // ============================================================

    const query = {};

    // ------------------------------------------------------------
    // USER ID
    // ------------------------------------------------------------

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId",
        });
      }

      query.userId = userId;
    }

    // ------------------------------------------------------------
    // EMAIL
    // ------------------------------------------------------------

    if (email) {
      query.email = email.trim().toLowerCase();
    }

    // ------------------------------------------------------------
    // CATEGORY
    // ------------------------------------------------------------

    if (
      category &&
      category.toLowerCase() !== "all"
    ) {
      query.category = category.trim();
    }

    // ------------------------------------------------------------
    // SOURCE
    // ------------------------------------------------------------

    if (
      source &&
      source.toLowerCase() !== "all"
    ) {
      query.source = source.trim();
    }

    // ============================================================
    // DATE FILTER
    // ============================================================

    if (startDate || endDate) {
      query.date = {};

      if (startDate) {
        const start = new Date(startDate);

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid startDate",
          });
        }

        start.setHours(0, 0, 0, 0);

        query.date.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid endDate",
          });
        }

        end.setHours(23, 59, 59, 999);

        query.date.$lte = end;
      }
    }

    // ============================================================
    // SEARCH
    // ============================================================

    if (search && search.trim()) {
      const searchValue = search.trim();

      query.$or = [
        {
          description: {
            $regex: searchValue,
            $options: "i",
          },
        },

        {
          category: {
            $regex: searchValue,
            $options: "i",
          },
        },

        {
          source: {
            $regex: searchValue,
            $options: "i",
          },
        },

        {
          user: {
            $regex: searchValue,
            $options: "i",
          },
        },

        {
          email: {
            $regex: searchValue,
            $options: "i",
          },
        },
      ];
    }

    // ============================================================
    // FETCH INCOMES
    // ============================================================

    const incomes = await Income.find(query).sort({
      date: -1,
      createdAt: -1,
    });

    // ============================================================
    // MONTH / YEAR
    // ============================================================

    const currentMonth =
      month !== undefined
        ? Number(month)
        : new Date().getMonth();

    const currentYear =
      year !== undefined
        ? Number(year)
        : new Date().getFullYear();

    // ============================================================
    // VALIDATE MONTH
    // ============================================================

    if (
      !Number.isInteger(currentMonth) ||
      currentMonth < 0 ||
      currentMonth > 11
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Month must be an integer between 0 and 11",
      });
    }

    // ============================================================
    // VALIDATE YEAR
    // ============================================================

    if (
      !Number.isInteger(currentYear) ||
      currentYear < 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid year",
      });
    }

    // ============================================================
    // BUDGET QUERY
    //
    // Use userId when available.
    // Keep email compatibility.
    // ============================================================

    const budgetQuery = {
      month: currentMonth,
      year: currentYear,
    };

    if (userId) {
      budgetQuery.userId = userId;
    } else if (email) {
      budgetQuery.email =
        email.trim().toLowerCase();
    }

    const budgets = await Budget.find(
      budgetQuery
    );

    // ============================================================
    // MONTHLY INCOME
    // ============================================================

    const monthIncomes = incomes.filter(
      (income) => {
        const incomeDate =
          new Date(income.date);

        return (
          incomeDate.getMonth() ===
            currentMonth &&
          incomeDate.getFullYear() ===
            currentYear
        );
      }
    );

    const totalMonthlyIncome =
      monthIncomes.reduce(
        (sum, income) =>
          sum +
          Number(income.amount || 0),
        0
      );

    // ============================================================
    // BUDGET TOTALS
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

    const totalRemaining =
      budgets.reduce(
        (sum, budget) =>
          sum +
          Number(
            budget.remainingAmount || 0
          ),
        0
      );

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
    // CATEGORY SUMMARY
    // ============================================================

    const budgetSummary =
      budgets.map((budget) => ({
        id: budget._id,

        category:
          budget.category,

        allocated: Number(
          budget.allocatedAmount || 0
        ),

        spent: Number(
          budget.spentAmount || 0
        ),

        remaining: Number(
          budget.remainingAmount || 0
        ),

        percentageUsed: Number(
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
    // RESPONSE
    // ============================================================

    return res.status(200).json({
      success: true,

      count: incomes.length,

      data: incomes,

      budgetSummary: {
        totalBudgeted,

        totalSpent,

        totalRemaining,

        totalMonthlyIncome,

        savingsRate: Number(
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

      message:
        "Failed to fetch incomes",

      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE INCOME
// ============================================================

exports.getIncome = async (req, res) => {
  try {
    const income =
      await Income.findById(
        req.params.id
      );

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: income,
    });
  } catch (error) {
    console.error(
      "❌ Get income error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch income",

      error: error.message,
    });
  }
};

// ============================================================
// CREATE INCOME
// ============================================================

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
      userId,
      isRecurring,
      frequency,
    } = req.body;

    // ============================================================
    // REQUIRED FIELDS
    // ============================================================

    if (
      !description ||
      !category ||
      amount === undefined ||
      !date ||
      !user ||
      !email ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required",
      });
    }

    // ============================================================
    // USER ID
    // ============================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // ============================================================
    // AMOUNT
    // ============================================================

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      !Number.isInteger(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Amount must be a positive whole number",
      });
    }

    // ============================================================
    // DATE
    // ============================================================

    const incomeDate =
      new Date(date);

    if (
      Number.isNaN(
        incomeDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid income date",
      });
    }

    // ============================================================
    // NORMALIZE
    // ============================================================

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedDescription =
      description.trim();

    const normalizedCategory =
      category.trim();

    const normalizedUser =
      user.trim();

    const normalizedSource =
      source?.trim() ||
      normalizedCategory;

    // ============================================================
    // CREATE INCOME
    //
    // remainingAmount starts equal to amount.
    // The Income model also protects this.
    // ============================================================

    const income =
      await Income.create({
        description:
          normalizedDescription,

        category:
          normalizedCategory,

        source:
          normalizedSource,

        amount:
          numericAmount,

        remainingAmount:
          numericAmount,

        date:
          incomeDate,

        user:
          normalizedUser,

        userId,

        email:
          normalizedEmail,

        isRecurring:
          Boolean(isRecurring),

        frequency:
          frequency || "monthly",
      });

    // ============================================================
    // NOTIFICATION
    // ============================================================

    const notification =
      await createNotification({
        userEmail:
          normalizedEmail,

        userId,

        title:
          "💰 Income Added",

        message:
          `You received RWF ${numericAmount.toLocaleString()} ` +
          `from ${normalizedSource}.`,

        type: "income",

        severity: "low",

        relatedId:
          income._id,

        relatedType:
          "income",

        actionLink:
          `/incomes/${income._id}`,

        metadata: {
          incomeId:
            income._id,

          amount:
            numericAmount,

          category:
            normalizedCategory,

          source:
            normalizedSource,

          remainingAmount:
            income.remainingAmount,
        },
      });

    return res.status(201).json({
      success: true,

      message:
        "Income created successfully",

      data: income,

      notification,
    });
  } catch (error) {
    console.error(
      "❌ Create income error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Income validation failed",

        errors: Object.values(
          error.errors
        ).map(
          (err) => err.message
        ),
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Failed to create income",

      error: error.message,
    });
  }
};

// ============================================================
// GET INCOMES BY EMAIL
// ============================================================

exports.getIncomesByEmail = async (
  req,
  res
) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const incomes =
      await Income.find({
        email:
          normalizedEmail,
      }).sort({
        date: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      message:
        "Incomes retrieved successfully",

      count: incomes.length,

      data: incomes,
    });
  } catch (error) {
    console.error(
      "❌ Get incomes by email error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to retrieve incomes",

      error: error.message,
    });
  }
};

// ============================================================
// GET INCOMES BY USER ID
// ============================================================

exports.getIncomesByUserId = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const incomes =
      await Income.find({
        userId,
      }).sort({
        date: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      message:
        "Incomes retrieved successfully",

      count: incomes.length,

      data: incomes,
    });
  } catch (error) {
    console.error(
      "❌ Get incomes by userId error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to retrieve incomes",

      error: error.message,
    });
  }
};

// ============================================================
// UPDATE INCOME
// ============================================================

exports.updateIncome = async (
  req,
  res
) => {
  try {
    const income =
      await Income.findById(
        req.params.id
      );

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    // ============================================================
    // SAVE ORIGINAL VALUES
    // ============================================================

    const oldAmount =
      Number(income.amount) || 0;

    const oldRemaining =
      Number(
        income.remainingAmount
      ) || 0;

    // Money already consumed by expenses.
    const oldUsed =
      Math.max(
        oldAmount -
          oldRemaining,
        0
      );

    // ============================================================
    // ONLY UPDATE ALLOWED FIELDS
    //
    // Do NOT allow userId/email to be changed accidentally.
    // ============================================================

    const {
      description,
      category,
      source,
      amount,
      date,
      user,
      isRecurring,
      frequency,
    } = req.body;

    if (
      description !== undefined
    ) {
      if (
        !String(
          description
        ).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Description cannot be empty",
        });
      }

      income.description =
        String(
          description
        ).trim();
    }

    if (
      category !== undefined
    ) {
      if (
        !String(
          category
        ).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Category cannot be empty",
        });
      }

      income.category =
        String(
          category
        ).trim();
    }

    if (
      source !== undefined
    ) {
      income.source =
        String(
          source || ""
        ).trim();
    }

    // ============================================================
    // AMOUNT UPDATE
    // ============================================================

    if (
      amount !== undefined
    ) {
      const newAmount =
        Number(amount);

      if (
        !Number.isFinite(
          newAmount
        ) ||
        !Number.isInteger(
          newAmount
        ) ||
        newAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Amount must be a positive whole number",
        });
      }

      income.amount =
        newAmount;

      // Preserve money already used by expenses.
      income.remainingAmount =
        Math.max(
          newAmount -
            oldUsed,
          0
        );
    }

    // ============================================================
    // DATE UPDATE
    // ============================================================

    if (
      date !== undefined
    ) {
      const newDate =
        new Date(date);

      if (
        Number.isNaN(
          newDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid income date",
        });
      }

      income.date =
        newDate;
    }

    // ============================================================
    // USER DISPLAY NAME
    // ============================================================

    if (
      user !== undefined
    ) {
      income.user =
        String(
          user || ""
        ).trim();
    }

    // ============================================================
    // RECURRING
    // ============================================================

    if (
      isRecurring !== undefined
    ) {
      income.isRecurring =
        Boolean(
          isRecurring
        );
    }

    if (
      frequency !== undefined
    ) {
      income.frequency =
        frequency;
    }

    // ============================================================
    // SAVE
    // ============================================================

    await income.save();

    // ============================================================
    // NOTIFICATION
    // ============================================================

    const notification =
      await createNotification({
        userEmail:
          income.email,

        userId:
          income.userId,

        title:
          "📝 Income Updated",

        message:
          `${income.category} income has been updated to ` +
          `RWF ${Number(
            income.amount
          ).toLocaleString()}.`,

        type: "income",

        severity: "low",

        relatedId:
          income._id,

        relatedType:
          "income",

        actionLink:
          `/incomes/${income._id}`,

        metadata: {
          incomeId:
            income._id,

          amount:
            income.amount,

          remainingAmount:
            income.remainingAmount,

          category:
            income.category,

          source:
            income.source,
        },
      });

    return res.status(200).json({
      success: true,

      message:
        "Income updated successfully",

      data: income,

      notification,
    });
  } catch (error) {
    console.error(
      "❌ Update income error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Income validation failed",

        errors: Object.values(
          error.errors
        ).map(
          (err) => err.message
        ),
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Failed to update income",

      error: error.message,
    });
  }
};

// ============================================================
// DELETE INCOME
// ============================================================

exports.deleteIncome = async (
  req,
  res
) => {
  try {
    const income =
      await Income.findById(
        req.params.id
      );

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    // ============================================================
    // IMPORTANT
    //
    // Do NOT modify Budget.spentAmount here.
    //
    // Income does not represent budget spending.
    // Expenses are responsible for budget.spentAmount.
    // ============================================================

    const incomeId =
      income._id;

    const incomeEmail =
      income.email;

    const incomeUserId =
      income.userId;

    const incomeDescription =
      income.description;

    const incomeCategory =
      income.category;

    const incomeAmount =
      Number(income.amount) || 0;

    await income.deleteOne();

    // ============================================================
    // NOTIFICATION
    // ============================================================

    const notification =
      await createNotification({
        userEmail:
          incomeEmail,

        userId:
          incomeUserId,

        title:
          "🗑️ Income Deleted",

        message:
          `${incomeCategory} income of RWF ` +
          `${incomeAmount.toLocaleString()} ` +
          `(${incomeDescription}) was deleted.`,

        type: "income",

        severity: "medium",

        relatedId:
          incomeId,

        relatedType:
          "income",

        actionLink:
          "/incomes",

        metadata: {
          incomeId,

          amount:
            incomeAmount,

          category:
            incomeCategory,
        },
      });

    return res.status(200).json({
      success: true,

      message:
        "Income deleted successfully",

      notification,
    });
  } catch (error) {
    console.error(
      "❌ Delete income error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to delete income",

      error: error.message,
    });
  }
};

// ============================================================
// GET BUDGET SUMMARY
// ============================================================

exports.getBudgetSummary = async (
  req,
  res
) => {
  try {
    const {
      userId,
      email,
      month,
      year,
    } = req.query;

    // ============================================================
    // OWNERSHIP
    // ============================================================

    if (
      !userId &&
      !email &&
      (!req.user ||
        !req.user.email)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "userId or email is required",
      });
    }

    let queryOwner = {};

    if (userId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId",
        });
      }

      queryOwner.userId =
        userId;
    } else {
      const userEmail =
        (
          email ||
          req.user.email
        )
          .trim()
          .toLowerCase();

      queryOwner.email =
        userEmail;
    }

    // ============================================================
    // MONTH / YEAR
    // ============================================================

    const currentMonth =
      month !== undefined
        ? Number(month)
        : new Date().getMonth();

    const currentYear =
      year !== undefined
        ? Number(year)
        : new Date().getFullYear();

    if (
      !Number.isInteger(
        currentMonth
      ) ||
      currentMonth < 0 ||
      currentMonth > 11
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Month must be an integer between 0 and 11",
      });
    }

    if (
      !Number.isInteger(
        currentYear
      ) ||
      currentYear < 2000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid year",
      });
    }

    // ============================================================
    // BUDGETS
    // ============================================================

    const budgets =
      await Budget.find({
        ...queryOwner,

        month:
          currentMonth,

        year:
          currentYear,
      });

    // ============================================================
    // INCOME DATE RANGE
    // ============================================================

    const startDate =
      new Date(
        currentYear,
        currentMonth,
        1
      );

    const endDate =
      new Date(
        currentYear,
        currentMonth + 1,
        1
      );

    const incomes =
      await Income.find({
        ...queryOwner,

        date: {
          $gte: startDate,
          $lt: endDate,
        },
      });

    // ============================================================
    // TOTAL INCOME
    // ============================================================

    const totalIncome =
      incomes.reduce(
        (sum, income) =>
          sum +
          Number(
            income.amount || 0
          ),
        0
      );

    // ============================================================
    // BUDGET TOTALS
    // ============================================================

    const totalBudgeted =
      budgets.reduce(
        (sum, budget) =>
          sum +
          Number(
            budget.allocatedAmount ||
              0
          ),
        0
      );

    const totalSpent =
      budgets.reduce(
        (sum, budget) =>
          sum +
          Number(
            budget.spentAmount ||
              0
          ),
        0
      );

    const totalRemaining =
      budgets.reduce(
        (sum, budget) =>
          sum +
          Number(
            budget.remainingAmount ||
              0
          ),
        0
      );

    const overallPercentage =
      totalBudgeted > 0
        ? (totalSpent /
            totalBudgeted) *
          100
        : 0;

    // ============================================================
    // CATEGORY BREAKDOWN
    // ============================================================

    const categoryBreakdown =
      budgets.map(
        (budget) => {
          const categoryIncome =
            incomes
              .filter(
                (income) =>
                  income.category ===
                  budget.category
              )
              .reduce(
                (
                  sum,
                  income
                ) =>
                  sum +
                  Number(
                    income.amount ||
                      0
                  ),
                0
              );

          return {
            category:
              budget.category,

            budgeted:
              Number(
                budget.allocatedAmount ||
                  0
              ),

            spent:
              Number(
                budget.spentAmount ||
                  0
              ),

            remaining:
              Number(
                budget.remainingAmount ||
                  0
              ),

            percentageUsed:
              Number(
                budget.percentageUsed ||
                  0
              ),

            status:
              budget.status ||
              "on-track",

            income:
              categoryIncome,
          };
        }
      );

    // ============================================================
    // STATUS
    // ============================================================

    let status =
      "on-track";

    if (
      overallPercentage >
      100
    ) {
      status =
        "over-budget";
    } else if (
      overallPercentage >=
      80
    ) {
      status =
        "approaching-limit";
    } else if (
      overallPercentage <
        50 &&
      totalSpent > 0
    ) {
      status =
        "under-budget";
    }

    // ============================================================
    // RESPONSE
    // ============================================================

    return res.status(200).json({
      success: true,

      data: {
        month:
          currentMonth,

        year:
          currentYear,

        totalIncome,

        totalBudgeted,

        totalSpent,

        totalRemaining,

        overallPercentage:
          Number(
            overallPercentage.toFixed(
              2
            )
          ),

        status,

        categories:
          categoryBreakdown,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get budget summary error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch budget summary",

      error: error.message,
    });
  }
};

// ============================================================
// GET INCOME STATISTICS
// ============================================================

exports.getIncomeStats = async (
  req,
  res
) => {
  try {
    const {
      userId,
      email,
    } = req.query;

    // ============================================================
    // OWNERSHIP
    // ============================================================

    if (
      !userId &&
      !email &&
      (!req.user ||
        !req.user.email)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "userId or email is required",
      });
    }

    let query = {};

    if (userId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid userId",
        });
      }

      query.userId =
        userId;
    } else {
      const userEmail =
        (
          email ||
          req.user.email
        )
          .trim()
          .toLowerCase();

      query.email =
        userEmail;
    }

    // ============================================================
    // TOTAL INCOME
    // ============================================================

    const totalIncome =
      await Income.aggregate([
        {
          $match:
            query,
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$amount",
            },

            count: {
              $sum: 1,
            },
          },
        },
      ]);

    // ============================================================
    // INCOME BY CATEGORY
    // ============================================================

    const categoryStats =
      await Income.aggregate([
        {
          $match:
            query,
        },

        {
          $group: {
            _id:
              "$category",

            total: {
              $sum: "$amount",
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            total: -1,
          },
        },
      ]);

    // ============================================================
    // LAST 12 MONTHS
    // ============================================================

    const twelveMonthsAgo =
      new Date();

    twelveMonthsAgo.setMonth(
      twelveMonthsAgo.getMonth() -
        12
    );

    const monthlyStats =
      await Income.aggregate([
        {
          $match: {
            ...query,

            date: {
              $gte:
                twelveMonthsAgo,
            },
          },
        },

        {
          $group: {
            _id: {
              year: {
                $year:
                  "$date",
              },

              month: {
                $month:
                  "$date",
              },
            },

            total: {
              $sum:
                "$amount",
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            "_id.year": -1,
            "_id.month": -1,
          },
        },
      ]);

    // ============================================================
    // CURRENT MONTH BUDGET
    // ============================================================

    const currentMonth =
      new Date().getMonth();

    const currentYear =
      new Date().getFullYear();

    const budgetQuery = {
      ...query,

      month:
        currentMonth,

      year:
        currentYear,
    };

    const budgets =
      await Budget.find(
        budgetQuery
      );

    const totalBudgeted =
      budgets.reduce(
        (sum, budget) =>
          sum +
          Number(
            budget.allocatedAmount ||
              0
          ),
        0
      );

    const totalSpent =
      budgets.reduce(
        (sum, budget) =>
          sum +
          Number(
            budget.spentAmount ||
              0
          ),
        0
      );

    const remainingBudget =
      budgets.reduce(
        (sum, budget) =>
          sum +
          Number(
            budget.remainingAmount ||
              0
          ),
        0
      );

    const percentageUsed =
      totalBudgeted > 0
        ? (totalSpent /
            totalBudgeted) *
          100
        : 0;

    // ============================================================
    // RESPONSE
    // ============================================================

    return res.status(200).json({
      success: true,

      data: {
        totalIncome:
          totalIncome.length >
          0
            ? totalIncome[0]
                .total
            : 0,

        totalCount:
          totalIncome.length >
          0
            ? totalIncome[0]
                .count
            : 0,

        categoryBreakdown:
          categoryStats,

        monthlyBreakdown:
          monthlyStats,

        currentMonthBudget: {
          month:
            currentMonth,

          year:
            currentYear,

          totalBudgeted,

          totalSpent,

          remainingBudget,

          percentageUsed:
            Number(
              percentageUsed.toFixed(
                2
              )
            ),
        },
      },
    });
  } catch (error) {
    console.error(
      "❌ Get income stats error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch income statistics",

      error: error.message,
    });
  }
};

