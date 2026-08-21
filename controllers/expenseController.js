
// // ============================================================
// // CONTROLLERS / EXPENSE.CONTROLLER.JS
// // ============================================================

// const mongoose = require("mongoose");

// const Expense = require("../models/Expense");
// const Income = require("../models/Income");
// const Savings = require("../models/Savings");
// const Budget = require("../models/Budget");

// const createNotification = require("../utils/createNotification");

// // ============================================================
// // EXPENSE CATEGORIES
// // ============================================================

// const EXPENSE_CATEGORIES = [
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
// // HELPERS
// // ============================================================

// const isValidObjectId = (id) => {
//   return mongoose.Types.ObjectId.isValid(id);
// };

// const normalizeEmail = (email) => {
//   return String(email || "")
//     .trim()
//     .toLowerCase();
// };

// const normalizeCategory = (category) => {
//   return String(category || "").trim();
// };

// const parsePositiveWholeNumber = (value) => {
//   const number = Number(value);

//   if (!Number.isFinite(number) || !Number.isInteger(number) || number <= 0) {
//     return null;
//   }

//   return number;
// };

// const parseNonNegativeWholeNumber = (value) => {
//   const number = Number(value);

//   if (!Number.isFinite(number) || !Number.isInteger(number) || number < 0) {
//     return null;
//   }

//   return number;
// };

// const normalizeExpenseType = (type) => {
//   return String(type || "expense")
//     .trim()
//     .toLowerCase();
// };

// // ============================================================
// // VALIDATE EXPENSE CATEGORY
// // ============================================================

// const isValidExpenseCategory = (category) => {
//   return EXPENSE_CATEGORIES.includes(normalizeCategory(category));
// };

// // ============================================================
// // GET OWNER
// //
// // userId is primary.
// // email remains supported for compatibility.
// // ============================================================

// const buildOwnerQuery = (req) => {
//   const { userId, email } = req.query;

//   // ----------------------------------------------------------
//   // USER ID
//   // ----------------------------------------------------------

//   if (userId) {
//     if (!isValidObjectId(userId)) {
//       return {
//         error: "Invalid userId",
//       };
//     }

//     return {
//       query: {
//         userId,
//       },
//     };
//   }

//   // ----------------------------------------------------------
//   // EMAIL
//   // ----------------------------------------------------------

//   if (email) {
//     return {
//       query: {
//         email: normalizeEmail(email),
//       },
//     };
//   }

//   // ----------------------------------------------------------
//   // AUTHENTICATED USER
//   // ----------------------------------------------------------

//   if (req.user) {
//     if (req.user._id) {
//       return {
//         query: {
//           userId: req.user._id,
//         },
//       };
//     }

//     if (req.user.email) {
//       return {
//         query: {
//           email: normalizeEmail(req.user.email),
//         },
//       };
//     }
//   }

//   return {
//     error: "userId or email is required",
//   };
// };

// // ============================================================
// // CREATE NOTIFICATION SAFELY
// //
// // Financial operations should not fail just because
// // notification creation failed after the transaction committed.
// // ============================================================

// const createNotificationSafely = async (payload) => {
//   try {
//     return await createNotification(payload);
//   } catch (error) {
//     console.error("⚠️ Expense notification creation failed:", error.message);

//     return null;
//   }
// };

// // ============================================================
// // GET ALL EXPENSES
// //
// // Supports:
// //
// // ?userId=...
// // ?email=...
// // ?category=...
// // ?type=...
// // ?startDate=...
// // ?endDate=...
// // ?search=...
// // ?month=...
// // ?year=...
// // ============================================================

// exports.getExpenses = async (req, res) => {
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

//     // --------------------------------------------------------
//     // USER ID
//     // --------------------------------------------------------

//     if (userId) {
//       if (!isValidObjectId(userId)) {
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
//       query.email = normalizeEmail(email);
//     }

//     // --------------------------------------------------------
//     // CATEGORY
//     // --------------------------------------------------------

//     if (category && category.toLowerCase() !== "all") {
//       query.category = category.trim();
//     }

//     // --------------------------------------------------------
//     // TYPE
//     // --------------------------------------------------------

//     if (type && type.toLowerCase() !== "all") {
//       query.type = normalizeExpenseType(type);
//     }

//     // --------------------------------------------------------
//     // DATE RANGE
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

//     // --------------------------------------------------------
//     // MONTH
//     //
//     // Supports month=1..12 from frontend as well as
//     // JavaScript month 0..11 internally.
//     // --------------------------------------------------------

//     if (month !== undefined) {
//       const numericMonth = Number(month);

//       if (
//         !Number.isInteger(numericMonth) ||
//         numericMonth < 0 ||
//         numericMonth > 11
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Month must be an integer between 0 and 11",
//         });
//       }

//       const selectedYear =
//         year !== undefined ? Number(year) : new Date().getFullYear();

//       if (!Number.isInteger(selectedYear) || selectedYear < 2000) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid year",
//         });
//       }

//       query.date = {
//         ...(query.date || {}),
//         $gte: new Date(selectedYear, numericMonth, 1),
//         $lt: new Date(selectedYear, numericMonth + 1, 1),
//       };
//     }

//     // --------------------------------------------------------
//     // YEAR
//     // --------------------------------------------------------

//     if (year !== undefined && month === undefined) {
//       const numericYear = Number(year);

//       if (!Number.isInteger(numericYear) || numericYear < 2000) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid year",
//         });
//       }

//       query.date = {
//         ...(query.date || {}),
//         $gte: new Date(numericYear, 0, 1),
//         $lt: new Date(numericYear + 1, 0, 1),
//       };
//     }

//     // --------------------------------------------------------
//     // SEARCH
//     // --------------------------------------------------------

//     if (search && search.trim()) {
//       const searchValue = search.trim();

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

//     // --------------------------------------------------------
//     // FETCH
//     // --------------------------------------------------------

//     const expenses = await Expense.find(query).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     // --------------------------------------------------------
//     // SUMMARY
//     // --------------------------------------------------------

//     const totalExpenses = expenses.reduce(
//       (sum, expense) => sum + Number(expense.amount || 0),
//       0,
//     );

//     const totalIncomeUsed = expenses.reduce(
//       (sum, expense) => sum + Number(expense.incomeUsed || 0),
//       0,
//     );

//     const totalSavingsUsed = expenses.reduce(
//       (sum, expense) => sum + Number(expense.savingsUsed || 0),
//       0,
//     );

//     const totalBudgetUsed = expenses.reduce(
//       (sum, expense) => sum + Number(expense.budgetAmountUsed || 0),
//       0,
//     );

//     return res.status(200).json({
//       success: true,

//       count: expenses.length,

//       data: expenses,

//       summary: {
//         totalExpenses,
//         totalIncomeUsed,
//         totalSavingsUsed,
//         totalBudgetUsed,
//       },
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
// // GET SINGLE EXPENSE
// // ============================================================

// exports.getExpense = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!isValidObjectId(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense id",
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
// // GET EXPENSES BY EMAIL
// // ============================================================

// exports.getExpensesByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const normalizedEmail = normalizeEmail(email);

//     const expenses = await Expense.find({
//       email: normalizedEmail,
//     }).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     return res.status(200).json({
//       success: true,

//       message: "Expenses retrieved successfully",

//       count: expenses.length,

//       data: expenses,
//     });
//   } catch (error) {
//     console.error("❌ Get expenses by email error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to retrieve expenses",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET ALL EXPENSES
// // NO FILTERS
// // ============================================================

// exports.getAllExpenses = async (req, res) => {
//   try {
//     const expenses = await Expense.find().sort({
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
// // GET EXPENSE STATISTICS
// // NO FILTERS
// // Calculates statistics for ALL expenses
// // ============================================================

// exports.getStats = async (req, res) => {
//   try {
//     const expenses = await Expense.find();

//     // --------------------------------------------------------
//     // BASIC TOTALS
//     // --------------------------------------------------------

//     const totalExpenses = expenses.reduce(
//       (sum, expense) => sum + Number(expense.amount || 0),
//       0,
//     );

//     const totalCount = expenses.length;

//     // --------------------------------------------------------
//     // INCOME / SAVINGS
//     // --------------------------------------------------------

//     const totalIncomeUsed = expenses.reduce(
//       (sum, expense) => sum + Number(expense.incomeUsed || 0),
//       0,
//     );

//     const totalSavingsUsed = expenses.reduce(
//       (sum, expense) => sum + Number(expense.savingsUsed || 0),
//       0,
//     );

//     // --------------------------------------------------------
//     // BUDGET
//     // --------------------------------------------------------

//     const totalBudgetUsed = expenses.reduce(
//       (sum, expense) => sum + Number(expense.budgetAmountUsed || 0),
//       0,
//     );

//     // --------------------------------------------------------
//     // CATEGORY
//     // --------------------------------------------------------

//     const categoryMap = {};

//     expenses.forEach((expense) => {
//       const category = expense.category || "Other";

//       if (!categoryMap[category]) {
//         categoryMap[category] = {
//           category,
//           total: 0,
//           count: 0,
//         };
//       }

//       categoryMap[category].total += Number(expense.amount || 0);

//       categoryMap[category].count += 1;
//     });

//     const categoryBreakdown = Object.values(categoryMap).sort(
//       (a, b) => b.total - a.total,
//     );

//     // --------------------------------------------------------
//     // TYPE
//     // --------------------------------------------------------

//     const typeMap = {};

//     expenses.forEach((expense) => {
//       const type = expense.type || "expense";

//       if (!typeMap[type]) {
//         typeMap[type] = {
//           type,
//           total: 0,
//           count: 0,
//         };
//       }

//       typeMap[type].total += Number(expense.amount || 0);

//       typeMap[type].count += 1;
//     });

//     const typeBreakdown = Object.values(typeMap).sort(
//       (a, b) => b.total - a.total,
//     );

//     // --------------------------------------------------------
//     // MONTHLY
//     // --------------------------------------------------------

//     const monthlyMap = {};

//     expenses.forEach((expense) => {
//       const expenseDate = new Date(expense.date);

//       if (Number.isNaN(expenseDate.getTime())) {
//         return;
//       }

//       const expenseYear = expenseDate.getFullYear();
//       const expenseMonth = expenseDate.getMonth() + 1;

//       const key =
//         `${expenseYear}-` + `${String(expenseMonth).padStart(2, "0")}`;

//       if (!monthlyMap[key]) {
//         monthlyMap[key] = {
//           year: expenseYear,
//           month: expenseMonth,
//           total: 0,
//           count: 0,
//         };
//       }

//       monthlyMap[key].total += Number(expense.amount || 0);

//       monthlyMap[key].count += 1;
//     });

//     const monthlyBreakdown = Object.values(monthlyMap).sort((a, b) => {
//       if (a.year !== b.year) {
//         return b.year - a.year;
//       }

//       return b.month - a.month;
//     });

//     // --------------------------------------------------------
//     // INCOME ALLOCATIONS
//     // --------------------------------------------------------

//     const incomeAllocationMap = {};

//     expenses.forEach((expense) => {
//       const allocations = expense.incomeAllocations || [];

//       allocations.forEach((allocation) => {
//         if (!allocation.incomeId) {
//           return;
//         }

//         const incomeId = String(allocation.incomeId);

//         if (!incomeAllocationMap[incomeId]) {
//           incomeAllocationMap[incomeId] = {
//             incomeId: allocation.incomeId,
//             amount: 0,
//           };
//         }

