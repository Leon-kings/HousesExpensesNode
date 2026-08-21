// // ============================================================
// // CONTROLLERS / INCOME.CONTROLLER.JS
// // ============================================================

// const Income = require("../models/Income");
// const Budget = require("../models/Budget");
// const mongoose = require("mongoose");

// // ============================================================
// // NOTIFICATION HELPER
// // ============================================================

// const createNotification = require("../utils/createNotification");

// // ============================================================
// // GET ALL INCOMES
// //
// // Supports:
// // ?userId=...
// // ?email=...
// // ?category=...
// // ?source=...
// // ?startDate=...
// // ?endDate=...
// // ?search=...
// // ?month=...
// // ?year=...
// // ============================================================

// exports.getIncomes = async (req, res) => {
//   try {
//     const {
//       userId,
//       email,
//       category,
//       source,
//       startDate,
//       endDate,
//       search,
//       month,
//       year,
//     } = req.query;

//     // ========================================================
//     // BUILD QUERY
//     // ========================================================

//     const query = {};

//     // --------------------------------------------------------
//     // USER ID
//     // --------------------------------------------------------

//     if (userId) {
//       if (!mongoose.Types.ObjectId.isValid(userId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid userId",
//         });
//       }

//       query.userId = userId;
//     }

//     // --------------------------------------------------------
//     // EMAIL
//     // --------------------------------------------------------

//     if (email) {
//       query.email = String(email).trim().toLowerCase();
//     }

//     // --------------------------------------------------------
//     // CATEGORY
//     // --------------------------------------------------------

//     if (category && category.toLowerCase() !== "all") {
//       query.category = String(category).trim();
//     }

//     // --------------------------------------------------------
//     // SOURCE
//     // --------------------------------------------------------

//     if (source && source.toLowerCase() !== "all") {
//       query.source = String(source).trim();
//     }

//     // ========================================================
//     // DATE FILTER
//     // ========================================================

//     if (startDate || endDate) {
//       query.date = {};

//       if (startDate) {
//         const start = new Date(startDate);

//         if (Number.isNaN(start.getTime())) {
//           return res.status(400).json({
//             success: false,
//             message: "Invalid startDate",
//           });
//         }

//         start.setHours(0, 0, 0, 0);
//         query.date.$gte = start;
//       }

//       if (endDate) {
//         const end = new Date(endDate);

//         if (Number.isNaN(end.getTime())) {
//           return res.status(400).json({
//             success: false,
//             message: "Invalid endDate",
//           });
//         }

//         end.setHours(23, 59, 59, 999);
//         query.date.$lte = end;
//       }
//     }

//     // ========================================================
//     // SEARCH
//     // ========================================================

//     if (search && String(search).trim()) {
//       const searchValue = String(search).trim();

//       query.$or = [
//         {
//           description: {
//             $regex: searchValue,
//             $options: "i",
//           },
//         },
//         {
//           category: {
//             $regex: searchValue,
//             $options: "i",
//           },
//         },
//         {
//           source: {
//             $regex: searchValue,
//             $options: "i",
//           },
//         },
//         {
//           user: {
//             $regex: searchValue,
//             $options: "i",
//           },
//         },
//         {
//           email: {
//             $regex: searchValue,
//             $options: "i",
//           },
//         },
//       ];
//     }

//     // ========================================================
//     // FETCH INCOMES
//     // ========================================================

//     const incomes = await Income.find(query).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     // ========================================================
//     // MONTH / YEAR
//     // ========================================================

//     const currentMonth =
//       month !== undefined ? Number(month) : new Date().getMonth();

//     const currentYear =
//       year !== undefined ? Number(year) : new Date().getFullYear();

//     // ========================================================
//     // VALIDATE MONTH
//     // ========================================================

//     if (
//       !Number.isInteger(currentMonth) ||
//       currentMonth < 0 ||
//       currentMonth > 11
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Month must be an integer between 0 and 11",
//       });
//     }

//     // ========================================================
//     // VALIDATE YEAR
//     // ========================================================

//     if (!Number.isInteger(currentYear) || currentYear < 2000) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid year",
//       });
//     }

//     // ========================================================
//     // BUDGET QUERY
//     // ========================================================

//     const budgetQuery = {
//       month: currentMonth,
//       year: currentYear,
//     };

//     if (userId) {
//       budgetQuery.userId = userId;
//     } else if (email) {
//       budgetQuery.email = String(email).trim().toLowerCase();
//     }

//     const budgets = await Budget.find(budgetQuery);

//     // ========================================================
//     // MONTHLY INCOME
//     // ========================================================

//     const monthIncomes = incomes.filter((income) => {
//       const incomeDate = new Date(income.date);

//       return (
//         incomeDate.getMonth() === currentMonth &&
//         incomeDate.getFullYear() === currentYear
//       );
//     });

//     const totalMonthlyIncome = monthIncomes.reduce(
//       (sum, income) => sum + Number(income.amount || 0),
//       0,
//     );

//     // ========================================================
//     // BUDGET TOTALS
//     // ========================================================

//     const totalBudgeted = budgets.reduce(
//       (sum, budget) => sum + Number(budget.allocatedAmount || 0),
//       0,
//     );

//     const totalSpent = budgets.reduce(
//       (sum, budget) => sum + Number(budget.spentAmount || 0),
//       0,
//     );

//     const totalRemaining = budgets.reduce(
//       (sum, budget) => sum + Number(budget.remainingAmount || 0),
//       0,
//     );

//     // ========================================================
//     // SAVINGS RATE
//     // ========================================================

//     const savingsRate =
//       totalMonthlyIncome > 0
//         ? ((totalMonthlyIncome - totalSpent) / totalMonthlyIncome) * 100
//         : 0;

//     // ========================================================
//     // CATEGORY SUMMARY
//     // ========================================================

