// const Expense = require("../models/Expense");
// const mongoose = require("mongoose");
// const Income = require("../models/Income");
// const Savings = require("../models/Savings");
// const Budget = require("../models/Budget");
// const Notification = require("../models/Notification");

// const createNotification = async ({
//   userEmail,
//   email,
//   userId,
//   title,
//   message,
//   type = "system",
//   severity = "low",
//   relatedId = null,
//   relatedType = "system",
//   actionLink = "",
//   metadata = {},
//   session = null,
// }) => {
//   const normalizedEmail = String(
//     userEmail || email || "",
//   )
//     .trim()
//     .toLowerCase();

//   if (!normalizedEmail) {
//     throw new Error("Notification email is required");
//   }

//   if (!userId) {
//     throw new Error("Notification userId is required");
//   }

//   const notificationData = {
//     userEmail: normalizedEmail,
//     userId,
//     title,
//     message,
//     type,
//     severity,
//     relatedId,
//     relatedType,
//     actionLink,
//     metadata,
//   };

//   const options = session ? { session } : {};

//   const [notification] = await Notification.create(
//     [notificationData],
//     options,
//   );

//   return notification;
// };

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

// exports.createExpense = async (req, res) => {
//   const session = await mongoose.startSession();

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

//     // ============================================================
//     // VALIDATION
//     // ============================================================
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
//         message: "Required fields are missing",
//       });
//     }

//     const expenseAmount = Number(amount);

//     if (!Number.isFinite(expenseAmount) || expenseAmount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Expense amount must be greater than 0",
//       });
//     }

//     const normalizedEmail = email.toLowerCase().trim();
//     const normalizedCategory = category.trim();

//     // ============================================================
//     // DATE
//     // ============================================================
//     const expenseDate = new Date(date);

//     if (isNaN(expenseDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense date",
//       });
//     }

//     const budgetMonth = expenseDate.getMonth();
//     const budgetYear = expenseDate.getFullYear();

//     // ============================================================
//     // START TRANSACTION
//     // ============================================================
//     session.startTransaction();

//     // ============================================================
//     // 1. FIND INCOME
//     // ============================================================
//     const income = await Income.findOne({
//       userId,
//     }).session(session);

//     if (!income) {
//       await session.abortTransaction();

//       return res.status(404).json({
//         success: false,
//         message: "Income record not found",
//       });
//     }

//     let incomeBalance = Number(income.balance) || 0;

//     let remainingExpense = expenseAmount;
//     let incomeUsed = 0;
//     let savingsUsed = 0;

//     // ============================================================
//     // 2. USE INCOME FIRST
//     // ============================================================
//     if (incomeBalance > 0) {
//       incomeUsed = Math.min(incomeBalance, remainingExpense);

//       income.balance = incomeBalance - incomeUsed;

//       await income.save({ session });

//       remainingExpense -= incomeUsed;
//     }

//     // ============================================================
//     // 3. USE SAVINGS ONLY AFTER INCOME REACHES ZERO
//     // ============================================================
//     if (remainingExpense > 0) {
//       const savingsList = await Savings.find({
//         email: normalizedEmail,
//         currentAmount: { $gt: 0 },
//       })
//         .sort({ currentAmount: -1 })
//         .session(session);

//       for (const saving of savingsList) {
//         if (remainingExpense <= 0) {
//           break;
//         }

//         const availableSavings = Number(saving.currentAmount) || 0;

//         if (availableSavings <= 0) {
//           continue;
//         }

//         const amountFromSaving = Math.min(
//           availableSavings,
//           remainingExpense
//         );

//         saving.currentAmount -= amountFromSaving;

//         if (saving.currentAmount < 0) {
//           saving.currentAmount = 0;
//         }

//         // Your Savings pre-save middleware will
//         // recalculate progress/isCompleted/completedDate.
//         await saving.save({ session });

//         savingsUsed += amountFromSaving;
//         remainingExpense -= amountFromSaving;
//       }
//     }

//     // ============================================================
//     // 4. CHECK IF THERE IS ENOUGH MONEY
//     // ============================================================
//     if (remainingExpense > 0) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,
//         message: "Insufficient income and savings to cover this expense",
//         expenseAmount,
//         incomeUsed,
//         savingsUsed,
//         remainingAmount: remainingExpense,
//       });
//     }

//     // ============================================================
//     // 5. CREATE EXPENSE
//     // ============================================================
//     const [expense] = await Expense.create(
//       [
//         {
//           description: description.trim(),
//           category: normalizedCategory,
//           type: type || "expense",
//           amount: expenseAmount,
//           date: expenseDate,
//           user: user.trim(),
//           userId,
//           email: normalizedEmail,
//         },
//       ],
//       { session }
//     );

//     // ============================================================
//     // 6. UPDATE BUDGET
//     // ============================================================
//     const budget = await Budget.findOne({
//       email: normalizedEmail,
//       category: normalizedCategory,
//       month: budgetMonth,
//       year: budgetYear,
//     }).session(session);

//     let budgetUpdated = false;

//     if (budget) {
//       budget.spentAmount =
//         Number(budget.spentAmount || 0) + expenseAmount;

//       await budget.save({ session });

//       budgetUpdated = true;
//     }

//     // ============================================================
//     // 7. CREATE NOTIFICATION
//     // ============================================================
//     await createNotification({
//       userId,
//       email: normalizedEmail,
//       title: "💸 Expense Recorded",
//       message: `You spent ${expenseAmount} on ${normalizedCategory}`,
//       type: "info",
//       referenceId: expense._id,
//       referenceModel: "Expense",
//     });

//     // ============================================================
//     // 8. COMMIT TRANSACTION
//     // ============================================================
//     await session.commitTransaction();

//     // ============================================================
//     // 9. RESPONSE
//     // ============================================================
//     return res.status(201).json({
//       success: true,
//       message: "Expense created successfully",

//       data: expense,

//       moneyUsed: {
//         expenseAmount,
//         incomeUsed,
//         savingsUsed,
//       },

//       remainingIncomeBalance: income.balance,

//       budget: budgetUpdated
//         ? {
//             category: budget.category,
//             allocatedAmount: budget.allocatedAmount,
//             spentAmount: budget.spentAmount,
//             remainingAmount: budget.remainingAmount,
//             percentageUsed: budget.percentageUsed,
//             status: budget.status,
//           }
//         : null,
//     });
//   } catch (error) {
//     try {
//       await session.abortTransaction();
//     } catch (abortError) {
//       console.error("❌ Transaction abort error:", abortError);
//     }

//     console.error("❌ Create expense error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create expense",
//       error: error.message,
//     });
//   } finally {
//     session.endSession();
//   }
// };

// exports.getAllExpenses = async (req, res) => {
//   try {
//     const expenses = await Expense.find({}).sort({
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

// exports.createExpense = async (req, res) => {
//   try {
//     const { description, category, type, amount, date, user, email, userId } =
//       req.body;

//     // ✅ VALIDATION
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
//         message: "All fields are required",
//       });
//     }

//     if (!Number.isInteger(Number(amount)) || Number(amount) <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Amount must be a positive whole number",
//       });
//     }

//     // ✅ CREATE EXPENSE
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

//     // ⚠️ NOTE:
//     // Income deduction + savings fallback + notification
//     // are already handled in Expense model (post save hook)

//     return res.status(201).json({
//       success: true,
//       message: "Expense created & processed successfully",
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
// // CONTROLLERS / EXPENSECONTROLLER.JS
// // ============================================================

// const Expense = require("../models/Expense");
// const mongoose = require("mongoose");
// const Income = require("../models/Income");
// const Savings = require("../models/Savings");
// const Budget = require("../models/Budget");

// const createNotification = require("../utils/createNotification");

// // ============================================================
// // GET ALL EXPENSES FOR A USER
// // @route GET /api/expenses
// // @access Private
// // ============================================================

// exports.getExpenses = async (req, res) => {
//   try {
//     const {
//       category,
//       type,
//       startDate,
//       endDate,
//       search,
//     } = req.query;

//     const query = {};

//     // ============================================================
//     // CATEGORY FILTER
//     // ============================================================

//     if (category && category !== "all") {
//       query.category = category;
//     }

//     // ============================================================
//     // TYPE FILTER
//     // ============================================================

//     if (type && type !== "all") {
//       query.type = type;
//     }

//     // ============================================================
//     // DATE FILTER
//     // ============================================================

//     if (startDate || endDate) {
//       query.date = {};

//       if (startDate) {
//         const start = new Date(startDate);

//         if (!isNaN(start.getTime())) {
//           query.date.$gte = start;
//         }
//       }

//       if (endDate) {
//         const end = new Date(endDate);

//         if (!isNaN(end.getTime())) {
//           // Include the whole end date
//           end.setHours(23, 59, 59, 999);
//           query.date.$lte = end;
//         }
//       }

//       if (Object.keys(query.date).length === 0) {
//         delete query.date;
//       }
//     }

//     // ============================================================
//     // SEARCH
//     // ============================================================

//     if (search && search.trim()) {
//       const searchRegex = {
//         $regex: search.trim(),
//         $options: "i",
//       };

//       query.$or = [
//         { description: searchRegex },
//         { category: searchRegex },
//         { type: searchRegex },
//         { user: searchRegex },
//         { email: searchRegex },
//       ];
//     }

//     // ============================================================
//     // FIND EXPENSES
//     // ============================================================

//     const expenses = await Expense.find(query).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     return res.status(200).json({
//       success: true,
//       count: expenses.length,
//       data: expenses,
//     });
//   } catch (error) {
//     console.error("❌ Get expenses error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch expenses",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // CREATE EXPENSE
// // @route POST /api/expenses
// // @access Private
// // ============================================================

// exports.createExpense = async (req, res) => {
//   const session = await mongoose.startSession();

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

//     // ============================================================
//     // VALIDATION
//     // ============================================================

//     if (
//       !description ||
//       !category ||
//       amount === undefined ||
//       amount === null ||
//       !date ||
//       !user ||
//       !email ||
//       !userId
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Required fields are missing",
//       });
//     }

//     const expenseAmount = Number(amount);

//     if (
//       !Number.isFinite(expenseAmount) ||
//       expenseAmount <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Expense amount must be greater than 0",
//       });
//     }

//     const normalizedEmail = String(email)
//       .trim()
//       .toLowerCase();

//     const normalizedCategory = String(category).trim();

//     const normalizedUser = String(user).trim();

//     if (!normalizedEmail) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid email is required",
//       });
//     }

//     if (!normalizedCategory) {
//       return res.status(400).json({
//         success: false,
//         message: "Category is required",
//       });
//     }

