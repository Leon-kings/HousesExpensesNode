// const Expense = require("../models/Expense");
// const mongoose = require("mongoose");
// const Income = require("../models/Income");
// const Savings = require("../models/Savings");
// const createNotification = require("../utils/createNotification");
// const Budget = require("../models/Budget");

// // @desc    Get all expenses for a user
// // @route   GET /api/expenses
// // @access  Private
// exports.getExpenses = async (req, res) => {
//   try {
//     const { category, type, startDate, endDate, search } = req.query;

//     const query = {};

//     if (category && category !== "all") {
//       query.category = category;
//     }

//     if (type && type !== "all") {
//       query.type = type;
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
//         { type: { $regex: search, $options: "i" } },
//         { user: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//       ];
//     }

//     const expenses = await Expense.find(query).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     res.status(200).json({
//       success: true,
//       count: expenses.length,
//       data: expenses,
//     });
//   } catch (error) {
//     console.error("Get expenses error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch expenses",
//       error: error.message,
//     });
//   }
// };

// // Make sure createNotification is imported





// // ============================================================
// // CREATE EXPENSE
// // ============================================================

// exports.createExpense = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const {
//       description,
//       category,
//       amount,
//       date,
//       user,
//       email,
//       userId,
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
//         message: "All fields are required",
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     const expenseAmount = Number(amount);

//     if (
//       !Number.isFinite(expenseAmount) ||
//       !Number.isInteger(expenseAmount) ||
//       expenseAmount <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Amount must be a positive whole number",
//       });
//     }

//     const normalizedEmail = email.trim().toLowerCase();
//     const normalizedDescription = description.trim();
//     const normalizedUser = user.trim();

//     if (!normalizedDescription) {
//       return res.status(400).json({
//         success: false,
//         message: "Description cannot be empty",
//       });
//     }

//     const expenseDate = new Date(date);

//     if (Number.isNaN(expenseDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense date",
//       });
//     }

//     // ========================================================
//     // CATEGORY
//     // ========================================================

//     const validCategories = [
//       "Food",
//       "Utilities",
//       "Transport",
//       "Entertainment",
//       "Shopping",
//       "Healthcare",
//       "Education",
//       "Salary",
//       "Freelance",
//       "Investment",
//       "Rent",
//       "Insurance",
//       "Other",
//     ];

//     if (!validCategories.includes(category)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense category",
//       });
//     }

//     // ========================================================
//     // START TRANSACTION
//     // ========================================================

//     session.startTransaction();

//     // ========================================================
//     // FIND AVAILABLE INCOME
//     // ========================================================

//     const incomeList = await Income.find({
//       userId,
//       remainingAmount: {
//         $gt: 0,
//       },
//     })
//       .sort({
//         date: 1,
//         createdAt: 1,
//       })
//       .session(session);

//     // ========================================================
//     // FIND AVAILABLE SAVINGS
//     // ========================================================

//     const savingsList = await Savings.find({
//       userId,
//       currentAmount: {
//         $gt: 0,
//       },
//     })
//       .sort({
//         priority: -1,
//         currentAmount: -1,
//       })
//       .session(session);

//     // ========================================================
//     // CALCULATE TOTAL AVAILABLE
//     // ========================================================

//     const totalIncome = incomeList.reduce(
//       (total, income) =>
//         total + (Number(income.remainingAmount) || 0),
//       0
//     );

//     const totalSavings = savingsList.reduce(
//       (total, saving) =>
//         total + (Number(saving.currentAmount) || 0),
//       0
//     );

//     const totalAvailable = totalIncome + totalSavings;

//     // ========================================================
//     // CHECK AVAILABLE MONEY
//     // ========================================================

//     if (totalAvailable <= 0) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,
//         message:
//           "Cannot create expense. Your income and savings are both empty.",
//         availableBalance: 0,
//       });
//     }

//     if (expenseAmount > totalAvailable) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,
//         message:
//           "Insufficient income and savings to cover this expense.",
//         expenseAmount,
//         totalIncome,
//         totalSavings,
//         availableBalance: totalAvailable,
//         missingAmount:
//           expenseAmount - totalAvailable,
//       });
//     }

//     // ========================================================
//     // TRACK MONEY USED
//     // ========================================================

//     let remainingExpense = expenseAmount;

//     let incomeUsed = 0;
//     let savingsUsed = 0;

//     const savingsAllocations = [];

//     // ========================================================
//     // USE INCOME FIRST
//     // ========================================================

//     for (const income of incomeList) {
//       if (remainingExpense <= 0) {
//         break;
//       }

//       const availableIncome =
//         Number(income.remainingAmount) || 0;

//       if (availableIncome <= 0) {
//         continue;
//       }

//       const amountFromIncome = Math.min(
//         availableIncome,
//         remainingExpense
//       );

//       income.remainingAmount =
//         availableIncome - amountFromIncome;

//       if (income.remainingAmount < 0) {
//         income.remainingAmount = 0;
//       }

//       await income.save({
//         session,
//         validateBeforeSave: true,
//       });

//       incomeUsed += amountFromIncome;

//       remainingExpense -= amountFromIncome;
//     }

//     // ========================================================
//     // USE SAVINGS ONLY AFTER INCOME IS EXHAUSTED
//     // ========================================================

//     if (remainingExpense > 0) {
//       for (const saving of savingsList) {
//         if (remainingExpense <= 0) {
//           break;
//         }

//         const availableSavings =
//           Number(saving.currentAmount) || 0;

//         if (availableSavings <= 0) {
//           continue;
//         }

//         const amountFromSavings = Math.min(
//           availableSavings,
//           remainingExpense
//         );

//         saving.currentAmount =
//           availableSavings - amountFromSavings;

//         if (saving.currentAmount < 0) {
//           saving.currentAmount = 0;
//         }

//         await saving.save({
//           session,
//           validateBeforeSave: true,
//         });

//         savingsUsed += amountFromSavings;

//         remainingExpense -= amountFromSavings;

//         savingsAllocations.push({
//           savingsId: saving._id,
//           amount: amountFromSavings,
//         });
//       }
//     }

//     // ========================================================
//     // FINAL SAFETY CHECK
//     // ========================================================

//     if (remainingExpense > 0) {
//       throw new Error(
//         "Money allocation failed. Transaction rolled back."
//       );
//     }

//     // ========================================================
//     // FIND BUDGET
//     // ========================================================

//     const budgetMonth = expenseDate.getMonth();
//     const budgetYear = expenseDate.getFullYear();

//     const budget = await Budget.findOne({
//       userId,
//       category,
//       month: budgetMonth,
//       year: budgetYear,
//     }).session(session);

//     let budgetUpdated = false;

//     // ========================================================
//     // UPDATE BUDGET
//     // ========================================================

//     if (budget) {
//       const currentSpent =
//         Number(budget.spentAmount) || 0;

//       budget.spentAmount =
//         currentSpent + expenseAmount;

//       if (budget.spentAmount < 0) {
//         budget.spentAmount = 0;
//       }

//       await budget.save({
//         session,
//         validateBeforeSave: true,
//       });

//       budgetUpdated = true;
//     }

//     // ========================================================
//     // CREATE EXPENSE
//     // ========================================================

//     const [expense] = await Expense.create(
//       [
//         {
//           description: normalizedDescription,

//           category,

//           type: "expense",

//           amount: expenseAmount,

//           date: expenseDate,

//           user: normalizedUser,

//           email: normalizedEmail,

//           userId,

//           incomeUsed,

//           savingsUsed,

//           savingsAllocations,

//           budgetId: budget ? budget._id : null,

//           budgetAmountUsed: budget
//             ? expenseAmount
//             : 0,
//         },
//       ],
//       {
//         session,
//       }
//     );

//     // ========================================================
//     // EXPENSE NOTIFICATION
//     // ========================================================

//     const [expenseNotification] =
//       await Notification.create(
//         [
//           {
//             userEmail: normalizedEmail,

//             userId,

//             title: "💸 Expense Recorded",

//             message:
//               `You spent RWF ${expenseAmount.toLocaleString()} ` +
//               `on ${category}.`,

//             type: "expense",

//             severity: "low",

//             isRead: false,

//             relatedId: expense._id,

//             relatedType: "expense",

//             actionLink:
//               `/expenses/${expense._id}`,

//             metadata: {
//               expenseId: expense._id,

//               amount: expenseAmount,

//               category,

//               incomeUsed,

//               savingsUsed,

//               budgetUpdated,
//             },
//           },
//         ],
//         {
//           session,
//         }
//       );

//     // ========================================================
//     // BUDGET NOTIFICATION
//     // ========================================================

//     let budgetNotification = null;

//     if (budget) {
//       let budgetSeverity = "low";
//       let budgetTitle = "📊 Budget Updated";

//       const percentageUsed =
//         Number(budget.percentageUsed) || 0;

//       if (percentageUsed >= 100) {
//         budgetSeverity = "high";
//         budgetTitle = "🚨 Budget Exceeded";
//       } else if (percentageUsed >= 80) {
//         budgetSeverity = "medium";
//         budgetTitle = "⚠️ Budget Almost Used";
//       }

//       const notifications =
//         await Notification.create(
//           [
//             {
//               userEmail: normalizedEmail,

//               userId,

//               title: budgetTitle,

//               message:
//                 `${category} budget: spent RWF ` +
//                 `${Number(budget.spentAmount).toLocaleString()} ` +
//                 `of RWF ` +
//                 `${Number(budget.allocatedAmount).toLocaleString()}. ` +
//                 `Remaining: RWF ` +
//                 `${Number(budget.remainingAmount).toLocaleString()}.`,

//               type: "budget",

//               severity: budgetSeverity,

//               isRead: false,

//               relatedId: budget._id,

//               relatedType: "budget",

//               actionLink:
//                 `/budgets/${budget._id}`,

//               metadata: {
//                 budgetId: budget._id,

//                 expenseId: expense._id,

//                 category,

//                 allocatedAmount:
//                   budget.allocatedAmount,

//                 spentAmount:
//                   budget.spentAmount,

//                 remainingAmount:
//                   budget.remainingAmount,

//                 percentageUsed:
//                   budget.percentageUsed,

//                 status:
//                   budget.status,

//                 expenseAmount,
//               },
//             },
//           ],
//           {
//             session,
//           }
//         );

//       budgetNotification = notifications[0];
//     }

//     // ========================================================
//     // COMMIT
//     // ========================================================

//     await session.commitTransaction();

//     // ========================================================
//     // RESPONSE BALANCES
//     // ========================================================

//     const remainingIncome =
//       totalIncome - incomeUsed;

//     const remainingSavings =
//       totalSavings - savingsUsed;

//     const remainingTotal =
//       remainingIncome + remainingSavings;

//     return res.status(201).json({
//       success: true,

//       message: "Expense created successfully",

//       data: expense,

//       moneyUsed: {
//         expenseAmount,
//         incomeUsed,
//         savingsUsed,
//       },

//       balances: {
//         income: remainingIncome,
//         savings: remainingSavings,
//         total: remainingTotal,
//       },

//       budgetUpdated,

//       budget: budget
//         ? {
//             id: budget._id,
//             category: budget.category,
//             allocatedAmount:
//               budget.allocatedAmount,
//             spentAmount:
//               budget.spentAmount,
//             remainingAmount:
//               budget.remainingAmount,
//             percentageUsed:
//               budget.percentageUsed,
//             status: budget.status,
//             month: budget.month,
//             year: budget.year,
//           }
//         : null,

//       notifications: {
//         expense: expenseNotification,
//         budget: budgetNotification,
//       },
//     });
//   } catch (error) {
//     if (session.inTransaction()) {
//       await session.abortTransaction();
//     }

//     console.error(
//       "❌ Create expense error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create expense",
//       error: error.message,
//     });
//   } finally {
//     await session.endSession();
//   }
// };




// // ============================================================
// // GET ALL EXPENSES
// // @route   GET /api/expenses/all
// // @access  Public
// // ============================================================

// exports.getAllExpenses = async (req, res) => {
//   try {
//     const expenses = await Expense.find({})
//       .sort({
//         date: -1,
//         createdAt: -1,
//       })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       count: expenses.length,
//       data: expenses,
//     });
//   } catch (error) {
//     console.error("❌ Get all expenses error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch all expenses",
//       error: error.message,
//     });
//   }
// };

// // @desc    Get single expense
// // @route   GET /api/expenses/:id
// // @access  Private
// exports.getExpense = async (req, res) => {
//   try {
//     const expense = await Expense.findById(req.params.id);