//     const budgetSummary = budgets.map((budget) => ({
//       id: budget._id,
//       category: budget.category,

//       allocated: Number(budget.allocatedAmount || 0),

//       spent: Number(budget.spentAmount || 0),

//       remaining: Number(budget.remainingAmount || 0),

//       percentageUsed: Number(budget.percentageUsed || 0),

//       status: budget.status || "on-track",

//       month: budget.month,
//       year: budget.year,
//     }));

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(200).json({
//       success: true,
//       count: incomes.length,
//       data: incomes,

//       budgetSummary: {
//         totalBudgeted,
//         totalSpent,
//         totalRemaining,
//         totalMonthlyIncome,
//         savingsRate: Number(savingsRate.toFixed(2)),
//         categories: budgetSummary,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Get incomes error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch incomes",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET SINGLE INCOME
// // @route GET /api/incomes/:id
// // ============================================================

// exports.getIncome = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid income ID",
//       });
//     }

//     const income = await Income.findById(id);

//     if (!income) {
//       return res.status(404).json({
//         success: false,
//         message: "Income not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: income,
//     });
//   } catch (error) {
//     console.error("❌ Get income error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch income",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // CREATE INCOME
// // @route POST /api/incomes
// // ============================================================

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
//       userId,
//       isRecurring,
//       frequency,
//     } = req.body;

//     // ========================================================
//     // VALIDATION
//     // ========================================================

//     if (
//       !description ||
//       !category ||
//       amount === undefined ||
//       !date ||
//       !user ||
//       !email ||
//       !userId
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "All income fields are required",
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     const numericAmount = Number(amount);

//     if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Amount must be greater than zero",
//       });
//     }

//     const incomeDate = new Date(date);

//     if (Number.isNaN(incomeDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid income date",
//       });
//     }

//     const normalizedEmail = String(email).trim().toLowerCase();

//     // ========================================================
//     // CREATE INCOME
//     // ========================================================

//     const income = await Income.create({
//       description: String(description).trim(),

//       category: String(category).trim(),

//       source: source ? String(source).trim() : "",

//       amount: numericAmount,

//       remainingAmount: numericAmount,

//       date: incomeDate,

//       user: String(user).trim(),

//       userId,

//       email: normalizedEmail,

//       isRecurring: Boolean(isRecurring),

//       frequency: frequency || "monthly",
//     });

//     // ========================================================
//     // NOTIFICATION
//     //
//     // IMPORTANT:
//     // These fields match the corrected createNotification.js
//     // ========================================================

//     await createNotification({
//       userId,
//       email: normalizedEmail,

//       title: "💰 Income Added",

//       message:
//         `Income of RWF ${numericAmount.toLocaleString()} ` +
//         `was added to your account.`,

//       type: "info",

//       referenceId: income._id,

//       referenceModel: "Income",
//     });

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(201).json({
//       success: true,
//       message: "Income created successfully",
//       data: income,
//     });
//   } catch (error) {
//     console.error("❌ Create income error:", error);

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         message: "Income validation failed",
//         errors: Object.values(error.errors).map((err) => err.message),
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create income",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET INCOMES BY EMAIL
// // @route GET /api/incomes/email/:email
// // ============================================================

// exports.getIncomesByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const normalizedEmail = String(email).trim().toLowerCase();

//     const incomes = await Income.find({
//       email: normalizedEmail,
//     }).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Incomes retrieved successfully",
//       count: incomes.length,
//       data: incomes,
//     });
//   } catch (error) {
//     console.error("❌ Get incomes by email error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to retrieve incomes",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET INCOMES BY USER ID
// // @route GET /api/incomes/user/:userId
// // ============================================================

// exports.getIncomesByUserId = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     const incomes = await Income.find({
//       userId,
//     }).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Incomes retrieved successfully",
//       count: incomes.length,
//       data: incomes,
//     });
//   } catch (error) {
//     console.error("❌ Get incomes by userId error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to retrieve incomes",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // UPDATE INCOME
// // @route PUT /api/incomes/:id
// // ============================================================

// exports.updateIncome = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid income ID",
//       });
//     }

//     const income = await Income.findById(id);

//     if (!income) {
//       return res.status(404).json({
//         success: false,
//         message: "Income not found",
//       });
//     }

//     // ========================================================
//     // SAVE ORIGINAL VALUES
//     // ========================================================

//     const oldAmount = Number(income.amount) || 0;

//     const oldRemaining = Number(income.remainingAmount) || 0;

//     const oldUsed = Math.max(oldAmount - oldRemaining, 0);

//     // ========================================================
//     // ONLY ALLOW SAFE FIELDS TO BE UPDATED
//     // ========================================================

//     const {
//       description,
//       category,
//       source,
//       amount,
//       date,
//       user,
//       isRecurring,
//       frequency,
//     } = req.body;

//     // --------------------------------------------------------
//     // DESCRIPTION
//     // --------------------------------------------------------

//     if (description !== undefined) {
//       const value = String(description).trim();

//       if (!value) {
//         return res.status(400).json({
//           success: false,
//           message: "Description cannot be empty",
//         });
//       }

//       income.description = value;
//     }

//     // --------------------------------------------------------
//     // CATEGORY
//     // --------------------------------------------------------

//     if (category !== undefined) {
//       const value = String(category).trim();

//       if (!value) {
//         return res.status(400).json({
//           success: false,
//           message: "Category cannot be empty",
//         });
//       }

//       income.category = value;
//     }

//     // --------------------------------------------------------
//     // SOURCE
//     // --------------------------------------------------------

//     if (source !== undefined) {
//       income.source = String(source || "").trim();
//     }

//     // ========================================================
//     // AMOUNT
//     // ========================================================

//     if (amount !== undefined) {
//       const newAmount = Number(amount);

//       if (!Number.isFinite(newAmount) || newAmount <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Amount must be greater than zero",
//         });
//       }

//       if (newAmount < oldUsed) {
//         return res.status(400).json({
//           success: false,
//           message: "New amount cannot be less than the amount already used",
//           amountAlreadyUsed: oldUsed,
//         });
//       }

//       income.amount = newAmount;

//       // Preserve money already consumed by expenses.
//       income.remainingAmount = newAmount - oldUsed;
//     }

//     // ========================================================
//     // DATE
//     // ========================================================

//     if (date !== undefined) {
//       const newDate = new Date(date);

//       if (Number.isNaN(newDate.getTime())) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid income date",
//         });
//       }

//       income.date = newDate;
//     }

//     // ========================================================
//     // USER DISPLAY NAME
//     // ========================================================

//     if (user !== undefined) {
//       const value = String(user).trim();

//       if (!value) {
//         return res.status(400).json({
//           success: false,
//           message: "User cannot be empty",
//         });
//       }

//       income.user = value;
//     }

//     // ========================================================
//     // RECURRING
//     // ========================================================

//     if (isRecurring !== undefined) {
//       income.isRecurring = isRecurring === true || isRecurring === "true";
//     }

//     if (frequency !== undefined) {
//       income.frequency = frequency;
//     }

//     // ========================================================
//     // SAVE
//     // ========================================================

//     await income.save();

//     // ========================================================
//     // NOTIFICATION
//     // ========================================================

//     await createNotification({
//       userId: income.userId,
//       email: income.email,

//       title: "📝 Income Updated",

//       message:
//         `${income.category} income has been updated to ` +
//         `RWF ${Number(income.amount).toLocaleString()}.`,

//       type: "info",

//       referenceId: income._id,

//       referenceModel: "Income",
//     });

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(200).json({
//       success: true,
//       message: "Income updated successfully",
//       data: income,
//     });
//   } catch (error) {
//     console.error("❌ Update income error:", error);

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         message: "Income validation failed",
//         errors: Object.values(error.errors).map((err) => err.message),
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update income",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // DELETE INCOME
// // @route DELETE /api/incomes/:id
// // ============================================================

// exports.deleteIncome = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid income ID",
//       });
//     }

//     const income = await Income.findById(id);

//     if (!income) {
//       return res.status(404).json({
//         success: false,
//         message: "Income not found",
//       });
//     }

//     // ========================================================
//     // SAVE INFORMATION BEFORE DELETE
//     // ========================================================

//     const incomeId = income._id;
//     const incomeEmail = income.email;
//     const incomeUserId = income.userId;
//     const incomeDescription = income.description;
//     const incomeCategory = income.category;
//     const incomeAmount = Number(income.amount) || 0;

//     // ========================================================
//     // DELETE
//     // ========================================================

//     await income.deleteOne();

//     // ========================================================
//     // NOTIFICATION
//     // ========================================================

//     await createNotification({
//       userId: incomeUserId,
//       email: incomeEmail,

//       title: "🗑️ Income Deleted",

//       message:
//         `${incomeCategory} income of RWF ` +
//         `${incomeAmount.toLocaleString()} ` +
//         `(${incomeDescription}) was deleted.`,

//       type: "warning",

//       referenceId: incomeId,

//       referenceModel: "Income",
//     });

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(200).json({
//       success: true,
//       message: "Income deleted successfully",
//     });
//   } catch (error) {
//     console.error("❌ Delete income error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete income",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET BUDGET SUMMARY
// // @route GET /api/incomes/budget-summary
// // ============================================================

// exports.getBudgetSummary = async (req, res) => {
//   try {
//     const { userId, email, month, year } = req.query;

//     // ========================================================
//     // OWNERSHIP
//     // ========================================================

//     if (!userId && !email && (!req.user || !req.user.email)) {
//       return res.status(400).json({
//         success: false,
//         message: "userId or email is required",
//       });
//     }

//     const queryOwner = {};

//     if (userId) {
//       if (!mongoose.Types.ObjectId.isValid(userId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid userId",
//         });
//       }

//       queryOwner.userId = userId;
//     } else {
//       const userEmail = String(email || req.user.email)
//         .trim()
//         .toLowerCase();

//       queryOwner.email = userEmail;
//     }

//     // ========================================================
//     // MONTH / YEAR
//     // ========================================================

//     const currentMonth =
//       month !== undefined ? Number(month) : new Date().getMonth();

//     const currentYear =
//       year !== undefined ? Number(year) : new Date().getFullYear();

//     if (
//       !Number.isInteger(currentMonth) ||
//       currentMonth < 0 ||
//       currentMonth > 11
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Month must be an integer between 0 and 11",
//       });
//     }

//     if (!Number.isInteger(currentYear) || currentYear < 2000) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid year",
//       });
//     }

//     // ========================================================
//     // BUDGETS
//     // ========================================================

//     const budgets = await Budget.find({
//       ...queryOwner,
//       month: currentMonth,
//       year: currentYear,
//     });

//     // ========================================================
//     // INCOME DATE RANGE
//     // ========================================================

//     const startDate = new Date(currentYear, currentMonth, 1);

//     const endDate = new Date(currentYear, currentMonth + 1, 1);

//     const incomes = await Income.find({
//       ...queryOwner,
//       date: {
//         $gte: startDate,
//         $lt: endDate,
//       },
//     });

//     // ========================================================
//     // TOTAL INCOME
//     // ========================================================

//     const totalIncome = incomes.reduce(
//       (sum, income) => sum + Number(income.amount || 0),
//       0,
//     );

//     // ========================================================
//     // BUDGET TOTALS
//     // ========================================================

//     const totalBudgeted = budgets.reduce(
//       (sum, budget) => sum + Number(budget.allocatedAmount || 0),
//       0,
//     );

//     const totalSpent = budgets.reduce(
//       (sum, budget) => sum + Number(budget.spentAmount || 0),
//       0,
//     );

//     const totalRemaining = budgets.reduce(
//       (sum, budget) => sum + Number(budget.remainingAmount || 0),
//       0,
//     );

//     const overallPercentage =
//       totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

//     // ========================================================
//     // CATEGORY BREAKDOWN
//     // ========================================================

//     const categoryBreakdown = budgets.map((budget) => {
//       const categoryIncome = incomes
//         .filter((income) => income.category === budget.category)
//         .reduce((sum, income) => sum + Number(income.amount || 0), 0);

//       return {
//         category: budget.category,

//         budgeted: Number(budget.allocatedAmount || 0),

//         spent: Number(budget.spentAmount || 0),

//         remaining: Number(budget.remainingAmount || 0),

//         percentageUsed: Number(budget.percentageUsed || 0),

//         status: budget.status || "on-track",

//         income: categoryIncome,
//       };
//     });

//     // ========================================================
//     // STATUS
//     // ========================================================

//     let status = "on-track";

//     if (overallPercentage > 100) {
//       status = "over-budget";
//     } else if (overallPercentage >= 80) {
//       status = "approaching-limit";
//     } else if (overallPercentage < 50 && totalSpent > 0) {
//       status = "under-budget";
//     }

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(200).json({
//       success: true,

//       data: {
//         month: currentMonth,
//         year: currentYear,

//         totalIncome,
//         totalBudgeted,
//         totalSpent,
//         totalRemaining,

//         overallPercentage: Number(overallPercentage.toFixed(2)),

//         status,

//         categories: categoryBreakdown,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Get budget summary error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch budget summary",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET INCOME STATISTICS
// // @route GET /api/incomes/stats
// // ============================================================

// exports.getIncomeStats = async (req, res) => {
//   try {
//     const { userId, email } = req.query;

//     // ========================================================
//     // OWNERSHIP
//     // ========================================================

//     if (!userId && !email && (!req.user || !req.user.email)) {
//       return res.status(400).json({
//         success: false,
//         message: "userId or email is required",
//       });
//     }

//     const query = {};

//     if (userId) {
//       if (!mongoose.Types.ObjectId.isValid(userId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid userId",
//         });
//       }

//       query.userId = userId;
//     } else {
//       const userEmail = String(email || req.user.email)
//         .trim()
//         .toLowerCase();

//       query.email = userEmail;
//     }

//     // ========================================================
//     // TOTAL INCOME
//     // ========================================================

//     const totalIncome = await Income.aggregate([
//       {
//         $match: query,
//       },
//       {
//         $group: {
//           _id: null,

//           total: {
//             $sum: "$amount",
//           },

//           count: {
//             $sum: 1,
//           },
//         },
//       },
//     ]);

//     // ========================================================
//     // INCOME BY CATEGORY
//     // ========================================================

//     const categoryStats = await Income.aggregate([
//       {
//         $match: query,
//       },
//       {
//         $group: {
//           _id: "$category",

//           total: {
//             $sum: "$amount",
//           },

//           count: {
//             $sum: 1,
//           },
//         },
//       },
//       {
//         $sort: {
//           total: -1,
//         },
//       },
//     ]);

//     // ========================================================
//     // LAST 12 MONTHS
//     // ========================================================

//     const twelveMonthsAgo = new Date();

//     twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

//     const monthlyStats = await Income.aggregate([
//       {
//         $match: {
//           ...query,

//           date: {
//             $gte: twelveMonthsAgo,
//           },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             year: {
//               $year: "$date",
//             },

//             month: {
//               $month: "$date",
//             },
//           },

//           total: {
//             $sum: "$amount",
//           },

//           count: {
//             $sum: 1,
//           },
//         },
//       },
//       {
//         $sort: {
//           "_id.year": -1,
//           "_id.month": -1,
//         },
//       },
//     ]);

//     // ========================================================
//     // CURRENT MONTH BUDGET
//     // ========================================================

//     const currentMonth = new Date().getMonth();

//     const currentYear = new Date().getFullYear();

//     const budgetQuery = {
//       month: currentMonth,
//       year: currentYear,
//     };

//     if (userId) {
//       budgetQuery.userId = userId;
//     } else {
//       budgetQuery.email = query.email;
//     }

//     const budgets = await Budget.find(budgetQuery);

//     const totalBudgeted = budgets.reduce(
//       (sum, budget) => sum + Number(budget.allocatedAmount || 0),
//       0,
//     );

//     const totalSpent = budgets.reduce(
//       (sum, budget) => sum + Number(budget.spentAmount || 0),
//       0,
//     );

//     const remainingBudget = budgets.reduce(
//       (sum, budget) => sum + Number(budget.remainingAmount || 0),
//       0,
//     );

//     const percentageUsed =
//       totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(200).json({
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
//           remainingBudget,

//           percentageUsed: Number(percentageUsed.toFixed(2)),
//         },
//       },
//     });
//   } catch (error) {
//     console.error("❌ Get income stats error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch income statistics",
//       error: error.message,
//     });
//   }
// };

// ============================================================
// CONTROLLERS / INCOME.CONTROLLER.JS
// ============================================================

const mongoose = require("mongoose");

const Income = require("../models/Income");
const Budget = require("../models/Budget");

const createNotification = require("../utils/createNotification");

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const validateMonth = (month) => {
  const parsedMonth = Number(month);

  if (!Number.isInteger(parsedMonth) || parsedMonth < 0 || parsedMonth > 11) {
    return null;
  }

  return parsedMonth;
};

const validateYear = (year) => {
  const parsedYear = Number(year);

  if (!Number.isInteger(parsedYear) || parsedYear < 2000) {
    return null;
  }

  return parsedYear;
};

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

    // ========================================================
    // BUILD QUERY
    // ========================================================

    const query = {};

    // --------------------------------------------------------
    // USER ID
    // --------------------------------------------------------

    if (userId) {
      if (!isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId",
        });
      }

      query.userId = userId;
    }

    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    if (email) {
      query.email = normalizeEmail(email);
    }

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (category && String(category).trim().toLowerCase() !== "all") {
      query.category = String(category).trim();
    }

    // --------------------------------------------------------
    // SOURCE
    // --------------------------------------------------------

    if (source && String(source).trim().toLowerCase() !== "all") {
      query.source = String(source).trim();
    }

    // ========================================================
    // DATE FILTER
    // ========================================================

    if (startDate || endDate) {
      query.date = {};

      // ------------------------------------------------------
      // START DATE
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // END DATE
      // ------------------------------------------------------

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

    // ========================================================
    // SEARCH
    // ========================================================

    if (search && String(search).trim()) {
      const searchValue = String(search).trim();

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

    // ========================================================
    // FETCH INCOMES
    // ========================================================

    const incomes = await Income.find(query).sort({
      date: -1,
      createdAt: -1,
    });

    // ========================================================
    // MONTH / YEAR
    // ========================================================

    const currentMonth =
      month !== undefined ? validateMonth(month) : new Date().getMonth();

    const currentYear =
      year !== undefined ? validateYear(year) : new Date().getFullYear();

    // --------------------------------------------------------
    // VALIDATE MONTH
    // --------------------------------------------------------

    if (currentMonth === null) {
      return res.status(400).json({
        success: false,
        message: "Month must be an integer between 0 and 11",
      });
    }

    // --------------------------------------------------------
    // VALIDATE YEAR
    // --------------------------------------------------------

    if (currentYear === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid year",
      });
    }

    // ========================================================
    // BUDGET QUERY
    // ========================================================

    const budgetQuery = {
      month: currentMonth,
      year: currentYear,
    };

    if (userId) {
      budgetQuery.userId = userId;
    } else if (email) {
      budgetQuery.email = normalizeEmail(email);
    }

    const budgets = await Budget.find(budgetQuery);

    // ========================================================
    // MONTHLY INCOME
    // ========================================================

    const monthIncomes = incomes.filter((income) => {
      const incomeDate = new Date(income.date);

      return (
        incomeDate.getMonth() === currentMonth &&
        incomeDate.getFullYear() === currentYear
      );
    });

    const totalMonthlyIncome = monthIncomes.reduce(
      (sum, income) => sum + Number(income.amount || 0),
      0,
    );

    // ========================================================
    // AVAILABLE INCOME
    // ========================================================

    const totalAvailableIncome = monthIncomes.reduce(
      (sum, income) => sum + Number(income.remainingAmount || 0),
      0,
    );

    // ========================================================
    // BUDGET TOTALS
    // ========================================================

    const totalBudgeted = budgets.reduce(
      (sum, budget) => sum + Number(budget.allocatedAmount || 0),
      0,
    );

    const totalSpent = budgets.reduce(
      (sum, budget) => sum + Number(budget.spentAmount || 0),
      0,
    );

    const totalRemaining = budgets.reduce(
      (sum, budget) => sum + Number(budget.remainingAmount || 0),
      0,
    );

    // ========================================================
    // SAVINGS RATE
    // ========================================================

    const savingsRate =
      totalMonthlyIncome > 0
        ? ((totalMonthlyIncome - totalSpent) / totalMonthlyIncome) * 100
        : 0;

    // ========================================================
    // CATEGORY SUMMARY
    // ========================================================

    const budgetSummary = budgets.map((budget) => ({
      id: budget._id,

      category: budget.category,

      allocated: Number(budget.allocatedAmount || 0),

      spent: Number(budget.spentAmount || 0),

      remaining: Number(budget.remainingAmount || 0),

      percentageUsed: Number(budget.percentageUsed || 0),

      status: budget.status || "on-track",

      month: budget.month,

      year: budget.year,
    }));

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      count: incomes.length,

      data: incomes,

      budgetSummary: {
        totalBudgeted,

        totalSpent,

        totalRemaining,

        totalMonthlyIncome,

        totalAvailableIncome,

        savingsRate: Number(savingsRate.toFixed(2)),

        categories: budgetSummary,
      },
    });
  } catch (error) {
    console.error("❌ Get incomes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch incomes",
      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE INCOME
// @route GET /api/incomes/:id
// ============================================================

exports.getIncome = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid income ID",
      });
    }

    // ========================================================
    // FIND INCOME
    // ========================================================

    const income = await Income.findById(id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      data: income,
    });
  } catch (error) {
    console.error("❌ Get income error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch income",
      error: error.message,
    });
  }
};