//     if (!normalizedUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User is required",
//       });
//     }

//     // ============================================================
//     // VALIDATE USER ID
//     // ============================================================

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     // ============================================================
//     // DATE
//     // ============================================================

//     const expenseDate = new Date(date);

//     if (isNaN(expenseDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense date",
//       });
//     }

//     const budgetMonth = expenseDate.getMonth();
//     const budgetYear = expenseDate.getFullYear();

//     // ============================================================
//     // START TRANSACTION
//     // ============================================================

//     session.startTransaction();

//     // ============================================================
//     // 1. FIND INCOME
//     // ============================================================

//     const income = await Income.findOne({
//       userId,
//     }).session(session);

//     if (!income) {
//       await session.abortTransaction();

//       return res.status(404).json({
//         success: false,
//         message: "Income record not found",
//       });
//     }

//     let incomeBalance = Number(income.balance) || 0;

//     let remainingExpense = expenseAmount;
//     let incomeUsed = 0;
//     let savingsUsed = 0;

//     // ============================================================
//     // 2. USE INCOME FIRST
//     // ============================================================

//     if (incomeBalance > 0) {
//       incomeUsed = Math.min(
//         incomeBalance,
//         remainingExpense,
//       );

//       income.balance = incomeBalance - incomeUsed;

//       await income.save({
//         session,
//       });

//       remainingExpense -= incomeUsed;
//     }

//     // ============================================================
//     // 3. USE SAVINGS ONLY AFTER INCOME IS ZERO
//     // ============================================================

//     if (remainingExpense > 0) {
//       const savingsList = await Savings.find({
//         email: normalizedEmail,
//         currentAmount: {
//           $gt: 0,
//         },
//       })
//         .sort({
//           currentAmount: -1,
//         })
//         .session(session);

//       for (const saving of savingsList) {
//         if (remainingExpense <= 0) {
//           break;
//         }

//         const availableSavings =
//           Number(saving.currentAmount) || 0;

//         if (availableSavings <= 0) {
//           continue;
//         }

//         const amountFromSaving = Math.min(
//           availableSavings,
//           remainingExpense,
//         );

//         saving.currentAmount =
//           availableSavings - amountFromSaving;

//         if (saving.currentAmount < 0) {
//           saving.currentAmount = 0;
//         }

//         // Savings middleware can update progress,
//         // completion status, etc.
//         await saving.save({
//           session,
//         });

//         savingsUsed += amountFromSaving;
//         remainingExpense -= amountFromSaving;
//       }
//     }

//     // ============================================================
//     // 4. CHECK IF THERE IS ENOUGH MONEY
//     // ============================================================

//     if (remainingExpense > 0) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,
//         message:
//           "Insufficient income and savings to cover this expense",
//         expenseAmount,
//         incomeUsed,
//         savingsUsed,
//         remainingAmount: remainingExpense,
//       });
//     }

//     // ============================================================
//     // 5. CREATE EXPENSE
//     // ============================================================

//     const [expense] = await Expense.create(
//       [
//         {
//           description: normalizedDescription(description),
//           category: normalizedCategory,
//           type: type || "expense",
//           amount: expenseAmount,
//           date: expenseDate,
//           user: normalizedUser,
//           userId,
//           email: normalizedEmail,
//         },
//       ],
//       {
//         session,
//       },
//     );

//     // ============================================================
//     // 6. UPDATE BUDGET
//     // ============================================================

//     const budget = await Budget.findOne({
//       email: normalizedEmail,
//       category: normalizedCategory,
//       month: budgetMonth,
//       year: budgetYear,
//     }).session(session);

//     let budgetUpdated = false;

//     if (budget) {
//       budget.spentAmount =
//         Number(budget.spentAmount || 0) +
//         expenseAmount;

//       await budget.save({
//         session,
//       });

//       budgetUpdated = true;
//     }

//     // ============================================================
//     // 7. CREATE NOTIFICATION
//     // ============================================================

//     await createNotification({
//       userId,
//       userEmail: normalizedEmail,

//       title: "💸 Expense Recorded",

//       message: `You spent ${expenseAmount} on ${normalizedCategory}`,

//       type: "expense",

//       severity: "low",

//       relatedId: expense._id,

//       relatedType: "Expense",

//       actionLink: `/expenses/${expense._id}`,

//       metadata: {
//         amount: expenseAmount,
//         category: normalizedCategory,
//         incomeUsed,
//         savingsUsed,
//       },

//       session,
//     });

//     // ============================================================
//     // 8. COMMIT TRANSACTION
//     // ============================================================

//     await session.commitTransaction();

//     // ============================================================
//     // 9. RESPONSE
//     // ============================================================

//     return res.status(201).json({
//       success: true,
//       message: "Expense created successfully",

//       data: expense,

//       moneyUsed: {
//         expenseAmount,
//         incomeUsed,
//         savingsUsed,
//       },

//       remainingIncomeBalance:
//         Number(income.balance) || 0,

//       budget: budgetUpdated
//         ? {
//             category: budget.category,
//             allocatedAmount:
//               budget.allocatedAmount,
//             spentAmount: budget.spentAmount,
//             remainingAmount:
//               budget.remainingAmount,
//             percentageUsed:
//               budget.percentageUsed,
//             status: budget.status,
//           }
//         : null,
//     });
//   } catch (error) {
//     // ============================================================
//     // ABORT TRANSACTION ON ERROR
//     // ============================================================

//     if (session.inTransaction()) {
//       try {
//         await session.abortTransaction();
//       } catch (abortError) {
//         console.error(
//           "❌ Transaction abort error:",
//           abortError,
//         );
//       }
//     }

//     console.error(
//       "❌ Create expense error:",
//       error,
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
// // HELPER
// // ============================================================

// function normalizedDescription(description) {
//   return String(description).trim();
// }

// // ============================================================
// // GET ALL EXPENSES
// // @route GET /api/expenses/all
// // @access Private
// // ============================================================

// exports.getAllExpenses = async (req, res) => {
//   try {
//     const expenses = await Expense.find({}).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     return res.status(200).json({
//       success: true,
//       count: expenses.length,
//       data: expenses,
//     });
//   } catch (error) {
//     console.error("❌ Get all expenses error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch expenses",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET SINGLE EXPENSE
// // @route GET /api/expenses/:id
// // @access Private
// // ============================================================

// exports.getExpense = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense ID",
//       });
//     }

//     const expense = await Expense.findById(id);

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
//     console.error("❌ Get expense error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch expense",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET EXPENSES BY USER EMAIL
// // @route GET /api/expenses/email/:email
// // @access Private
// // ============================================================

// exports.getExpensesByEmail = async (req, res) => {
//   try {
//     const email = req.params.email;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const normalizedEmail = email
//       .trim()
//       .toLowerCase();

//     const expenses = await Expense.find({
//       email: normalizedEmail,
//     }).sort({
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
// // UPDATE EXPENSE
// // @route PUT /api/expenses/:id
// // @access Private
// // ============================================================

// exports.updateExpense = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense ID",
//       });
//     }

//     const expense = await Expense.findById(id);

//     if (!expense) {
//       return res.status(404).json({
//         success: false,
//         message: "Expense not found",
//       });
//     }

//     const updatedExpense =
//       await Expense.findByIdAndUpdate(
//         id,
//         req.body,
//         {
//           new: true,
//           runValidators: true,
//         },
//       );

//     return res.status(200).json({
//       success: true,
//       message: "Expense updated successfully",
//       data: updatedExpense,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Update expense error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update expense",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // DELETE EXPENSE
// // @route DELETE /api/expenses/:id
// // @access Private
// // ============================================================

// exports.deleteExpense = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense ID",
//       });
//     }

//     const expense =
//       await Expense.findByIdAndDelete(id);

//     if (!expense) {
//       return res.status(404).json({
//         success: false,
//         message: "Expense not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Expense deleted successfully",
//       data: expense,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Delete expense error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete expense",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET EXPENSE STATISTICS
// // @route GET /api/expenses/stats
// // @access Private
// // ============================================================

// exports.getStats = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         message: "User authentication is required",
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID",
//       });
//     }

//     const userObjectId =
//       new mongoose.Types.ObjectId(req.user.id);

//     // ============================================================
//     // GENERAL STATISTICS
//     // ============================================================

//     const stats = await Expense.getStats(
//       req.user.id,
//     );

//     // ============================================================
//     // CATEGORY BREAKDOWN
//     // ============================================================

//     const categoryStats =
//       await Expense.aggregate([
//         {
//           $match: {
//             userId: userObjectId,
//           },
//         },

//         {
//           $group: {
//             _id: {
//               category: "$category",
//               type: "$type",
//             },

//             total: {
//               $sum: "$amount",
//             },

//             count: {
//               $sum: 1,
//             },
//           },
//         },

//         {
//           $group: {
//             _id: "$_id.category",

//             expenses: {
//               $push: {
//                 type: "$_id.type",
//                 total: "$total",
//                 count: "$count",
//               },
//             },

//             totalAmount: {
//               $sum: "$total",
//             },
//           },
//         },
//       ]);

//     // ============================================================
//     // MONTHLY SUMMARY - LAST 12 MONTHS
//     // ============================================================

//     const twelveMonthsAgo = new Date();

//     twelveMonthsAgo.setMonth(
//       twelveMonthsAgo.getMonth() - 12,
//     );

//     const monthlyStats =
//       await Expense.aggregate([
//         {
//           $match: {
//             userId: userObjectId,

//             date: {
//               $gte: twelveMonthsAgo,
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

//               type: "$type",
//             },

//             total: {
//               $sum: "$amount",
//             },
//           },
//         },

//         {
//           $group: {
//             _id: {
//               year: "$_id.year",
//               month: "$_id.month",
//             },

//             income: {
//               $sum: {
//                 $cond: [
//                   {
//                     $eq: [
//                       "$_id.type",
//                       "income",
//                     ],
//                   },
//                   "$total",
//                   0,
//                 ],
//               },
//             },

//             expenses: {
//               $sum: {
//                 $cond: [
//                   {
//                     $eq: [
//                       "$_id.type",
//                       "expense",
//                     ],
//                   },
//                   "$total",
//                   0,
//                 ],
//               },
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
//         summary: stats,
//         categoryBreakdown: categoryStats,
//         monthlySummary: monthlyStats,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get expense statistics error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch statistics",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // BULK DELETE EXPENSES
// // @route DELETE /api/expenses/bulk
// // @access Private
// // ============================================================

// exports.bulkDeleteExpenses = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         message: "User authentication is required",
//       });
//     }

//     const { expenseIds } = req.body;

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