//     if (!expense) {
//       return res.status(404).json({
//         success: false,
//         message: "Expense not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: expense,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch expense",
//       error: error.message,
//     });
//   }
// };

// // @desc    Get expenses by user email
// // @route   GET /api/expenses/email/:email
// // @access  Private
// exports.getExpensesByEmail = async (req, res) => {
//   try {
//     const expenses = await Expense.find({
//       email: req.params.email.toLowerCase(),
//     }).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     res.status(200).json({
//       success: true,
//       count: expenses.length,
//       data: expenses,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch expenses",
//       error: error.message,
//     });
//   }
// };

// // @desc    Create expense
// // @route   POST /api/expenses
// // @access  Private

// // exports.createExpense = async (req, res) => {
// //   try {
// //     const {
// //       description,
// //       category,
// //       type,
// //       amount,
// //       date,
// //       user,
// //       email,
// //       userId,
// //     } = req.body;

// //     // Validate required fields
// //     if (
// //       !description ||
// //       !category ||
// //       !amount ||
// //       !date ||
// //       !user ||
// //       !email ||
// //       !userId
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message:
// //           "Description, category, amount, date, user, email, and userId are required",
// //       });
// //     }

// //     // Validate amount
// // if (!Number.isInteger(Number(amount)) || Number(amount) <= 0) {
// //   return res.status(400).json({
// //     success: false,
// //     message: "Amount must be a positive whole number (no decimals)",
// //   });
// // }

// //     const expense = await Expense.create({
// //       description: description.trim(),
// //       category,
// //       type: type || "expense",
// //       amount: Number(amount),
// //       date,
// //       user: user.trim(),
// //       userId,
// //       email: email.toLowerCase().trim(),
// //     });

// //     return res.status(201).json({
// //       success: true,
// //       message: "Expense created successfully",
// //       data: expense,
// //     });

// //   } catch (error) {

// //     console.error("Create expense error:", error);

// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to create expense",
// //       error: error.message,
// //     });

// //   }
// // };



// // @desc    Update expense
// // @route   PUT /api/expenses/:id
// // @access  Private
// exports.updateExpense = async (req, res) => {
//   try {
//     const expense = await Expense.findById(req.params.id);

//     if (!expense) {
//       return res.status(404).json({
//         success: false,
//         message: "Expense not found",
//       });
//     }

//     const updatedExpense = await Expense.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       },
//     );

//     res.status(200).json({
//       success: true,
//       message: "Expense updated successfully",
//       data: updatedExpense,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to update expense",
//       error: error.message,
//     });
//   }
// };

// // @desc    Delete expense
// // @route   DELETE /api/expenses/:id
// // @access  Private
// exports.deleteExpense = async (req, res) => {
//   try {
//     const expense = await Expense.findByIdAndDelete(req.params.id);

//     if (!expense) {
//       return res.status(404).json({
//         success: false,
//         message: "Expense not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Expense deleted successfully",
//       data: expense,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete expense",
//       error: error.message,
//     });
//   }
// };

// // @desc    Get expense statistics
// // @route   GET /api/expenses/stats
// // @access  Private
// exports.getStats = async (req, res) => {
//   try {
//     const stats = await Expense.getStats(req.user.id);