//         incomeAllocationMap[incomeId].amount += Number(allocation.amount || 0);
//       });
//     });

//     const incomeAllocations = Object.values(incomeAllocationMap);

//     // --------------------------------------------------------
//     // SAVINGS ALLOCATIONS
//     // --------------------------------------------------------

//     const savingsAllocationMap = {};

//     expenses.forEach((expense) => {
//       const allocations = expense.savingsAllocations || [];

//       allocations.forEach((allocation) => {
//         if (!allocation.savingsId) {
//           return;
//         }

//         const savingsId = String(allocation.savingsId);

//         if (!savingsAllocationMap[savingsId]) {
//           savingsAllocationMap[savingsId] = {
//             savingsId: allocation.savingsId,
//             amount: 0,
//           };
//         }

//         savingsAllocationMap[savingsId].amount += Number(
//           allocation.amount || 0,
//         );
//       });
//     });

//     const savingsAllocations = Object.values(savingsAllocationMap);

//     // --------------------------------------------------------
//     // AVERAGE
//     // --------------------------------------------------------

//     const averageExpense = totalCount > 0 ? totalExpenses / totalCount : 0;

//     // --------------------------------------------------------
//     // HIGHEST
//     // --------------------------------------------------------

//     let highestExpense = null;

//     if (expenses.length > 0) {
//       highestExpense = expenses.reduce((highest, expense) => {
//         if (
//           !highest ||
//           Number(expense.amount || 0) > Number(highest.amount || 0)
//         ) {
//           return expense;
//         }

//         return highest;
//       }, null);
//     }

//     return res.status(200).json({
//       success: true,

//       data: {
//         totalExpenses,

//         totalCount,

//         totalIncomeUsed,

//         totalSavingsUsed,

//         totalBudgetUsed,

//         averageExpense: Number(averageExpense.toFixed(2)),

//         highestExpense,

//         categoryBreakdown,

//         typeBreakdown,

//         monthlyBreakdown,

//         incomeAllocations,

//         savingsAllocations,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Get expense statistics error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch expense statistics",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET EXPENSES BY USER ID
// // ============================================================

// exports.getExpensesByUserId = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!userId || !isValidObjectId(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     const expenses = await Expense.find({
//       userId,
//     }).sort({
//       date: -1,
//       createdAt: -1,
//     });

//     return res.status(200).json({
//       success: true,

//       message: "Expenses retrieved successfully",

//       count: expenses.length,

//       data: expenses,
//     });
//   } catch (error) {
//     console.error("❌ Get expenses by userId error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to retrieve expenses",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // ALLOCATE MONEY
// //
// // Priority:
// //
// // 1. Income
// // 2. Savings
// //
// // Income is completely exhausted before savings are touched.
// //
// // Example:
// //
// // Expense = 150000
// // Income = 100000
// // Savings = 80000
// //
// // incomeUsed = 100000
// // savingsUsed = 50000
// // ============================================================

// const allocateMoney = async ({ amount, userId, email, session }) => {
//   let remaining = Number(amount);

//   const incomeAllocations = [];
//   const savingsAllocations = [];

//   // ========================================================
//   // INCOME
//   // ========================================================

//   const incomes = await Income.find({
//     userId,
//     email,

//     remainingAmount: {
//       $gt: 0,
//     },
//   })
//     .sort({
//       date: 1,
//       createdAt: 1,
//     })
//     .session(session);

//   for (const income of incomes) {
//     if (remaining <= 0) {
//       break;
//     }

//     const available = Number(income.remainingAmount) || 0;

//     if (available <= 0) {
//       continue;
//     }

//     const used = Math.min(available, remaining);

//     income.remainingAmount = available - used;

//     // Prevent floating/invalid values.
//     if (income.remainingAmount < 0) {
//       income.remainingAmount = 0;
//     }

//     await income.save({
//       session,
//     });

//     incomeAllocations.push({
//       incomeId: income._id,
//       amount: used,
//     });

//     remaining -= used;
//   }

//   // ========================================================
//   // SAVINGS
//   // ========================================================

//   if (remaining > 0) {
//     const savings = await Savings.find({
//       userId,
//       email,

//       currentAmount: {
//         $gt: 0,
//       },

//       isCompleted: {
//         $ne: true,
//       },
//     })
//       .sort({
//         priority: -1,
//         createdAt: 1,
//       })
//       .session(session);

//     for (const saving of savings) {
//       if (remaining <= 0) {
//         break;
//       }

//       const available = Number(saving.currentAmount) || 0;

//       if (available <= 0) {
//         continue;
//       }

//       const used = Math.min(available, remaining);

//       saving.currentAmount = available - used;

//       if (saving.currentAmount < 0) {
//         saving.currentAmount = 0;
//       }

//       await saving.save({
//         session,
//       });

//       savingsAllocations.push({
//         savingsId: saving._id,
//         amount: used,
//       });

//       remaining -= used;
//     }
//   }

//   // ========================================================
//   // NOT ENOUGH MONEY
//   // ========================================================

//   if (remaining > 0) {
//     throw new Error(
//       `Insufficient funds. RWF ${remaining.toLocaleString()} is still required.`,
//     );
//   }

//   return {
//     incomeAllocations,

//     savingsAllocations,

//     incomeUsed: incomeAllocations.reduce(
//       (sum, allocation) => sum + Number(allocation.amount || 0),
//       0,
//     ),

//     savingsUsed: savingsAllocations.reduce(
//       (sum, allocation) => sum + Number(allocation.amount || 0),
//       0,
//     ),
//   };
// };

// // ============================================================
// // REVERSE MONEY ALLOCATIONS
// //
// // Returns money to the exact records that originally funded
// // the expense.
// //
// // Income:
// // remainingAmount + allocation.amount
// //
// // Savings:
// // currentAmount + allocation.amount
// // ============================================================

// const reverseMoneyAllocations = async (expense, session) => {
//   // ========================================================
//   // RETURN TO INCOME
//   // ========================================================

//   for (const allocation of expense.incomeAllocations || []) {
//     if (!allocation.incomeId) {
//       continue;
//     }

//     const income = await Income.findById(allocation.incomeId).session(session);

//     if (!income) {
//       throw new Error(`Income record ${allocation.incomeId} no longer exists.`);
//     }

//     const allocationAmount = Number(allocation.amount) || 0;

//     if (allocationAmount <= 0) {
//       continue;
//     }

//     const originalAmount = Number(income.amount) || 0;

//     income.remainingAmount =
//       (Number(income.remainingAmount) || 0) + allocationAmount;

//     // Never restore beyond the original income amount.
//     if (originalAmount > 0 && income.remainingAmount > originalAmount) {
//       income.remainingAmount = originalAmount;
//     }

//     await income.save({
//       session,
//     });
//   }

//   // ========================================================
//   // RETURN TO SAVINGS
//   // ========================================================

//   for (const allocation of expense.savingsAllocations || []) {
//     if (!allocation.savingsId) {
//       continue;
//     }

//     const saving = await Savings.findById(allocation.savingsId).session(
//       session,
//     );

//     if (!saving) {
//       throw new Error(
//         `Savings record ${allocation.savingsId} no longer exists.`,
//       );
//     }

//     const allocationAmount = Number(allocation.amount) || 0;

//     if (allocationAmount <= 0) {
//       continue;
//     }

//     // IMPORTANT:
//     // Deleting/updating an expense MUST RESTORE savings.
//     saving.currentAmount =
//       (Number(saving.currentAmount) || 0) + allocationAmount;

//     if (saving.currentAmount < 0) {
//       saving.currentAmount = 0;
//     }

//     await saving.save({
//       session,
//     });
//   }
// };

// // ============================================================
// // FIND BUDGET FOR EXPENSE
// //
// // Budget category is lowercase.
// // Expense category may be capitalized.
// // ============================================================

// const findBudgetForExpense = async ({ userId, category, date, session }) => {
//   const expenseDate = new Date(date);

//   if (Number.isNaN(expenseDate.getTime())) {
//     return null;
//   }

//   const month = expenseDate.getMonth();
//   const year = expenseDate.getFullYear();

//   const budget = await Budget.findOne({
//     userId,

//     category: normalizeCategory(category).toLowerCase(),

//     month,

//     year,
//   }).session(session);

//   return budget;
// };

// // ============================================================
// // APPLY EXPENSE TO BUDGET
// // ============================================================

// // const applyBudgetAmount = async ({
// //   budget,
// //   amount,
// //   session,
// // }) => {
// //   if (!budget) {
// //     return 0;
// //   }

// //   const numericAmount =
// //     Number(amount) || 0;

// //   if (numericAmount <= 0) {
// //     return 0;
// //   }

// //   budget.spentAmount =
// //     (Number(budget.spentAmount) || 0) +
// //     numericAmount;

// //   await budget.save({
// //     session,
// //   });

// //   return numericAmount;
// // };

// // ============================================================
// // APPLY EXPENSE AMOUNT TO BUDGET
// // ============================================================

// const applyBudgetAmount = async ({ budget, amount, session }) => {
//   if (!budget) {
//     return 0;
//   }

//   const numericAmount = Number(amount) || 0;

//   if (numericAmount <= 0) {
//     return 0;
//   }

//   // Add expense to spent amount
//   budget.spentAmount = (Number(budget.spentAmount) || 0) + numericAmount;

//   // Recalculate all derived budget values
//   recalculateBudget(budget);

//   await budget.save({
//     session,
//   });

//   return numericAmount;
// };

// // ============================================================
// // REMOVE EXPENSE FROM BUDGET
// // ============================================================

// // const reverseBudgetAmount = async ({
// //   budgetId,
// //   amount,
// //   session,
// // }) => {
// //   if (!budgetId) {
// //     return;
// //   }

// //   const numericAmount =
// //     Number(amount) || 0;

// //   if (numericAmount <= 0) {
// //     return;
// //   }

// //   const budget = await Budget.findById(
// //     budgetId,
// //   ).session(session);

// //   if (!budget) {
// //     throw new Error(
// //       `Budget ${budgetId} no longer exists.`,
// //     );
// //   }

// //   budget.spentAmount = Math.max(
// //     (Number(budget.spentAmount) || 0) -
// //       numericAmount,
// //     0,
// //   );

// //   await budget.save({
// //     session,
// //   });
// // };

// // ============================================================
// // REVERSE EXPENSE FROM BUDGET
// // ============================================================

// const reverseBudgetAmount = async ({ budgetId, amount, session }) => {
//   if (!budgetId) {
//     return;
//   }

//   const numericAmount = Number(amount) || 0;

//   if (numericAmount <= 0) {
//     return;
//   }

//   const budget = await Budget.findById(budgetId).session(session);

//   if (!budget) {
//     throw new Error(`Budget ${budgetId} no longer exists.`);
//   }

//   // Remove the expense from spent amount
//   budget.spentAmount = Math.max(
//     (Number(budget.spentAmount) || 0) - numericAmount,
//     0,
//   );

//   // Recalculate all derived values
//   recalculateBudget(budget);

//   await budget.save({
//     session,
//   });
// };

// // ============================================================
// // CREATE EXPENSE
// //
// // FLOW:
// //
// // Expense
// //   ↓
// // Income
// //   ↓
// // Savings
// //   ↓
// // Budget
// //   ↓
// // Notification
// // ============================================================

// exports.createExpense = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const { description, category, type, amount, date, user, email, userId } =
//       req.body;

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
//         message: "All expense fields are required",
//       });
//     }