//     const invalidIds = expenseIds.some(
//       (id) => !mongoose.Types.ObjectId.isValid(id),
//     );

//     if (invalidIds) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "One or more expense IDs are invalid",
//       });
//     }

//     const result = await Expense.deleteMany({
//       _id: {
//         $in: expenseIds,
//       },

//       userId: req.user.id,
//     });

//     // ============================================================
//     // GET UPDATED STATISTICS
//     // ============================================================

//     const stats = await Expense.getStats(
//       req.user.id,
//     );

//     return res.status(200).json({
//       success: true,
//       message: `${result.deletedCount} expenses deleted successfully`,
//       deletedCount: result.deletedCount,
//       stats,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Bulk delete expenses error:",
//       error,
//     );

//     return res.status(500).json({
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

// const createNotification =
//   require("../utils/createNotification");

// // ============================================================
// // HELPER: VALIDATE USER ID
// // ============================================================

// const validateUserId = (userId) => {
//   return (
//     userId &&
//     mongoose.Types.ObjectId.isValid(userId)
//   );
// };

// // ============================================================
// // HELPER: NORMALIZE EMAIL
// // ============================================================

// const normalizeEmail = (email) => {
//   return String(email || "")
//     .trim()
//     .toLowerCase();
// };

// // ============================================================
// // HELPER: FIND OWNER
// // ============================================================

// const getOwnerFilter = ({
//   userId,
//   email,
// }) => {
//   if (userId) {
//     return { userId };
//   }

//   return {
//     email: normalizeEmail(email),
//   };
// };

// // ============================================================
// // HELPER: ALLOCATE MONEY
// //
// // Priority:
// //
// // 1. Income
// // 2. Savings
// //
// // Example:
// //
// // Expense = 150000
// //
// // Income available = 100000
// // Savings available = 50000
// //
// // Result:
// //
// // incomeUsed = 100000
// // savingsUsed = 50000
// // ============================================================

// const calculateAllocations = async ({
//   userId,
//   amount,
//   excludeExpenseId = null,
//   session = null,
// }) => {
//   let remaining = amount;

//   const incomeAllocations = [];
//   const savingsAllocations = [];

//   // ========================================================
//   // INCOME
//   // ========================================================

//   const incomeQuery = {
//     userId,
//     remainingAmount: {
//       $gt: 0,
//     },
//   };

//   const incomeQueryBuilder =
//     Income.find(incomeQuery).sort({
//       date: 1,
//       createdAt: 1,
//     });

//   if (session) {
//     incomeQueryBuilder.session(session);
//   }

//   const incomes =
//     await incomeQueryBuilder.exec();

//   for (const income of incomes) {
//     if (remaining <= 0) break;

//     const available =
//       Number(income.remainingAmount) || 0;

//     if (available <= 0) continue;

//     const used = Math.min(
//       available,
//       remaining
//     );

//     incomeAllocations.push({
//       incomeId: income._id,
//       amount: Math.trunc(used),
//     });

//     remaining -= used;
//   }

//   // ========================================================
//   // SAVINGS
//   // ========================================================

//   if (remaining > 0) {
//     const savingsQuery = {
//       userId,
//       currentAmount: {
//         $gt: 0,
//       },
//     };

//     const savingsQueryBuilder =
//       Savings.find(savingsQuery).sort({
//         priority: -1,
//         createdAt: 1,
//       });

//     if (session) {
//       savingsQueryBuilder.session(session);
//     }

//     const savings =
//       await savingsQueryBuilder.exec();

//     for (const saving of savings) {
//       if (remaining <= 0) break;

//       const available =
//         Number(saving.currentAmount) || 0;

//       if (available <= 0) continue;

//       const used = Math.min(
//         available,
//         remaining
//       );

//       savingsAllocations.push({
//         savingsId: saving._id,
//         amount: Math.trunc(used),
//       });

//       remaining -= used;
//     }
//   }

//   if (remaining > 0) {
//     throw new Error(
//       `Insufficient funds. RWF ${remaining.toLocaleString()} is still required.`
//     );
//   }

//   return {
//     incomeAllocations,
//     savingsAllocations,
//   };
// };

// // ============================================================
// // HELPER: APPLY ALLOCATIONS
// // ============================================================

// const applyAllocations = async ({
//   incomeAllocations,
//   savingsAllocations,
//   session = null,
// }) => {
//   // ========================================================
//   // INCOME
//   // ========================================================

//   for (const allocation of incomeAllocations) {
//     const query = {
//       _id: allocation.incomeId,
//       remainingAmount: {
//         $gte: allocation.amount,
//       },
//     };

//     const update = {
//       $inc: {
//         remainingAmount:
//           -allocation.amount,
//       },
//     };

//     const options = session
//       ? { session }
//       : {};

//     const updated =
//       await Income.findOneAndUpdate(
//         query,
//         update,
//         {
//           ...options,
//           new: true,
//         }
//       );

//     if (!updated) {
//       throw new Error(
//         "Income allocation failed. The income balance may have changed."
//       );
//     }
//   }

//   // ========================================================
//   // SAVINGS
//   // ========================================================

//   for (const allocation of savingsAllocations) {
//     const query = {
//       _id: allocation.savingsId,
//       currentAmount: {
//         $gte: allocation.amount,
//       },
//     };

//     const update = {
//       $inc: {
//         currentAmount:
//           -allocation.amount,
//       },
//     };

//     const options = session
//       ? { session }
//       : {};

//     const updated =
//       await Savings.findOneAndUpdate(
//         query,
//         update,
//         {
//           ...options,
//           new: true,
//         }
//       );

//     if (!updated) {
//       throw new Error(
//         "Savings allocation failed. The savings balance may have changed."
//       );
//     }
//   }
// };

// // ============================================================
// // HELPER: RETURN ALLOCATIONS
// // ============================================================

// const returnAllocations = async ({
//   incomeAllocations = [],
//   savingsAllocations = [],
//   session = null,
// }) => {
//   // ========================================================
//   // RETURN INCOME
//   // ========================================================

//   for (const allocation of incomeAllocations) {
//     await Income.findByIdAndUpdate(
//       allocation.incomeId,
//       {
//         $inc: {
//           remainingAmount:
//             allocation.amount,
//         },
//       },
//       session
//         ? { session }
//         : {}
//     );
//   }

//   // ========================================================
//   // RETURN SAVINGS
//   // ========================================================

//   for (const allocation of savingsAllocations) {
//     await Savings.findByIdAndUpdate(
//       allocation.savingsId,
//       {
//         $inc: {
//           currentAmount:
//             allocation.amount,
//         },
//       },
//       session
//         ? { session }
//         : {}
//     );
//   }
// };

// // ============================================================
// // HELPER: FIND BUDGET
// // ============================================================

// const findBudgetForExpense = async ({
//   userId,
//   category,
//   date,
//   session = null,
// }) => {
//   const expenseDate =
//     new Date(date);

//   const month =
//     expenseDate.getMonth();

//   const year =
//     expenseDate.getFullYear();

//   const query = {
//     userId,

//     category:
//       String(category)
//         .trim()
//         .toLowerCase(),

//     month,

//     year,
//   };

//   const queryBuilder =
//     Budget.findOne(query);

//   if (session) {
//     queryBuilder.session(session);
//   }

//   return await queryBuilder.exec();
// };

// // ============================================================
// // HELPER: APPLY BUDGET
// // ============================================================

// const applyBudgetAmount = async ({
//   budget,
//   amount,
//   session = null,
// }) => {
//   if (!budget || amount <= 0) {
//     return;
//   }

//   const query = {
//     _id: budget._id,
//   };

//   const update = {
//     $inc: {
//       spentAmount: amount,
//     },
//   };

//   const options = session
//     ? { session, new: true }
//     : { new: true };

//   const updated =
//     await Budget.findOneAndUpdate(
//       query,
//       update,
//       options
//     );

//   if (!updated) {
//     throw new Error(
//       "Failed to update budget"
//     );
//   }

//   return updated;
// };

// // ============================================================
// // HELPER: RETURN BUDGET
// // ============================================================

// const returnBudgetAmount = async ({
//   budgetId,
//   amount,
//   session = null,
// }) => {
//   if (!budgetId || amount <= 0) {
//     return;
//   }

//   const budget =
//     await Budget.findOneAndUpdate(
//       {
//         _id: budgetId,

//         spentAmount: {
//           $gte: amount,
//         },
//       },
//       {
//         $inc: {
//           spentAmount: -amount,
//         },
//       },
//       {
//         new: true,
//         ...(session
//           ? { session }
//           : {}),
//       }
//     );

//   if (!budget) {
//     throw new Error(
//       "Failed to restore budget spending"
//     );
//   }

//   return budget;
// };

// // ============================================================
// // GET ALL EXPENSES
// // ============================================================

// exports.getExpenses = async (
//   req,
//   res
// ) => {
//   try {
//     const {
//       userId,
//       email,
//       category,
//       type,
//       startDate,
//       endDate,
//       search,
//       month,
//       year,
//     } = req.query;

//     const query = {};

//     // ========================================================
//     // OWNER
//     // ========================================================

//     if (userId) {
//       if (!validateUserId(userId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid userId",
//         });
//       }

//       query.userId = userId;
//     } else if (email) {
//       query.email =
//         normalizeEmail(email);
//     }

//     // ========================================================
//     // CATEGORY
//     // ========================================================

//     if (
//       category &&
//       category.toLowerCase() !== "all"
//     ) {
//       query.category =
//         category.trim();
//     }

//     // ========================================================
//     // TYPE
//     // ========================================================

//     if (
//       type &&
//       type.toLowerCase() !== "all"
//     ) {
//       query.type = type.trim();
//     }

//     // ========================================================
//     // DATE RANGE
//     // ========================================================

//     if (startDate || endDate) {
//       query.date = {};

//       if (startDate) {
//         const start =
//           new Date(startDate);

//         if (
//           Number.isNaN(
//             start.getTime()
//           )
//         ) {
//           return res.status(400).json({
//             success: false,
//             message:
//               "Invalid startDate",
//           });
//         }

//         start.setHours(
//           0,
//           0,
//           0,
//           0
//         );

//         query.date.$gte =
//           start;
//       }

//       if (endDate) {
//         const end =
//           new Date(endDate);

//         if (
//           Number.isNaN(
//             end.getTime()
//           )
//         ) {
//           return res.status(400).json({
//             success: false,
//             message:
//               "Invalid endDate",
//           });
//         }

//         end.setHours(
//           23,
//           59,
//           59,
//           999
//         );

//         query.date.$lte =
//           end;
//       }
//     }

//     // ========================================================
//     // MONTH / YEAR
//     // ========================================================