// ============================================================
// CREATE INCOME
// @route POST /api/incomes
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

    // ========================================================
    // REQUIRED FIELDS
    // ========================================================

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
          "Description, category, amount, date, user, email and userId are required",
      });
    }

    // ========================================================
    // USER ID
    // ========================================================

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // ========================================================
    // AMOUNT
    // ========================================================

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    // ========================================================
    // DATE
    // ========================================================

    const incomeDate = new Date(date);

    if (Number.isNaN(incomeDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid income date",
      });
    }

    // ========================================================
    // NORMALIZE
    // ========================================================

    const normalizedEmail = normalizeEmail(email);

    const normalizedDescription = String(description).trim();

    const normalizedCategory = String(category).trim();

    const normalizedSource = source ? String(source).trim() : "";

    if (!normalizedDescription) {
      return res.status(400).json({
        success: false,
        message: "Description cannot be empty",
      });
    }

    if (!normalizedCategory) {
      return res.status(400).json({
        success: false,
        message: "Category cannot be empty",
      });
    }

    // ========================================================
    // CREATE INCOME
    // ========================================================

    const income = await Income.create({
      description: normalizedDescription,

      category: normalizedCategory,

      source: normalizedSource,

      amount: numericAmount,

      remainingAmount: numericAmount,

      date: incomeDate,

      user: String(user).trim(),

      userId,

      email: normalizedEmail,

      isRecurring: isRecurring === true || isRecurring === "true",

      frequency: frequency || "monthly",
    });

    // ========================================================
    // NOTIFICATION
    // ========================================================

    let notification = null;

    try {
      notification = await createNotification({
        userId,

        email: normalizedEmail,

        title: "💰 Income Added",

        message:
          `Income of RWF ` +
          `${numericAmount.toLocaleString()} ` +
          `was added to your account.`,

        type: "info",

        referenceId: income._id,

        referenceModel: "Income",
      });
    } catch (notificationError) {
      console.error("⚠️ Income notification error:", notificationError);
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,

      message: "Income created successfully",

      data: income,

      notification,
    });
  } catch (error) {
    console.error("❌ Create income error:", error);

    // ========================================================
    // VALIDATION ERROR
    // ========================================================

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,

        message: "Income validation failed",

        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,

      message: "Failed to create income",

      error: error.message,
    });
  }
};