//     // Get category breakdown
//     const categoryStats = await Expense.aggregate([
//       {
//         $match: { userId: mongoose.Types.ObjectId(req.user.id) },
//       },
//       {
//         $group: {
//           _id: {
//             category: "$category",
//             type: "$type",
//           },
//           total: { $sum: "$amount" },
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $group: {
//           _id: "$_id.category",
//           expenses: {
//             $push: {
//               type: "$_id.type",
//               total: "$total",
//               count: "$count",
//             },
//           },
//           totalAmount: { $sum: "$total" },
//         },
//       },
//     ]);

//     // Get monthly summary (last 12 months)
//     const twelveMonthsAgo = new Date();
//     twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

//     const monthlyStats = await Expense.aggregate([
//       {
//         $match: {
//           userId: mongoose.Types.ObjectId(req.user.id),
//           date: { $gte: twelveMonthsAgo },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             year: { $year: "$date" },
//             month: { $month: "$date" },
//             type: "$type",
//           },
//           total: { $sum: "$amount" },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             year: "$_id.year",
//             month: "$_id.month",
//           },
//           income: {
//             $sum: {
//               $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0],
//             },
//           },
//           expenses: {
//             $sum: {
//               $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0],
//             },
//           },
//         },
//       },
//       { $sort: { "_id.year": -1, "_id.month": -1 } },
//       { $limit: 12 },
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         summary: stats,
//         categoryBreakdown: categoryStats,
//         monthlySummary: monthlyStats,
//       },
//     });
//   } catch (error) {
//     console.error("Get stats error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch statistics",
//       error: error.message,
//     });
//   }
// };

// // @desc    Bulk delete expenses
// // @route   DELETE /api/expenses/bulk
// // @access  Private
// exports.bulkDeleteExpenses = async (req, res) => {
//   try {
//     const { expenseIds } = req.body;

//     if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide an array of expense IDs",
//       });
//     }

//     const result = await Expense.deleteMany({
//       _id: { $in: expenseIds },
//       userId: req.user.id,
//     });

//     // Get updated statistics
//     const stats = await Expense.getStats(req.user.id);

//     res.status(200).json({
//       success: true,
//       message: `${result.deletedCount} expenses deleted successfully`,
//       deletedCount: result.deletedCount,
//       stats,
//     });
//   } catch (error) {
//     console.error("Bulk delete error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete expenses",
//       error: error.message,
//     });
//   }
// };



















// // ============================================================
// // CONTROLLERS / EXPENSE.CONTROLLER.JS
// // ============================================================

// const mongoose = require("mongoose");

// const Expense = require("../models/Expense");
// const Income = require("../models/Income");
// const Savings = require("../models/Savings");
// const Budget = require("../models/Budget");
// const Notification = require("../models/Notification");

// // ============================================================
// // CREATE NOTIFICATION
// // Kept inside this controller as requested.
// // ============================================================

// const createNotification = async ({
//   userEmail,
//   userId = null,
//   title,
//   message,
//   type = "info",
//   severity = "low",
//   relatedId = null,
//   relatedType = null,
//   actionLink = null,
//   metadata = {},
//   session = null,
// }) => {
//   try {
//     if (!userEmail) {
//       console.error(
//         "❌ Notification failed: userEmail is required",
//       );

//       return null;
//     }

//     const notificationData = {
//       userEmail: String(userEmail)
//         .trim()
//         .toLowerCase(),

//       userId,

//       title,

//       message,

//       type,

//       severity,

//       isRead: false,

//       relatedId,

//       relatedType,

//       actionLink,

//       metadata,
//     };

//     if (session) {
//       const [notification] =
//         await Notification.create(
//           [notificationData],
//           { session },
//         );

//       return notification;
//     }

//     return await Notification.create(
//       notificationData,
//     );
//   } catch (error) {
//     console.error(
//       "❌ Notification creation failed:",
//       error.message,
//     );

//     return null;
//   }
// };

// // ============================================================
// // CATEGORY LIST
// // ============================================================

// const VALID_CATEGORIES = [
//   "Food",
//   "Utilities",
//   "Transport",
//   "Entertainment",
//   "Shopping",
//   "Healthcare",
//   "Education",
//   "Salary",
//   "Freelance",
//   "Investment",
//   "Rent",
//   "Insurance",
//   "Other",
// ];

// // ============================================================
// // UPDATE BUDGET
// // ============================================================

// const recalculateBudget = async (
//   budget,
//   session,
// ) => {
//   if (!budget) return null;

//   const allocatedAmount =
//     Number(budget.allocatedAmount) || 0;

//   const spentAmount =
//     Number(budget.spentAmount) || 0;

//   budget.spentAmount = Math.max(
//     0,
//     spentAmount,
//   );

//   budget.remainingAmount = Math.max(
//     0,
//     allocatedAmount - budget.spentAmount,
//   );

//   budget.percentageUsed =
//     allocatedAmount > 0
//       ? (budget.spentAmount /
//           allocatedAmount) *
//         100
//       : 0;

//   if (budget.percentageUsed >= 100) {
//     budget.status = "over-budget";
//   } else if (budget.percentageUsed >= 80) {
//     budget.status = "approaching-limit";
//   } else if (
//     budget.percentageUsed < 50 &&
//     budget.spentAmount > 0
//   ) {
//     budget.status = "under-budget";
//   } else {
//     budget.status = "on-track";
//   }

//   await budget.save({
//     session,
//     validateBeforeSave: true,
//   });

//   return budget;
// };

// // ============================================================
// // GET ALL EXPENSES
// // ============================================================

// exports.getExpenses = async (req, res) => {
//   try {
//     const {
//       category,
//       type,
//       startDate,
//       endDate,
//       search,
//       email,
//       userId,
//     } = req.query;

//     const query = {};

//     // --------------------------------------------------------
//     // USER FILTER
//     // --------------------------------------------------------

//     if (userId) {
//       if (
//         !mongoose.Types.ObjectId.isValid(userId)
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid userId",
//         });
//       }

//       query.userId = userId;
//     }

//     if (email) {
//       query.email = email
//         .trim()
//         .toLowerCase();
//     }

//     // --------------------------------------------------------
//     // CATEGORY
//     // --------------------------------------------------------

//     if (
//       category &&
//       category.toLowerCase() !== "all"
//     ) {
//       query.category = category;
//     }

//     // --------------------------------------------------------
//     // TYPE
//     // --------------------------------------------------------

//     if (
//       type &&
//       type.toLowerCase() !== "all"
//     ) {
//       query.type = type;
//     }

//     // --------------------------------------------------------
//     // DATE
//     // --------------------------------------------------------

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

//         end.setHours(
//           23,
//           59,
//           59,
//           999,
//         );

//         query.date.$lte = end;
//       }
//     }

//     // --------------------------------------------------------
//     // SEARCH
//     // --------------------------------------------------------

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
//           type: {
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

//     const expenses = await Expense.find(
//       query,
//     ).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     return res.status(200).json({
//       success: true,
//       count: expenses.length,
//       data: expenses,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get expenses error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch expenses",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET ALL EXPENSES - ADMIN
// // ============================================================

// exports.getAllExpenses = async (
//   req,
//   res,
// ) => {
//   try {
//     const expenses = await Expense.find({})
//       .sort({
//         date: -1,
//         createdAt: -1,
//       })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       count: expenses.length,
//       data: expenses,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get all expenses error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch all expenses",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET EXPENSE BY ID
// // ============================================================

// exports.getExpense = async (req, res) => {
//   try {
//     const expense =
//       await Expense.findById(req.params.id);

//     if (!expense) {
//       return res.status(404).json({
//         success: false,
//         message: "Expense not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: expense,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get expense error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch expense",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET EXPENSES BY EMAIL
// // ============================================================

// exports.getExpensesByEmail = async (
//   req,
//   res,
// ) => {
//   try {
//     const email =
//       String(req.params.email || "")
//         .trim()
//         .toLowerCase();

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const expenses =
//       await Expense.find({ email }).sort({
//         date: -1,
//         createdAt: -1,
//       });

//     return res.status(200).json({
//       success: true,
//       count: expenses.length,
//       data: expenses,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get expenses by email error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch expenses",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET EXPENSES BY USER ID
// // ============================================================

// exports.getExpensesByUserId = async (
//   req,
//   res,
// ) => {
//   try {
//     const { userId } = req.params;

//     if (
//       !mongoose.Types.ObjectId.isValid(userId)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     const expenses =
//       await Expense.find({ userId }).sort({
//         date: -1,
//         createdAt: -1,
//       });

//     return res.status(200).json({
//       success: true,
//       count: expenses.length,
//       data: expenses,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get expenses by userId error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch expenses",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // CREATE EXPENSE
// //
// // MONEY ORDER:
// //
// // 1. Income first
// // 2. Savings only after income is exhausted
// // 3. Update budget
// // 4. Create expense
// // 5. Create notifications
// // 6. Commit transaction
// //
// // Everything rolls back if something fails.
// // ============================================================

// exports.createExpense = async (
//   req,
//   res,
// ) => {
//   const session =
//     await mongoose.startSession();

//   try {
//     const {
//       description,
//       category,
//       amount,
//       date,
//       user,
//       email,
//       userId,
//     } = req.body;

//     // --------------------------------------------------------
//     // VALIDATION
//     // --------------------------------------------------------

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
//         message: "All fields are required",
//       });
//     }

//     if (
//       !mongoose.Types.ObjectId.isValid(userId)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     if (
//       !VALID_CATEGORIES.includes(category)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense category",
//       });
//     }

//     const expenseAmount = Number(amount);

//     if (
//       !Number.isFinite(expenseAmount) ||
//       !Number.isInteger(expenseAmount) ||
//       expenseAmount <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Amount must be a positive whole number",
//       });
//     }

//     const normalizedEmail =
//       String(email)
//         .trim()
//         .toLowerCase();

//     const normalizedDescription =
//       String(description).trim();

//     const normalizedUser =
//       String(user).trim();

//     if (!normalizedDescription) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Description cannot be empty",
//       });
//     }

//     const expenseDate = new Date(date);

//     if (
//       Number.isNaN(expenseDate.getTime())
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense date",
//       });
//     }

//     // --------------------------------------------------------
//     // START TRANSACTION
//     // --------------------------------------------------------

//     session.startTransaction();

//     // --------------------------------------------------------
//     // FIND AVAILABLE INCOME
//     // --------------------------------------------------------

//     const incomeList =
//       await Income.find({
//         userId,
//         remainingAmount: {
//           $gt: 0,
//         },
//       })
//         .sort({
//           date: 1,
//           createdAt: 1,
//         })
//         .session(session);

//     // --------------------------------------------------------
//     // FIND AVAILABLE SAVINGS
//     // --------------------------------------------------------

//     const savingsList =
//       await Savings.find({
//         userId,
//         currentAmount: {
//           $gt: 0,
//         },
//       })
//         .sort({
//           priority: -1,
//           currentAmount: -1,
//           createdAt: 1,
//         })
//         .session(session);

//     // --------------------------------------------------------
//     // CALCULATE AVAILABLE MONEY
//     // --------------------------------------------------------

//     const totalIncome =
//       incomeList.reduce(
//         (sum, income) =>
//           sum +
//           (Number(
//             income.remainingAmount,
//           ) || 0),
//         0,
//       );

//     const totalSavings =
//       savingsList.reduce(
//         (sum, saving) =>
//           sum +
//           (Number(
//             saving.currentAmount,
//           ) || 0),
//         0,
//       );

//     const totalAvailable =
//       totalIncome + totalSavings;

//     // --------------------------------------------------------
//     // NO MONEY
//     // --------------------------------------------------------

//     if (totalAvailable <= 0) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,
//         message:
//           "Cannot create expense. Your income and savings are both empty.",
//         availableBalance: 0,
//       });
//     }

//     // --------------------------------------------------------
//     // INSUFFICIENT MONEY
//     // --------------------------------------------------------

//     if (
//       expenseAmount > totalAvailable
//     ) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,
//         message:
//           "Insufficient income and savings to cover this expense.",
//         expenseAmount,
//         totalIncome,
//         totalSavings,
//         availableBalance:
//           totalAvailable,
//         missingAmount:
//           expenseAmount -
//           totalAvailable,
//       });
//     }

//     // --------------------------------------------------------
//     // MONEY TRACKING
//     // --------------------------------------------------------

//     let remainingExpense =
//       expenseAmount;

//     let incomeUsed = 0;
//     let savingsUsed = 0;

//     const savingsAllocations = [];

//     // --------------------------------------------------------
//     // USE INCOME FIRST
//     // --------------------------------------------------------

//     for (const income of incomeList) {
//       if (remainingExpense <= 0) {
//         break;
//       }

//       const availableIncome =
//         Number(
//           income.remainingAmount,
//         ) || 0;

//       if (availableIncome <= 0) {
//         continue;
//       }

//       const amountFromIncome =
//         Math.min(
//           availableIncome,
//           remainingExpense,
//         );

//       income.remainingAmount =
//         availableIncome -
//         amountFromIncome;

//       if (
//         income.remainingAmount < 0
//       ) {
//         income.remainingAmount = 0;
//       }

//       await income.save({
//         session,
//         validateBeforeSave: true,
//       });

//       incomeUsed +=
//         amountFromIncome;

//       remainingExpense -=
//         amountFromIncome;
//     }

//     // --------------------------------------------------------
//     // USE SAVINGS ONLY AFTER INCOME
//     // --------------------------------------------------------

//     if (remainingExpense > 0) {
//       for (const saving of savingsList) {
//         if (remainingExpense <= 0) {
//           break;
//         }

//         const availableSavings =
//           Number(
//             saving.currentAmount,
//           ) || 0;

//         if (availableSavings <= 0) {
//           continue;
//         }

//         const amountFromSavings =
//           Math.min(
//             availableSavings,
//             remainingExpense,
//           );

//         saving.currentAmount =
//           availableSavings -
//           amountFromSavings;

//         if (
//           saving.currentAmount < 0
//         ) {
//           saving.currentAmount = 0;
//         }

//         // Keep savings progress consistent.
//         const targetAmount =
//           Number(
//             saving.targetAmount,
//           ) || 0;

//         saving.progress =
//           targetAmount > 0
//             ? Math.min(
//                 100,
//                 (saving.currentAmount /
//                   targetAmount) *
//                   100,
//               )
//             : 0;

//         if (
//           saving.progress >= 100
//         ) {
//           saving.isCompleted = true;

//           if (!saving.completedDate) {
//             saving.completedDate =
//               new Date();
//           }
//         } else {
//           saving.isCompleted = false;
//           saving.completedDate =
//             null;
//         }

//         await saving.save({
//           session,
//           validateBeforeSave: true,
//         });

//         savingsUsed +=
//           amountFromSavings;

//         remainingExpense -=
//           amountFromSavings;

//         savingsAllocations.push({
//           savingsId: saving._id,
//           amount:
//             amountFromSavings,
//         });
//       }
//     }

//     // --------------------------------------------------------
//     // FINAL MONEY SAFETY CHECK
//     // --------------------------------------------------------

//     if (remainingExpense > 0) {
//       throw new Error(
//         "Money allocation failed. Transaction rolled back.",
//       );
//     }

//     // --------------------------------------------------------
//     // FIND BUDGET
//     // --------------------------------------------------------

//     const budgetMonth =
//       expenseDate.getMonth();

//     const budgetYear =
//       expenseDate.getFullYear();

//     const budget =
//       await Budget.findOne({
//         userId,
//         category,
//         month: budgetMonth,
//         year: budgetYear,
//       }).session(session);

//     let budgetUpdated = false;

//     // --------------------------------------------------------
//     // UPDATE BUDGET
//     // --------------------------------------------------------

//     if (budget) {
//       const currentSpent =
//         Number(
//           budget.spentAmount,
//         ) || 0;

//       budget.spentAmount =
//         currentSpent +
//         expenseAmount;

//       await recalculateBudget(
//         budget,
//         session,
//       );

//       budgetUpdated = true;
//     }

//     // --------------------------------------------------------
//     // CREATE EXPENSE
//     // --------------------------------------------------------

//     const [expense] =
//       await Expense.create(
//         [
//           {
//             description:
//               normalizedDescription,

//             category,

//             type: "expense",

//             amount: expenseAmount,

//             date: expenseDate,

//             user: normalizedUser,

//             email: normalizedEmail,

//             userId,

//             incomeUsed,

//             savingsUsed,

//             savingsAllocations,

//             budgetId:
//               budget
//                 ? budget._id
//                 : null,

//             budgetAmountUsed:
//               budget
//                 ? expenseAmount
//                 : 0,
//           },
//         ],
//         {
//           session,
//         },
//       );

//     // --------------------------------------------------------
//     // EXPENSE NOTIFICATION
//     // --------------------------------------------------------

//     const expenseNotification =
//       await createNotification({
//         userEmail:
//           normalizedEmail,

//         userId,

//         title:
//           "💸 Expense Recorded",

//         message:
//           `You spent RWF ${expenseAmount.toLocaleString()} ` +
//           `on ${category}.`,

//         type: "expense",

//         severity: "low",

//         relatedId:
//           expense._id,

//         relatedType:
//           "Expense",

//         actionLink:
//           `/expenses/${expense._id}`,

//         metadata: {
//           expenseId:
//             expense._id,

//           amount:
//             expenseAmount,

//           category,

//           incomeUsed,

//           savingsUsed,

//           budgetUpdated,
//         },

//         session,
//       });

//     // --------------------------------------------------------
//     // BUDGET NOTIFICATION
//     // --------------------------------------------------------

//     let budgetNotification =
//       null;

//     if (budget) {
//       let severity = "low";
//       let title =
//         "📊 Budget Updated";

//       if (
//         budget.percentageUsed >=
//         100
//       ) {
//         severity = "high";
//         title =
//           "🚨 Budget Exceeded";
//       } else if (
//         budget.percentageUsed >=
//         80
//       ) {
//         severity = "medium";
//         title =
//           "⚠️ Budget Almost Used";
//       }

//       budgetNotification =
//         await createNotification({
//           userEmail:
//             normalizedEmail,

//           userId,

//           title,

//           message:
//             `${category} budget: spent RWF ` +
//             `${Number(
//               budget.spentAmount,
//             ).toLocaleString()} ` +
//             `of RWF ` +
//             `${Number(
//               budget.allocatedAmount,
//             ).toLocaleString()}. ` +
//             `Remaining: RWF ` +
//             `${Number(
//               budget.remainingAmount,
//             ).toLocaleString()}.`,

//           type: "budget",

//           severity,

//           relatedId:
//             budget._id,

//           relatedType:
//             "Budget",

//           actionLink:
//             `/budgets/${budget._id}`,

//           metadata: {
//             budgetId:
//               budget._id,

//             expenseId:
//               expense._id,

//             category,

//             allocatedAmount:
//               budget.allocatedAmount,

//             spentAmount:
//               budget.spentAmount,

//             remainingAmount:
//               budget.remainingAmount,

//             percentageUsed:
//               budget.percentageUsed,

//             status:
//               budget.status,

//             expenseAmount,
//           },

//           session,
//         });
//     }

//     // --------------------------------------------------------
//     // COMMIT
//     // --------------------------------------------------------

//     await session.commitTransaction();

//     // --------------------------------------------------------
//     // FINAL BALANCES
//     // --------------------------------------------------------

//     const remainingIncome =
//       totalIncome -
//       incomeUsed;

//     const remainingSavings =
//       totalSavings -
//       savingsUsed;

//     const remainingTotal =
//       remainingIncome +
//       remainingSavings;

//     return res.status(201).json({
//       success: true,

//       message:
//         "Expense created successfully",

//       data: expense,

//       moneyUsed: {
//         expenseAmount,

//         incomeUsed,

//         savingsUsed,
//       },

//       balances: {
//         income:
//           remainingIncome,

//         savings:
//           remainingSavings,

//         total:
//           remainingTotal,
//       },

//       budgetUpdated,

//       budget: budget
//         ? {
//             id: budget._id,

//             category:
//               budget.category,

//             allocatedAmount:
//               budget.allocatedAmount,

//             spentAmount:
//               budget.spentAmount,

//             remainingAmount:
//               budget.remainingAmount,

//             percentageUsed:
//               budget.percentageUsed,

//             status:
//               budget.status,

//             month:
//               budget.month,

//             year:
//               budget.year,
//           }
//         : null,

//       notifications: {
//         expense:
//           expenseNotification,

//         budget:
//           budgetNotification,
//       },
//     });
//   } catch (error) {
//     if (session.inTransaction()) {
//       await session.abortTransaction();
//     }

//     console.error(
//       "❌ Create expense error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to create expense",
//       error: error.message,
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// // ============================================================
// // UPDATE EXPENSE
// //
// // Important:
// // Updating an expense amount/category can affect:
// // - Income
// // - Savings
// // - Budget
// //
// // Therefore this reverses the old expense first,
// // then applies the new expense.
// // ============================================================

// exports.updateExpense = async (
//   req,
//   res,
// ) => {
//   const session =
//     await mongoose.startSession();

//   try {
//     const expense =
//       await Expense.findById(
//         req.params.id,
//       ).session(session);

//     if (!expense) {
//       return res.status(404).json({
//         success: false,
//         message: "Expense not found",
//       });
//     }

//     session.startTransaction();

//     // --------------------------------------------------------
//     // Store old values
//     // --------------------------------------------------------

//     const oldAmount =
//       Number(expense.amount) || 0;

//     const oldCategory =
//       expense.category;

//     const oldDate =
//       new Date(expense.date);

//     const oldUserId =
//       expense.userId;

//     // --------------------------------------------------------
//     // REVERSE OLD INCOME
//     // --------------------------------------------------------

//     if (expense.incomeUsed > 0) {
//       const income =
//         await Income.findOne({
//           userId: oldUserId,
//           date: {
//             $lte: oldDate,
//           },
//         })
//           .sort({
//             date: -1,
//             createdAt: -1,
//           })
//           .session(session);

//       if (income) {
//         income.remainingAmount =
//           Number(
//             income.remainingAmount,
//           ) +
//           Number(
//             expense.incomeUsed,
//           );

//         income.remainingAmount =
//           Math.min(
//             income.remainingAmount,
//             income.amount,
//           );

//         await income.save({
//           session,
//           validateBeforeSave: true,
//         });
//       }
//     }

//     // --------------------------------------------------------
//     // REVERSE SAVINGS
//     // --------------------------------------------------------

//     for (const allocation of
//       expense.savingsAllocations ||
//       []) {
//       const saving =
//         await Savings.findById(
//           allocation.savingsId,
//         ).session(session);

//       if (!saving) continue;

//       saving.currentAmount =
//         Number(
//           saving.currentAmount,
//         ) +
//         Number(
//           allocation.amount,
//         );

//       const targetAmount =
//         Number(
//           saving.targetAmount,
//         ) || 0;

//       saving.progress =
//         targetAmount > 0
//           ? Math.min(
//               100,
//               (saving.currentAmount /
//                 targetAmount) *
//                 100,
//             )
//           : 0;

//       saving.isCompleted =
//         saving.progress >= 100;

//       if (!saving.isCompleted) {
//         saving.completedDate =
//           null;
//       }

//       await saving.save({
//         session,
//         validateBeforeSave: true,
//       });
//     }

//     // --------------------------------------------------------
//     // REVERSE OLD BUDGET
//     // --------------------------------------------------------

//     const oldBudget =
//       await Budget.findOne({
//         userId: oldUserId,
//         category: oldCategory,
//         month:
//           oldDate.getMonth(),
//         year:
//           oldDate.getFullYear(),
//       }).session(session);

//     if (oldBudget) {
//       oldBudget.spentAmount =
//         Math.max(
//           0,
//           Number(
//             oldBudget.spentAmount,
//           ) -
//             oldAmount,
//         );

//       await recalculateBudget(
//         oldBudget,
//         session,
//       );
//     }

//     // --------------------------------------------------------
//     // UPDATE EXPENSE FIELDS
//     // --------------------------------------------------------

//     const {
//       description,
//       category,
//       amount,
//       date,
//       user,
//       email,
//     } = req.body;

//     const newDescription =
//       description !== undefined
//         ? String(
//             description,
//           ).trim()
//         : expense.description;

//     const newCategory =
//       category !== undefined
//         ? category
//         : expense.category;

//     const newAmount =
//       amount !== undefined
//         ? Number(amount)
//         : oldAmount;

//     const newDate =
//       date !== undefined
//         ? new Date(date)
//         : oldDate;

//     if (
//       !VALID_CATEGORIES.includes(
//         newCategory,
//       )
//     ) {
//       throw new Error(
//         "Invalid expense category",
//       );
//     }

//     if (
//       !Number.isInteger(
//         newAmount,
//       ) ||
//       newAmount <= 0
//     ) {
//       throw new Error(
//         "Amount must be a positive whole number",
//       );
//     }

//     if (
//       Number.isNaN(
//         newDate.getTime(),
//       )
//     ) {
//       throw new Error(
//         "Invalid expense date",
//       );
//     }

//     expense.description =
//       newDescription;

//     expense.category =
//       newCategory;

//     expense.amount =
//       newAmount;

//     expense.date =
//       newDate;

//     if (user !== undefined) {
//       expense.user =
//         String(user).trim();
//     }

//     if (email !== undefined) {
//       expense.email =
//         String(email)
//           .trim()
//           .toLowerCase();
//     }

//     expense.incomeUsed = 0;
//     expense.savingsUsed = 0;
//     expense.savingsAllocations = [];

//     // --------------------------------------------------------
//     // APPLY NEW MONEY
//     // --------------------------------------------------------

//     const newIncomeList =
//       await Income.find({
//         userId:
//           expense.userId,
//         remainingAmount: {
//           $gt: 0,
//         },
//       })
//         .sort({
//           date: 1,
//           createdAt: 1,
//         })
//         .session(session);

//     const newSavingsList =
//       await Savings.find({
//         userId:
//           expense.userId,
//         currentAmount: {
//           $gt: 0,
//         },
//       })
//         .sort({
//           priority: -1,
//           currentAmount: -1,
//         })
//         .session(session);

//     let remaining =
//       newAmount;

//     // --------------------------------------------------------
//     // INCOME FIRST
//     // --------------------------------------------------------

//     for (const income of
//       newIncomeList) {
//       if (remaining <= 0) break;

//       const available =
//         Number(
//           income.remainingAmount,
//         ) || 0;

//       const used =
//         Math.min(
//           available,
//           remaining,
//         );

//       if (used <= 0) continue;

//       income.remainingAmount =
//         available - used;

//       await income.save({
//         session,
//         validateBeforeSave: true,
//       });

//       expense.incomeUsed +=
//         used;

//       remaining -= used;
//     }

//     // --------------------------------------------------------
//     // SAVINGS SECOND
//     // --------------------------------------------------------

//     if (remaining > 0) {
//       for (const saving of
//         newSavingsList) {
//         if (remaining <= 0)
//           break;

//         const available =
//           Number(
//             saving.currentAmount,
//           ) || 0;

//         const used =
//           Math.min(
//             available,
//             remaining,
//           );

//         if (used <= 0)
//           continue;

//         saving.currentAmount =
//           available - used;

//         const target =
//           Number(
//             saving.targetAmount,
//           ) || 0;

//         saving.progress =
//           target > 0
//             ? Math.min(
//                 100,
//                 (saving.currentAmount /
//                   target) *
//                   100,
//               )
//             : 0;

//         saving.isCompleted =
//           saving.progress >= 100;

//         if (!saving.isCompleted) {
//           saving.completedDate =
//             null;
//         }

//         await saving.save({
//           session,
//           validateBeforeSave: true,
//         });

//         expense.savingsUsed +=
//           used;

//         expense.savingsAllocations.push(
//           {
//             savingsId:
//               saving._id,
//             amount: used,
//           },
//         );

//         remaining -= used;
//       }
//     }

//     if (remaining > 0) {
//       throw new Error(
//         "Insufficient income and savings to update this expense.",
//       );
//     }

//     // --------------------------------------------------------
//     // NEW BUDGET
//     // --------------------------------------------------------

//     const newBudget =
//       await Budget.findOne({
//         userId:
//           expense.userId,
//         category:
//           newCategory,
//         month:
//           newDate.getMonth(),
//         year:
//           newDate.getFullYear(),
//       }).session(session);

//     if (newBudget) {
//       newBudget.spentAmount =
//         (Number(
//           newBudget.spentAmount,
//         ) || 0) +
//         newAmount;

//       await recalculateBudget(
//         newBudget,
//         session,
//       );

//       expense.budgetId =
//         newBudget._id;

//       expense.budgetAmountUsed =
//         newAmount;
//     } else {
//       expense.budgetId =
//         null;

//       expense.budgetAmountUsed =
//         0;
//     }

//     // --------------------------------------------------------
//     // SAVE EXPENSE
//     // --------------------------------------------------------

//     await expense.save({
//       session,
//       validateBeforeSave: true,
//     });

//     // --------------------------------------------------------
//     // NOTIFICATION
//     // --------------------------------------------------------

//     const notification =
//       await createNotification({
//         userEmail:
//           expense.email,

//         userId:
//           expense.userId,

//         title:
//           "📝 Expense Updated",

//         message:
//           `Your ${expense.category} expense ` +
//           `was updated to RWF ` +
//           `${expense.amount.toLocaleString()}.`,

//         type: "expense",

//         severity: "low",

//         relatedId:
//           expense._id,

//         relatedType:
//           "Expense",

//         actionLink:
//           `/expenses/${expense._id}`,

//         metadata: {
//           expenseId:
//             expense._id,

//           amount:
//             expense.amount,

//           category:
//             expense.category,

//           incomeUsed:
//             expense.incomeUsed,

//           savingsUsed:
//             expense.savingsUsed,
//         },

//         session,
//       });

//     await session.commitTransaction();

//     return res.status(200).json({
//       success: true,

//       message:
//         "Expense updated successfully",

//       data: expense,

//       notification,
//     });
//   } catch (error) {
//     if (session.inTransaction()) {
//       await session.abortTransaction();
//     }

//     console.error(
//       "❌ Update expense error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to update expense",
//       error: error.message,
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// // ============================================================
// // DELETE EXPENSE
// //
// // Reverses:
// // - Income
// // - Savings
// // - Budget
// // Then deletes expense.
// // ============================================================

// exports.deleteExpense = async (
//   req,
//   res,
// ) => {
//   const session =
//     await mongoose.startSession();

//   try {
//     const expense =
//       await Expense.findById(
//         req.params.id,
//       ).session(session);

//     if (!expense) {
//       return res.status(404).json({
//         success: false,
//         message: "Expense not found",
//       });
//     }

//     session.startTransaction();

//     // --------------------------------------------------------
//     // RESTORE INCOME
//     // --------------------------------------------------------

//     if (expense.incomeUsed > 0) {
//       const income =
//         await Income.findOne({
//           userId:
//             expense.userId,
//         })
//           .sort({
//             date: -1,
//             createdAt: -1,
//           })
//           .session(session);

//       if (income) {
//         income.remainingAmount =
//           Math.min(
//             Number(income.amount),
//             Number(
//               income.remainingAmount,
//             ) +
//               Number(
//                 expense.incomeUsed,
//               ),
//           );

//         await income.save({
//           session,
//           validateBeforeSave: true,
//         });
//       }
//     }

//     // --------------------------------------------------------
//     // RESTORE SAVINGS
//     // --------------------------------------------------------

//     for (const allocation of
//       expense.savingsAllocations ||
//       []) {
//       const saving =
//         await Savings.findById(
//           allocation.savingsId,
//         ).session(session);

//       if (!saving) continue;

//       saving.currentAmount =
//         Number(
//           saving.currentAmount,
//         ) +
//         Number(
//           allocation.amount,
//         );

//       const target =
//         Number(
//           saving.targetAmount,
//         ) || 0;

//       saving.progress =
//         target > 0
//           ? Math.min(
//               100,
//               (saving.currentAmount /
//                 target) *
//                 100,
//             )
//           : 0;

//       saving.isCompleted =
//         saving.progress >= 100;

//       if (!saving.isCompleted) {
//         saving.completedDate =
//           null;
//       }

//       await saving.save({
//         session,
//         validateBeforeSave: true,
//       });
//     }

//     // --------------------------------------------------------
//     // RESTORE BUDGET
//     // --------------------------------------------------------

//     if (expense.budgetId) {
//       const budget =
//         await Budget.findById(
//           expense.budgetId,
//         ).session(session);

//       if (budget) {
//         budget.spentAmount =
//           Math.max(
//             0,
//             Number(
//               budget.spentAmount,
//             ) -
//               Number(
//                 expense.budgetAmountUsed ||
//                   expense.amount,
//               ),
//           );

//         await recalculateBudget(
//           budget,
//           session,
//         );
//       }
//     }

//     // --------------------------------------------------------
//     // DELETE EXPENSE
//     // --------------------------------------------------------

//     await expense.deleteOne({
//       session,
//     });

//     // --------------------------------------------------------
//     // DELETE NOTIFICATION
//     //
//     // We create a new notification instead of deleting
//     // historical notifications.
//     // --------------------------------------------------------

//     const notification =
//       await createNotification({
//         userEmail:
//           expense.email,

//         userId:
//           expense.userId,

//         title:
//           "🗑️ Expense Deleted",

//         message:
//           `Your ${expense.category} expense ` +
//           `of RWF ${Number(
//             expense.amount,
//           ).toLocaleString()} was deleted ` +
//           `and the money was restored.`,

//         type: "expense",

//         severity: "medium",

//         relatedId:
//           expense._id,

//         relatedType:
//           "Expense",

//         actionLink:
//           "/expenses",

//         metadata: {
//           expenseId:
//             expense._id,

//           amount:
//             expense.amount,

//           incomeRestored:
//             expense.incomeUsed,

//           savingsRestored:
//             expense.savingsUsed,

//           category:
//             expense.category,
//         },

//         session,
//       });

//     await session.commitTransaction();

//     return res.status(200).json({
//       success: true,

//       message:
//         "Expense deleted successfully",

//       data: expense,

//       notification,
//     });
//   } catch (error) {
//     if (session.inTransaction()) {
//       await session.abortTransaction();
//     }

//     console.error(
//       "❌ Delete expense error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to delete expense",
//       error: error.message,
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// // ============================================================
// // GET EXPENSE STATISTICS
// // ============================================================

// exports.getStats = async (
//   req,
//   res,
// ) => {
//   try {
//     const userId =
//       req.user?.id ||
//       req.query.userId;

//     if (
//       !userId ||
//       !mongoose.Types.ObjectId.isValid(
//         userId,
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid userId is required",
//       });
//     }

//     const objectUserId =
//       new mongoose.Types.ObjectId(
//         userId,
//       );

//     const summary =
//       await Expense.aggregate([
//         {
//           $match: {
//             userId:
//               objectUserId,
//           },
//         },
//         {
//           $group: {
//             _id: null,

//             totalAmount: {
//               $sum: "$amount",
//             },

//             totalCount: {
//               $sum: 1,
//             },

//             expenseAmount: {
//               $sum: {
//                 $cond: [
//                   {
//                     $eq: [
//                       "$type",
//                       "expense",
//                     ],
//                   },
//                   "$amount",
//                   0,
//                 ],
//               },
//             },

//             incomeAmount: {
//               $sum: {
//                 $cond: [
//                   {
//                     $eq: [
//                       "$type",
//                       "income",
//                     ],
//                   },
//                   "$amount",
//                   0,
//                 ],
//               },
//             },
//           },
//         },
//       ]);

//     const categoryBreakdown =
//       await Expense.aggregate([
//         {
//           $match: {
//             userId:
//               objectUserId,
//           },
//         },
//         {
//           $group: {
//             _id: "$category",

//             total: {
//               $sum: "$amount",
//             },

//             count: {
//               $sum: 1,
//             },
//           },
//         },
//         {
//           $sort: {
//             total: -1,
//           },
//         },
//       ]);

//     const twelveMonthsAgo =
//       new Date();

//     twelveMonthsAgo.setMonth(
//       twelveMonthsAgo.getMonth() -
//         12,
//     );

//     const monthlySummary =
//       await Expense.aggregate([
//         {
//           $match: {
//             userId:
//               objectUserId,

//             date: {
//               $gte:
//                 twelveMonthsAgo,
//             },
//           },
//         },
//         {
//           $group: {
//             _id: {
//               year: {
//                 $year: "$date",
//               },

//               month: {
//                 $month: "$date",
//               },
//             },

//             expense: {
//               $sum: {
//                 $cond: [
//                   {
//                     $eq: [
//                       "$type",
//                       "expense",
//                     ],
//                   },
//                   "$amount",
//                   0,
//                 ],
//               },
//             },

//             income: {
//               $sum: {
//                 $cond: [
//                   {
//                     $eq: [
//                       "$type",
//                       "income",
//                     ],
//                   },
//                   "$amount",
//                   0,
//                 ],
//               },
//             },

//             count: {
//               $sum: 1,
//             },
//           },
//         },
//         {
//           $sort: {
//             "_id.year": -1,
//             "_id.month": -1,
//           },
//         },
//         {
//           $limit: 12,
//         },
//       ]);

//     return res.status(200).json({
//       success: true,

//       data: {
//         summary:
//           summary[0] || {
//             totalAmount: 0,
//             totalCount: 0,
//             expenseAmount: 0,
//             incomeAmount: 0,
//           },

//         categoryBreakdown,

//         monthlySummary,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get expense statistics error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to fetch statistics",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // BULK DELETE
// //
// // Deletes only expense documents belonging to the user.
// // For financial safety, this endpoint intentionally does NOT
// // silently delete them without restoring their balances.
// // ============================================================

// exports.bulkDeleteExpenses = async (
//   req,
//   res,
// ) => {
//   try {
//     const {
//       expenseIds,
//     } = req.body;

//     const userId =
//       req.user?.id ||
//       req.body.userId;

//     if (
//       !Array.isArray(expenseIds) ||
//       expenseIds.length === 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Please provide an array of expense IDs",
//       });
//     }

//     if (
//       !userId ||
//       !mongoose.Types.ObjectId.isValid(
//         userId,
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Valid userId is required",
//       });
//     }

//     // --------------------------------------------------------
//     // IMPORTANT
//     //
//     // Financial records should be deleted one-by-one through
//     // deleteExpense so income, savings and budgets are restored.
//     // --------------------------------------------------------

//     let deletedCount = 0;

//     for (const expenseId of expenseIds) {
//       if (
//         !mongoose.Types.ObjectId.isValid(
//           expenseId,
//         )
//       ) {
//         continue;
//       }

//       const expense =
//         await Expense.findOne({
//           _id: expenseId,
//           userId,
//         });

//       if (!expense) {
//         continue;
//       }

//       // Restore income.
//       if (expense.incomeUsed > 0) {
//         const income =
//           await Income.findOne({
//             userId,
//           }).sort({
//             date: -1,
//             createdAt: -1,
//           });

//         if (income) {
//           income.remainingAmount =
//             Math.min(
//               Number(income.amount),
//               Number(
//                 income.remainingAmount,
//               ) +
//                 Number(
//                   expense.incomeUsed,
//                 ),
//             );

//           await income.save();
//         }
//       }

//       // Restore savings.
//       for (const allocation of
//         expense.savingsAllocations ||
//         []) {
//         const saving =
//           await Savings.findById(
//             allocation.savingsId,
//           );

//         if (!saving) continue;

//         saving.currentAmount +=
//           Number(
//             allocation.amount,
//           );

//         const target =
//           Number(
//             saving.targetAmount,
//           ) || 0;

//         saving.progress =
//           target > 0
//             ? Math.min(
//                 100,
//                 (saving.currentAmount /
//                   target) *
//                   100,
//               )
//             : 0;

//         saving.isCompleted =
//           saving.progress >= 100;

//         if (!saving.isCompleted) {
//           saving.completedDate =
//             null;
//         }

//         await saving.save();
//       }

//       // Restore budget.
//       if (expense.budgetId) {
//         const budget =
//           await Budget.findById(
//             expense.budgetId,
//           );

//         if (budget) {
//           budget.spentAmount =
//             Math.max(
//               0,
//               Number(
//                 budget.spentAmount,
//               ) -
//                 Number(
//                   expense.budgetAmountUsed ||
//                     expense.amount,
//                 ),
//             );

//           const allocated =
//             Number(
//               budget.allocatedAmount,
//             ) || 0;

//           budget.remainingAmount =
//             Math.max(
//               0,
//               allocated -
//                 budget.spentAmount,
//             );

//           budget.percentageUsed =
//             allocated > 0
//               ? (budget.spentAmount /
//                   allocated) *
//                 100
//               : 0;

//           if (
//             budget.percentageUsed >=
//             100
//           ) {
//             budget.status =
//               "over-budget";
//           } else if (
//             budget.percentageUsed >=
//             80
//           ) {
//             budget.status =
//               "approaching-limit";
//           } else if (
//             budget.percentageUsed <
//               50 &&
//             budget.spentAmount > 0
//           ) {
//             budget.status =
//               "under-budget";
//           } else {
//             budget.status =
//               "on-track";
//           }

//           await budget.save();
//         }
//       }

//       await Expense.findByIdAndDelete(
//         expense._id,
//       );

//       await createNotification({
//         userEmail:
//           expense.email,

//         userId:
//           expense.userId,

//         title:
//           "🗑️ Expense Deleted",

//         message:
//           `Your ${expense.category} expense ` +
//           `of RWF ${Number(
//             expense.amount,
//           ).toLocaleString()} was deleted.`,

//         type: "expense",

//         severity: "medium",

//         relatedId:
//           expense._id,

//         relatedType:
//           "Expense",

//         actionLink:
//           "/expenses",

//         metadata: {
//           expenseId:
//             expense._id,

//           amount:
//             expense.amount,

//           incomeRestored:
//             expense.incomeUsed,

//           savingsRestored:
//             expense.savingsUsed,
//         },
//       });

//       deletedCount++;
//     }

//     return res.status(200).json({
//       success: true,

//       message:
//         `${deletedCount} expenses deleted successfully`,

//       deletedCount,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Bulk delete expenses error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to delete expenses",
//       error: error.message,
//     });
//   }
// };

















// ============================================================
// CONTROLLERS / EXPENSECONTROLLER.JS
// ============================================================

const mongoose = require("mongoose");

const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Savings = require("../models/Savings");
const Budget = require("../models/Budget");
const Notification = require("../models/Notification");

// ============================================================
// CREATE NOTIFICATION HELPER
// ============================================================

const createNotification = async ({
  userEmail,
  userId,
  title,
  message,
  type = "system",
  severity = "low",
  relatedId = null,
  relatedType = "system",
  actionLink = "",
  metadata = {},
  session = null,
}) => {
  try {
    if (!userEmail || !userId) {
      console.error(
        "❌ Notification skipped: userEmail and userId are required"
      );

      return null;
    }

    const notificationData = {
      userEmail: String(userEmail).trim().toLowerCase(),

      userId,

      title: String(title || "").trim(),

      message: String(message || "").trim(),

      type,

      severity,

      isRead: false,

      readAt: null,

      relatedId,

      relatedType,

      actionLink: actionLink || "",

      metadata: metadata || {},
    };

    if (session) {
      const [notification] =
        await Notification.create(
          [notificationData],
          { session }
        );

      return notification;
    }

    return await Notification.create(
      notificationData
    );
  } catch (error) {
    console.error(
      "❌ Notification creation failed:",
      error.message
    );

    // Notification failure should NOT crash the
    // main operation when no transaction session
    // is being used.

    return null;
  }
};

// ============================================================
// VALID EXPENSE CATEGORIES
// ============================================================

const VALID_CATEGORIES = [
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
];

// ============================================================
// NORMALIZE EMAIL
// ============================================================

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

// ============================================================
// VALIDATE USER ID
// ============================================================

const validateUserId = (userId) => {
  return (
    userId &&
    mongoose.Types.ObjectId.isValid(userId)
  );
};

// ============================================================
// GET ALL EXPENSES
//
// IMPORTANT:
// This endpoint should normally be admin-only.
// It intentionally returns all expenses.
// ============================================================

exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({})
      .sort({
        date: -1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error(
      "❌ Get all expenses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch all expenses",
      error: error.message,
    });
  }
};