//     if (
//       month !== undefined ||
//       year !== undefined
//     ) {
//       const selectedMonth =
//         Number(month);

//       const selectedYear =
//         Number(year);

//       if (
//         month !== undefined &&
//         (!Number.isInteger(
//           selectedMonth
//         ) ||
//           selectedMonth < 0 ||
//           selectedMonth > 11)
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Month must be an integer between 0 and 11",
//         });
//       }

//       if (
//         year !== undefined &&
//         (!Number.isInteger(
//           selectedYear
//         ) ||
//           selectedYear < 2000)
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Invalid year",
//         });
//       }

//       if (
//         month !== undefined &&
//         year !== undefined
//       ) {
//         query.date = {
//           $gte: new Date(
//             selectedYear,
//             selectedMonth,
//             1
//           ),

//           $lt: new Date(
//             selectedYear,
//             selectedMonth + 1,
//             1
//           ),
//         };
//       }
//     }

//     // ========================================================
//     // SEARCH
//     // ========================================================

//     if (
//       search &&
//       search.trim()
//     ) {
//       const value =
//         search.trim();

//       query.$or = [
//         {
//           description: {
//             $regex: value,
//             $options: "i",
//           },
//         },
//         {
//           category: {
//             $regex: value,
//             $options: "i",
//           },
//         },
//         {
//           user: {
//             $regex: value,
//             $options: "i",
//           },
//         },
//         {
//           email: {
//             $regex: value,
//             $options: "i",
//           },
//         },
//       ];
//     }

//     const expenses =
//       await Expense.find(query)
//         .sort({
//           date: -1,
//           createdAt: -1,
//         });

//     const total = expenses.reduce(
//       (sum, expense) =>
//         sum +
//         Number(
//           expense.amount || 0
//         ),
//       0
//     );

//     return res.status(200).json({
//       success: true,

//       count: expenses.length,

//       data: expenses,

//       summary: {
//         total,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get expenses error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to fetch expenses",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET SINGLE EXPENSE
// // ============================================================

// exports.getExpense = async (
//   req,
//   res
// ) => {
//   try {
//     const expense =
//       await Expense.findById(
//         req.params.id
//       );

//     if (!expense) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Expense not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: expense,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get expense error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to fetch expense",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // CREATE EXPENSE
// // ============================================================

// exports.createExpense = async (
//   req,
//   res
// ) => {
//   const session =
//     await mongoose.startSession();

//   try {
//     const {
//       description,
//       category,
//       type = "expense",
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
//         message:
//           "All expense fields are required",
//       });
//     }

//     if (
//       !validateUserId(userId)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid userId",
//       });
//     }

//     if (type !== "expense") {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Only expense records can be created by this controller",
//       });
//     }

//     const numericAmount =
//       Number(amount);

//     if (
//       !Number.isFinite(
//         numericAmount
//       ) ||
//       !Number.isInteger(
//         numericAmount
//       ) ||
//       numericAmount <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Amount must be a positive whole number",
//       });
//     }

//     const expenseDate =
//       new Date(date);

//     if (
//       Number.isNaN(
//         expenseDate.getTime()
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid expense date",
//       });
//     }

//     const normalizedEmail =
//       normalizeEmail(email);

//     const normalizedCategory =
//       String(category).trim();

//     // ========================================================
//     // VERIFY USER OWNERSHIP
//     // ========================================================

//     const User =
//       require("../models/User");

//     const owner =
//       await User.findOne({
//         _id: userId,
//         email: normalizedEmail,
//       });

//     if (!owner) {
//       return res.status(403).json({
//         success: false,
//         message:
//           "User ownership verification failed",
//       });
//     }

//     // ========================================================
//     // TRANSACTION
//     // ========================================================

//     session.startTransaction();

//     // ========================================================
//     // CALCULATE FUNDING
//     // ========================================================

//     const {
//       incomeAllocations,
//       savingsAllocations,
//     } =
//       await calculateAllocations({
//         userId,
//         amount:
//           numericAmount,
//         session,
//       });

//     const incomeUsed =
//       incomeAllocations.reduce(
//         (sum, item) =>
//           sum +
//           Number(
//             item.amount
//           ),
//         0
//       );

//     const savingsUsed =
//       savingsAllocations.reduce(
//         (sum, item) =>
//           sum +
//           Number(
//             item.amount
//           ),
//         0
//       );

//     // ========================================================
//     // APPLY FUNDING
//     // ========================================================

//     await applyAllocations({
//       incomeAllocations,
//       savingsAllocations,
//       session,
//     });

//     // ========================================================
//     // FIND BUDGET
//     // ========================================================

//     const budget =
//       await findBudgetForExpense({
//         userId,
//         category:
//           normalizedCategory,
//         date:
//           expenseDate,
//         session,
//       });

//     let budgetAmountUsed = 0;

//     if (budget) {
//       budgetAmountUsed =
//         numericAmount;

//       await applyBudgetAmount({
//         budget,
//         amount:
//           budgetAmountUsed,
//         session,
//       });
//     }

//     // ========================================================
//     // CREATE EXPENSE
//     // ========================================================

//     const expense =
//       new Expense({
//         description:
//           String(
//             description
//           ).trim(),

//         category:
//           normalizedCategory,

//         type: "expense",

//         amount:
//           numericAmount,

//         date:
//           expenseDate,

//         user:
//           String(user).trim(),

//         userId,

//         email:
//           normalizedEmail,

//         incomeUsed,

//         savingsUsed,

//         incomeAllocations,

//         savingsAllocations,

//         budgetId:
//           budget
//             ? budget._id
//             : null,

//         budgetAmountUsed,
//       });

//     await expense.save({
//       session,
//     });

//     // ========================================================
//     // COMMIT
//     // ========================================================

//     await session.commitTransaction();

//     // ========================================================
//     // NOTIFICATION
//     // ========================================================

//     const notification =
//       await createNotification({
//         userId,

//         userEmail:
//           normalizedEmail,

//         title:
//           "💸 Expense Added",

//         message:
//           `An expense of RWF ${numericAmount.toLocaleString()} ` +
//           `for ${normalizedCategory} was recorded.`,

//         type:
//           "expense",

//         severity:
//           "low",

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

//           incomeUsed,

//           savingsUsed,

//           budgetAmountUsed,

//           category:
//             expense.category,
//         },
//       });

//     return res.status(201).json({
//       success: true,

//       message:
//         "Expense created successfully",

//       data: expense,

//       notification,
//     });
//   } catch (error) {
//     try {
//       await session.abortTransaction();
//     } catch (_) {}

//     console.error(
//       "❌ Create expense error:",
//       error
//     );

//     return res.status(400).json({
//       success: false,
//       message:
//         error.message ||
//         "Failed to create expense",
//     });
//   } finally {
//     session.endSession();
//   }
// };

// // ============================================================
// // UPDATE EXPENSE
// // ============================================================

// exports.updateExpense = async (
//   req,
//   res
// ) => {
//   const session =
//     await mongoose.startSession();

//   try {
//     const oldExpense =
//       await Expense.findById(
//         req.params.id
//       );

//     if (!oldExpense) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Expense not found",
//       });
//     }

//     const {
//       description,
//       category,
//       amount,
//       date,
//       user,
//     } = req.body;

//     // ========================================================
//     // VALIDATION
//     // ========================================================

//     if (
//       description !== undefined &&
//       !String(description).trim()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Description cannot be empty",
//       });
//     }

//     if (
//       amount !== undefined
//     ) {
//       const numericAmount =
//         Number(amount);

//       if (
//         !Number.isFinite(
//           numericAmount
//         ) ||
//         !Number.isInteger(
//           numericAmount
//         ) ||
//         numericAmount <= 0
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Amount must be a positive whole number",
//         });
//       }
//     }

//     let newDate =
//       oldExpense.date;

//     if (date !== undefined) {
//       newDate =
//         new Date(date);

//       if (
//         Number.isNaN(
//           newDate.getTime()
//         )
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Invalid expense date",
//         });
//       }
//     }

//     const newAmount =
//       amount !== undefined
//         ? Number(amount)
//         : Number(
//             oldExpense.amount
//           );

//     const newCategory =
//       category !== undefined
//         ? String(category).trim()
//         : oldExpense.category;

//     session.startTransaction();

//     // ========================================================
//     // RETURN OLD FUNDING
//     // ========================================================

//     await returnAllocations({
//       incomeAllocations:
//         oldExpense.incomeAllocations,

//       savingsAllocations:
//         oldExpense.savingsAllocations,

//       session,
//     });

//     // ========================================================
//     // RETURN OLD BUDGET
//     // ========================================================

//     if (
//       oldExpense.budgetId &&
//       oldExpense.budgetAmountUsed >
//         0
//     ) {
//       await returnBudgetAmount({
//         budgetId:
//           oldExpense.budgetId,

//         amount:
//           oldExpense.budgetAmountUsed,

//         session,
//       });
//     }

//     // ========================================================
//     // CALCULATE NEW FUNDING
//     // ========================================================

//     const {
//       incomeAllocations,
//       savingsAllocations,
//     } =
//       await calculateAllocations({
//         userId:
//           oldExpense.userId,

//         amount:
//           newAmount,

//         session,
//       });

//     const incomeUsed =
//       incomeAllocations.reduce(
//         (sum, item) =>
//           sum + item.amount,
//         0
//       );

//     const savingsUsed =
//       savingsAllocations.reduce(
//         (sum, item) =>
//           sum + item.amount,
//         0
//       );

//     // ========================================================
//     // APPLY NEW FUNDING
//     // ========================================================

//     await applyAllocations({
//       incomeAllocations,
//       savingsAllocations,
//       session,
//     });

//     // ========================================================
//     // NEW BUDGET
//     // ========================================================

//     const budget =
//       await findBudgetForExpense({
//         userId:
//           oldExpense.userId,

//         category:
//           newCategory,

//         date:
//           newDate,

//         session,
//       });

//     let budgetAmountUsed = 0;

//     if (budget) {
//       budgetAmountUsed =
//         newAmount;

//       await applyBudgetAmount({
//         budget,

//         amount:
//           budgetAmountUsed,

//         session,
//       });
//     }

//     // ========================================================
//     // UPDATE EXPENSE
//     // ========================================================

//     if (
//       description !== undefined
//     ) {
//       oldExpense.description =
//         String(
//           description
//         ).trim();
//     }

//     if (
//       category !== undefined
//     ) {
//       oldExpense.category =
//         newCategory;
//     }

//     if (
//       amount !== undefined
//     ) {
//       oldExpense.amount =
//         newAmount;
//     }