// ============================================================
// GET INCOMES BY EMAIL
// @route GET /api/incomes/email/:email
// ============================================================

exports.getIncomesByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // ========================================================
    // VALIDATE EMAIL
    // ========================================================

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    // ========================================================
    // FETCH
    // ========================================================

    const incomes = await Income.find({
      email: normalizedEmail,
    }).sort({
      date: -1,
      createdAt: -1,
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message: "Incomes retrieved successfully",

      count: incomes.length,

      data: incomes,
    });
  } catch (error) {
    console.error("❌ Get incomes by email error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to retrieve incomes",

      error: error.message,
    });
  }
};

// ============================================================
// GET INCOMES BY USER ID
// @route GET /api/incomes/user/:userId
// ============================================================

exports.getIncomesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // ========================================================
    // VALIDATE USER ID
    // ========================================================

    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // ========================================================
    // FETCH
    // ========================================================

    const incomes = await Income.find({
      userId,
    }).sort({
      date: -1,
      createdAt: -1,
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message: "Incomes retrieved successfully",

      count: incomes.length,

      data: incomes,
    });
  } catch (error) {
    console.error("❌ Get incomes by userId error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to retrieve incomes",

      error: error.message,
    });
  }
};

// ============================================================
// UPDATE INCOME
// @route PUT /api/incomes/:id
// ============================================================