// ============================================================
// GET EXPENSES
//
// Uses authenticated req.user.id when available.
// Falls back to query userId/email for compatibility.
// ============================================================

exports.getExpenses = async (req, res) => {
  try {
    const {
      category,
      type,
      startDate,
      endDate,
      search,
      userId,
      email,
    } = req.query;

    const query = {};

    // --------------------------------------------------------
    // PRIMARY USER FILTER
    // --------------------------------------------------------

    if (req.user?.id) {
      query.userId = req.user.id;
    } else if (userId) {
      if (!validateUserId(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId",
        });
      }

      query.userId = userId;
    } else if (email) {
      query.email = normalizeEmail(email);
    }

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (
      category &&
      category.toLowerCase() !== "all"
    ) {
      query.category = category;
    }

    // --------------------------------------------------------
    // TYPE
    // --------------------------------------------------------

    if (
      type &&
      type.toLowerCase() !== "all"
    ) {
      query.type = type;
    }

    // --------------------------------------------------------
    // DATE
    // --------------------------------------------------------

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

        end.setHours(
          23,
          59,
          59,
          999
        );

        query.date.$lte = end;
      }
    }

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (search?.trim()) {
      const safeSearch =
        search.trim().replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

      query.$or = [
        {
          description: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          category: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          type: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          user: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          email: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    const expenses =
      await Expense.find(query)
        .sort({
          date: -1,
          createdAt: -1,
        })
        .lean();

    const total = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

    return res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      data: expenses,
    });
  } catch (error) {
    console.error(
      "❌ Get expenses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE EXPENSE
// ============================================================

exports.getExpense = async (req, res) => {
  try {
    const expense =
      await Expense.findById(
        req.params.id
      );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // --------------------------------------------------------
    // OWNERSHIP CHECK
    // --------------------------------------------------------

    if (
      req.user?.id &&
      expense.userId.toString() !==
        req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access this expense",
      });
    }

    return res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error(
      "❌ Get expense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expense",
      error: error.message,
    });
  }
};