//     if (!isValidObjectId(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     const numericAmount = parsePositiveWholeNumber(amount);

//     if (numericAmount === null) {
//       return res.status(400).json({
//         success: false,
//         message: "Amount must be a positive whole number",
//       });
//     }

//     const expenseDate = new Date(date);

//     if (Number.isNaN(expenseDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense date",
//       });
//     }

//     const normalizedEmail = normalizeEmail(email);

//     if (!normalizedEmail) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid email is required",
//       });
//     }

//     const normalizedCategory = normalizeCategory(category);

//     if (!isValidExpenseCategory(normalizedCategory)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense category",
//       });
//     }

//     const expenseType = normalizeExpenseType(type);

//     if (expenseType !== "expense") {
//       return res.status(400).json({
//         success: false,
//         message: "This endpoint can only create expense records",
//       });
//     }

//     // ========================================================
//     // TRANSACTION
//     // ========================================================

//     let expense;

//     await session.withTransaction(async () => {
//       // ------------------------------------------------------
//       // ALLOCATE MONEY
//       // ------------------------------------------------------

//       const allocation = await allocateMoney({
//         amount: numericAmount,

//         userId,

//         email: normalizedEmail,

//         session,
//       });

//       // ------------------------------------------------------
//       // FIND BUDGET
//       // ------------------------------------------------------

//       const budget = await findBudgetForExpense({
//         userId,

//         category: normalizedCategory,

//         date: expenseDate,

//         session,
//       });

//       const budgetAmountUsed = budget ? numericAmount : 0;

//       // ------------------------------------------------------
//       // CREATE EXPENSE
//       // ------------------------------------------------------

//       const createdExpenses = await Expense.create(
//         [
//           {
//             description: String(description).trim(),

//             category: normalizedCategory,

//             type: "expense",

//             amount: numericAmount,

//             date: expenseDate,

//             user: String(user).trim(),

//             userId,

//             email: normalizedEmail,

//             incomeUsed: allocation.incomeUsed,

//             savingsUsed: allocation.savingsUsed,

//             incomeAllocations: allocation.incomeAllocations,

//             savingsAllocations: allocation.savingsAllocations,

//             budgetId: budget ? budget._id : null,

//             budgetAmountUsed,
//           },
//         ],
//         {
//           session,
//         },
//       );

//       expense = createdExpenses[0];

//       // ------------------------------------------------------
//       // UPDATE BUDGET
//       // ------------------------------------------------------

//       if (budget) {
//         await applyBudgetAmount({
//           budget,

//           amount: numericAmount,

//           session,
//         });
//       }
//     });

//     // ========================================================
//     // NOTIFICATION
//     //
//     // Created AFTER transaction commits.
//     // ========================================================

//     const notification = await createNotificationSafely({
//       userEmail: normalizedEmail,

//       userId,

//       title: "💸 Expense Added",

//       message:
//         `Expense of RWF ` +
//         `${numericAmount.toLocaleString()} ` +
//         `for ${normalizedCategory} ` +
//         `was added.`,

//       type: "expense",

//       severity: "medium",

//       relatedId: expense._id,

//       relatedType: "expense",

//       actionLink: `/expenses/${expense._id}`,

//       metadata: {
//         expenseId: expense._id,

//         amount: numericAmount,

//         category: normalizedCategory,

//         incomeUsed: expense.incomeUsed,

//         savingsUsed: expense.savingsUsed,

//         budgetAmountUsed: expense.budgetAmountUsed,

//         budgetId: expense.budgetId,
//       },
//     });

//     return res.status(201).json({
//       success: true,

//       message: "Expense created successfully",

//       data: expense,

//       notification,
//     });
//   } catch (error) {
//     console.error("❌ Create expense error:", error);

//     return res.status(400).json({
//       success: false,

//       message: error.message || "Failed to create expense",
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// // ============================================================
// // BULK DELETE EXPENSES
// //
// // IMPORTANT:
// //
// // Everything happens inside ONE transaction.
// //
// // If any expense cannot be safely restored/deleted,
// // EVERYTHING is rolled back.
// //
// // Restore:
// //
// // Income:
// // + allocation.amount
// //
// // Savings:
// // + allocation.amount
// //
// // Budget:
// // - budgetAmountUsed
// // ============================================================

// exports.bulkDeleteExpenses = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const { expenseIds } = req.body;

//     // ========================================================
//     // VALIDATE IDS
//     // ========================================================

//     if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "expenseIds must be a non-empty array",
//       });
//     }

//     const uniqueExpenseIds = [...new Set(expenseIds.map((id) => String(id)))];

//     for (const expenseId of uniqueExpenseIds) {
//       if (!isValidObjectId(expenseId)) {
//         return res.status(400).json({
//           success: false,
//           message: `Invalid expense ID: ${expenseId}`,
//         });
//       }
//     }

//     let deletedExpenses = [];

//     // ========================================================
//     // TRANSACTION
//     // ========================================================

//     await session.withTransaction(async () => {
//       const expenses = await Expense.find({
//         _id: {
//           $in: uniqueExpenseIds,
//         },
//       }).session(session);

//       if (expenses.length === 0) {
//         throw new Error("No expenses found");
//       }

//       // ----------------------------------------------------
//       // DELETE EACH EXPENSE
//       // ----------------------------------------------------

//       for (const expense of expenses) {
//         // ----------------------------------------------
//         // RESTORE INCOME
//         // ----------------------------------------------

//         for (const allocation of expense.incomeAllocations || []) {
//           if (!allocation.incomeId) {
//             continue;
//           }

//           const income = await Income.findById(allocation.incomeId).session(
//             session,
//           );

//           if (!income) {
//             throw new Error(
//               `Income ${allocation.incomeId} no longer exists. Cannot safely delete expense ${expense._id}.`,
//             );
//           }

//           const allocationAmount = Number(allocation.amount) || 0;

//           if (allocationAmount <= 0) {
//             continue;
//           }

//           income.remainingAmount =
//             (Number(income.remainingAmount) || 0) + allocationAmount;

//           const originalIncome = Number(income.amount) || 0;

//           if (originalIncome > 0 && income.remainingAmount > originalIncome) {
//             income.remainingAmount = originalIncome;
//           }

//           await income.save({
//             session,
//           });
//         }

//         // ----------------------------------------------
//         // RESTORE SAVINGS
//         // ----------------------------------------------

//         for (const allocation of expense.savingsAllocations || []) {
//           if (!allocation.savingsId) {
//             continue;
//           }

//           const savings = await Savings.findById(allocation.savingsId).session(
//             session,
//           );

//           if (!savings) {
//             throw new Error(
//               `Savings ${allocation.savingsId} no longer exists. Cannot safely delete expense ${expense._id}.`,
//             );
//           }

//           const allocationAmount = Number(allocation.amount) || 0;

//           if (allocationAmount <= 0) {
//             continue;
//           }

//           // IMPORTANT:
//           // RESTORE savings with PLUS.
//           savings.currentAmount =
//             (Number(savings.currentAmount) || 0) + allocationAmount;

//           if (savings.currentAmount < 0) {
//             savings.currentAmount = 0;
//           }

//           await savings.save({
//             session,
//           });
//         }

//         // ----------------------------------------------
//         // RESTORE BUDGET
//         // ----------------------------------------------

//         if (expense.budgetId) {
//           const budget = await Budget.findById(expense.budgetId).session(
//             session,
//           );

//           if (!budget) {
//             throw new Error(
//               `Budget ${expense.budgetId} no longer exists. Cannot safely delete expense ${expense._id}.`,
//             );
//           }

//           const budgetAmount = Number(expense.budgetAmountUsed) || 0;

//           if (budgetAmount > 0) {
//             budget.spentAmount = Math.max(
//               (Number(budget.spentAmount) || 0) - budgetAmount,
//               0,
//             );

//             await budget.save({
//               session,
//             });
//           }
//         }

//         // ----------------------------------------------
//         // SAVE INFORMATION
//         // ----------------------------------------------

//         deletedExpenses.push({
//           expenseId: expense._id,

//           description: expense.description,

//           category: expense.category,

//           amount: Number(expense.amount) || 0,

//           email: expense.email,

//           userId: expense.userId,

//           incomeReturned: Number(expense.incomeUsed) || 0,

//           savingsReturned: Number(expense.savingsUsed) || 0,

//           budgetReturned: Number(expense.budgetAmountUsed) || 0,
//         });

//         // ----------------------------------------------
//         // DELETE
//         // ----------------------------------------------

//         await expense.deleteOne({
//           session,
//         });
//       }

//       // ----------------------------------------------------
//       // VERIFY ALL REQUESTED IDS WERE FOUND
//       // ----------------------------------------------------

//       if (expenses.length !== uniqueExpenseIds.length) {
//         const foundIds = new Set(
//           expenses.map((expense) => String(expense._id)),
//         );

//         const missingIds = uniqueExpenseIds.filter((id) => !foundIds.has(id));

//         throw new Error(
//           `Some expenses were not found: ${missingIds.join(", ")}`,
//         );
//       }
//     });

//     // ========================================================
//     // CREATE NOTIFICATIONS AFTER COMMIT
//     // ========================================================

//     const notifications = [];

//     for (const deleted of deletedExpenses) {
//       const notification = await createNotificationSafely({
//         userEmail: deleted.email,

//         userId: deleted.userId,

//         title: "🗑️ Expense Deleted",

//         message:
//           `${deleted.category} expense of RWF ` +
//           `${deleted.amount.toLocaleString()} ` +
//           `(${deleted.description}) was deleted and the money was returned to its original sources.`,

//         type: "expense",

//         severity: "medium",

//         relatedId: deleted.expenseId,

//         relatedType: "expense",

//         actionLink: "/expenses",

//         metadata: {
//           expenseId: deleted.expenseId,

//           amount: deleted.amount,

//           category: deleted.category,

//           incomeRestored: deleted.incomeReturned,

//           savingsRestored: deleted.savingsReturned,

//           budgetRestored: deleted.budgetReturned,
//         },
//       });

//       if (notification) {
//         notifications.push(notification);
//       }
//     }

//     return res.status(200).json({
//       success: true,

//       message: `${deletedExpenses.length} expense(s) deleted successfully`,

//       deletedCount: deletedExpenses.length,

//       requestedCount: uniqueExpenseIds.length,

//       deletedExpenses,

//       notifications,
//     });
//   } catch (error) {
//     console.error("❌ Bulk delete expenses error:", error);

//     const status = error.message === "No expenses found" ? 404 : 400;

//     return res.status(status).json({
//       success: false,

//       message: error.message || "Failed to bulk delete expenses",
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// // ============================================================
// // UPDATE EXPENSE
// //
// // OLD:
// //
// // Expense
// //   ↓
// // Income/Savings restored
// // Budget restored
// //
// // NEW:
// //
// // Expense
// //   ↓
// // Income
// // Savings
// // Budget
// // ============================================================

// exports.updateExpense = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const { id } = req.params;

//     if (!isValidObjectId(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense id",
//       });
//     }

//     let updatedExpense;

//     let notificationPayload;

//     // ========================================================
//     // TRANSACTION
//     // ========================================================

//     await session.withTransaction(async () => {
//       const expense = await Expense.findById(id).session(session);

//       if (!expense) {
//         throw new Error("Expense not found");
//       }

//       // ----------------------------------------------------
//       // ORIGINAL OWNER
//       // ----------------------------------------------------

//       const expenseUserId = expense.userId;

//       const expenseEmail = normalizeEmail(expense.email);