//     if (date !== undefined) {
//       oldExpense.date =
//         newDate;
//     }

//     if (user !== undefined) {
//       oldExpense.user =
//         String(user).trim();
//     }

//     oldExpense.incomeUsed =
//       incomeUsed;

//     oldExpense.savingsUsed =
//       savingsUsed;

//     oldExpense.incomeAllocations =
//       incomeAllocations;

//     oldExpense.savingsAllocations =
//       savingsAllocations;

//     oldExpense.budgetId =
//       budget
//         ? budget._id
//         : null;

//     oldExpense.budgetAmountUsed =
//       budgetAmountUsed;

//     await oldExpense.save({
//       session,
//     });

//     await session.commitTransaction();

//     // ========================================================
//     // NOTIFICATION
//     // ========================================================

//     const notification =
//       await createNotification({
//         userId:
//           oldExpense.userId,

//         userEmail:
//           oldExpense.email,

//         title:
//           "📝 Expense Updated",

//         message:
//           `${oldExpense.category} expense was updated to ` +
//           `RWF ${Number(
//             oldExpense.amount
//           ).toLocaleString()}.`,

//         type:
//           "expense",

//         severity:
//           "low",

//         relatedId:
//           oldExpense._id,

//         relatedType:
//           "Expense",

//         actionLink:
//           `/expenses/${oldExpense._id}`,

//         metadata: {
//           expenseId:
//             oldExpense._id,

//           amount:
//             oldExpense.amount,

//           incomeUsed:
//             oldExpense.incomeUsed,

//           savingsUsed:
//             oldExpense.savingsUsed,

//           budgetAmountUsed:
//             oldExpense.budgetAmountUsed,

//           category:
//             oldExpense.category,
//         },
//       });

//     return res.status(200).json({
//       success: true,

//       message:
//         "Expense updated successfully",

//       data:
//         oldExpense,

//       notification,
//     });
//   } catch (error) {
//     try {
//       await session.abortTransaction();
//     } catch (_) {}

//     console.error(
//       "❌ Update expense error:",
//       error
//     );

//     return res.status(400).json({
//       success: false,

//       message:
//         error.message ||
//         "Failed to update expense",
//     });
//   } finally {
//     session.endSession();
//   }
// };

// // ============================================================
// // DELETE EXPENSE
// // ============================================================

// exports.deleteExpense = async (
//   req,
//   res
// ) => {
//   const session =
//     await mongoose.startSession();

//   try {
//     const expense =
//       await Expense.findById(
//         req.params.id
//       );

//     if (!expense) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Expense not found",
//       });
//     }

//     session.startTransaction();

//     // ========================================================
//     // RETURN INCOME + SAVINGS
//     // ========================================================

//     await returnAllocations({
//       incomeAllocations:
//         expense.incomeAllocations,

//       savingsAllocations:
//         expense.savingsAllocations,

//       session,
//     });

//     // ========================================================
//     // RETURN BUDGET
//     // ========================================================

//     if (
//       expense.budgetId &&
//       expense.budgetAmountUsed >
//         0
//     ) {
//       await returnBudgetAmount({
//         budgetId:
//           expense.budgetId,

//         amount:
//           expense.budgetAmountUsed,

//         session,
//       });
//     }

//     // ========================================================
//     // DELETE EXPENSE
//     // ========================================================

//     await Expense.deleteOne(
//       {
//         _id: expense._id,
//       },
//       {
//         session,
//       }
//     );

//     await session.commitTransaction();

//     // ========================================================
//     // NOTIFICATION
//     // ========================================================

//     const notification =
//       await createNotification({
//         userId:
//           expense.userId,

//         userEmail:
//           expense.email,

//         title:
//           "🗑️ Expense Deleted",

//         message:
//           `${expense.category} expense of RWF ` +
//           `${Number(
//             expense.amount
//           ).toLocaleString()} ` +
//           `was deleted.`,

//         type:
//           "expense",

//         severity:
//           "medium",

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

//           incomeReturned:
//             expense.incomeUsed,

//           savingsReturned:
//             expense.savingsUsed,

//           budgetReturned:
//             expense.budgetAmountUsed,

//           category:
//             expense.category,
//         },
//       });

//     return res.status(200).json({
//       success: true,

//       message:
//         "Expense deleted successfully",

//       notification,
//     });
//   } catch (error) {
//     try {
//       await session.abortTransaction();
//     } catch (_) {}

//     console.error(
//       "❌ Delete expense error:",
//       error
//     );

//     return res.status(400).json({
//       success: false,

//       message:
//         error.message ||
//         "Failed to delete expense",
//     });
//   } finally {
//     session.endSession();
//   }
// };

// // ============================================================
// // GET EXPENSES BY USER ID
// // ============================================================

// exports.getExpensesByUserId = async (
//   req,
//   res
// ) => {
//   try {
//     const { userId } =
//       req.params;

//     if (
//       !validateUserId(userId)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid userId",
//       });
//     }

//     const expenses =
//       await Expense.find({
//         userId,
//       }).sort({
//         date: -1,
//         createdAt: -1,
//       });

//     return res.status(200).json({
//       success: true,

//       count:
//         expenses.length,

//       data: expenses,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get expenses by userId error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,

//       message:
//         "Failed to retrieve expenses",

//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET EXPENSES BY EMAIL
// // ============================================================

// exports.getExpensesByEmail = async (
//   req,
//   res
// ) => {
//   try {
//     const { email } =
//       req.params;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Email is required",
//       });
//     }

//     const expenses =
//       await Expense.find({
//         email:
//           normalizeEmail(email),
//       }).sort({
//         date: -1,
//         createdAt: -1,
//       });

//     return res.status(200).json({
//       success: true,

//       count:
//         expenses.length,

//       data: expenses,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get expenses by email error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,

//       message:
//         "Failed to retrieve expenses",

//       error: error.message,
//     });
//   }
// };















// ============================================================
// CONTROLLERS / EXPENSE.CONTROLLER.JS
// ============================================================

const mongoose = require("mongoose");

const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Savings = require("../models/Savings");
const Budget = require("../models/Budget");

const createNotification = require("../utils/createNotification");

// ============================================================
// EXPENSE CATEGORIES
//
// Keep these synchronized with Expense model.
// ============================================================

const EXPENSE_CATEGORIES = [
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
// HELPERS
// ============================================================

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const normalizeCategory = (category) =>
  String(category || "").trim();

const parsePositiveWholeNumber = (value) => {
  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    !Number.isInteger(number) ||
    number <= 0
  ) {
    return null;
  }

  return number;
};

const parseNonNegativeWholeNumber = (value) => {
  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    !Number.isInteger(number) ||
    number < 0
  ) {
    return null;
  }

  return number;
};

// ============================================================
// GET OWNER
//
// userId is primary.
// email remains supported for compatibility.
// ============================================================

const buildOwnerQuery = (req) => {
  const { userId, email } = req.query;

  if (userId) {
    if (!isValidObjectId(userId)) {
      return {
        error: "Invalid userId",
      };
    }

    return {
      query: {
        userId,
      },
    };
  }

  if (email) {
    return {
      query: {
        email: normalizeEmail(email),
      },
    };
  }

  if (req.user) {
    if (req.user._id) {
      return {
        query: {
          userId: req.user._id,
        },
      };
    }

    if (req.user.email) {
      return {
        query: {
          email: normalizeEmail(req.user.email),
        },
      };
    }
  }

  return {
    error: "userId or email is required",
  };
};

// ============================================================
// GET ALL EXPENSES
//
// Supports:
//
// ?userId=...
// ?email=...
// ?category=...
// ?type=...
// ?startDate=...
// ?endDate=...
// ?search=...
// ?month=...
// ?year=...
// ============================================================

exports.getExpenses = async (req, res) => {
  try {
    const {
      userId,
      email,
      category,
      type,
      startDate,
      endDate,
      search,
      month,
      year,
    } = req.query;

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

    if (
      category &&
      category.toLowerCase() !== "all"
    ) {
      query.category = category.trim();
    }

    // --------------------------------------------------------
    // TYPE
    // --------------------------------------------------------

    if (
      type &&
      type.toLowerCase() !== "all"
    ) {
      query.type = type.trim().toLowerCase();
    }

    // --------------------------------------------------------
    // DATE RANGE
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

        end.setHours(23, 59, 59, 999);

        query.date.$lte = end;
      }
    }

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // FETCH
    // --------------------------------------------------------

    const expenses = await Expense.find(query).sort({
      date: -1,
      createdAt: -1,
    });

    // --------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------

    const totalExpenses = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

    const totalIncomeUsed = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.incomeUsed || 0),
      0
    );

    const totalSavingsUsed = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.savingsUsed || 0),
      0
    );

    const totalBudgetUsed = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.budgetAmountUsed || 0),
      0
    );

    return res.status(200).json({
      success: true,

      count: expenses.length,

      data: expenses,

      summary: {
        totalExpenses,

        totalIncomeUsed,

        totalSavingsUsed,

        totalBudgetUsed,
      },
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
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense id",
      });
    }

    const expense =
      await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
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
// GET EXPENSES BY EMAIL
// ============================================================

exports.getExpensesByEmail = async (
  req,
  res
) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      normalizeEmail(email);

    const expenses =
      await Expense.find({
        email: normalizedEmail,
      }).sort({
        date: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      message:
        "Expenses retrieved successfully",

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
      message:
        "Failed to retrieve expenses",
      error: error.message,
    });
  }
};

// ============================================================
// GET ALL EXPENSES
// NO FILTERS
// ============================================================

exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({
      date: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error("❌ Get all expenses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
};


// ============================================================
// GET EXPENSE STATISTICS
// NO FILTERS
// Calculates statistics for ALL expenses
// ============================================================

exports.getStats = async (req, res) => {
  try {
    // ========================================================
    // FETCH ALL EXPENSES
    // ========================================================

    const expenses = await Expense.find();

    // ========================================================
    // BASIC TOTALS
    // ========================================================

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );

    const totalCount = expenses.length;

    // ========================================================
    // INCOME / SAVINGS FUNDING TOTALS
    // ========================================================

    const totalIncomeUsed = expenses.reduce(
      (sum, expense) => sum + Number(expense.incomeUsed || 0),
      0
    );

    const totalSavingsUsed = expenses.reduce(
      (sum, expense) => sum + Number(expense.savingsUsed || 0),
      0
    );

    // ========================================================
    // BUDGET TOTAL
    // ========================================================

    const totalBudgetUsed = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.budgetAmountUsed || 0),
      0
    );

    // ========================================================
    // EXPENSES BY CATEGORY
    // ========================================================

    const categoryMap = {};

    expenses.forEach((expense) => {
      const category = expense.category || "Other";

      if (!categoryMap[category]) {
        categoryMap[category] = {
          category,
          total: 0,
          count: 0,
        };
      }

      categoryMap[category].total += Number(
        expense.amount || 0
      );

      categoryMap[category].count += 1;
    });

    const categoryBreakdown = Object.values(categoryMap).sort(
      (a, b) => b.total - a.total
    );

    // ========================================================
    // EXPENSES BY TYPE
    // ========================================================

    const typeMap = {};

    expenses.forEach((expense) => {
      const type = expense.type || "expense";

      if (!typeMap[type]) {
        typeMap[type] = {
          type,
          total: 0,
          count: 0,
        };
      }

      typeMap[type].total += Number(
        expense.amount || 0
      );

      typeMap[type].count += 1;
    });

    const typeBreakdown = Object.values(typeMap).sort(
      (a, b) => b.total - a.total
    );

    // ========================================================
    // MONTHLY BREAKDOWN
    // ========================================================

    const monthlyMap = {};

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);

      if (Number.isNaN(expenseDate.getTime())) {
        return;
      }

      const year = expenseDate.getFullYear();
      const month = expenseDate.getMonth() + 1;

      const key = `${year}-${String(month).padStart(2, "0")}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          year,
          month,
          total: 0,
          count: 0,
        };
      }

      monthlyMap[key].total += Number(
        expense.amount || 0
      );

      monthlyMap[key].count += 1;
    });

    const monthlyBreakdown = Object.values(monthlyMap).sort(
      (a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }

        return b.month - a.month;
      }
    );

    // ========================================================
    // INCOME ALLOCATION BREAKDOWN
    // ========================================================

    const incomeAllocationMap = {};

    expenses.forEach((expense) => {
      const allocations = expense.incomeAllocations || [];

      allocations.forEach((allocation) => {
        const incomeId = String(allocation.incomeId);

        if (!incomeAllocationMap[incomeId]) {
          incomeAllocationMap[incomeId] = {
            incomeId: allocation.incomeId,
            amount: 0,
          };
        }

        incomeAllocationMap[incomeId].amount += Number(
          allocation.amount || 0
        );
      });
    });

    const incomeAllocations = Object.values(
      incomeAllocationMap
    );

    // ========================================================
    // SAVINGS ALLOCATION BREAKDOWN
    // ========================================================

    const savingsAllocationMap = {};

    expenses.forEach((expense) => {
      const allocations = expense.savingsAllocations || [];

      allocations.forEach((allocation) => {
        const savingsId = String(allocation.savingsId);

        if (!savingsAllocationMap[savingsId]) {
          savingsAllocationMap[savingsId] = {
            savingsId: allocation.savingsId,
            amount: 0,
          };
        }

        savingsAllocationMap[savingsId].amount += Number(
          allocation.amount || 0
        );
      });
    });

    const savingsAllocations = Object.values(
      savingsAllocationMap
    );

    // ========================================================
    // AVERAGE EXPENSE
    // ========================================================

    const averageExpense =
      totalCount > 0
        ? totalExpenses / totalCount
        : 0;

    // ========================================================
    // HIGHEST EXPENSE
    // ========================================================

    let highestExpense = null;

    if (expenses.length > 0) {
      highestExpense = expenses.reduce(
        (highest, expense) => {
          if (
            !highest ||
            Number(expense.amount || 0) >
              Number(highest.amount || 0)
          ) {
            return expense;
          }

          return highest;
        },
        null
      );
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      data: {
        totalExpenses,

        totalCount,

        totalIncomeUsed,

        totalSavingsUsed,

        totalBudgetUsed,

        averageExpense: Number(
          averageExpense.toFixed(2)
        ),

        highestExpense,

        categoryBreakdown,

        typeBreakdown,

        monthlyBreakdown,

        incomeAllocations,

        savingsAllocations,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get expense statistics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expense statistics",
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

    if (
      !userId ||
      !isValidObjectId(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const expenses =
      await Expense.find({
        userId,
      }).sort({
        date: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      message:
        "Expenses retrieved successfully",

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
      message:
        "Failed to retrieve expenses",
      error: error.message,
    });
  }
};

// ============================================================
// FIND AND ALLOCATE MONEY
//
// Priority:
//
// 1. Income
// 2. Savings
//
// Example:
//
// Expense = 150000
//
// Income available = 100000
// Savings available = 80000
//
// Result:
//
// incomeUsed = 100000
// savingsUsed = 50000
//
// incomeAllocations = [
//   { incomeId, amount: 100000 }
// ]
//
// savingsAllocations = [
//   { savingsId, amount: 50000 }
// ]
// ============================================================

const allocateMoney = async ({
  amount,
  userId,
  email,
  session,
}) => {
  let remaining = amount;

  const incomeAllocations = [];
  const savingsAllocations = [];

  // ========================================================
  // INCOME
  // ========================================================

  const incomes =
    await Income.find({
      userId,
      email,

      remainingAmount: {
        $gt: 0,
      },
    })
      .sort({
        date: 1,
        createdAt: 1,
      })
      .session(session);

  for (const income of incomes) {
    if (remaining <= 0) {
      break;
    }

    const available =
      Number(
        income.remainingAmount
      ) || 0;

    if (available <= 0) {
      continue;
    }

    const used = Math.min(
      available,
      remaining
    );

    income.remainingAmount =
      available - used;

    await income.save({
      session,
    });

    incomeAllocations.push({
      incomeId: income._id,
      amount: used,
    });

    remaining -= used;
  }

  // ========================================================
  // SAVINGS
  // ========================================================

  if (remaining > 0) {
    const savings =
      await Savings.find({
        userId,
        email,

        currentAmount: {
          $gt: 0,
        },

        isCompleted: {
          $ne: true,
        },
      })
        .sort({
          priority: -1,
          createdAt: 1,
        })
        .session(session);

    for (const saving of savings) {
      if (remaining <= 0) {
        break;
      }

      const available =
        Number(
          saving.currentAmount
        ) || 0;

      if (available <= 0) {
        continue;
      }

      const used = Math.min(
        available,
        remaining
      );

      saving.currentAmount =
        available - used;

      await saving.save({
        session,
      });

      savingsAllocations.push({
        savingsId: saving._id,
        amount: used,
      });

      remaining -= used;
    }
  }

  // ========================================================
  // NOT ENOUGH MONEY
  // ========================================================

  if (remaining > 0) {
    throw new Error(
      `Insufficient funds. RWF ${remaining.toLocaleString()} is still required.`
    );
  }

  return {
    incomeAllocations,

    savingsAllocations,

    incomeUsed:
      incomeAllocations.reduce(
        (sum, allocation) =>
          sum + allocation.amount,
        0
      ),

    savingsUsed:
      savingsAllocations.reduce(
        (sum, allocation) =>
          sum + allocation.amount,
        0
      ),
  };
};

// ============================================================
// REVERSE MONEY ALLOCATIONS
//
// Used when:
// - updating an expense
// - deleting an expense
//
// Money is returned to the exact Income/Savings records that
// originally funded the expense.
// ============================================================

const reverseMoneyAllocations = async (
  expense,
  session
) => {
  // ========================================================
  // RETURN TO INCOME
  // ========================================================

  for (const allocation of
    expense.incomeAllocations || []) {
    const income =
      await Income.findById(
        allocation.incomeId
      ).session(session);

    if (!income) {
      throw new Error(
        `Income record ${allocation.incomeId} no longer exists.`
      );
    }

    income.remainingAmount =
      (Number(
        income.remainingAmount
      ) || 0) +
      Number(allocation.amount || 0);

    await income.save({
      session,
    });
  }

  // ========================================================
  // RETURN TO SAVINGS
  // ========================================================

  for (const allocation of
    expense.savingsAllocations || []) {
    const saving =
      await Savings.findById(
        allocation.savingsId
      ).session(session);

    if (!saving) {
      throw new Error(
        `Savings record ${allocation.savingsId} no longer exists.`
      );
    }

    saving.currentAmount =
      (Number(
        saving.currentAmount
      ) || 0) +
      Number(allocation.amount || 0);

    await saving.save({
      session,
    });
  }
};

// ============================================================
// FIND BUDGET FOR EXPENSE
//
// Budget category is lowercase in Budget model.
// Expense category keeps the original Expense model values.
// ============================================================

const findBudgetForExpense = async ({
  userId,
  category,
  date,
  session,
}) => {
  const expenseDate =
    new Date(date);

  const month =
    expenseDate.getMonth();

  const year =
    expenseDate.getFullYear();

  const budget =
    await Budget.findOne({
      userId,

      category:
        normalizeCategory(
          category
        ).toLowerCase(),

      month,

      year,
    }).session(session);

  return budget;
};

// ============================================================
// APPLY EXPENSE TO BUDGET
// ============================================================

const applyBudgetAmount = async ({
  budget,
  amount,
  session,
}) => {
  if (!budget) {
    return 0;
  }

  budget.spentAmount =
    (Number(
      budget.spentAmount
    ) || 0) + amount;

  await budget.save({
    session,
  });

  return amount;
};

// ============================================================
// REMOVE EXPENSE FROM BUDGET
// ============================================================

const reverseBudgetAmount = async ({
  budgetId,
  amount,
  session,
}) => {
  if (!budgetId || amount <= 0) {
    return;
  }

  const budget =
    await Budget.findById(
      budgetId
    ).session(session);

  if (!budget) {
    throw new Error(
      `Budget ${budgetId} no longer exists.`
    );
  }

  budget.spentAmount =
    Math.max(
      (Number(
        budget.spentAmount
      ) || 0) - amount,
      0
    );

  await budget.save({
    session,
  });
};

// ============================================================
// CREATE EXPENSE
//
// FLOW:
//
// Expense
//   ↓
// Income
//   ↓
// Savings
//   ↓
// Budget
//   ↓
// Notification
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
      type,
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
          "All expense fields are required",
      });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const numericAmount =
      parsePositiveWholeNumber(
        amount
      );

    if (numericAmount === null) {
      return res.status(400).json({
        success: false,
        message:
          "Amount must be a positive whole number",
      });
    }

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

    const normalizedEmail =
      normalizeEmail(email);

    const normalizedCategory =
      normalizeCategory(category);

    if (
      !EXPENSE_CATEGORIES.includes(
        normalizedCategory
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid expense category",
      });
    }

    // Expense records in this controller are always expenses.
    const expenseType =
      type || "expense";

    if (expenseType !== "expense") {
      return res.status(400).json({
        success: false,
        message:
          "This endpoint can only create expense records",
      });
    }

    // ========================================================
    // TRANSACTION
    // ========================================================

    let expense;

    let notification;

    await session.withTransaction(
      async () => {
        // ====================================================
        // ALLOCATE MONEY
        // ====================================================

        const allocation =
          await allocateMoney({
            amount: numericAmount,

            userId,

            email:
              normalizedEmail,

            session,
          });

        // ====================================================
        // FIND BUDGET
        // ====================================================

        const budget =
          await findBudgetForExpense({
            userId,

            category:
              normalizedCategory,

            date:
              expenseDate,

            session,
          });

        const budgetAmountUsed =
          budget
            ? numericAmount
            : 0;

        // ====================================================
        // CREATE EXPENSE
        // ====================================================

        const createdExpenses =
          await Expense.create(
            [
              {
                description:
                  String(
                    description
                  ).trim(),

                category:
                  normalizedCategory,

                type: "expense",

                amount:
                  numericAmount,

                date:
                  expenseDate,

                user:
                  String(
                    user
                  ).trim(),

                userId,

                email:
                  normalizedEmail,

                incomeUsed:
                  allocation.incomeUsed,

                savingsUsed:
                  allocation.savingsUsed,

                incomeAllocations:
                  allocation.incomeAllocations,

                savingsAllocations:
                  allocation.savingsAllocations,

                budgetId:
                  budget
                    ? budget._id
                    : null,

                budgetAmountUsed,
              },
            ],
            {
              session,
            }
          );

        expense =
          createdExpenses[0];

        // ====================================================
        // UPDATE BUDGET
        // ====================================================

        if (budget) {
          await applyBudgetAmount({
            budget,

            amount:
              numericAmount,

            session,
          });
        }

        // ====================================================
        // NOTIFICATION
        // ====================================================

        notification =
          await createNotification({
            userEmail:
              normalizedEmail,

            userId,

            title:
              "💸 Expense Added",

            message:
              `Expense of RWF ` +
              `${numericAmount.toLocaleString()} ` +
              `for ${normalizedCategory} ` +
              `was added.`,

            type: "expense",

            severity: "medium",

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
                numericAmount,

              category:
                normalizedCategory,

              incomeUsed:
                allocation.incomeUsed,

              savingsUsed:
                allocation.savingsUsed,

              budgetAmountUsed,

              budgetId:
                budget
                  ? budget._id
                  : null,
            },
          });
      }
    );

    return res.status(201).json({
      success: true,

      message:
        "Expense created successfully",

      data: expense,

      notification,
    });
  } catch (error) {
    console.error(
      "❌ Create expense error:",
      error
    );

    return res.status(400).json({
      success: false,

      message:
        error.message ||
        "Failed to create expense",
    });
  } finally {
    await session.endSession();
  }
};



// ============================================================
// BULK DELETE EXPENSES
//
// Deletes multiple expenses at once.
//
// IMPORTANT:
// Before deleting each expense:
// 1. Restore allocated Income amounts.
// 2. Restore allocated Savings amounts.
// 3. Restore Budget spentAmount.
// 4. Recalculate Budget fields using .save().
// 5. Create a notification.
// ============================================================

exports.bulkDeleteExpenses = async (req, res) => {
  try {
    const { expenseIds } = req.body;

    // ========================================================
    // VALIDATE IDS
    // ========================================================

    if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "expenseIds must be a non-empty array",
      });
    }

    // Remove duplicates
    const uniqueExpenseIds = [
      ...new Set(expenseIds.map((id) => String(id))),
    ];

    // Validate every ID
    for (const expenseId of uniqueExpenseIds) {
      if (!mongoose.Types.ObjectId.isValid(expenseId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid expense ID: ${expenseId}`,
        });
      }
    }

    // ========================================================
    // FETCH EXPENSES
    // ========================================================

    const expenses = await Expense.find({
      _id: {
        $in: uniqueExpenseIds,
      },
    });

    if (expenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No expenses found",
      });
    }

    // ========================================================
    // TRACK RESULTS
    // ========================================================

    const deletedExpenses = [];

    const notifications = [];

    // ========================================================
    // PROCESS EACH EXPENSE
    // ========================================================

    for (const expense of expenses) {
      // ======================================================
      // RESTORE INCOME
      // ======================================================

      for (const allocation of expense.incomeAllocations || []) {
        const income = await Income.findById(
          allocation.incomeId
        );

        if (!income) {
          console.warn(
            `⚠️ Income ${allocation.incomeId} not found while deleting expense ${expense._id}`
          );

          continue;
        }

        const allocationAmount =
          Number(allocation.amount) || 0;

        income.remainingAmount =
          Number(income.remainingAmount || 0) +
          allocationAmount;

        // Never allow remaining amount to exceed
        // the original income amount.

        if (
          income.remainingAmount >
          Number(income.amount)
        ) {
          income.remainingAmount =
            Number(income.amount);
        }

        await income.save();
      }

      // ======================================================
      // RESTORE SAVINGS
      // ======================================================

      for (const allocation of expense.savingsAllocations || []) {
        const savings = await Savings.findById(
          allocation.savingsId
        );

        if (!savings) {
          console.warn(
            `⚠️ Savings ${allocation.savingsId} not found while deleting expense ${expense._id}`
          );

          continue;
        }

        const allocationAmount =
          Number(allocation.amount) || 0;

        savings.currentAmount =
          Math.max(
            Number(savings.currentAmount || 0) -
              allocationAmount,
            0
          );

        await savings.save();
      }

      // ======================================================
      // RESTORE BUDGET
      // ======================================================

      if (expense.budgetId) {
        const budget = await Budget.findById(
          expense.budgetId
        );

        if (budget) {
          const budgetAmount =
            Number(expense.budgetAmountUsed) || 0;

          budget.spentAmount =
            Math.max(
              Number(budget.spentAmount || 0) -
                budgetAmount,
              0
            );

          // Budget model pre-save hook should
          // recalculate:
          //
          // remainingAmount
          // percentageUsed
          // status

          await budget.save();
        }
      }

      // ======================================================
      // SAVE INFORMATION FOR NOTIFICATION
      // ======================================================

      const expenseId = expense._id;

      const expenseEmail = expense.email;

      const expenseUserId = expense.userId;

      const expenseDescription =
        expense.description;

      const expenseCategory =
        expense.category;

      const expenseAmount =
        Number(expense.amount) || 0;

      // ======================================================
      // DELETE EXPENSE
      // ======================================================

      await expense.deleteOne();

      deletedExpenses.push({
        expenseId,

        description:
          expenseDescription,

        category:
          expenseCategory,

        amount:
          expenseAmount,
      });

      // ======================================================
      // CREATE NOTIFICATION
      // ======================================================

      const notification =
        await createNotification({
          userEmail: expenseEmail,

          userId: expenseUserId,

          title:
            "🗑️ Expense Deleted",

          message:
            `${expenseCategory} expense of RWF ` +
            `${expenseAmount.toLocaleString()} ` +
            `(${expenseDescription}) was deleted.`,

          type: "expense",

          severity: "medium",

          relatedId: expenseId,

          relatedType: "Expense",

          actionLink:
            "/expenses",

          metadata: {
            expenseId,

            amount:
              expenseAmount,

            category:
              expenseCategory,

            incomeRestored:
              Number(
                expense.incomeUsed || 0
              ),

            savingsRestored:
              Number(
                expense.savingsUsed || 0
              ),

            budgetRestored:
              Number(
                expense.budgetAmountUsed || 0
              ),
          },
        });

      if (notification) {
        notifications.push(notification);
      }
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message:
        `${deletedExpenses.length} expense(s) deleted successfully`,

      deletedCount:
        deletedExpenses.length,

      requestedCount:
        uniqueExpenseIds.length,

      deletedExpenses,

      notifications,
    });
  } catch (error) {
    console.error(
      "❌ Bulk delete expenses error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to bulk delete expenses",

      error:
        error.message,
    });
  }
};