// ============================================================
// GET EXPENSES BY USER ID
// ============================================================

exports.getExpensesByUserId = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    if (!validateUserId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // Prevent one authenticated user
    // from reading another user's data.

    if (
      req.user?.id &&
      req.user.id.toString() !==
        userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access these expenses",
      });
    }

    const expenses =
      await Expense.find({ userId })
        .sort({
          date: -1,
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error(
      "❌ Get expenses by userId error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user expenses",
      error: error.message,
    });
  }
};

// ============================================================
// GET EXPENSES BY EMAIL
// ============================================================

exports.getExpensesByEmail = async (
  req,
  res
) => {
  try {
    const email = normalizeEmail(
      req.params.email
    );

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // If authenticated, make sure the
    // requested email belongs to the user.

    if (
      req.user?.email &&
      normalizeEmail(req.user.email) !==
        email
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access these expenses",
      });
    }

    const expenses =
      await Expense.find({ email })
        .sort({
          date: -1,
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error(
      "❌ Get expenses by email error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
};

// ============================================================
// CREATE EXPENSE
//
// MONEY FLOW:
//
// 1. Income remainingAmount
// 2. Savings currentAmount
//
// Savings are ONLY touched after income is exhausted.
//
// Everything happens inside ONE transaction.
// ============================================================

exports.createExpense = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const {
      description,
      category,
      amount,
      date,
      user,
      email,
      userId,
    } = req.body;

    // ========================================================
    // VALIDATION
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
          "Description, category, amount, date, user, email, and userId are required",
      });
    }

    if (!validateUserId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // --------------------------------------------------------
    // Authenticated user ownership
    // --------------------------------------------------------

    if (
      req.user?.id &&
      req.user.id.toString() !==
        userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot create an expense for another user",
      });
    }

    const normalizedEmail =
      normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    // --------------------------------------------------------
    // Authenticated email ownership
    // --------------------------------------------------------

    if (
      req.user?.email &&
      normalizeEmail(req.user.email) !==
        normalizedEmail
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Email does not belong to the authenticated user",
      });
    }

    const normalizedDescription =
      String(description).trim();

    const normalizedUser =
      String(user).trim();

    if (!normalizedDescription) {
      return res.status(400).json({
        success: false,
        message:
          "Description cannot be empty",
      });
    }

    if (!normalizedUser) {
      return res.status(400).json({
        success: false,
        message:
          "User name cannot be empty",
      });
    }

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (
      !VALID_CATEGORIES.includes(category)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid expense category",
      });
    }

    // --------------------------------------------------------
    // AMOUNT
    // --------------------------------------------------------

    const expenseAmount =
      Number(amount);

    if (
      !Number.isFinite(expenseAmount) ||
      !Number.isInteger(expenseAmount) ||
      expenseAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Amount must be a positive whole number",
      });
    }

    // --------------------------------------------------------
    // DATE
    // --------------------------------------------------------

    const expenseDate =
      new Date(date);

    if (
      Number.isNaN(
        expenseDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense date",
      });
    }

    // ========================================================
    // START TRANSACTION
    // ========================================================

    session.startTransaction();

    // ========================================================
    // FIND AVAILABLE INCOME
    //
    // Oldest income first.
    // ========================================================

    const incomeList =
      await Income.find({
        userId,
        remainingAmount: {
          $gt: 0,
        },
      })
        .sort({
          date: 1,
          createdAt: 1,
        })
        .session(session);

    // ========================================================
    // FIND AVAILABLE SAVINGS
    //
    // Savings are only used after income.
    // ========================================================

    const savingsList =
      await Savings.find({
        userId,
        currentAmount: {
          $gt: 0,
        },
      })
        .sort({
          priority: -1,
          createdAt: 1,
        })
        .session(session);

    // ========================================================
    // TOTAL AVAILABLE
    // ========================================================

    const totalIncome =
      incomeList.reduce(
        (sum, income) =>
          sum +
          Number(
            income.remainingAmount || 0
          ),
        0
      );

    const totalSavings =
      savingsList.reduce(
        (sum, saving) =>
          sum +
          Number(
            saving.currentAmount || 0
          ),
        0
      );

    const totalAvailable =
      totalIncome + totalSavings;

    // ========================================================
    // NO MONEY
    // ========================================================

    if (totalAvailable <= 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Cannot create expense. Your income and savings are both empty.",
        availableBalance: 0,
      });
    }

    // ========================================================
    // INSUFFICIENT MONEY
    // ========================================================

    if (
      expenseAmount >
      totalAvailable
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Insufficient income and savings to cover this expense.",
        expenseAmount,
        totalIncome,
        totalSavings,
        availableBalance:
          totalAvailable,
        missingAmount:
          expenseAmount -
          totalAvailable,
      });
    }

    // ========================================================
    // TRACK MONEY
    // ========================================================

    let remainingExpense =
      expenseAmount;

    let incomeUsed = 0;

    let savingsUsed = 0;

    const savingsAllocations = [];

    // ========================================================
    // USE INCOME FIRST
    // ========================================================

    for (
      const income of incomeList
    ) {
      if (
        remainingExpense <= 0
      ) {
        break;
      }

      const availableIncome =
        Number(
          income.remainingAmount || 0
        );

      if (
        availableIncome <= 0
      ) {
        continue;
      }

      const amountFromIncome =
        Math.min(
          availableIncome,
          remainingExpense
        );

      income.remainingAmount =
        availableIncome -
        amountFromIncome;

      if (
        income.remainingAmount <
        0
      ) {
        income.remainingAmount = 0;
      }

      await income.save({
        session,
        validateBeforeSave: true,
      });

      incomeUsed +=
        amountFromIncome;

      remainingExpense -=
        amountFromIncome;
    }

    // ========================================================
    // USE SAVINGS ONLY AFTER INCOME IS EMPTY
    // ========================================================

    if (
      remainingExpense > 0
    ) {
      for (
        const saving of savingsList
      ) {
        if (
          remainingExpense <= 0
        ) {
          break;
        }

        const availableSavings =
          Number(
            saving.currentAmount || 0
          );

        if (
          availableSavings <= 0
        ) {
          continue;
        }

        const amountFromSavings =
          Math.min(
            availableSavings,
            remainingExpense
          );

        saving.currentAmount =
          availableSavings -
          amountFromSavings;

        if (
          saving.currentAmount <
          0
        ) {
          saving.currentAmount = 0;
        }

        // ----------------------------------------------------
        // Recalculate savings progress if
        // your Savings model supports progress.
        // ----------------------------------------------------

        if (
          Number(
            saving.targetAmount
          ) > 0
        ) {
          saving.progress =
            Math.min(
              100,
              (
                Number(
                  saving.currentAmount
                ) /
                Number(
                  saving.targetAmount
                )
              ) *
                100
            );

          saving.isCompleted =
            saving.currentAmount >=
            saving.targetAmount;

          if (
            saving.isCompleted &&
            !saving.completedDate
          ) {
            saving.completedDate =
              new Date();
          }
        }

        await saving.save({
          session,
          validateBeforeSave: true,
        });

        savingsUsed +=
          amountFromSavings;

        remainingExpense -=
          amountFromSavings;

        savingsAllocations.push({
          savingsId:
            saving._id,

          amount:
            amountFromSavings,
        });
      }
    }

    // ========================================================
    // FINAL MONEY SAFETY CHECK
    // ========================================================

    if (
      remainingExpense > 0
    ) {
      throw new Error(
        "Money allocation failed. Transaction rolled back."
      );
    }

    // ========================================================
    // FIND BUDGET
    // ========================================================

    const budgetMonth =
      expenseDate.getMonth();

    const budgetYear =
      expenseDate.getFullYear();

    const budget =
      await Budget.findOne({
        userId,
        category,
        month: budgetMonth,
        year: budgetYear,
      }).session(session);

    let budgetUpdated =
      false;

    // ========================================================
    // UPDATE BUDGET
    // ========================================================

    if (budget) {
      const currentSpent =
        Number(
          budget.spentAmount || 0
        );

      budget.spentAmount =
        currentSpent +
        expenseAmount;

      // ------------------------------------------------------
      // Do NOT cap percentage at 100.
      //
      // 120% must remain 120% so the status can
      // correctly become "over-budget".
      // ------------------------------------------------------

      budget.percentageUsed =
        budget.allocatedAmount >
        0
          ? (
              budget.spentAmount /
              budget.allocatedAmount
            ) * 100
          : 0;

      budget.remainingAmount =
        Math.max(
          0,
          Number(
            budget.allocatedAmount ||
              0
          ) -
            budget.spentAmount
        );

      if (
        budget.percentageUsed >
        100
      ) {
        budget.status =
          "over-budget";
      } else if (
        budget.percentageUsed >=
        80
      ) {
        budget.status =
          "approaching-limit";
      } else if (
        budget.percentageUsed <
          50 &&
        budget.spentAmount > 0
      ) {
        budget.status =
          "under-budget";
      } else {
        budget.status =
          "on-track";
      }

      await budget.save({
        session,
        validateBeforeSave: true,
      });

      budgetUpdated = true;
    }

    // ========================================================
    // CREATE EXPENSE
    // ========================================================

    const [
      expense,
    ] = await Expense.create(
      [
        {
          description:
            normalizedDescription,

          category,

          type: "expense",

          amount:
            expenseAmount,

          date:
            expenseDate,

          user:
            normalizedUser,

          userId,

          email:
            normalizedEmail,

          incomeUsed,

          savingsUsed,

          savingsAllocations,

          budgetId:
            budget
              ? budget._id
              : null,

          budgetAmountUsed:
            budget
              ? expenseAmount
              : 0,
        },
      ],
      {
        session,
      }
    );

    // ========================================================
    // EXPENSE NOTIFICATION
    // ========================================================

    const expenseNotification =
      await createNotification({
        userEmail:
          normalizedEmail,

        userId,

        title:
          "💸 Expense Recorded",

        message:
          `You spent RWF ${expenseAmount.toLocaleString()} on ${category}.`,

        type:
          "expense",

        severity:
          "low",

        relatedId:
          expense._id,

        relatedType:
          "expense",

        actionLink:
          `/expenses/${expense._id}`,

        metadata: {
          expenseId:
            expense._id,

          amount:
            expenseAmount,

          category,

          incomeUsed,

          savingsUsed,

          budgetUpdated,
        },

        session,
      });

    // ========================================================
    // BUDGET NOTIFICATION
    // ========================================================

    let budgetNotification =
      null;

    if (budget) {
      let severity =
        "low";

      let title =
        "📊 Budget Updated";

      if (
        budget.percentageUsed >
        100
      ) {
        severity =
          "high";

        title =
          "🚨 Budget Exceeded";
      } else if (
        budget.percentageUsed >=
        80
      ) {
        severity =
          "medium";

        title =
          "⚠️ Budget Almost Used";
      }

      budgetNotification =
        await createNotification({
          userEmail:
            normalizedEmail,

          userId,

          title,

          message:
            `${category} budget: spent RWF ${Number(
              budget.spentAmount || 0
            ).toLocaleString()} of RWF ${Number(
              budget.allocatedAmount || 0
            ).toLocaleString()}. Remaining: RWF ${Number(
              budget.remainingAmount || 0
            ).toLocaleString()}.`,

          type:
            "budget",

          severity,

          relatedId:
            budget._id,

          relatedType:
            "budget",

          actionLink:
            `/budgets/${budget._id}`,

          metadata: {
            budgetId:
              budget._id,

            expenseId:
              expense._id,

            category,

            allocatedAmount:
              budget.allocatedAmount,

            spentAmount:
              budget.spentAmount,

            remainingAmount:
              budget.remainingAmount,

            percentageUsed:
              budget.percentageUsed,

            status:
              budget.status,

            expenseAmount,
          },

          session,
        });
    }

    // ========================================================
    // COMMIT TRANSACTION
    // ========================================================

    await session.commitTransaction();

    // ========================================================
    // FINAL BALANCES
    // ========================================================

    const remainingIncome =
      totalIncome -
      incomeUsed;

    const remainingSavings =
      totalSavings -
      savingsUsed;

    const remainingTotal =
      remainingIncome +
      remainingSavings;

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,

      message:
        "Expense created successfully",

      data:
        expense,

      moneyUsed: {
        expenseAmount,

        incomeUsed,

        savingsUsed,
      },

      balances: {
        income:
          remainingIncome,

        savings:
          remainingSavings,

        total:
          remainingTotal,
      },

      budgetUpdated,

      budget: budget
        ? {
            id:
              budget._id,

            category:
              budget.category,

            allocatedAmount:
              budget.allocatedAmount,

            spentAmount:
              budget.spentAmount,

            remainingAmount:
              budget.remainingAmount,

            percentageUsed:
              Number(
                budget.percentageUsed.toFixed(
                  2
                )
              ),

            status:
              budget.status,

            month:
              budget.month,

            year:
              budget.year,
          }
        : null,

      notifications: {
        expense:
          expenseNotification,

        budget:
          budgetNotification,
      },
    });
  } catch (error) {
    // ========================================================
    // ROLLBACK
    // ========================================================

    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    console.error(
      "❌ Create expense error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to create expense",

      error:
        error.message,
    });
  } finally {
    await session.endSession();
  }
};