exports.updateIncome = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid income ID",
      });
    }

    // ========================================================
    // FIND INCOME
    // ========================================================

    const income = await Income.findById(id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    // ========================================================
    // ORIGINAL VALUES
    // ========================================================

    const oldAmount = Number(income.amount) || 0;

    const oldRemaining = Number(income.remainingAmount) || 0;

    // Amount already consumed
    // by expenses.

    const oldUsed = Math.max(oldAmount - oldRemaining, 0);

    // ========================================================
    // ALLOWED FIELDS
    // ========================================================

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

    // ========================================================
    // DESCRIPTION
    // ========================================================

    if (description !== undefined) {
      const value = String(description).trim();

      if (!value) {
        return res.status(400).json({
          success: false,
          message: "Description cannot be empty",
        });
      }

      income.description = value;
    }

    // ========================================================
    // CATEGORY
    // ========================================================

    if (category !== undefined) {
      const value = String(category).trim();

      if (!value) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be empty",
        });
      }

      income.category = value;
    }

    // ========================================================
    // SOURCE
    // ========================================================

    if (source !== undefined) {
      income.source = String(source || "").trim();
    }

    // ========================================================
    // AMOUNT
    // ========================================================

    if (amount !== undefined) {
      const newAmount = Number(amount);

      if (!Number.isFinite(newAmount) || newAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than zero",
        });
      }

      // ------------------------------------------------------
      // NEVER ALLOW THE NEW INCOME TO BECOME LESS THAN
      // MONEY ALREADY CONSUMED BY EXPENSES.
      // ------------------------------------------------------

      if (newAmount < oldUsed) {
        return res.status(400).json({
          success: false,

          message: "New amount cannot be less than the amount already used",

          amountAlreadyUsed: oldUsed,
        });
      }

      income.amount = newAmount;

      // Preserve consumed amount.

      income.remainingAmount = newAmount - oldUsed;
    }

    // ========================================================
    // DATE
    // ========================================================

    if (date !== undefined) {
      const newDate = new Date(date);

      if (Number.isNaN(newDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid income date",
        });
      }

      income.date = newDate;
    }

    // ========================================================
    // USER DISPLAY NAME
    // ========================================================

    if (user !== undefined) {
      const value = String(user).trim();

      if (!value) {
        return res.status(400).json({
          success: false,
          message: "User cannot be empty",
        });
      }

      income.user = value;
    }

    // ========================================================
    // RECURRING
    // ========================================================

    if (isRecurring !== undefined) {
      income.isRecurring = isRecurring === true || isRecurring === "true";
    }

    // ========================================================
    // FREQUENCY
    // ========================================================

    if (frequency !== undefined) {
      income.frequency = frequency;
    }

    // ========================================================
    // SAVE
    // ========================================================

    await income.save();

    // ========================================================
    // NOTIFICATION
    // ========================================================

    let notification = null;

    try {
      notification = await createNotification({
        userId: income.userId,

        email: income.email,

        title: "📝 Income Updated",

        message:
          `${income.category} income has been updated to ` +
          `RWF ${Number(income.amount).toLocaleString()}.`,

        type: "info",

        referenceId: income._id,

        referenceModel: "Income",
      });
    } catch (notificationError) {
      console.error("⚠️ Income update notification error:", notificationError);
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message: "Income updated successfully",

      data: income,

      notification,
    });
  } catch (error) {
    console.error("❌ Update income error:", error);

    // ========================================================
    // VALIDATION ERROR
    // ========================================================

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,

        message: "Income validation failed",

        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,

      message: "Failed to update income",

      error: error.message,
    });
  }
};