// ============================================================
// UPDATE EXPENSE
//
// Important:
//
// We first return the old expense money:
//
// old Expense
//   ↓
// return Income
// return Savings
// return Budget
//
// Then allocate the new amount:
//
// new Expense
//   ↓
// Income
// Savings
// Budget
// Notification
//
// This prevents money from being deducted twice.
// ============================================================

exports.updateExpense = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense id",
      });
    }

    let updatedExpense;

    let notification;

    await session.withTransaction(
      async () => {
        const expense =
          await Expense.findById(
            id
          ).session(session);

        if (!expense) {
          throw new Error(
            "Expense not found"
          );
        }

        // ====================================================
        // SAVE ORIGINAL OWNER
        // ====================================================

        const expenseUserId =
          expense.userId;

        const expenseEmail =
          normalizeEmail(
            expense.email
          );

        // ====================================================
        // REQUESTED VALUES
        // ====================================================

        const {
          description,
          category,
          amount,
          date,
          user,
        } = req.body;

        const newDescription =
          description !== undefined
            ? String(
                description
              ).trim()
            : expense.description;

        const newCategory =
          category !== undefined
            ? normalizeCategory(
                category
              )
            : expense.category;

        const newAmount =
          amount !== undefined
            ? parsePositiveWholeNumber(
                amount
              )
            : Number(
                expense.amount
              );

        const newDate =
          date !== undefined
            ? new Date(date)
            : new Date(
                expense.date
              );

        // ====================================================
        // VALIDATE
        // ====================================================

        if (!newDescription) {
          throw new Error(
            "Description cannot be empty"
          );
        }

        if (
          !EXPENSE_CATEGORIES.includes(
            newCategory
          )
        ) {
          throw new Error(
            "Invalid expense category"
          );
        }

        if (newAmount === null) {
          throw new Error(
            "Amount must be a positive whole number"
          );
        }

        if (
          Number.isNaN(
            newDate.getTime()
          )
        ) {
          throw new Error(
            "Invalid expense date"
          );
        }

        // ====================================================
        // RETURN OLD MONEY
        // ====================================================

        await reverseMoneyAllocations(
          expense,
          session
        );

        // ====================================================
        // RETURN OLD BUDGET
        // ====================================================

        if (
          expense.budgetId &&
          Number(
            expense.budgetAmountUsed
          ) > 0
        ) {
          await reverseBudgetAmount({
            budgetId:
              expense.budgetId,

            amount:
              Number(
                expense.budgetAmountUsed
              ),

            session,
          });
        }

        // ====================================================
        // ALLOCATE NEW MONEY
        // ====================================================

        const allocation =
          await allocateMoney({
            amount: newAmount,

            userId:
              expenseUserId,

            email:
              expenseEmail,

            session,
          });

        // ====================================================
        // FIND NEW BUDGET
        // ====================================================

        const budget =
          await findBudgetForExpense({
            userId:
              expenseUserId,

            category:
              newCategory,

            date:
              newDate,

            session,
          });

        // ====================================================
        // APPLY NEW BUDGET
        // ====================================================

        if (budget) {
          await applyBudgetAmount({
            budget,

            amount:
              newAmount,

            session,
          });
        }

        // ====================================================
        // UPDATE EXPENSE
        // ====================================================

        expense.description =
          newDescription;

        expense.category =
          newCategory;

        expense.amount =
          newAmount;

        expense.date =
          newDate;

        if (user !== undefined) {
          expense.user =
            String(
              user
            ).trim();
        }

        expense.incomeUsed =
          allocation.incomeUsed;

        expense.savingsUsed =
          allocation.savingsUsed;

        expense.incomeAllocations =
          allocation.incomeAllocations;

        expense.savingsAllocations =
          allocation.savingsAllocations;

        expense.budgetId =
          budget
            ? budget._id
            : null;

        expense.budgetAmountUsed =
          budget
            ? newAmount
            : 0;

        await expense.save({
          session,
        });

        updatedExpense =
          expense;

        // ====================================================
        // NOTIFICATION
        // ====================================================

        notification =
          await createNotification({
            userEmail:
              expenseEmail,

            userId:
              expenseUserId,

            title:
              "📝 Expense Updated",

            message:
              `${newCategory} expense ` +
              `was updated to RWF ` +
              `${newAmount.toLocaleString()}.`,

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

              incomeUsed:
                allocation.incomeUsed,

              savingsUsed:
                allocation.savingsUsed,

              budgetAmountUsed:
                budget
                  ? newAmount
                  : 0,

              budgetId:
                budget
                  ? budget._id
                  : null,
            },
          });
      }
    );

    return res.status(200).json({
      success: true,

      message:
        "Expense updated successfully",

      data: updatedExpense,

      notification,
    });
  } catch (error) {
    console.error(
      "❌ Update expense error:",
      error
    );

    const status =
      error.message ===
      "Expense not found"
        ? 404
        : 400;

    return res.status(status).json({
      success: false,

      message:
        error.message ||
        "Failed to update expense",
    });
  } finally {
    await session.endSession();
  }
};