// ============================================================
// UPDATE EXPENSE
//
// IMPORTANT:
// Because an expense already consumed money, changing the
// amount/category/date should NOT simply update the document.
//
// We restore the old allocation and then allocate the new
// expense again.
// ============================================================

exports.updateExpense = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const expense =
      await Expense.findById(
        req.params.id
      ).session(session);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message:
          "Expense not found",
      });
    }

    // --------------------------------------------------------
    // Ownership
    // --------------------------------------------------------

    if (
      req.user?.id &&
      expense.userId.toString() !==
        req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this expense",
      });
    }

    const {
      description,
      category,
      amount,
      date,
      user,
    } = req.body;

    const newDescription =
      description !== undefined
        ? String(description).trim()
        : expense.description;

    const newCategory =
      category !== undefined
        ? category
        : expense.category;

    const newAmount =
      amount !== undefined
        ? Number(amount)
        : expense.amount;

    const newDate =
      date !== undefined
        ? new Date(date)
        : new Date(expense.date);

    const newUser =
      user !== undefined
        ? String(user).trim()
        : expense.user;

    // --------------------------------------------------------
    // Validate
    // --------------------------------------------------------

    if (!newDescription) {
      return res.status(400).json({
        success: false,
        message:
          "Description cannot be empty",
      });
    }

    if (
      !VALID_CATEGORIES.includes(
        newCategory
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid expense category",
      });
    }

    if (
      !Number.isFinite(newAmount) ||
      !Number.isInteger(newAmount) ||
      newAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Amount must be a positive whole number",
      });
    }

    if (
      Number.isNaN(
        newDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid expense date",
      });
    }

    session.startTransaction();

    // ========================================================
    // RESTORE OLD INCOME
    // ========================================================

    if (
      Number(expense.incomeUsed) >
      0
    ) {
      let remainingRestore =
        Number(
          expense.incomeUsed
        );

      const oldIncomeList =
        await Income.find({
          userId:
            expense.userId,

          date: {
            $lte: new Date(
              expense.date
            ),
          },
        })
          .sort({
            date: -1,
            createdAt: -1,
          })
          .session(session);

      // Restore to most recent income first.
      for (
        const income of oldIncomeList
      ) {
        if (
          remainingRestore <=
          0
        ) {
          break;
        }

        const originalAmount =
          Number(
            income.amount || 0
          );

        const currentRemaining =
          Number(
            income.remainingAmount ||
              0
          );

        const capacity =
          Math.max(
            0,
            originalAmount -
              currentRemaining
          );

        if (capacity <= 0) {
          continue;
        }

        const restoreAmount =
          Math.min(
            capacity,
            remainingRestore
          );

        income.remainingAmount =
          currentRemaining +
          restoreAmount;

        await income.save({
          session,
          validateBeforeSave:
            true,
        });

        remainingRestore -=
          restoreAmount;
      }

      if (
        remainingRestore > 0
      ) {
        throw new Error(
          "Could not restore the income used by this expense."
        );
      }
    }

    // ========================================================
    // RESTORE SAVINGS
    // ========================================================

    for (
      const allocation of
        expense.savingsAllocations ||
        []
    ) {
      const saving =
        await Savings.findOne({
          _id:
            allocation.savingsId,

          userId:
            expense.userId,
        }).session(session);

      if (!saving) {
        throw new Error(
          "A savings account used by this expense could not be found."
        );
      }

      saving.currentAmount =
        Number(
          saving.currentAmount || 0
        ) +
        Number(
          allocation.amount || 0
        );

      if (
        Number(
          saving.targetAmount
        ) > 0
      ) {
        saving.progress =
          Math.min(
            100,
            (
              saving.currentAmount /
              saving.targetAmount
            ) *
              100
          );

        saving.isCompleted =
          saving.currentAmount >=
          saving.targetAmount;

        if (
          !saving.isCompleted
        ) {
          saving.completedDate =
            null;
        }
      }

      await saving.save({
        session,
        validateBeforeSave:
          true,
      });
    }

    // ========================================================
    // REVERSE OLD BUDGET
    // ========================================================

    if (expense.budgetId) {
      const oldBudget =
        await Budget.findOne({
          _id:
            expense.budgetId,

          userId:
            expense.userId,
        }).session(session);

      if (oldBudget) {
        oldBudget.spentAmount =
          Math.max(
            0,
            Number(
              oldBudget.spentAmount ||
                0
            ) -
              Number(
                expense.amount ||
                  0
              )
          );

        oldBudget.percentageUsed =
          oldBudget.allocatedAmount >
          0
            ? (
                oldBudget.spentAmount /
                oldBudget.allocatedAmount
              ) * 100
            : 0;

        oldBudget.remainingAmount =
          Math.max(
            0,
            Number(
              oldBudget.allocatedAmount ||
                0
            ) -
              oldBudget.spentAmount
          );

        if (
          oldBudget.percentageUsed >
          100
        ) {
          oldBudget.status =
            "over-budget";
        } else if (
          oldBudget.percentageUsed >=
          80
        ) {
          oldBudget.status =
            "approaching-limit";
        } else if (
          oldBudget.percentageUsed <
            50 &&
          oldBudget.spentAmount >
            0
        ) {
          oldBudget.status =
            "under-budget";
        } else {
          oldBudget.status =
            "on-track";
        }

        await oldBudget.save({
          session,
          validateBeforeSave:
            true,
        });
      }
    }

    // ========================================================
    // FIND NEW AVAILABLE MONEY
    // ========================================================

    const incomeList =
      await Income.find({
        userId:
          expense.userId,

        remainingAmount: {
          $gt: 0,
        },
      })
        .sort({
          date: 1,
          createdAt: 1,
        })
        .session(session);

    const savingsList =
      await Savings.find({
        userId:
          expense.userId,

        currentAmount: {
          $gt: 0,
        },
      })
        .sort({
          priority: -1,
          createdAt: 1,
        })
        .session(session);

    let remainingExpense =
      newAmount;

    let incomeUsed = 0;

    let savingsUsed = 0;

    const savingsAllocations =
      [];

    // ========================================================
    // USE INCOME FIRST
    // ========================================================

    for (
      const income of incomeList
    ) {
      if (
        remainingExpense <=
        0
      ) {
        break;
      }

      const available =
        Number(
          income.remainingAmount ||
            0
        );

      const used =
        Math.min(
          available,
          remainingExpense
        );

      if (used <= 0) {
        continue;
      }

      income.remainingAmount =
        available - used;

      await income.save({
        session,
        validateBeforeSave:
          true,
      });

      incomeUsed += used;

      remainingExpense -=
        used;
    }

    // ========================================================
    // USE SAVINGS
    // ========================================================

    if (
      remainingExpense > 0
    ) {
      for (
        const saving of savingsList
      ) {
        if (
          remainingExpense <=
          0
        ) {
          break;
        }

        const available =
          Number(
            saving.currentAmount ||
              0
          );

        const used =
          Math.min(
            available,
            remainingExpense
          );

        if (used <= 0) {
          continue;
        }

        saving.currentAmount =
          available - used;

        if (
          Number(
            saving.targetAmount
          ) > 0
        ) {
          saving.progress =
            Math.min(
              100,
              (
                saving.currentAmount /
                saving.targetAmount
              ) *
                100
            );

          saving.isCompleted =
            saving.currentAmount >=
            saving.targetAmount;
        }

        await saving.save({
          session,
          validateBeforeSave:
            true,
        });

        savingsUsed += used;

        remainingExpense -=
          used;

        savingsAllocations.push({
          savingsId:
            saving._id,

          amount: used,
        });
      }
    }

    // ========================================================
    // INSUFFICIENT MONEY
    // ========================================================

    if (
      remainingExpense > 0
    ) {
      throw new Error(
        "Insufficient income and savings to update this expense."
      );
    }

    // ========================================================
    // FIND NEW BUDGET
    // ========================================================

    const newBudget =
      await Budget.findOne({
        userId:
          expense.userId,

        category:
          newCategory,

        month:
          newDate.getMonth(),

        year:
          newDate.getFullYear(),
      }).session(session);

    if (newBudget) {
      newBudget.spentAmount =
        Number(
          newBudget.spentAmount ||
            0
        ) + newAmount;

      newBudget.percentageUsed =
        newBudget.allocatedAmount >
        0
          ? (
              newBudget.spentAmount /
              newBudget.allocatedAmount
            ) * 100
          : 0;

      newBudget.remainingAmount =
        Math.max(
          0,
          Number(
            newBudget.allocatedAmount ||
              0
          ) -
            newBudget.spentAmount
        );

      if (
        newBudget.percentageUsed >
        100
      ) {
        newBudget.status =
          "over-budget";
      } else if (
        newBudget.percentageUsed >=
        80
      ) {
        newBudget.status =
          "approaching-limit";
      } else if (
        newBudget.percentageUsed <
          50 &&
        newBudget.spentAmount >
          0
      ) {
        newBudget.status =
          "under-budget";
      } else {
        newBudget.status =
          "on-track";
      }

      await newBudget.save({
        session,
        validateBeforeSave:
          true,
      });
    }

    // ========================================================
    // UPDATE EXPENSE
    // ========================================================

    expense.description =
      newDescription;

    expense.category =
      newCategory;

    expense.amount =
      newAmount;

    expense.date =
      newDate;

    expense.user =
      newUser;

    expense.incomeUsed =
      incomeUsed;

    expense.savingsUsed =
      savingsUsed;

    expense.savingsAllocations =
      savingsAllocations;

    expense.budgetId =
      newBudget
        ? newBudget._id
        : null;

    expense.budgetAmountUsed =
      newBudget
        ? newAmount
        : 0;

    await expense.save({
      session,
      validateBeforeSave:
        true,
    });

    // ========================================================
    // NOTIFICATION
    // ========================================================

    await createNotification({
      userEmail:
        expense.email,

      userId:
        expense.userId,

      title:
        "📝 Expense Updated",

      message:
        `Your ${newCategory} expense was updated to RWF ${newAmount.toLocaleString()}.`,

      type:
        "expense",

      severity:
        "low",

      relatedId:
        expense._id,

      relatedType:
        "expense",

      actionLink:
        `/expenses/${expense._id}`,

      metadata: {
        expenseId:
          expense._id,

        amount:
          newAmount,

        category:
          newCategory,

        incomeUsed,

        savingsUsed,

        budgetId:
          newBudget
            ? newBudget._id
            : null,
      },

      session,
    });

    // ========================================================
    // COMMIT
    // ========================================================

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message:
        "Expense updated successfully",
      data: expense,
    });
  } catch (error) {
    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    console.error(
      "❌ Update expense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update expense",
      error:
        error.message,
    });
  } finally {
    await session.endSession();
  }
};