// ============================================================
// DELETE INCOME
// @route DELETE /api/incomes/:id
// ============================================================

// exports.deleteIncome = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // ========================================================
//     // VALIDATE ID
//     // ========================================================

//     if (!isValidObjectId(id)) {
//       return res.status(400).json({
//         success: false,

//         message: "Invalid income ID",
//       });
//     }

//     // ========================================================
//     // FIND INCOME
//     // ========================================================

//     const income = await Income.findById(id);

//     if (!income) {
//       return res.status(404).json({
//         success: false,

//         message: "Income not found",
//       });
//     }

//     // ========================================================
//     // CHECK USED MONEY
//     // ========================================================

//     const incomeAmount = Number(income.amount) || 0;

//     const remainingAmount = Number(income.remainingAmount) || 0;

//     const usedAmount = Math.max(incomeAmount - remainingAmount, 0);

//     // --------------------------------------------------------
//     // IMPORTANT
//     //
//     // If expenses have already consumed part of this income,
//     // deleting the income would make the financial records
//     // inconsistent.
//     // --------------------------------------------------------

//     if (usedAmount > 0) {
//       return res.status(409).json({
//         success: false,

//         message:
//           "This income cannot be deleted because part of it has already been used by expenses.",

//         amountUsed: usedAmount,