//       // ----------------------------------------------------
//       // REQUESTED VALUES
//       // ----------------------------------------------------

//       const { description, category, amount, date, user } = req.body;

//       const newDescription =
//         description !== undefined
//           ? String(description).trim()
//           : expense.description;

//       const newCategory =
//         category !== undefined ? normalizeCategory(category) : expense.category;

//       const newAmount =
//         amount !== undefined
//           ? parsePositiveWholeNumber(amount)
//           : Number(expense.amount);

//       const newDate =
//         date !== undefined ? new Date(date) : new Date(expense.date);

//       // ----------------------------------------------------
//       // VALIDATION
//       // ----------------------------------------------------

//       if (!newDescription) {
//         throw new Error("Description cannot be empty");
//       }

//       if (!isValidExpenseCategory(newCategory)) {
//         throw new Error("Invalid expense category");
//       }

//       if (newAmount === null || newAmount === undefined) {
//         throw new Error("Amount must be a positive whole number");
//       }

//       if (Number.isNaN(newDate.getTime())) {
//         throw new Error("Invalid expense date");
//       }

//       // ----------------------------------------------------
//       // RETURN OLD MONEY
//       // ----------------------------------------------------

//       await reverseMoneyAllocations(expense, session);

//       // ----------------------------------------------------
//       // RETURN OLD BUDGET
//       // ----------------------------------------------------

//       if (expense.budgetId && Number(expense.budgetAmountUsed) > 0) {
//         await reverseBudgetAmount({
//           budgetId: expense.budgetId,

//           amount: Number(expense.budgetAmountUsed),

//           session,
//         });
//       }

//       // ----------------------------------------------------
//       // ALLOCATE NEW MONEY
//       // ----------------------------------------------------

//       const allocation = await allocateMoney({
//         amount: newAmount,

//         userId: expenseUserId,

//         email: expenseEmail,

//         session,
//       });

//       // ----------------------------------------------------
//       // FIND NEW BUDGET
//       // ----------------------------------------------------

//       const budget = await findBudgetForExpense({
//         userId: expenseUserId,

//         category: newCategory,

//         date: newDate,

//         session,
//       });

//       // ----------------------------------------------------
//       // APPLY NEW BUDGET
//       // ----------------------------------------------------

//       if (budget) {
//         await applyBudgetAmount({
//           budget,

//           amount: newAmount,

//           session,
//         });
//       }

//       // ----------------------------------------------------
//       // UPDATE EXPENSE
//       // ----------------------------------------------------

//       expense.description = newDescription;

//       expense.category = newCategory;

//       expense.type = "expense";

//       expense.amount = newAmount;

//       expense.date = newDate;

//       if (user !== undefined) {
//         const normalizedUser = String(user).trim();

//         if (!normalizedUser) {
//           throw new Error("User cannot be empty");
//         }

//         expense.user = normalizedUser;
//       }

//       expense.incomeUsed = allocation.incomeUsed;

//       expense.savingsUsed = allocation.savingsUsed;

//       expense.incomeAllocations = allocation.incomeAllocations;

//       expense.savingsAllocations = allocation.savingsAllocations;

//       expense.budgetId = budget ? budget._id : null;

//       expense.budgetAmountUsed = budget ? newAmount : 0;

//       await expense.save({
//         session,
//       });

//       updatedExpense = expense;

//       notificationPayload = {
//         userEmail: expenseEmail,

//         userId: expenseUserId,

//         title: "📝 Expense Updated",

//         message:
//           `${newCategory} expense was updated to RWF ` +
//           `${newAmount.toLocaleString()}.`,

//         type: "expense",

//         severity: "low",

//         relatedId: expense._id,

//         relatedType: "expense",

//         actionLink: `/expenses/${expense._id}`,

//         metadata: {
//           expenseId: expense._id,

//           amount: newAmount,

//           category: newCategory,

//           incomeUsed: allocation.incomeUsed,

//           savingsUsed: allocation.savingsUsed,

//           budgetAmountUsed: budget ? newAmount : 0,

//           budgetId: budget ? budget._id : null,
//         },
//       };
//     });

//     // ========================================================
//     // NOTIFICATION AFTER COMMIT
//     // ========================================================

//     const notification = await createNotificationSafely(notificationPayload);

//     return res.status(200).json({
//       success: true,

//       message: "Expense updated successfully",

//       data: updatedExpense,

//       notification,
//     });
//   } catch (error) {
//     console.error("❌ Update expense error:", error);

//     const status = error.message === "Expense not found" ? 404 : 400;

//     return res.status(status).json({
//       success: false,

//       message: error.message || "Failed to update expense",
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// // ============================================================
// // DELETE EXPENSE
// //
// // Reverse:
// //
// // Expense
// //   ↓
// // Income gets money back
// // Savings gets money back
// // Budget.spentAmount decreases
// // ============================================================

// exports.deleteExpense = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const { id } = req.params;

//     if (!isValidObjectId(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense id",
//       });
//     }

//     let notificationPayload;

//     // ========================================================
//     // TRANSACTION
//     // ========================================================

//     await session.withTransaction(async () => {
//       const expense = await Expense.findById(id).session(session);

//       if (!expense) {
//         throw new Error("Expense not found");
//       }

//       // ----------------------------------------------------
//       // SAVE INFORMATION BEFORE DELETE
//       // ----------------------------------------------------

//       const expenseId = expense._id;

//       const expenseEmail = normalizeEmail(expense.email);

//       const expenseUserId = expense.userId;

//       const expenseCategory = expense.category;

//       const expenseAmount = Number(expense.amount) || 0;

//       const budgetId = expense.budgetId;

//       const budgetAmountUsed = Number(expense.budgetAmountUsed) || 0;

//       // ----------------------------------------------------
//       // RETURN MONEY
//       // ----------------------------------------------------

//       await reverseMoneyAllocations(expense, session);

//       // ----------------------------------------------------
//       // RETURN BUDGET
//       // ----------------------------------------------------

//       if (budgetId && budgetAmountUsed > 0) {
//         await reverseBudgetAmount({
//           budgetId,

//           amount: budgetAmountUsed,

//           session,
//         });
//       }

//       // ----------------------------------------------------
//       // DELETE
//       // ----------------------------------------------------

//       await expense.deleteOne({
//         session,
//       });

//       // ----------------------------------------------------
//       // NOTIFICATION PAYLOAD
//       // ----------------------------------------------------

//       notificationPayload = {
//         userEmail: expenseEmail,

//         userId: expenseUserId,

//         title: "🗑️ Expense Deleted",

//         message:
//           `${expenseCategory} expense of RWF ` +
//           `${expenseAmount.toLocaleString()} ` +
//           `was deleted and the money was returned to its original sources.`,

//         type: "expense",

//         severity: "medium",

//         relatedId: expenseId,

//         relatedType: "expense",

//         actionLink: "/expenses",

//         metadata: {
//           expenseId,

//           amount: expenseAmount,

//           category: expenseCategory,

//           incomeReturned: Number(expense.incomeUsed) || 0,

//           savingsReturned: Number(expense.savingsUsed) || 0,

//           budgetReturned: budgetAmountUsed,

//           budgetId: budgetId || null,
//         },
//       };
//     });

//     // ========================================================
//     // NOTIFICATION AFTER COMMIT
//     // ========================================================

//     const notification = await createNotificationSafely(notificationPayload);

//     return res.status(200).json({
//       success: true,

//       message: "Expense deleted successfully",

//       notification,
//     });
//   } catch (error) {
//     console.error("❌ Delete expense error:", error);

//     const status = error.message === "Expense not found" ? 404 : 400;

//     return res.status(status).json({
//       success: false,

//       message: error.message || "Failed to delete expense",
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// // ============================================================
// // GET EXPENSE STATISTICS
// // FILTER BY OWNER
// //
// // Supports:
// //
// // ?userId=...
// // ?email=...
// // ============================================================

// exports.getExpenseStats = async (req, res) => {
//   try {
//     const owner = buildOwnerQuery(req);

//     if (owner.error) {
//       return res.status(400).json({
//         success: false,
//         message: owner.error,
//       });
//     }

//     const query = owner.query;

//     // ========================================================
//     // TOTAL
//     // ========================================================

//     const totalExpense = await Expense.aggregate([
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
//     // CATEGORY
//     // ========================================================

//     const categoryStats = await Expense.aggregate([
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
//     // SOURCE
//     // ========================================================

//     const sourceStats = await Expense.aggregate([
//       {
//         $match: query,
//       },

//       {
//         $group: {
//           _id: null,

//           incomeUsed: {
//             $sum: "$incomeUsed",
//           },

//           savingsUsed: {
//             $sum: "$savingsUsed",
//           },
//         },
//       },
//     ]);

//     // ========================================================
//     // LAST 12 MONTHS
//     // ========================================================

//     const twelveMonthsAgo = new Date();

//     twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

//     const monthlyStats = await Expense.aggregate([
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

//     const now = new Date();

//     const currentMonth = now.getMonth();

//     const currentYear = now.getFullYear();

//     const budgetQuery = {
//       month: currentMonth,

//       year: currentYear,
//     };

//     if (query.userId) {
//       budgetQuery.userId = query.userId;
//     }

//     if (query.email) {
//       budgetQuery.email = query.email;
//     }

//     const budgets = await Budget.find(budgetQuery);

//     const totalBudgeted = budgets.reduce(
//       (sum, budget) => sum + Number(budget.allocatedAmount || 0),
//       0,
//     );

//     const totalBudgetSpent = budgets.reduce(
//       (sum, budget) => sum + Number(budget.spentAmount || 0),
//       0,
//     );

//     const remainingBudget = budgets.reduce(
//       (sum, budget) => sum + Number(budget.remainingAmount || 0),
//       0,
//     );

//     const percentageUsed =
//       totalBudgeted > 0 ? (totalBudgetSpent / totalBudgeted) * 100 : 0;

//     return res.status(200).json({
//       success: true,

//       data: {
//         totalExpense: totalExpense.length > 0 ? totalExpense[0].total : 0,

//         totalCount: totalExpense.length > 0 ? totalExpense[0].count : 0,

//         categoryBreakdown: categoryStats,

//         sourceBreakdown: {
//           incomeUsed: sourceStats.length > 0 ? sourceStats[0].incomeUsed : 0,

//           savingsUsed: sourceStats.length > 0 ? sourceStats[0].savingsUsed : 0,
//         },

//         monthlyBreakdown: monthlyStats,

//         currentMonthBudget: {
//           month: currentMonth,

//           year: currentYear,

//           totalBudgeted,

//           totalSpent: totalBudgetSpent,

//           remainingBudget,

//           percentageUsed: Number(percentageUsed.toFixed(2)),
//         },
//       },
//     });
//   } catch (error) {
//     console.error("❌ Get expense stats error:", error);

//     return res.status(500).json({
//       success: false,

//       message: "Failed to fetch expense statistics",

//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET BUDGET SUMMARY FOR EXPENSES
// //
// // Query:
// //
// // ?userId=...
// // ?email=...
// // ?month=0
// // ?year=2026
// // ============================================================

// exports.getExpenseBudgetSummary = async (req, res) => {
//   try {
//     const { userId, email, month, year } = req.query;

//     // ======================================================
//     // OWNER
//     // ======================================================

//     let ownerQuery = {};

//     if (userId) {
//       if (!isValidObjectId(userId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid userId",
//         });
//       }