// ============================================================
// DELETE EXPENSE
//
// Restores:
// - incomeUsed -> Income.remainingAmount
// - savingsUsed -> Savings.currentAmount
// - expense amount -> Budget.spentAmount
//
// Everything is atomic.
// ============================================================

exports.deleteExpense = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const expense =
      await Expense.findById(
        req.params.id
      ).session(session);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message:
          "Expense not found",
      });
    }

    // --------------------------------------------------------
    // Ownership
    // --------------------------------------------------------

    if (
      req.user?.id &&
      expense.userId.toString() !==
        req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this expense",
      });
    }

    session.startTransaction();

    // ========================================================
    // RESTORE INCOME
    // ========================================================

    if (
      Number(expense.incomeUsed) >
      0
    ) {
      let amountToRestore =
        Number(
          expense.incomeUsed
        );

      const incomeList =
        await Income.find({
          userId:
            expense.userId,
        })
          .sort({
            date: -1,
            createdAt: -1,
          })
          .session(session);

      for (
        const income of incomeList
      ) {
        if (
          amountToRestore <=
          0
        ) {
          break;
        }

        const originalAmount =
          Number(
            income.amount || 0
          );

        const currentRemaining =
          Number(
            income.remainingAmount ||
              0
          );

        const capacity =
          Math.max(
            0,
            originalAmount -
              currentRemaining
          );

        if (capacity <= 0) {
          continue;
        }

        const restore =
          Math.min(
            capacity,
            amountToRestore
          );

        income.remainingAmount =
          currentRemaining +
          restore;

        await income.save({
          session,
          validateBeforeSave:
            true,
        });

        amountToRestore -=
          restore;
      }

      if (
        amountToRestore >
        0
      ) {
        throw new Error(
          "Could not restore the income used by this expense."
        );
      }
    }

    // ========================================================
    // RESTORE SAVINGS
    // ========================================================

    for (
      const allocation of
        expense.savingsAllocations ||
        []
    ) {
      const saving =
        await Savings.findOne({
          _id:
            allocation.savingsId,

          userId:
            expense.userId,
        }).session(session);

      if (!saving) {
        throw new Error(
          "A savings account used by this expense could not be found."
        );
      }

      saving.currentAmount =
        Number(
          saving.currentAmount ||
            0
        ) +
        Number(
          allocation.amount || 0
        );

      if (
        Number(
          saving.targetAmount
        ) > 0
      ) {
        saving.progress =
          Math.min(
            100,
            (
              saving.currentAmount /
              saving.targetAmount
            ) *
              100
          );

        saving.isCompleted =
          saving.currentAmount >=
          saving.targetAmount;

        if (
          !saving.isCompleted
        ) {
          saving.completedDate =
            null;
        }
      }

      await saving.save({
        session,
        validateBeforeSave:
          true,
      });
    }

    // ========================================================
    // RESTORE BUDGET
    // ========================================================

    if (expense.budgetId) {
      const budget =
        await Budget.findOne({
          _id:
            expense.budgetId,

          userId:
            expense.userId,
        }).session(session);

      if (budget) {
        budget.spentAmount =
          Math.max(
            0,
            Number(
              budget.spentAmount ||
                0
            ) -
              Number(
                expense.amount ||
                  0
              )
          );

        budget.percentageUsed =
          budget.allocatedAmount >
          0
            ? (
                budget.spentAmount /
                budget.allocatedAmount
              ) * 100
            : 0;

        budget.remainingAmount =
          Math.max(
            0,
            Number(
              budget.allocatedAmount ||
                0
            ) -
              budget.spentAmount
          );

        if (
          budget.percentageUsed >
          100
        ) {
          budget.status =
            "over-budget";
        } else if (
          budget.percentageUsed >=
          80
        ) {
          budget.status =
            "approaching-limit";
        } else if (
          budget.percentageUsed <
            50 &&
          budget.spentAmount >
            0
        ) {
          budget.status =
            "under-budget";
        } else {
          budget.status =
            "on-track";
        }

        await budget.save({
          session,
          validateBeforeSave:
            true,
        });
      }
    }

    // ========================================================
    // DELETE EXPENSE
    // ========================================================

    await Expense.deleteOne(
      {
        _id:
          expense._id,
      },
      {
        session,
      }
    );

    // ========================================================
    // DELETE NOTIFICATION
    //
    // Remove notifications directly related to
    // this expense.
    // ========================================================

    await Notification.deleteMany(
      {
        userId:
          expense.userId,

        relatedId:
          expense._id,

        relatedType:
          "expense",
      },
      {
        session,
      }
    );

    // ========================================================
    // CREATE DELETE NOTIFICATION
    // ========================================================

    await createNotification({
      userEmail:
        expense.email,

      userId:
        expense.userId,

      title:
        "🗑️ Expense Deleted",

      message:
        `Your ${expense.category} expense of RWF ${Number(
          expense.amount || 0
        ).toLocaleString()} was deleted.`,

      type:
        "expense",

      severity:
        "medium",

      relatedId:
        null,

      relatedType:
        "system",

      actionLink:
        "/expenses",

      metadata: {
        deletedExpenseId:
          expense._id,

        amount:
          expense.amount,

        category:
          expense.category,

        incomeRestored:
          expense.incomeUsed,

        savingsRestored:
          expense.savingsUsed,
      },

      session,
    });

    // ========================================================
    // COMMIT
    // ========================================================

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message:
        "Expense deleted successfully",

      restored: {
        income:
          expense.incomeUsed,

        savings:
          expense.savingsUsed,

        total:
          Number(
            expense.incomeUsed || 0
          ) +
          Number(
            expense.savingsUsed || 0
          ),
      },
    });
  } catch (error) {
    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    console.error(
      "❌ Delete expense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete expense",
      error:
        error.message,
    });
  } finally {
    await session.endSession();
  }
};