//         remainingAmount: remainingAmount,
//       });
//     }

//     // ========================================================
//     // SAVE INFORMATION
//     // ========================================================

//     const incomeId = income._id;

//     const incomeEmail = income.email;

//     const incomeUserId = income.userId;

//     const incomeDescription = income.description;

//     const incomeCategory = income.category;

//     // ========================================================
//     // DELETE
//     // ========================================================

//     await income.deleteOne();

//     // ========================================================
//     // NOTIFICATION
//     // ========================================================

//     let notification = null;

//     try {
//       notification = await createNotification({
//         userId: incomeUserId,

//         email: incomeEmail,

//         title: "🗑️ Income Deleted",

//         message:
//           `${incomeCategory} income of RWF ` +
//           `${incomeAmount.toLocaleString()} ` +
//           `(${incomeDescription}) was deleted.`,

//         type: "warning",

//         referenceId: incomeId,

//         referenceModel: "Income",
//       });
//     } catch (notificationError) {
//       console.error("⚠️ Income delete notification error:", notificationError);
//     }

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(200).json({
//       success: true,

//       message: "Income deleted successfully",

//       notification,
//     });
//   } catch (error) {
//     console.error("❌ Delete income error:", error);

//     return res.status(500).json({
//       success: false,

//       message: "Failed to delete income",

//       error: error.message,
//     });
//   }
// };
exports.deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    await Income.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete income error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete income",
      error: error.message,
    });
  }
};

// ============================================================
// GET BUDGET SUMMARY
// @route GET /api/incomes/budget-summary
//
// Supports:
// ?userId=...
// ?email=...
// ?month=...
// ?year=...
// ============================================================

exports.getBudgetSummary = async (req, res) => {
  try {
    const { userId, email, month, year } = req.query;

    // ========================================================
    // OWNERSHIP
    // ========================================================

    if (!userId && !email && (!req.user || !req.user.email)) {
      return res.status(400).json({
        success: false,

        message: "userId or email is required",
      });
    }

    const queryOwner = {};

    // --------------------------------------------------------
    // USER ID
    // --------------------------------------------------------

    if (userId) {
      if (!isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId",
        });
      }

      queryOwner.userId = userId;
    }

    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------
    else {
      const userEmail = normalizeEmail(email || req.user.email);

      queryOwner.email = userEmail;
    }

    // ========================================================
    // MONTH / YEAR
    // ========================================================

    const currentMonth =
      month !== undefined ? validateMonth(month) : new Date().getMonth();

    const currentYear =
      year !== undefined ? validateYear(year) : new Date().getFullYear();

    if (currentMonth === null) {
      return res.status(400).json({
        success: false,

        message: "Month must be an integer between 0 and 11",
      });
    }

    if (currentYear === null) {
      return res.status(400).json({
        success: false,

        message: "Invalid year",
      });
    }

    // ========================================================
    // BUDGETS
    // ========================================================

    const budgets = await Budget.find({
      ...queryOwner,

      month: currentMonth,

      year: currentYear,
    });

    // ========================================================
    // INCOME DATE RANGE
    // ========================================================

    const startDate = new Date(currentYear, currentMonth, 1);

    const endDate = new Date(currentYear, currentMonth + 1, 1);

    const incomes = await Income.find({
      ...queryOwner,

      date: {
        $gte: startDate,

        $lt: endDate,
      },
    });

    // ========================================================
    // TOTAL INCOME
    // ========================================================

    const totalIncome = incomes.reduce(
      (sum, income) => sum + Number(income.amount || 0),
      0,
    );

    // ========================================================
    // AVAILABLE INCOME
    // ========================================================

    const availableIncome = incomes.reduce(
      (sum, income) => sum + Number(income.remainingAmount || 0),
      0,
    );

    // ========================================================
    // BUDGET TOTALS
    // ========================================================

    const totalBudgeted = budgets.reduce(
      (sum, budget) => sum + Number(budget.allocatedAmount || 0),
      0,
    );

    const totalSpent = budgets.reduce(
      (sum, budget) => sum + Number(budget.spentAmount || 0),
      0,
    );

    const totalRemaining = budgets.reduce(
      (sum, budget) => sum + Number(budget.remainingAmount || 0),
      0,
    );

    // ========================================================
    // OVERALL PERCENTAGE
    // ========================================================

    const overallPercentage =
      totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    // ========================================================
    // CATEGORY BREAKDOWN
    // ========================================================

    const categoryBreakdown = budgets.map((budget) => {
      const categoryIncome = incomes
        .filter((income) => income.category === budget.category)
        .reduce((sum, income) => sum + Number(income.amount || 0), 0);

      return {
        id: budget._id,

        category: budget.category,

        budgeted: Number(budget.allocatedAmount || 0),

        spent: Number(budget.spentAmount || 0),

        remaining: Number(budget.remainingAmount || 0),

        percentageUsed: Number(budget.percentageUsed || 0),

        status: budget.status || "on-track",

        income: categoryIncome,

        month: budget.month,

        year: budget.year,
      };
    });

    // ========================================================
    // STATUS
    // ========================================================

    let status = "on-track";

    if (overallPercentage > 100) {
      status = "over-budget";
    } else if (overallPercentage >= 80) {
      status = "approaching-limit";
    } else if (overallPercentage < 50 && totalSpent > 0) {
      status = "under-budget";
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      data: {
        month: currentMonth,

        year: currentYear,

        totalIncome,

        availableIncome,

        totalBudgeted,

        totalSpent,

        totalRemaining,

        overallPercentage: Number(overallPercentage.toFixed(2)),

        status,

        categories: categoryBreakdown,
      },
    });
  } catch (error) {
    console.error("❌ Get budget summary error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch budget summary",

      error: error.message,
    });
  }
};