//       ownerQuery.userId = userId;
//     } else if (email) {
//       ownerQuery.email = normalizeEmail(email);
//     } else if (req.user) {
//       if (req.user._id) {
//         ownerQuery.userId = req.user._id;
//       } else if (req.user.email) {
//         ownerQuery.email = normalizeEmail(req.user.email);
//       }
//     } else {
//       return res.status(400).json({
//         success: false,

//         message: "userId or email is required",
//       });
//     }

//     // ======================================================
//     // MONTH
//     // ======================================================

//     const currentMonth =
//       month !== undefined ? Number(month) : new Date().getMonth();

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

//     // ======================================================
//     // YEAR
//     // ======================================================

//     const currentYear =
//       year !== undefined ? Number(year) : new Date().getFullYear();

//     if (!Number.isInteger(currentYear) || currentYear < 2000) {
//       return res.status(400).json({
//         success: false,

//         message: "Invalid year",
//       });
//     }

//     // ======================================================
//     // BUDGETS
//     // ======================================================

//     const budgets = await Budget.find({
//       ...ownerQuery,

//       month: currentMonth,

//       year: currentYear,
//     });

//     // ======================================================
//     // EXPENSES
//     // ======================================================

//     const startDate = new Date(currentYear, currentMonth, 1);

//     const endDate = new Date(currentYear, currentMonth + 1, 1);

//     const expenses = await Expense.find({
//       ...ownerQuery,

//       date: {
//         $gte: startDate,

//         $lt: endDate,
//       },
//     });

//     // ======================================================
//     // TOTAL EXPENSE
//     // ======================================================

//     const totalExpenses = expenses.reduce(
//       (sum, expense) => sum + Number(expense.amount || 0),
//       0,
//     );

//     // ======================================================
//     // BUDGET TOTALS
//     // ======================================================

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

//     // ======================================================
//     // CATEGORY BREAKDOWN
//     // ======================================================

//     const categories = budgets.map((budget) => {
//       const categoryExpenses = expenses
//         .filter(
//           (expense) =>
//             String(expense.category).toLowerCase() ===
//             String(budget.category).toLowerCase(),
//         )
//         .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

//       return {
//         category: budget.category,

//         budgeted: Number(budget.allocatedAmount || 0),

//         spent: Number(budget.spentAmount || 0),

//         remaining: Number(budget.remainingAmount || 0),

//         percentageUsed: Number(budget.percentageUsed || 0),

//         status: budget.status || "on-track",

//         expenses: categoryExpenses,
//       };
//     });

//     // ======================================================
//     // STATUS
//     // ======================================================

//     let status = "on-track";

//     if (overallPercentage > 100) {
//       status = "over-budget";
//     } else if (overallPercentage >= 80) {
//       status = "approaching-limit";
//     } else if (overallPercentage < 50 && totalSpent > 0) {
//       status = "under-budget";
//     }

//     // ======================================================
//     // RESPONSE
//     // ======================================================

//     return res.status(200).json({
//       success: true,

//       data: {
//         month: currentMonth,

//         year: currentYear,

//         totalExpenses,

//         totalBudgeted,

//         totalSpent,

//         totalRemaining,

//         overallPercentage: Number(overallPercentage.toFixed(2)),

//         status,

//         categories,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Expense budget summary error:", error);

//     return res.status(500).json({
//       success: false,

//       message: "Failed to fetch expense budget summary",

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

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

const normalizeCategory = (category) => {
  return String(category || "").trim();
};

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

const normalizeExpenseType = (type) => {
  return String(type || "expense")
    .trim()
    .toLowerCase();
};

// ============================================================
// VALIDATE EXPENSE CATEGORY
// ============================================================

const isValidExpenseCategory = (category) => {
  return EXPENSE_CATEGORIES.includes(
    normalizeCategory(category),
  );
};

// ============================================================
// GET OWNER
//
// userId is primary.
// email remains supported for compatibility.
// ============================================================