// ============================================================
// DELETE EXPENSE
//
// Reverse:
//
// Expense
//   ↓
// Income gets money back
// Savings gets money back
// Budget.spentAmount decreases
//
// Notification remains as historical information.
// ============================================================

exports.deleteExpense = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense id",
      });
    }

    let notification;

    await session.withTransaction(
      async () => {
        const expense =
          await Expense.findById(
            id
          ).session(session);

        if (!expense) {
          throw new Error(
            "Expense not found"
          );
        }

        // ====================================================
        // SAVE INFORMATION
        // ====================================================

        const expenseId =
          expense._id;

        const expenseEmail =
          expense.email;

        const expenseUserId =
          expense.userId;

        const expenseCategory =
          expense.category;

        const expenseAmount =
          Number(
            expense.amount
          ) || 0;

        const budgetId =
          expense.budgetId;

        const budgetAmountUsed =
          Number(
            expense.budgetAmountUsed
          ) || 0;

        // ====================================================
        // RETURN MONEY
        // ====================================================

        await reverseMoneyAllocations(
          expense,
          session
        );

        // ====================================================
        // RETURN BUDGET MONEY
        // ====================================================

        if (
          budgetId &&
          budgetAmountUsed > 0
        ) {
          await reverseBudgetAmount({
            budgetId,

            amount:
              budgetAmountUsed,

            session,
          });
        }

        // ====================================================
        // DELETE EXPENSE
        // ====================================================

        await expense.deleteOne({
          session,
        });

        // ====================================================
        // NOTIFICATION
        // ====================================================

        notification =
          await createNotification({
            userEmail:
              expenseEmail,

            userId:
              expenseUserId,

            title:
              "🗑️ Expense Deleted",

            message:
              `${expenseCategory} expense ` +
              `of RWF ` +
              `${expenseAmount.toLocaleString()} ` +
              `was deleted and the money was returned ` +
              `to its original sources.`,

            type:
              "expense",

            severity:
              "medium",

            relatedId:
              expenseId,

            relatedType:
              "expense",

            actionLink:
              "/expenses",

            metadata: {
              expenseId,

              amount:
                expenseAmount,

              category:
                expenseCategory,

              incomeReturned:
                Number(
                  expense.incomeUsed
                ) || 0,

              savingsReturned:
                Number(
                  expense.savingsUsed
                ) || 0,

              budgetReturned:
                budgetAmountUsed,

              budgetId:
                budgetId || null,
            },
          });
      }
    );

    return res.status(200).json({
      success: true,

      message:
        "Expense deleted successfully",

      notification,
    });
  } catch (error) {
    console.error(
      "❌ Delete expense error:",
      error
    );

    const status =
      error.message ===
      "Expense not found"
        ? 404
        : 400;

    return res.status(status).json({
      success: false,

      message:
        error.message ||
        "Failed to delete expense",
    });
  } finally {
    await session.endSession();
  }
};

// ============================================================
// GET EXPENSE STATISTICS
// ============================================================

exports.getExpenseStats = async (
  req,
  res
) => {
  try {
    const owner =
      buildOwnerQuery(req);

    if (owner.error) {
      return res.status(400).json({
        success: false,
        message: owner.error,
      });
    }

    const query =
      owner.query;

    // ========================================================
    // TOTAL
    // ========================================================

    const totalExpense =
      await Expense.aggregate([
        {
          $match: query,
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

    // ========================================================
    // BY CATEGORY
    // ========================================================

    const categoryStats =
      await Expense.aggregate([
        {
          $match: query,
        },

        {
          $group: {
            _id: "$category",

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
    // BY SOURCE
    // ========================================================

    const sourceStats =
      await Expense.aggregate([
        {
          $match: query,
        },

        {
          $group: {
            _id: null,

            incomeUsed: {
              $sum: "$incomeUsed",
            },

            savingsUsed: {
              $sum: "$savingsUsed",
            },
          },
        },
      ]);

    // ========================================================
    // LAST 12 MONTHS
    // ========================================================

    const twelveMonthsAgo =
      new Date();

    twelveMonthsAgo.setMonth(
      twelveMonthsAgo.getMonth() - 12
    );

    const monthlyStats =
      await Expense.aggregate([
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
                $year: "$date",
              },

              month: {
                $month: "$date",
              },
            },

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
            "_id.year": -1,
            "_id.month": -1,
          },
        },
      ]);

    // ========================================================
    // CURRENT MONTH BUDGET
    // ========================================================

    const currentMonth =
      new Date().getMonth();

    const currentYear =
      new Date().getFullYear();

    const budgetQuery = {
      month:
        currentMonth,

      year:
        currentYear,
    };

    if (query.userId) {
      budgetQuery.userId =
        query.userId;
    }

    if (query.email) {
      budgetQuery.email =
        query.email;
    }

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

    const totalBudgetSpent =
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
        ? (totalBudgetSpent /
            totalBudgeted) *
          100
        : 0;

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      data: {
        totalExpense:
          totalExpense.length > 0
            ? totalExpense[0]
                .total
            : 0,

        totalCount:
          totalExpense.length > 0
            ? totalExpense[0]
                .count
            : 0,

        categoryBreakdown:
          categoryStats,

        sourceBreakdown: {
          incomeUsed:
            sourceStats.length > 0
              ? sourceStats[0]
                  .incomeUsed
              : 0,

          savingsUsed:
            sourceStats.length > 0
              ? sourceStats[0]
                  .savingsUsed
              : 0,
        },

        monthlyBreakdown:
          monthlyStats,

        currentMonthBudget: {
          month:
            currentMonth,

          year:
            currentYear,

          totalBudgeted,

          totalSpent:
            totalBudgetSpent,

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
      "❌ Get expense stats error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch expense statistics",

      error: error.message,
    });
  }
};

// ============================================================
// GET BUDGET SUMMARY FOR EXPENSES
// ============================================================

exports.getExpenseBudgetSummary = async (
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

    // ========================================================
    // OWNER
    // ========================================================

    let ownerQuery = {};

    if (userId) {
      if (
        !isValidObjectId(userId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid userId",
        });
      }

      ownerQuery.userId =
        userId;
    } else if (email) {
      ownerQuery.email =
        normalizeEmail(email);
    } else if (req.user) {
      if (req.user._id) {
        ownerQuery.userId =
          req.user._id;
      } else if (
        req.user.email
      ) {
        ownerQuery.email =
          normalizeEmail(
            req.user.email
          );
      }
    } else {
      return res.status(400).json({
        success: false,

        message:
          "userId or email is required",
      });
    }

    // ========================================================
    // MONTH
    // ========================================================

    const currentMonth =
      month !== undefined
        ? Number(month)
        : new Date().getMonth();

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

    // ========================================================
    // YEAR
    // ========================================================

    const currentYear =
      year !== undefined
        ? Number(year)
        : new Date().getFullYear();

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

    // ========================================================
    // BUDGETS
    // ========================================================

    const budgets =
      await Budget.find({
        ...ownerQuery,

        month:
          currentMonth,

        year:
          currentYear,
      });

    // ========================================================
    // EXPENSES
    // ========================================================

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

    const expenses =
      await Expense.find({
        ...ownerQuery,

        date: {
          $gte:
            startDate,

          $lt:
            endDate,
        },
      });

    // ========================================================
    // TOTAL EXPENSE
    // ========================================================

    const totalExpenses =
      expenses.reduce(
        (sum, expense) =>
          sum +
          Number(
            expense.amount || 0
          ),
        0
      );

    // ========================================================
    // BUDGET TOTALS
    // ========================================================

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

    // ========================================================
    // CATEGORY BREAKDOWN
    // ========================================================

    const categories =
      budgets.map(
        (budget) => {
          const categoryExpenses =
            expenses
              .filter(
                (expense) =>
                  String(
                    expense.category
                  ).toLowerCase() ===
                  String(
                    budget.category
                  ).toLowerCase()
              )
              .reduce(
                (
                  sum,
                  expense
                ) =>
                  sum +
                  Number(
                    expense.amount ||
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

            expenses:
              categoryExpenses,
          };
        }
      );

    // ========================================================
    // STATUS
    // ========================================================

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

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      data: {
        month:
          currentMonth,

        year:
          currentYear,

        totalExpenses,

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

        categories,
      },
    });
  } catch (error) {
    console.error(
      "❌ Expense budget summary error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch expense budget summary",

      error: error.message,
    });
  }
};