// ============================================================
// GET INCOME STATISTICS
// @route GET /api/incomes/stats
//
// Supports:
// ?userId=...
// ?email=...
// ============================================================

exports.getIncomeStats = async (req, res) => {
  try {
    const { userId, email } = req.query;

    // ========================================================
    // OWNERSHIP
    // ========================================================

    if (!userId && !email && (!req.user || !req.user.email)) {
      return res.status(400).json({
        success: false,

        message: "userId or email is required",
      });
    }

    const query = {};

    // --------------------------------------------------------
    // USER ID
    // --------------------------------------------------------

    if (userId) {
      if (!isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,

          message: "Invalid userId",
        });
      }

      query.userId = userId;
    }

    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------
    else {
      query.email = normalizeEmail(email || req.user.email);
    }

    // ========================================================
    // TOTAL INCOME
    // ========================================================

    const totalIncome = await Income.aggregate([
      {
        $match: query,
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: "$amount",
          },

          remaining: {
            $sum: "$remainingAmount",
          },

          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // ========================================================
    // INCOME BY CATEGORY
    // ========================================================

    const categoryStats = await Income.aggregate([
      {
        $match: query,
      },

      {
        $group: {
          _id: "$category",

          total: {
            $sum: "$amount",
          },

          remaining: {
            $sum: "$remainingAmount",
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

    // ========================================================
    // LAST 12 MONTHS
    // ========================================================

    const twelveMonthsAgo = new Date();

    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyStats = await Income.aggregate([
      {
        $match: {
          ...query,

          date: {
            $gte: twelveMonthsAgo,
          },
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$date",
            },

            month: {
              $month: "$date",
            },
          },

          total: {
            $sum: "$amount",
          },

          remaining: {
            $sum: "$remainingAmount",
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

    // ========================================================
    // CURRENT MONTH
    // ========================================================

    const currentMonth = new Date().getMonth();

    const currentYear = new Date().getFullYear();

    // ========================================================
    // CURRENT MONTH BUDGET
    // ========================================================

    const budgetQuery = {
      month: currentMonth,

      year: currentYear,
    };

    if (userId) {
      budgetQuery.userId = userId;
    } else {
      budgetQuery.email = query.email;
    }

    const budgets = await Budget.find(budgetQuery);

    // ========================================================
    // BUDGET TOTALS
    // ========================================================

    const totalBudgeted = budgets.reduce(
      (sum, budget) => sum + Number(budget.allocatedAmount || 0),
      0,
    );

    const totalSpent = budgets.reduce(
      (sum, budget) => sum + Number(budget.spentAmount || 0),
      0,
    );

    const remainingBudget = budgets.reduce(
      (sum, budget) => sum + Number(budget.remainingAmount || 0),
      0,
    );

    const percentageUsed =
      totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    // ========================================================
    // CURRENT MONTH INCOME
    // ========================================================

    const currentMonthStart = new Date(currentYear, currentMonth, 1);

    const nextMonthStart = new Date(currentYear, currentMonth + 1, 1);

    const currentMonthIncome = await Income.aggregate([
      {
        $match: {
          ...query,

          date: {
            $gte: currentMonthStart,

            $lt: nextMonthStart,
          },
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: "$amount",
          },

          remaining: {
            $sum: "$remainingAmount",
          },
        },
      },
    ]);

    const monthlyIncomeTotal =
      currentMonthIncome.length > 0
        ? Number(currentMonthIncome[0].total || 0)
        : 0;

    const monthlyIncomeRemaining =
      currentMonthIncome.length > 0
        ? Number(currentMonthIncome[0].remaining || 0)
        : 0;

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      data: {
        totalIncome:
          totalIncome.length > 0 ? Number(totalIncome[0].total || 0) : 0,

        totalRemainingIncome:
          totalIncome.length > 0 ? Number(totalIncome[0].remaining || 0) : 0,

        totalCount: totalIncome.length > 0 ? totalIncome[0].count : 0,

        categoryBreakdown: categoryStats,

        monthlyBreakdown: monthlyStats,

        currentMonthIncome: {
          month: currentMonth,

          year: currentYear,

          total: monthlyIncomeTotal,

          remaining: monthlyIncomeRemaining,
        },

        currentMonthBudget: {
          month: currentMonth,

          year: currentYear,

          totalBudgeted,

          totalSpent,

          remainingBudget,

          percentageUsed: Number(percentageUsed.toFixed(2)),
        },
      },
    });
  } catch (error) {
    console.error("❌ Get income stats error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch income statistics",

      error: error.message,
    });
  }
};