const buildOwnerQuery = (req) => {
  const { userId, email } = req.query;

  // ----------------------------------------------------------
  // USER ID
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // EMAIL
  // ----------------------------------------------------------

  if (email) {
    return {
      query: {
        email: normalizeEmail(email),
      },
    };
  }

  // ----------------------------------------------------------
  // AUTHENTICATED USER
  // ----------------------------------------------------------

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
// CREATE NOTIFICATION SAFELY
// ============================================================

const createNotificationSafely = async (payload) => {
  try {
    return await createNotification(payload);
  } catch (error) {
    console.error(
      "⚠️ Expense notification creation failed:",
      error.message,
    );

    return null;
  }
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
      query.type = normalizeExpenseType(type);
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
    // MONTH
    // --------------------------------------------------------

    if (month !== undefined) {
      const numericMonth = Number(month);

      if (
        !Number.isInteger(numericMonth) ||
        numericMonth < 0 ||
        numericMonth > 11
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Month must be an integer between 0 and 11",
        });
      }

      const selectedYear =
        year !== undefined
          ? Number(year)
          : new Date().getFullYear();

      if (
        !Number.isInteger(selectedYear) ||
        selectedYear < 2000
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid year",
        });
      }

      query.date = {
        ...(query.date || {}),
        $gte: new Date(
          selectedYear,
          numericMonth,
          1,
        ),
        $lt: new Date(
          selectedYear,
          numericMonth + 1,
          1,
        ),
      };
    }

    // --------------------------------------------------------
    // YEAR
    // --------------------------------------------------------

    if (
      year !== undefined &&
      month === undefined
    ) {
      const numericYear = Number(year);

      if (
        !Number.isInteger(numericYear) ||
        numericYear < 2000
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid year",
        });
      }

      query.date = {
        ...(query.date || {}),
        $gte: new Date(
          numericYear,
          0,
          1,
        ),
        $lt: new Date(
          numericYear + 1,
          0,
          1,
        ),
      };
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
      0,
    );

    const totalIncomeUsed = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.incomeUsed || 0),
      0,
    );

    const totalSavingsUsed = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.savingsUsed || 0),
      0,
    );

    const totalBudgetUsed = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.budgetAmountUsed || 0),
      0,
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
      error,
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

    const expense = await Expense.findById(id);

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
      error,
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
  res,
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

    const expenses = await Expense.find({
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
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve expenses",
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
    console.error(
      "❌ Get all expenses error:",
      error,
    );

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
// ============================================================

exports.getStats = async (req, res) => {
  try {
    const expenses = await Expense.find();

    // --------------------------------------------------------
    // BASIC TOTALS
    // --------------------------------------------------------

    const totalExpenses = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0,
    );

    const totalCount = expenses.length;

    // --------------------------------------------------------
    // INCOME / SAVINGS
    // --------------------------------------------------------

    const totalIncomeUsed = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.incomeUsed || 0),
      0,
    );

    const totalSavingsUsed = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.savingsUsed || 0),
      0,
    );

    // --------------------------------------------------------
    // BUDGET
    // --------------------------------------------------------

    const totalBudgetUsed = expenses.reduce(
      (sum, expense) =>
        sum + Number(
          expense.budgetAmountUsed || 0,
        ),
      0,
    );

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    const categoryMap = {};

    expenses.forEach((expense) => {
      const category =
        expense.category || "Other";

      if (!categoryMap[category]) {
        categoryMap[category] = {
          category,
          total: 0,
          count: 0,
        };
      }

      categoryMap[category].total +=
        Number(expense.amount || 0);

      categoryMap[category].count += 1;
    });

    const categoryBreakdown =
      Object.values(categoryMap).sort(
        (a, b) => b.total - a.total,
      );

    // --------------------------------------------------------
    // TYPE
    // --------------------------------------------------------

    const typeMap = {};

    expenses.forEach((expense) => {
      const type =
        expense.type || "expense";

      if (!typeMap[type]) {
        typeMap[type] = {
          type,
          total: 0,
          count: 0,
        };
      }

      typeMap[type].total +=
        Number(expense.amount || 0);

      typeMap[type].count += 1;
    });

    const typeBreakdown =
      Object.values(typeMap).sort(
        (a, b) => b.total - a.total,
      );

    // --------------------------------------------------------
    // MONTHLY
    // --------------------------------------------------------

    const monthlyMap = {};

    expenses.forEach((expense) => {
      const expenseDate =
        new Date(expense.date);

      if (
        Number.isNaN(
          expenseDate.getTime(),
        )
      ) {
        return;
      }

      const expenseYear =
        expenseDate.getFullYear();

      const expenseMonth =
        expenseDate.getMonth() + 1;

      const key =
        `${expenseYear}-` +
        `${String(expenseMonth).padStart(
          2,
          "0",
        )}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          year: expenseYear,
          month: expenseMonth,
          total: 0,
          count: 0,
        };
      }

      monthlyMap[key].total +=
        Number(expense.amount || 0);

      monthlyMap[key].count += 1;
    });

    const monthlyBreakdown =
      Object.values(monthlyMap).sort(
        (a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year;
          }

          return b.month - a.month;
        },
      );

    // --------------------------------------------------------
    // INCOME ALLOCATIONS
    // --------------------------------------------------------

    const incomeAllocationMap = {};

    expenses.forEach((expense) => {
      const allocations =
        expense.incomeAllocations || [];

      allocations.forEach(
        (allocation) => {
          if (!allocation.incomeId) {
            return;
          }

          const incomeId =
            String(allocation.incomeId);

          if (
            !incomeAllocationMap[incomeId]
          ) {
            incomeAllocationMap[incomeId] = {
              incomeId:
                allocation.incomeId,
              amount: 0,
            };
          }

          incomeAllocationMap[
            incomeId
          ].amount += Number(
            allocation.amount || 0,
          );
        },
      );
    });

    const incomeAllocations =
      Object.values(
        incomeAllocationMap,
      );

    // --------------------------------------------------------
    // SAVINGS ALLOCATIONS
    // --------------------------------------------------------

    const savingsAllocationMap = {};

    expenses.forEach((expense) => {
      const allocations =
        expense.savingsAllocations || [];

      allocations.forEach(
        (allocation) => {
          if (!allocation.savingsId) {
            return;
          }

          const savingsId =
            String(allocation.savingsId);

          if (
            !savingsAllocationMap[
              savingsId
            ]
          ) {
            savingsAllocationMap[
              savingsId
            ] = {
              savingsId:
                allocation.savingsId,
              amount: 0,
            };
          }

          savingsAllocationMap[
            savingsId
          ].amount += Number(
            allocation.amount || 0,
          );
        },
      );
    });

    const savingsAllocations =
      Object.values(
        savingsAllocationMap,
      );

    // --------------------------------------------------------
    // AVERAGE
    // --------------------------------------------------------

    const averageExpense =
      totalCount > 0
        ? totalExpenses / totalCount
        : 0;

    // --------------------------------------------------------
    // HIGHEST
    // --------------------------------------------------------

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
        null,
      );
    }

    return res.status(200).json({
      success: true,

      data: {
        totalExpenses,

        totalCount,

        totalIncomeUsed,

        totalSavingsUsed,

        totalBudgetUsed,

        averageExpense:
          Number(
            averageExpense.toFixed(2),
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
      error,
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
// GET EXPENSES BY USER ID
// ============================================================

exports.getExpensesByUserId = async (
  req,
  res,
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

    const expenses = await Expense.find({
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
      error,
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
// ALLOCATE MONEY
//
// PRIORITY:
//
// 1. INCOME
// 2. SAVINGS
//
// Income is exhausted first.
// ============================================================

const allocateMoney = async ({
  amount,
  userId,
  email,
  session,
}) => {
  let remaining = Number(amount);

  const incomeAllocations = [];
  const savingsAllocations = [];

  // ========================================================
  // INCOME
  // ========================================================

  const incomes = await Income.find({
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
      Number(income.remainingAmount) || 0;

    if (available <= 0) {
      continue;
    }

    const used = Math.min(
      available,
      remaining,
    );

    income.remainingAmount =
      available - used;

    if (income.remainingAmount < 0) {
      income.remainingAmount = 0;
    }

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
    const savings = await Savings.find({
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
        Number(saving.currentAmount) || 0;

      if (available <= 0) {
        continue;
      }

      const used = Math.min(
        available,
        remaining,
      );

      saving.currentAmount =
        available - used;

      if (saving.currentAmount < 0) {
        saving.currentAmount = 0;
      }

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
      `Insufficient funds. RWF ${remaining.toLocaleString()} is still required.`,
    );
  }

  return {
    incomeAllocations,

    savingsAllocations,

    incomeUsed:
      incomeAllocations.reduce(
        (sum, allocation) =>
          sum +
          Number(
            allocation.amount || 0,
          ),
        0,
      ),

    savingsUsed:
      savingsAllocations.reduce(
        (sum, allocation) =>
          sum +
          Number(
            allocation.amount || 0,
          ),
        0,
      ),
  };
};

// ============================================================
// REVERSE MONEY ALLOCATIONS
// ============================================================

const reverseMoneyAllocations = async (
  expense,
  session,
) => {
  // ========================================================
  // RETURN TO INCOME
  // ========================================================

  for (
    const allocation of
      expense.incomeAllocations || []
  ) {
    if (!allocation.incomeId) {
      continue;
    }

    const income =
      await Income.findById(
        allocation.incomeId,
      ).session(session);

    if (!income) {
      throw new Error(
        `Income record ${allocation.incomeId} no longer exists.`,
      );
    }

    const allocationAmount =
      Number(allocation.amount) || 0;

    if (allocationAmount <= 0) {
      continue;
    }

    const originalAmount =
      Number(income.amount) || 0;

    income.remainingAmount =
      (Number(
        income.remainingAmount,
      ) || 0) + allocationAmount;

    if (
      originalAmount > 0 &&
      income.remainingAmount >
        originalAmount
    ) {
      income.remainingAmount =
        originalAmount;
    }

    await income.save({
      session,
    });
  }

  // ========================================================
  // RETURN TO SAVINGS
  // ========================================================

  for (
    const allocation of
      expense.savingsAllocations || []
  ) {
    if (!allocation.savingsId) {
      continue;
    }

    const saving =
      await Savings.findById(
        allocation.savingsId,
      ).session(session);

    if (!saving) {
      throw new Error(
        `Savings record ${allocation.savingsId} no longer exists.`,
      );
    }

    const allocationAmount =
      Number(allocation.amount) || 0;

    if (allocationAmount <= 0) {
      continue;
    }

    saving.currentAmount =
      (Number(
        saving.currentAmount,
      ) || 0) + allocationAmount;

    if (saving.currentAmount < 0) {
      saving.currentAmount = 0;
    }

    await saving.save({
      session,
    });
  }
};

// ============================================================
// FIND BUDGET FOR EXPENSE
// ============================================================

const findBudgetForExpense = async ({
  userId,
  category,
  date,
  session,
}) => {
  const expenseDate = new Date(date);

  if (
    Number.isNaN(
      expenseDate.getTime(),
    )
  ) {
    return null;
  }

  const month =
    expenseDate.getMonth();

  const year =
    expenseDate.getFullYear();

  const budget =
    await Budget.findOne({
      userId,

      category:
        normalizeCategory(
          category,
        ).toLowerCase(),

      month,

      year,
    }).session(session);

  return budget;
};

// ============================================================
// APPLY EXPENSE TO BUDGET
//
// FIXED:
// Uses Budget.calculateValues()
// instead of nonexistent recalculateBudget()
// ============================================================

const applyBudgetAmount = async ({
  budget,
  amount,
  session,
}) => {
  if (!budget) {
    return 0;
  }

  const numericAmount =
    Number(amount);

  if (
    !Number.isFinite(
      numericAmount,
    ) ||
    !Number.isInteger(
      numericAmount,
    ) ||
    numericAmount <= 0
  ) {
    return 0;
  }

  budget.spentAmount =
    (Number(
      budget.spentAmount,
    ) || 0) + numericAmount;

  // IMPORTANT:
  // Recalculate remainingAmount,
  // percentageUsed and status.
  budget.calculateValues();

  await budget.save({
    session,
  });

  return numericAmount;
};

// ============================================================
// REMOVE EXPENSE FROM BUDGET
// ============================================================

const reverseBudgetAmount = async ({
  budgetId,
  amount,
  session,
}) => {
  if (!budgetId) {
    return;
  }

  const numericAmount =
    Number(amount);

  if (
    !Number.isFinite(
      numericAmount,
    ) ||
    !Number.isInteger(
      numericAmount,
    ) ||
    numericAmount <= 0
  ) {
    return;
  }

  const budget =
    await Budget.findById(
      budgetId,
    ).session(session);

  if (!budget) {
    throw new Error(
      `Budget ${budgetId} no longer exists.`,
    );
  }

  budget.spentAmount =
    Math.max(
      (Number(
        budget.spentAmount,
      ) || 0) - numericAmount,
      0,
    );

  // IMPORTANT:
  // Recalculate remainingAmount,
  // percentageUsed and status.
  budget.calculateValues();

  await budget.save({
    session,
  });
};

// ============================================================
// CREATE EXPENSE
// ============================================================

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
//       type,
//       amount,
//       date,
//       user,
//       email,
//       userId,
//     } = req.body;

//     // ======================================================
//     // VALIDATION
//     // ======================================================

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
//       !isValidObjectId(userId)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     const numericAmount =
//       parsePositiveWholeNumber(
//         amount,
//       );

//     if (numericAmount === null) {
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
//         expenseDate.getTime(),
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

//     if (!normalizedEmail) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Valid email is required",
//       });
//     }

//     const normalizedCategory =
//       normalizeCategory(category);

//     if (
//       !isValidExpenseCategory(
//         normalizedCategory,
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid expense category",
//       });
//     }

//     const expenseType =
//       normalizeExpenseType(type);

//     if (
//       expenseType !== "expense"
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "This endpoint can only create expense records",
//       });
//     }

//     // ======================================================
//     // TRANSACTION
//     // ======================================================

//     let expense;

//     await session.withTransaction(
//       async () => {
//         // --------------------------------------------------
//         // ALLOCATE MONEY
//         // --------------------------------------------------

//         const allocation =
//           await allocateMoney({
//             amount:
//               numericAmount,

//             userId,

//             email:
//               normalizedEmail,

//             session,
//           });

//         // --------------------------------------------------
//         // FIND BUDGET
//         // --------------------------------------------------

//         const budget =
//           await findBudgetForExpense({
//             userId,

//             category:
//               normalizedCategory,

//             date:
//               expenseDate,

//             session,
//           });

//         const budgetAmountUsed =
//           budget
//             ? numericAmount
//             : 0;

//         // --------------------------------------------------
//         // CREATE EXPENSE
//         // --------------------------------------------------

//         const createdExpenses =
//           await Expense.create(
//             [
//               {
//                 description:
//                   String(
//                     description,
//                   ).trim(),

//                 category:
//                   normalizedCategory,

//                 type: "expense",

//                 amount:
//                   numericAmount,

//                 date:
//                   expenseDate,

//                 user:
//                   String(user).trim(),

//                 userId,

//                 email:
//                   normalizedEmail,

//                 incomeUsed:
//                   allocation.incomeUsed,

//                 savingsUsed:
//                   allocation.savingsUsed,

//                 incomeAllocations:
//                   allocation.incomeAllocations,

//                 savingsAllocations:
//                   allocation.savingsAllocations,

//                 budgetId:
//                   budget
//                     ? budget._id
//                     : null,

//                 budgetAmountUsed,
//               },
//             ],
//             {
//               session,
//             },
//           );

//         expense =
//           createdExpenses[0];

//         // --------------------------------------------------
//         // UPDATE BUDGET
//         // --------------------------------------------------

//         if (budget) {
//           await applyBudgetAmount({
//             budget,

//             amount:
//               numericAmount,

//             session,
//           });
//         }
//       },
//     );

//     // ======================================================
//     // NOTIFICATION
//     // ======================================================

//     const notification =
//       await createNotificationSafely({
//         userEmail:
//           normalizedEmail,

//         userId,

//         title:
//           "💸 Expense Added",

//         message:
//           `Expense of RWF ` +
//           `${numericAmount.toLocaleString()} ` +
//           `for ${normalizedCategory} ` +
//           `was added.`,

//         type: "expense",

//         severity: "medium",

//         relatedId:
//           expense._id,

//         relatedType:
//           "expense",

//         actionLink:
//           `/expenses/${expense._id}`,

//         metadata: {
//           expenseId:
//             expense._id,

//           amount:
//             numericAmount,

//           category:
//             normalizedCategory,

//           incomeUsed:
//             expense.incomeUsed,

//           savingsUsed:
//             expense.savingsUsed,

//           budgetAmountUsed:
//             expense.budgetAmountUsed,

//           budgetId:
//             expense.budgetId,
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
//     console.error(
//       "❌ Create expense error:",
//       error,
//     );

//     return res.status(400).json({
//       success: false,

//       message:
//         error.message ||
//         "Failed to create expense",
//     });
//   } finally {
//     await session.endSession();
//   }
// };

exports.createExpense = async (
  req,
  res,
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

    // ======================================================
    // VALIDATION
    // ======================================================

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

    // ======================================================
    // USER ID
    // ======================================================

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // ======================================================
    // AMOUNT
    // ======================================================

    const numericAmount =
      parsePositiveWholeNumber(
        amount,
      );

    if (numericAmount === null) {
      return res.status(400).json({
        success: false,
        message:
          "Amount must be a positive whole number",
      });
    }

    // ======================================================
    // DATE
    // ======================================================

    const expenseDate =
      new Date(date);

    if (
      Number.isNaN(
        expenseDate.getTime(),
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid expense date",
      });
    }

    // ======================================================
    // EMAIL
    // ======================================================

    const normalizedEmail =
      normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Valid email is required",
      });
    }

    // ======================================================
    // CATEGORY
    // ======================================================

    const normalizedCategory =
      normalizeCategory(category);

    if (
      !isValidExpenseCategory(
        normalizedCategory,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid expense category",
      });
    }

    // ======================================================
    // TYPE
    // ======================================================

    const expenseType =
      normalizeExpenseType(type);

    if (
      expenseType !== "expense"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This endpoint can only create expense records",
      });
    }

    // ======================================================
    // TRANSACTION
    // ======================================================

    let expense = null;
    let budget = null;

    await session.withTransaction(
      async () => {
        // --------------------------------------------------
        // ALLOCATE MONEY
        //
        // Income is used first.
        // Savings is used when income is insufficient.
        // --------------------------------------------------

        const allocation =
          await allocateMoney({
            amount:
              numericAmount,

            userId,

            email:
              normalizedEmail,

            session,
          });

        // --------------------------------------------------
        // FIND MATCHING BUDGET
        //
        // Matches:
        // userId
        // category
        // expense date
        // month
        // year
        // --------------------------------------------------

        budget =
          await findBudgetForExpense({
            userId,

            category:
              normalizedCategory,

            date:
              expenseDate,

            session,
          });

        // --------------------------------------------------
        // BUDGET AMOUNT USED
        // --------------------------------------------------

        const budgetAmountUsed =
          budget
            ? numericAmount
            : 0;

        // --------------------------------------------------
        // CREATE EXPENSE
        // --------------------------------------------------

        const createdExpenses =
          await Expense.create(
            [
              {
                description:
                  String(
                    description,
                  ).trim(),

                category:
                  normalizedCategory,

                type:
                  "expense",

                amount:
                  numericAmount,

                date:
                  expenseDate,

                user:
                  String(user).trim(),

                userId,

                email:
                  normalizedEmail,

                // ------------------------------------------
                // MONEY ALLOCATION
                // ------------------------------------------

                incomeUsed:
                  allocation.incomeUsed,

                savingsUsed:
                  allocation.savingsUsed,

                incomeAllocations:
                  allocation.incomeAllocations,

                savingsAllocations:
                  allocation.savingsAllocations,

                // ------------------------------------------
                // BUDGET
                // ------------------------------------------

                budgetId:
                  budget
                    ? budget._id
                    : null,

                budgetAmountUsed:
                  budgetAmountUsed,
              },
            ],
            {
              session,
            },
          );

        expense =
          createdExpenses[0];

        // --------------------------------------------------
        // UPDATE BUDGET
        // --------------------------------------------------

        if (budget) {
          await applyBudgetAmount({
            budget,

            amount:
              numericAmount,

            session,
          });

          // Make sure the latest budget values are available
          // in the response.

          await budget.populate({
            path: "userId",
          });
        }
      },
    );

    // ======================================================
    // NOTIFICATION
    // ======================================================

    let notification = null;

    try {
      notification =
        await createNotificationSafely({
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

          type:
            "expense",

          severity:
            "medium",

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
              expense.incomeUsed,

            savingsUsed:
              expense.savingsUsed,

            budgetAmountUsed:
              expense.budgetAmountUsed,

            budgetId:
              expense.budgetId,

            // --------------------------------------------
            // BUDGET INFORMATION
            // --------------------------------------------

            budgetAllocatedAmount:
              budget
                ? budget.allocatedAmount
                : 0,

            budgetSpentAmount:
              budget
                ? budget.spentAmount
                : 0,

            budgetRemainingAmount:
              budget
                ? budget.remainingAmount
                : 0,

            budgetPercentageUsed:
              budget
                ? budget.percentageUsed
                : 0,

            budgetStatus:
              budget
                ? budget.status
                : null,
          },
        });
    } catch (notificationError) {
      console.error(
        "⚠️ Expense notification failed:",
        notificationError,
      );
    }

    // ======================================================
    // RESPONSE
    // ======================================================

    return res.status(201).json({
      success: true,

      message:
        "Expense created successfully",

      data:
        expense,

      // ----------------------------------------------------
      // BUDGET SUMMARY
      // ----------------------------------------------------

      budgetSummary: budget
        ? {
            budgetId:
              budget._id,

            category:
              budget.category,

            month:
              budget.month,

            year:
              budget.year,

            allocatedAmount:
              Number(
                budget.allocatedAmount ||
                  0,
              ),

            spentAmount:
              Number(
                budget.spentAmount ||
                  0,
              ),

            remainingAmount:
              Number(
                budget.remainingAmount ||
                  0,
              ),

            percentageUsed:
              Number(
                budget.percentageUsed ||
                  0,
              ),

            status:
              budget.status,
          }
        : null,

      notification,
    });
  } catch (error) {
    console.error(
      "❌ Create expense error:",
      error,
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
// ============================================================

exports.bulkDeleteExpenses = async (
  req,
  res,
) => {
  const session =
    await mongoose.startSession();

  try {
    const { expenseIds } =
      req.body;

    // ======================================================
    // VALIDATE IDS
    // ======================================================

    if (
      !Array.isArray(
        expenseIds,
      ) ||
      expenseIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "expenseIds must be a non-empty array",
      });
    }

    const uniqueExpenseIds =
      [
        ...new Set(
          expenseIds.map(
            (id) => String(id),
          ),
        ),
      ];

    for (
      const expenseId of
        uniqueExpenseIds
    ) {
      if (
        !isValidObjectId(
          expenseId,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid expense ID: ${expenseId}`,
        });
      }
    }

    let deletedExpenses = [];

    // ======================================================
    // TRANSACTION
    // ======================================================

    await session.withTransaction(
      async () => {
        const expenses =
          await Expense.find({
            _id: {
              $in:
                uniqueExpenseIds,
            },
          }).session(
            session,
          );

        if (
          expenses.length === 0
        ) {
          throw new Error(
            "No expenses found",
          );
        }

        // --------------------------------------------------
        // DELETE EACH EXPENSE
        // --------------------------------------------------

        for (
          const expense of
            expenses
        ) {
          // ----------------------------------------------
          // RESTORE INCOME
          // ----------------------------------------------

          for (
            const allocation of
              expense.incomeAllocations ||
              []
          ) {
            if (
              !allocation.incomeId
            ) {
              continue;
            }

            const income =
              await Income.findById(
                allocation.incomeId,
              ).session(
                session,
              );

            if (!income) {
              throw new Error(
                `Income ${allocation.incomeId} no longer exists. Cannot safely delete expense ${expense._id}.`,
              );
            }

            const allocationAmount =
              Number(
                allocation.amount,
              ) || 0;

            if (
              allocationAmount <=
              0
            ) {
              continue;
            }

            income.remainingAmount =
              (Number(
                income.remainingAmount,
              ) || 0) +
              allocationAmount;

            const originalIncome =
              Number(
                income.amount,
              ) || 0;

            if (
              originalIncome > 0 &&
              income.remainingAmount >
                originalIncome
            ) {
              income.remainingAmount =
                originalIncome;
            }

            await income.save({
              session,
            });
          }

          // ----------------------------------------------
          // RESTORE SAVINGS
          // ----------------------------------------------

          for (
            const allocation of
              expense.savingsAllocations ||
              []
          ) {
            if (
              !allocation.savingsId
            ) {
              continue;
            }

            const savings =
              await Savings.findById(
                allocation.savingsId,
              ).session(
                session,
              );

            if (!savings) {
              throw new Error(
                `Savings ${allocation.savingsId} no longer exists. Cannot safely delete expense ${expense._id}.`,
              );
            }

            const allocationAmount =
              Number(
                allocation.amount,
              ) || 0;

            if (
              allocationAmount <=
              0
            ) {
              continue;
            }

            savings.currentAmount =
              (Number(
                savings.currentAmount,
              ) || 0) +
              allocationAmount;

            if (
              savings.currentAmount <
              0
            ) {
              savings.currentAmount =
                0;
            }

            await savings.save({
              session,
            });
          }

          // ----------------------------------------------
          // RESTORE BUDGET
          // ----------------------------------------------

          if (
            expense.budgetId
          ) {
            await reverseBudgetAmount({
              budgetId:
                expense.budgetId,

              amount:
                Number(
                  expense.budgetAmountUsed,
                ) || 0,

              session,
            });
          }

          // ----------------------------------------------
          // SAVE INFORMATION
          // ----------------------------------------------

          deletedExpenses.push({
            expenseId:
              expense._id,

            description:
              expense.description,

            category:
              expense.category,

            amount:
              Number(
                expense.amount,
              ) || 0,

            email:
              expense.email,

            userId:
              expense.userId,

            incomeReturned:
              Number(
                expense.incomeUsed,
              ) || 0,

            savingsReturned:
              Number(
                expense.savingsUsed,
              ) || 0,

            budgetReturned:
              Number(
                expense.budgetAmountUsed,
              ) || 0,
          });

          // ----------------------------------------------
          // DELETE
          // ----------------------------------------------

          await expense.deleteOne({
            session,
          });
        }

        // --------------------------------------------------
        // VERIFY IDS
        // --------------------------------------------------

        if (
          expenses.length !==
          uniqueExpenseIds.length
        ) {
          const foundIds =
            new Set(
              expenses.map(
                (expense) =>
                  String(
                    expense._id,
                  ),
              ),
            );

          const missingIds =
            uniqueExpenseIds.filter(
              (id) =>
                !foundIds.has(id),
            );

          throw new Error(
            `Some expenses were not found: ${missingIds.join(", ")}`,
          );
        }
      },
    );

    // ======================================================
    // NOTIFICATIONS AFTER COMMIT
    // ======================================================

    const notifications = [];

    for (
      const deleted of
        deletedExpenses
    ) {
      const notification =
        await createNotificationSafely({
          userEmail:
            deleted.email,

          userId:
            deleted.userId,

          title:
            "🗑️ Expense Deleted",

          message:
            `${deleted.category} expense of RWF ` +
            `${deleted.amount.toLocaleString()} ` +
            `(${deleted.description}) was deleted and the money was returned to its original sources.`,

          type:
            "expense",

          severity:
            "medium",

          relatedId:
            deleted.expenseId,

          relatedType:
            "expense",

          actionLink:
            "/expenses",

          metadata: {
            expenseId:
              deleted.expenseId,

            amount:
              deleted.amount,

            category:
              deleted.category,

            incomeRestored:
              deleted.incomeReturned,

            savingsRestored:
              deleted.savingsReturned,

            budgetRestored:
              deleted.budgetReturned,
          },
        });

      if (
        notification
      ) {
        notifications.push(
          notification,
        );
      }
    }

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
      error,
    );

    const status =
      error.message ===
      "No expenses found"
        ? 404
        : 400;

    return res.status(status).json({
      success: false,

      message:
        error.message ||
        "Failed to bulk delete expenses",
    });
  } finally {
    await session.endSession();
  }
};