// ============================================================
// GET EXPENSE STATISTICS
// ============================================================

exports.getStats = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?.id ||
      req.query.userId;

    if (!validateUserId(userId)) {
      return res.status(400).json({
        success: false,
        message:
          "Valid userId is required",
      });
    }

    if (
      req.user?.id &&
      req.user.id.toString() !==
        userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access these statistics",
      });
    }

    const objectUserId =
      new mongoose.Types.ObjectId(
        userId
      );

    // ========================================================
    // BASIC SUMMARY
    // ========================================================

    const summary =
      await Expense.aggregate([
        {
          $match: {
            userId:
              objectUserId,

            type:
              "expense",
          },
        },
        {
          $group: {
            _id: null,

            totalAmount: {
              $sum: "$amount",
            },

            count: {
              $sum: 1,
            },

            totalIncomeUsed: {
              $sum: "$incomeUsed",
            },

            totalSavingsUsed: {
              $sum: "$savingsUsed",
            },
          },
        },
      ]);

    // ========================================================
    // CATEGORY BREAKDOWN
    // ========================================================

    const categoryBreakdown =
      await Expense.aggregate([
        {
          $match: {
            userId:
              objectUserId,

            type:
              "expense",
          },
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

    // ========================================================
    // MONTHLY SUMMARY
    // ========================================================

    const twelveMonthsAgo =
      new Date();

    twelveMonthsAgo.setMonth(
      twelveMonthsAgo.getMonth() -
        12
    );

    const monthlySummary =
      await Expense.aggregate([
        {
          $match: {
            userId:
              objectUserId,

            date: {
              $gte:
                twelveMonthsAgo,
            },

            type:
              "expense",
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
        {
          $limit: 12,
        },
      ]);

    return res.status(200).json({
      success: true,

      data: {
        summary:
          summary[0] || {
            totalAmount: 0,
            count: 0,
            totalIncomeUsed: 0,
            totalSavingsUsed: 0,
          },

        categoryBreakdown,

        monthlySummary,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get expense statistics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch expense statistics",
      error:
        error.message,
    });
  }
};

// ============================================================
// BULK DELETE EXPENSES
//
// This version intentionally restores money and budgets for
// EVERY deleted expense. Do not use deleteMany directly because
// that would leave Income/Savings/Budget balances incorrect.
// ============================================================

exports.bulkDeleteExpenses = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const { expenseIds } =
      req.body;

    if (
      !Array.isArray(expenseIds) ||
      expenseIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide an array of expense IDs",
      });
    }

    // --------------------------------------------------------
    // Validate IDs
    // --------------------------------------------------------

    const invalidIds =
      expenseIds.some(
        (id) =>
          !mongoose.Types.ObjectId.isValid(
            id
          )
      );

    if (invalidIds) {
      return res.status(400).json({
        success: false,
        message:
          "One or more expense IDs are invalid",
      });
    }

    session.startTransaction();

    const expenses =
      await Expense.find({
        _id: {
          $in: expenseIds,
        },

        ...(req.user?.id
          ? {
              userId:
                req.user.id,
            }
          : {}),
      }).session(session);

    if (
      expenses.length === 0
    ) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message:
          "No expenses found",
      });
    }

    // --------------------------------------------------------
    // Restore each expense individually.
    //
    // Reuse the same restoration logic inline.
    // --------------------------------------------------------

    for (
      const expense of expenses
    ) {
      // Restore income
      if (
        Number(
          expense.incomeUsed
        ) > 0
      ) {
        let restoreAmount =
          Number(
            expense.incomeUsed
          );

        const incomes =
          await Income.find({
            userId:
              expense.userId,
          })
            .sort({
              date: -1,
              createdAt: -1,
            })
            .session(session);

        for (
          const income of incomes
        ) {
          if (
            restoreAmount <=
            0
          ) {
            break;
          }

          const original =
            Number(
              income.amount || 0
            );

          const remaining =
            Number(
              income.remainingAmount ||
                0
            );

          const capacity =
            Math.max(
              0,
              original -
                remaining
            );

          if (
            capacity <= 0
          ) {
            continue;
          }

          const restore =
            Math.min(
              capacity,
              restoreAmount
            );

          income.remainingAmount =
            remaining +
            restore;

          await income.save({
            session,
            validateBeforeSave:
              true,
          });

          restoreAmount -=
            restore;
        }

        if (
          restoreAmount > 0
        ) {
          throw new Error(
            `Could not restore income for expense ${expense._id}`
          );
        }
      }

      // Restore savings
      for (
        const allocation of
          expense.savingsAllocations ||
          []
      ) {
        const saving =
          await Savings.findOne({
            _id:
              allocation.savingsId,

            userId:
              expense.userId,
          }).session(
            session
          );

        if (!saving) {
          throw new Error(
            `Could not find savings ${allocation.savingsId}`
          );
        }

        saving.currentAmount =
          Number(
            saving.currentAmount ||
              0
          ) +
          Number(
            allocation.amount ||
              0
          );

        if (
          Number(
            saving.targetAmount
          ) > 0
        ) {
          saving.progress =
            Math.min(
              100,
              (
                saving.currentAmount /
                saving.targetAmount
              ) *
                100
            );

          saving.isCompleted =
            saving.currentAmount >=
            saving.targetAmount;
        }

        await saving.save({
          session,
          validateBeforeSave:
            true,
        });
      }

      // Restore budget
      if (
        expense.budgetId
      ) {
        const budget =
          await Budget.findOne({
            _id:
              expense.budgetId,

            userId:
              expense.userId,
          }).session(
            session
          );

        if (budget) {
          budget.spentAmount =
            Math.max(
              0,
              Number(
                budget.spentAmount ||
                  0
              ) -
                Number(
                  expense.amount ||
                    0
                )
            );

          budget.percentageUsed =
            budget.allocatedAmount >
            0
              ? (
                  budget.spentAmount /
                  budget.allocatedAmount
                ) * 100
              : 0;

          budget.remainingAmount =
            Math.max(
              0,
              Number(
                budget.allocatedAmount ||
                  0
              ) -
                budget.spentAmount
            );

          if (
            budget.percentageUsed >
            100
          ) {
            budget.status =
              "over-budget";
          } else if (
            budget.percentageUsed >=
            80
          ) {
            budget.status =
              "approaching-limit";
          } else if (
            budget.percentageUsed <
              50 &&
            budget.spentAmount >
              0
          ) {
            budget.status =
              "under-budget";
          } else {
            budget.status =
              "on-track";
          }

          await budget.save({
            session,
            validateBeforeSave:
              true,
          });
        }
      }

      // Remove expense notifications
      await Notification.deleteMany(
        {
          userId:
            expense.userId,

          relatedId:
            expense._id,

          relatedType:
            "expense",
        },
        {
          session,
        }
      );
    }

    // ========================================================
    // DELETE EXPENSES
    // ========================================================

    const deleteResult =
      await Expense.deleteMany(
        {
          _id: {
            $in: expenses.map(
              (expense) =>
                expense._id
            ),
          },
        },
        {
          session,
        }
      );

    // ========================================================
    // CREATE ONE BULK NOTIFICATION
    // ========================================================

    if (req.user?.id) {
      const userEmail =
        req.user.email;

      if (userEmail) {
        await createNotification({
          userEmail,

          userId:
            req.user.id,

          title:
            "🗑️ Expenses Deleted",

          message:
            `${deleteResult.deletedCount} expense(s) were deleted and the used money was restored.`,

          type:
            "expense",

          severity:
            "medium",

          relatedType:
            "system",

          actionLink:
            "/expenses",

          metadata: {
            deletedCount:
              deleteResult.deletedCount,

            expenseIds,
          },

          session,
        });
      }
    }

    // ========================================================
    // COMMIT
    // ========================================================

    await session.commitTransaction();

    return res.status(200).json({
      success: true,

      message:
        `${deleteResult.deletedCount} expenses deleted successfully`,

      deletedCount:
        deleteResult.deletedCount,
    });
  } catch (error) {
    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    console.error(
      "❌ Bulk delete expenses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete expenses",
      error:
        error.message,
    });
  } finally {
    await session.endSession();
  }
};