// ============================================================
// UPDATE EXPENSE
// ============================================================

exports.updateExpense = async (
  req,
  res,
) => {
  const session =
    await mongoose.startSession();

  try {
    const { id } =
      req.params;

    if (
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid expense id",
      });
    }

    let updatedExpense;
    let notificationPayload;

    // ======================================================
    // TRANSACTION
    // ======================================================

    await session.withTransaction(
      async () => {
        const expense =
          await Expense.findById(
            id,
          ).session(session);

        if (!expense) {
          throw new Error(
            "Expense not found",
          );
        }

        // --------------------------------------------------
        // ORIGINAL OWNER
        // --------------------------------------------------

        const expenseUserId =
          expense.userId;

        const expenseEmail =
          normalizeEmail(
            expense.email,
          );

        // --------------------------------------------------
        // REQUESTED VALUES
        // --------------------------------------------------

        const {
          description,
          category,
          amount,
          date,
          user,
        } = req.body;

        const newDescription =
          description !==
          undefined
            ? String(
                description,
              ).trim()
            : expense.description;

        const newCategory =
          category !==
          undefined
            ? normalizeCategory(
                category,
              )
            : expense.category;

        const newAmount =
          amount !==
          undefined
            ? parsePositiveWholeNumber(
                amount,
              )
            : Number(
                expense.amount,
              );

        const newDate =
          date !== undefined
            ? new Date(date)
            : new Date(
                expense.date,
              );

        // --------------------------------------------------
        // VALIDATION
        // --------------------------------------------------

        if (!newDescription) {
          throw new Error(
            "Description cannot be empty",
          );
        }

        if (
          !isValidExpenseCategory(
            newCategory,
          )
        ) {
          throw new Error(
            "Invalid expense category",
          );
        }

        if (
          newAmount === null ||
          newAmount === undefined
        ) {
          throw new Error(
            "Amount must be a positive whole number",
          );
        }

        if (
          Number.isNaN(
            newDate.getTime(),
          )
        ) {
          throw new Error(
            "Invalid expense date",
          );
        }

        // --------------------------------------------------
        // RETURN OLD MONEY
        // --------------------------------------------------

        await reverseMoneyAllocations(
          expense,
          session,
        );

        // --------------------------------------------------
        // RETURN OLD BUDGET
        // --------------------------------------------------

        if (
          expense.budgetId &&
          Number(
            expense.budgetAmountUsed,
          ) > 0
        ) {
          await reverseBudgetAmount({
            budgetId:
              expense.budgetId,

            amount:
              Number(
                expense.budgetAmountUsed,
              ),

            session,
          });
        }

        // --------------------------------------------------
        // ALLOCATE NEW MONEY
        // --------------------------------------------------

        const allocation =
          await allocateMoney({
            amount:
              newAmount,

            userId:
              expenseUserId,

            email:
              expenseEmail,

            session,
          });

        // --------------------------------------------------
        // FIND NEW BUDGET
        // --------------------------------------------------

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

        // --------------------------------------------------
        // APPLY NEW BUDGET
        // --------------------------------------------------

        if (budget) {
          await applyBudgetAmount({
            budget,

            amount:
              newAmount,

            session,
          });
        }

        // --------------------------------------------------
        // UPDATE EXPENSE
        // --------------------------------------------------

        expense.description =
          newDescription;

        expense.category =
          newCategory;

        expense.type =
          "expense";

        expense.amount =
          newAmount;

        expense.date =
          newDate;

        if (
          user !== undefined
        ) {
          const normalizedUser =
            String(user).trim();

          if (!normalizedUser) {
            throw new Error(
              "User cannot be empty",
            );
          }

          expense.user =
            normalizedUser;
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

        notificationPayload = {
          userEmail:
            expenseEmail,

          userId:
            expenseUserId,

          title:
            "📝 Expense Updated",

          message:
            `${newCategory} expense was updated to RWF ` +
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
        };
      },
    );

    // ======================================================
    // NOTIFICATION AFTER COMMIT
    // ======================================================

    const notification =
      await createNotificationSafely(
        notificationPayload,
      );

    return res.status(200).json({
      success: true,

      message:
        "Expense updated successfully",

      data:
        updatedExpense,

      notification,
    });
  } catch (error) {
    console.error(
      "❌ Update expense error:",
      error,
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
// ============================================================

exports.deleteExpense = async (
  req,
  res,
) => {
  const session =
    await mongoose.startSession();

  try {
    const { id } =
      req.params;

    if (
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid expense id",
      });
    }

    let notificationPayload;

    // ======================================================
    // TRANSACTION
    // ======================================================

    await session.withTransaction(
      async () => {
        const expense =
          await Expense.findById(
            id,
          ).session(session);

        if (!expense) {
          throw new Error(
            "Expense not found",
          );
        }

        // --------------------------------------------------
        // SAVE INFORMATION
        // --------------------------------------------------

        const expenseId =
          expense._id;

        const expenseEmail =
          normalizeEmail(
            expense.email,
          );

        const expenseUserId =
          expense.userId;

        const expenseCategory =
          expense.category;

        const expenseAmount =
          Number(
            expense.amount,
          ) || 0;

        const budgetId =
          expense.budgetId;

        const budgetAmountUsed =
          Number(
            expense.budgetAmountUsed,
          ) || 0;

        // --------------------------------------------------
        // RETURN MONEY
        // --------------------------------------------------

        await reverseMoneyAllocations(
          expense,
          session,
        );

        // --------------------------------------------------
        // RETURN BUDGET
        // --------------------------------------------------

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

        // --------------------------------------------------
        // DELETE
        // --------------------------------------------------

        await expense.deleteOne({
          session,
        });

        // --------------------------------------------------
        // NOTIFICATION PAYLOAD
        // --------------------------------------------------

        notificationPayload = {
          userEmail:
            expenseEmail,

          userId:
            expenseUserId,

          title:
            "🗑️ Expense Deleted",

          message:
            `${expenseCategory} expense of RWF ` +
            `${expenseAmount.toLocaleString()} ` +
            `was deleted and the money was returned to its original sources.`,

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
                expense.incomeUsed,
              ) || 0,

            savingsReturned:
              Number(
                expense.savingsUsed,
              ) || 0,

            budgetReturned:
              budgetAmountUsed,

            budgetId:
              budgetId || null,
          },
        };
      },
    );

    // ======================================================
    // NOTIFICATION AFTER COMMIT
    // ======================================================

    const notification =
      await createNotificationSafely(
        notificationPayload,
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
      error,
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
// FILTER BY OWNER
//
// Supports:
//
// ?userId=...
// ?email=...
// ============================================================

exports.getExpenseStats = async (
  req,
  res,
) => {
  try {
    const owner =
      buildOwnerQuery(req);

    if (owner.error) {
      return res.status(400).json({
        success: false,
        message:
          owner.error,
      });
    }

    const query =
      owner.query;

    // ======================================================
    // TOTAL
    // ======================================================

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

    // ======================================================
    // CATEGORY
    // ======================================================

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

    // ======================================================
    // SOURCE
    // ======================================================

    const sourceStats =
      await Expense.aggregate([
        {
          $match: query,
        },

        {
          $group: {
            _id: null,

            incomeUsed: {
              $sum:
                "$incomeUsed",
            },

            savingsUsed: {
              $sum:
                "$savingsUsed",
            },
          },
        },
      ]);

    // ======================================================
    // LAST 12 MONTHS
    // ======================================================

    const twelveMonthsAgo =
      new Date();

    twelveMonthsAgo.setMonth(
      twelveMonthsAgo.getMonth() -
        12,
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
            "_id.year":
              -1,

            "_id.month":
              -1,
          },
        },
      ]);

    // ======================================================
    // CURRENT MONTH BUDGET
    // ======================================================

    const now =
      new Date();

    const currentMonth =
      now.getMonth();

    const currentYear =
      now.getFullYear();

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
        budgetQuery,
      );

    const totalBudgeted =
      budgets.reduce(
        (sum, budget) =>
          sum +
          Number(
            budget.allocatedAmount ||
              0,
          ),
        0,
      );

    const totalBudgetSpent =
      budgets.reduce(
        (sum, budget) =>
          sum +
          Number(
            budget.spentAmount ||
              0,
          ),
        0,
      );

    const remainingBudget =
      budgets.reduce(
        (sum, budget) =>
          sum +
          Number(
            budget.remainingAmount ||
              0,
          ),
        0,
      );

    const percentageUsed =
      totalBudgeted > 0
        ? (totalBudgetSpent /
            totalBudgeted) *
          100
        : 0;

    return res.status(200).json({
      success: true,

      data: {
        totalExpense:
          totalExpense.length >
          0
            ? totalExpense[0]
                .total
            : 0,

        totalCount:
          totalExpense.length >
          0
            ? totalExpense[0]
                .count
            : 0,

        categoryBreakdown:
          categoryStats,

        sourceBreakdown: {
          incomeUsed:
            sourceStats.length >
            0
              ? sourceStats[0]
                  .incomeUsed
              : 0,

          savingsUsed:
            sourceStats.length >
            0
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
                2,
              ),
            ),
        },
      },
    });
  } catch (error) {
    console.error(
      "❌ Get expense stats error:",
      error,
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
// GET BUDGET SUMMARY FOR EXPENSES
//
// Query:
//
// ?userId=...
// ?email=...
// ?month=0
// ?year=2026
// ============================================================

exports.getExpenseBudgetSummary =
  async (req, res) => {
    try {
      const {
        userId,
        email,
        month,
        year,
      } = req.query;

      // ====================================================
      // OWNER
      // ====================================================

      let ownerQuery = {};

      if (userId) {
        if (
          !isValidObjectId(
            userId,
          )
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
          normalizeEmail(
            email,
          );
      } else if (req.user) {
        if (req.user._id) {
          ownerQuery.userId =
            req.user._id;
        } else if (
          req.user.email
        ) {
          ownerQuery.email =
            normalizeEmail(
              req.user.email,
            );
        }
      } else {
        return res.status(400).json({
          success: false,

          message:
            "userId or email is required",
        });
      }

      // ====================================================
      // MONTH
      // ====================================================

      const currentMonth =
        month !== undefined
          ? Number(month)
          : new Date().getMonth();

      if (
        !Number.isInteger(
          currentMonth,
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

      // ====================================================
      // YEAR
      // ====================================================

      const currentYear =
        year !== undefined
          ? Number(year)
          : new Date().getFullYear();

      if (
        !Number.isInteger(
          currentYear,
        ) ||
        currentYear < 2000
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid year",
        });
      }

      // ====================================================
      // BUDGETS
      // ====================================================

      const budgets =
        await Budget.find({
          ...ownerQuery,

          month:
            currentMonth,

          year:
            currentYear,
        });

      // ====================================================
      // EXPENSES
      // ====================================================

      const startDate =
        new Date(
          currentYear,
          currentMonth,
          1,
        );

      const endDate =
        new Date(
          currentYear,
          currentMonth + 1,
          1,
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

      // ====================================================
      // TOTAL EXPENSE
      // ====================================================

      const totalExpenses =
        expenses.reduce(
          (sum, expense) =>
            sum +
            Number(
              expense.amount || 0,
            ),
          0,
        );

      // ====================================================
      // BUDGET TOTALS
      // ====================================================

      const totalBudgeted =
        budgets.reduce(
          (sum, budget) =>
            sum +
            Number(
              budget.allocatedAmount ||
                0,
            ),
          0,
        );

      const totalSpent =
        budgets.reduce(
          (sum, budget) =>
            sum +
            Number(
              budget.spentAmount ||
                0,
            ),
          0,
        );

      const totalRemaining =
        budgets.reduce(
          (sum, budget) =>
            sum +
            Number(
              budget.remainingAmount ||
                0,
            ),
          0,
        );

      const overallPercentage =
        totalBudgeted > 0
          ? (totalSpent /
              totalBudgeted) *
            100
          : 0;

      // ====================================================
      // CATEGORY BREAKDOWN
      // ====================================================

      const categories =
        budgets.map(
          (budget) => {
            const categoryExpenses =
              expenses
                .filter(
                  (expense) =>
                    String(
                      expense.category,
                    ).toLowerCase() ===
                    String(
                      budget.category,
                    ).toLowerCase(),
                )
                .reduce(
                  (
                    sum,
                    expense,
                  ) =>
                    sum +
                    Number(
                      expense.amount ||
                        0,
                    ),
                  0,
                );

            return {
              category:
                budget.category,

              budgeted:
                Number(
                  budget.allocatedAmount ||
                    0,
                ),

              spent:
                Number(
                  budget.spentAmount ||
                    0,
                ),

              remaining:
                Number(
                  budget.remainingAmount ||
                    0,
                ),

              percentageUsed:
                Number(
                  budget.percentageUsed ||
                    0,
                ),

              status:
                budget.status ||
                "on-track",

              expenses:
                categoryExpenses,
            };
          },
        );

      // ====================================================
      // STATUS
      // ====================================================

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

      // ====================================================
      // RESPONSE
      // ====================================================

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
                2,
              ),
            ),

          status,

          categories,
        },
      });
    } catch (error) {
      console.error(
        "❌ Expense budget summary error:",
        error,
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch expense budget summary",

        error:
          error.message,
      });
    }
  };