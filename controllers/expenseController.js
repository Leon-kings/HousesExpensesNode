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
// // BUILD OWNER QUERY
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
//     // INCOME
//     // --------------------------------------------------------

//     const totalIncomeUsed = expenses.reduce(
//       (sum, expense) => sum + Number(expense.incomeUsed || 0),
//       0,
//     );

//     // --------------------------------------------------------
//     // SAVINGS
//     //
//     // Kept for compatibility with existing records.
//     // New expenses always save savingsUsed = 0.
//     // --------------------------------------------------------

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
// // EXPENSES CAN ONLY USE INCOME.
// // ============================================================

// const allocateIncomeOnly = async ({ amount, userId, email, session }) => {
//   const numericAmount = Number(amount);

//   if (
//     !Number.isFinite(numericAmount) ||
//     !Number.isInteger(numericAmount) ||
//     numericAmount <= 0
//   ) {
//     throw new Error("Expense amount must be a positive whole number");
//   }

//   // ==========================================================
//   // FIND AVAILABLE INCOME
//   // ==========================================================

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

//   // ==========================================================
//   // CALCULATE TOTAL AVAILABLE INCOME
//   // ==========================================================

//   const totalAvailable = incomes.reduce((total, income) => {
//     return total + Number(income.remainingAmount || 0);
//   }, 0);

//   // ==========================================================
//   // INCOME NOT ENOUGH
//   // ==========================================================

//   if (totalAvailable < numericAmount) {
//     const shortage = numericAmount - totalAvailable;

//     const error = new Error(
//       `Insufficient income. RWF ${shortage.toLocaleString()} is still required.`,
//     );

//     error.statusCode = 400;
//     error.code = "INSUFFICIENT_INCOME";

//     throw error;
//   }

//   // ==========================================================
//   // ALLOCATE FROM INCOME
//   // ==========================================================

//   let remainingToAllocate = numericAmount;

//   let incomeUsed = 0;

//   const incomeAllocations = [];

//   for (const income of incomes) {
//     if (remainingToAllocate <= 0) {
//       break;
//     }

//     const available = Number(income.remainingAmount || 0);

//     if (available <= 0) {
//       continue;
//     }

//     const amountFromIncome = Math.min(available, remainingToAllocate);

//     // ========================================================
//     // DIRECTLY REDUCE REMAINING INCOME
//     //
//     // We do NOT depend on income.useAmount().
//     // ========================================================

//     income.remainingAmount = available - amountFromIncome;

//     if (income.remainingAmount < 0) {
//       income.remainingAmount = 0;
//     }

//     await income.save({
//       session,
//     });

//     // ========================================================
//     // RECORD ALLOCATION
//     // ========================================================

//     incomeAllocations.push({
//       incomeId: income._id,
//       amount: amountFromIncome,
//     });

//     incomeUsed += amountFromIncome;

//     remainingToAllocate -= amountFromIncome;
//   }

//   // ==========================================================
//   // FINAL CHECK
//   // ==========================================================

//   if (remainingToAllocate > 0) {
//     throw new Error(
//       `Insufficient income. RWF ${remainingToAllocate.toLocaleString()} is still required.`,
//     );
//   }

//   // ==========================================================
//   // SAFETY CHECK
//   // ==========================================================

//   if (incomeUsed !== numericAmount) {
//     throw new Error(
//       `Income allocation mismatch: incomeUsed (${incomeUsed}) must equal expense amount (${numericAmount})`,
//     );
//   }

//   return {
//     incomeUsed,

//     incomeAllocations,

//     savingsUsed: 0,

//     savingsAllocations: [],
//   };
// };

// // ============================================================
// // REVERSE MONEY ALLOCATIONS
// // ============================================================

// const reverseMoneyAllocations = async (expense, session) => {
//   // ==========================================================
//   // RETURN TO INCOME
//   // ==========================================================

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

//     // --------------------------------------------------------
//     // Never restore beyond original income amount.
//     // --------------------------------------------------------

//     if (originalAmount > 0 && income.remainingAmount > originalAmount) {
//       income.remainingAmount = originalAmount;
//     }

//     await income.save({
//       session,
//     });
//   }

//   // ==========================================================
//   // RETURN TO SAVINGS
//   //
//   // Only for old records that actually contain savings
//   // allocations.
//   // ==========================================================

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

// const applyBudgetAmount = async ({ budget, amount, session }) => {
//   if (!budget) {
//     return 0;
//   }

//   const numericAmount = Number(amount);

//   if (
//     !Number.isFinite(numericAmount) ||
//     !Number.isInteger(numericAmount) ||
//     numericAmount <= 0
//   ) {
//     return 0;
//   }

//   budget.spentAmount = (Number(budget.spentAmount) || 0) + numericAmount;

//   // ----------------------------------------------------------
//   // Prefer model's addExpense() when available.
//   // Otherwise calculate values directly.
//   // ----------------------------------------------------------

//   if (typeof budget.addExpense === "function") {
//     budget.addExpense(numericAmount);
//   } else if (typeof budget.calculateValues === "function") {
//     budget.calculateValues();
//   } else {
//     budget.remainingAmount =
//       Number(budget.allocatedAmount || 0) - Number(budget.spentAmount || 0);

//     const allocated = Number(budget.allocatedAmount || 0);

//     budget.percentageUsed =
//       allocated > 0
//         ? Number(
//             ((Number(budget.spentAmount || 0) / allocated) * 100).toFixed(2),
//           )
//         : 0;

//     if (Number(budget.spentAmount || 0) > allocated) {
//       budget.status = "over-budget";
//     } else if (
//       allocated > 0 &&
//       Number(budget.spentAmount || 0) >= allocated * 0.8
//     ) {
//       budget.status = "approaching-limit";
//     } else {
//       budget.status = "on-track";
//     }
//   }

//   await budget.save({
//     session,
//   });

//   return numericAmount;
// };

// // ============================================================
// // REMOVE EXPENSE FROM BUDGET
// // ============================================================

// const reverseBudgetAmount = async ({ budgetId, amount, session }) => {
//   if (!budgetId) {
//     return;
//   }

//   const numericAmount = Number(amount);

//   if (
//     !Number.isFinite(numericAmount) ||
//     !Number.isInteger(numericAmount) ||
//     numericAmount <= 0
//   ) {
//     return;
//   }

//   const budget = await Budget.findById(budgetId).session(session);

//   if (!budget) {
//     throw new Error(`Budget ${budgetId} no longer exists.`);
//   }

//   budget.spentAmount = Math.max(
//     (Number(budget.spentAmount) || 0) - numericAmount,
//     0,
//   );

//   // ----------------------------------------------------------
//   // Recalculate budget values.
//   // ----------------------------------------------------------

//   if (typeof budget.calculateValues === "function") {
//     budget.calculateValues();
//   } else {
//     budget.remainingAmount =
//       Number(budget.allocatedAmount || 0) - Number(budget.spentAmount || 0);

//     const allocated = Number(budget.allocatedAmount || 0);

//     budget.percentageUsed =
//       allocated > 0
//         ? Number(
//             ((Number(budget.spentAmount || 0) / allocated) * 100).toFixed(2),
//           )
//         : 0;

//     if (Number(budget.spentAmount || 0) > allocated) {
//       budget.status = "over-budget";
//     } else if (
//       allocated > 0 &&
//       Number(budget.spentAmount || 0) >= allocated * 0.8
//     ) {
//       budget.status = "approaching-limit";
//     } else {
//       budget.status = "on-track";
//     }
//   }

//   await budget.save({
//     session,
//   });
// };

// // ============================================================
// // CHECK BUDGET
// // ============================================================

// const checkBudgetExpense = (budget, amount) => {
//   if (!budget) {
//     return {
//       exceeds: false,
//       exceededBy: 0,
//       remainingBefore: null,
//       remainingAfter: null,
//       allocatedAmount: 0,
//       spentAmount: 0,
//     };
//   }

//   const numericAmount = Number(amount) || 0;

//   const allocatedAmount = Number(budget.allocatedAmount || 0);

//   const spentAmount = Number(budget.spentAmount || 0);

//   const remainingBefore = allocatedAmount - spentAmount;

//   const remainingAfter = remainingBefore - numericAmount;

//   const exceeds = remainingAfter < 0;

//   const exceededBy = exceeds ? Math.abs(remainingAfter) : 0;

//   return {
//     exceeds,

//     exceededBy,

//     remainingBefore,

//     remainingAfter,

//     allocatedAmount,

//     spentAmount,

//     expenseAmount: numericAmount,
//   };
// };

// // ============================================================
// // UPDATE EXPENSE
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

//     const {
//       description,
//       category,
//       type,
//       amount,
//       date,
//       user,
//       email,
//       userId,
//       confirmBudgetExceeded,
//     } = req.body;

//     // ========================================================
//     // FIND EXISTING EXPENSE
//     // ========================================================

//     const existingExpense = await Expense.findById(id);

//     if (!existingExpense) {
//       return res.status(404).json({
//         success: false,
//         message: "Expense not found",
//       });
//     }

//     // ========================================================
//     // USE OLD VALUES WHEN A FIELD IS NOT PROVIDED
//     // ========================================================

//     const finalDescription =
//       description !== undefined
//         ? String(description).trim()
//         : String(existingExpense.description || "").trim();

//     const finalCategory =
//       category !== undefined
//         ? normalizeCategory(category)
//         : normalizeCategory(existingExpense.category);

//     const finalType =
//       type !== undefined
//         ? normalizeExpenseType(type)
//         : normalizeExpenseType(existingExpense.type);

//     const finalAmount =
//       amount !== undefined
//         ? parsePositiveWholeNumber(amount)
//         : parsePositiveWholeNumber(existingExpense.amount);

//     const finalDate =
//       date !== undefined ? new Date(date) : new Date(existingExpense.date);

//     const finalUser =
//       user !== undefined
//         ? String(user).trim()
//         : String(existingExpense.user || "").trim();

//     const finalEmail =
//       email !== undefined
//         ? normalizeEmail(email)
//         : normalizeEmail(existingExpense.email);

//     const finalUserId = userId !== undefined ? userId : existingExpense.userId;

//     // ========================================================
//     // VALIDATION
//     // ========================================================

//     if (!finalDescription) {
//       return res.status(400).json({
//         success: false,
//         message: "Description is required",
//       });
//     }

//     if (!finalCategory) {
//       return res.status(400).json({
//         success: false,
//         message: "Category is required",
//       });
//     }

//     if (!finalUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User is required",
//       });
//     }

//     if (!finalEmail) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid email is required",
//       });
//     }

//     if (!finalUserId) {
//       return res.status(400).json({
//         success: false,
//         message: "userId is required",
//       });
//     }

//     if (!isValidObjectId(finalUserId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     if (finalAmount === null) {
//       return res.status(400).json({
//         success: false,
//         message: "Amount must be a positive whole number",
//       });
//     }

//     if (Number.isNaN(finalDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense date",
//       });
//     }

//     if (!isValidExpenseCategory(finalCategory)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense category",
//       });
//     }

//     if (finalType !== "expense") {
//       return res.status(400).json({
//         success: false,
//         message: "This endpoint can only update expense records",
//       });
//     }

//     const budgetExceededConfirmed =
//       confirmBudgetExceeded === true || confirmBudgetExceeded === "true";

//     let updatedExpense = null;
//     let matchedBudget = null;
//     let budgetCheck = null;

//     // ========================================================
//     // TRANSACTION
//     // ========================================================

//     await session.withTransaction(async () => {
//       // ====================================================
//       // RELOAD EXPENSE INSIDE TRANSACTION
//       // ====================================================

//       const expense = await Expense.findById(id).session(session);

//       if (!expense) {
//         const error = new Error("Expense not found");

//         error.statusCode = 404;

//         throw error;
//       }

//       // ====================================================
//       // 1. RESTORE OLD INCOME
//       // ====================================================

//       await reverseMoneyAllocations(expense, session);

//       // ====================================================
//       // 2. RESTORE OLD BUDGET
//       // ====================================================

//       if (expense.budgetId && Number(expense.budgetAmountUsed || 0) > 0) {
//         await reverseBudgetAmount({
//           budgetId: expense.budgetId,

//           amount: expense.budgetAmountUsed,

//           session,
//         });
//       }

//       // ====================================================
//       // 3. FIND NEW BUDGET
//       // ====================================================

//       matchedBudget = await findBudgetForExpense({
//         userId: finalUserId,

//         category: finalCategory,

//         date: finalDate,

//         session,
//       });

//       // ====================================================
//       // 4. CHECK NEW BUDGET
//       // ====================================================

//       if (matchedBudget) {
//         budgetCheck = checkBudgetExpense(matchedBudget, finalAmount);

//         if (budgetCheck.exceeds && !budgetExceededConfirmed) {
//           const error = new Error(
//             "Expense exceeds the remaining budget. Confirmation is required.",
//           );

//           error.statusCode = 409;
//           error.code = "BUDGET_EXCEEDED";

//           error.budgetCheck = budgetCheck;

//           throw error;
//         }
//       }

//       // ====================================================
//       // 5. ALLOCATE NEW AMOUNT FROM INCOME ONLY
//       // ====================================================

//       const allocation = await allocateIncomeOnly({
//         amount: finalAmount,

//         userId: finalUserId,

//         email: finalEmail,

//         session,
//       });

//       // ====================================================
//       // 6. UPDATE EXPENSE
//       // ====================================================

//       expense.description = finalDescription;

//       expense.category = finalCategory;

//       expense.type = "expense";

//       expense.amount = finalAmount;

//       expense.date = finalDate;

//       expense.user = finalUser;

//       expense.userId = finalUserId;

//       expense.email = finalEmail;

//       expense.incomeUsed = allocation.incomeUsed;

//       expense.incomeAllocations = allocation.incomeAllocations;

//       // ----------------------------------------------------
//       // Savings are ALWAYS zero for new/updated expenses.
//       // ----------------------------------------------------

//       expense.savingsUsed = 0;

//       expense.savingsAllocations = [];

//       // ----------------------------------------------------
//       // Budget tracking
//       // ----------------------------------------------------

//       expense.budgetId = matchedBudget ? matchedBudget._id : null;

//       expense.budgetAmountUsed = matchedBudget ? finalAmount : 0;

//       await expense.save({
//         session,
//       });

//       // ====================================================
//       // 7. UPDATE NEW BUDGET
//       // ====================================================

//       if (matchedBudget) {
//         await applyBudgetAmount({
//           budget: matchedBudget,

//           amount: finalAmount,

//           session,
//         });
//       }

//       updatedExpense = expense;
//     });

//     // ========================================================
//     // NOTIFICATION
//     // ========================================================

//     let notification = null;

//     try {
//       notification = await createNotificationSafely({
//         userEmail: finalEmail,

//         userId: finalUserId,

//         title: "✏️ Expense Updated",

//         message:
//           `Expense of RWF ` +
//           `${finalAmount.toLocaleString()} ` +
//           `for ${finalCategory} ` +
//           `was updated.`,

//         type: "expense",

//         severity:
//           matchedBudget && budgetCheck && budgetCheck.exceeds
//             ? "high"
//             : "medium",

//         relatedId: updatedExpense._id,

//         relatedType: "expense",

//         actionLink: `/expenses/${updatedExpense._id}`,

//         metadata: {
//           expenseId: updatedExpense._id,

//           amount: finalAmount,

//           category: finalCategory,

//           incomeUsed: updatedExpense.incomeUsed,

//           incomeAllocations: updatedExpense.incomeAllocations,

//           savingsUsed: 0,

//           savingsAllocations: [],

//           budgetId: updatedExpense.budgetId,

//           budgetAmountUsed: updatedExpense.budgetAmountUsed,

//           budgetExceeded:
//             matchedBudget && budgetCheck ? budgetCheck.exceeds : false,

//           budgetExceededBy:
//             matchedBudget && budgetCheck ? budgetCheck.exceededBy : 0,

//           budgetExceededConfirmed: budgetExceededConfirmed,
//         },
//       });
//     } catch (error) {
//       console.error("⚠️ Expense update notification failed:", error);
//     }

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(200).json({
//       success: true,

//       message:
//         matchedBudget && budgetCheck && budgetCheck.exceeds
//           ? "Expense updated successfully. Budget was exceeded."
//           : "Expense updated successfully",

//       data: updatedExpense,

//       budget: matchedBudget
//         ? {
//             _id: matchedBudget._id,

//             category: matchedBudget.category,

//             month: matchedBudget.month,

//             year: matchedBudget.year,

//             allocatedAmount: matchedBudget.allocatedAmount,

//             spentAmount: matchedBudget.spentAmount,

//             remainingAmount: matchedBudget.remainingAmount,

//             percentageUsed: matchedBudget.percentageUsed,

//             status: matchedBudget.status,

//             exceeded: budgetCheck ? budgetCheck.exceeds : false,

//             exceededBy: budgetCheck ? budgetCheck.exceededBy : 0,

//             confirmed: budgetExceededConfirmed,
//           }
//         : null,

//       funding: {
//         source: "income",

//         incomeUsed: updatedExpense.incomeUsed,

//         incomeAllocations: updatedExpense.incomeAllocations,

//         savingsUsed: 0,

//         savingsAllocations: [],
//       },

//       notification,
//     });
//   } catch (error) {
//     // ========================================================
//     // BUDGET EXCEEDED
//     // ========================================================

//     if (error.code === "BUDGET_EXCEEDED") {
//       return res.status(409).json({
//         success: false,

//         code: "BUDGET_EXCEEDED",

//         message:
//           "This expense exceeds the remaining budget. Do you want to proceed?",

//         requiresConfirmation: true,

//         budget: error.budgetCheck,

//         expenseUpdated: false,

//         incomeDeducted: false,

//         budgetUpdated: false,
//       });
//     }

//     console.error("❌ Update expense error:", error);

//     return res.status(error.statusCode || 400).json({
//       success: false,

//       message: error.message || "Failed to update expense",
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// // ============================================================
// // DELETE EXPENSE
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

//     let deletedExpense = null;

//     await session.withTransaction(async () => {
//       // ====================================================
//       // FIND EXPENSE
//       // ====================================================

//       const expense = await Expense.findById(id).session(session);

//       if (!expense) {
//         const error = new Error("Expense not found");

//         error.statusCode = 404;

//         throw error;
//       }

//       // ====================================================
//       // RESTORE MONEY
//       // ====================================================

//       await reverseMoneyAllocations(expense, session);

//       // ====================================================
//       // RESTORE BUDGET
//       // ====================================================

//       if (expense.budgetId && Number(expense.budgetAmountUsed || 0) > 0) {
//         await reverseBudgetAmount({
//           budgetId: expense.budgetId,

//           amount: expense.budgetAmountUsed,

//           session,
//         });
//       }

//       // ====================================================
//       // SAVE COPY FOR RESPONSE / NOTIFICATION
//       // ====================================================

//       deletedExpense = expense.toObject();

//       // ====================================================
//       // DELETE
//       // ====================================================

//       await Expense.deleteOne({
//         _id: expense._id,
//       }).session(session);
//     });

//     // ========================================================
//     // NOTIFICATION
//     // ========================================================

//     let notification = null;

//     try {
//       notification = await createNotificationSafely({
//         userEmail: normalizeEmail(deletedExpense.email),

//         userId: deletedExpense.userId,

//         title: "🗑️ Expense Deleted",

//         message:
//           `Expense of RWF ` +
//           `${Number(deletedExpense.amount || 0).toLocaleString()} ` +
//           `for ${deletedExpense.category} ` +
//           `was deleted.`,

//         type: "expense",

//         severity: "medium",

//         relatedId: deletedExpense._id,

//         relatedType: "expense",

//         actionLink: "/expenses",

//         metadata: {
//           expenseId: deletedExpense._id,

//           amount: deletedExpense.amount,

//           category: deletedExpense.category,

//           incomeRestored: Number(deletedExpense.incomeUsed || 0),

//           budgetRestored: Number(deletedExpense.budgetAmountUsed || 0),
//         },
//       });
//     } catch (error) {
//       console.error("⚠️ Expense delete notification failed:", error);
//     }

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(200).json({
//       success: true,

//       message: "Expense deleted successfully",

//       data: deletedExpense,

//       restored: {
//         income: Number(deletedExpense.incomeUsed || 0),

//         savings: Number(deletedExpense.savingsUsed || 0),

//         budget: Number(deletedExpense.budgetAmountUsed || 0),
//       },

//       notification,
//     });
//   } catch (error) {
//     console.error("❌ Delete expense error:", error);

//     return res.status(error.statusCode || 400).json({
//       success: false,

//       message: error.message || "Failed to delete expense",
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// // ============================================================
// // BULK DELETE EXPENSES
// // ============================================================

// exports.bulkDeleteExpenses = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const ids = Array.isArray(req.body.ids)
//       ? req.body.ids
//       : Array.isArray(req.body.expenseIds)
//         ? req.body.expenseIds
//         : [];

//     // ========================================================
//     // VALIDATE IDS
//     // ========================================================

//     if (!ids.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Expense ids are required",
//       });
//     }

//     const uniqueIds = [...new Set(ids.map((id) => String(id)))];

//     const invalidIds = uniqueIds.filter((id) => !isValidObjectId(id));

//     if (invalidIds.length) {
//       return res.status(400).json({
//         success: false,

//         message: "One or more expense ids are invalid",

//         invalidIds,
//       });
//     }

//     let deletedExpenses = [];

//     let totalIncomeRestored = 0;

//     let totalSavingsRestored = 0;

//     let totalBudgetRestored = 0;

//     // ========================================================
//     // TRANSACTION
//     // ========================================================

//     await session.withTransaction(async () => {
//       // ====================================================
//       // FIND EXPENSES
//       // ====================================================

//       const expenses = await Expense.find({
//         _id: {
//           $in: uniqueIds,
//         },
//       }).session(session);

//       if (!expenses.length) {
//         const error = new Error("No expenses found");

//         error.statusCode = 404;

//         throw error;
//       }

//       // ====================================================
//       // PROCESS EACH EXPENSE
//       // ====================================================

//       for (const expense of expenses) {
//         // --------------------------------------------------
//         // Restore income/savings
//         // --------------------------------------------------

//         await reverseMoneyAllocations(expense, session);

//         // --------------------------------------------------
//         // Restore budget
//         // --------------------------------------------------

//         if (expense.budgetId && Number(expense.budgetAmountUsed || 0) > 0) {
//           await reverseBudgetAmount({
//             budgetId: expense.budgetId,

//             amount: expense.budgetAmountUsed,

//             session,
//           });
//         }

//         // --------------------------------------------------
//         // Totals
//         // --------------------------------------------------

//         totalIncomeRestored += Number(expense.incomeUsed || 0);

//         totalSavingsRestored += Number(expense.savingsUsed || 0);

//         totalBudgetRestored += Number(expense.budgetAmountUsed || 0);

//         // --------------------------------------------------
//         // Save response copy
//         // --------------------------------------------------

//         deletedExpenses.push(expense.toObject());

//         // --------------------------------------------------
//         // Delete
//         // --------------------------------------------------

//         await Expense.deleteOne({
//           _id: expense._id,
//         }).session(session);
//       }

//       // ====================================================
//       // IF SOME IDS DID NOT EXIST
//       // ====================================================

//       const foundIds = expenses.map((expense) => String(expense._id));

//       const notFoundIds = uniqueIds.filter((id) => !foundIds.includes(id));

//       if (notFoundIds.length) {
//         console.warn("⚠️ Some expense ids were not found:", notFoundIds);
//       }
//     });

//     // ========================================================
//     // NOTIFICATIONS
//     // ========================================================

//     const notification = deletedExpenses.length
//       ? await createNotificationSafely({
//           userEmail: normalizeEmail(deletedExpenses[0].email),

//           userId: deletedExpenses[0].userId,

//           title: "🗑️ Expenses Deleted",

//           message:
//             `${deletedExpenses.length} ` +
//             `expense${
//               deletedExpenses.length === 1 ? "" : "s"
//             } deleted successfully.`,

//           type: "expense",

//           severity: "medium",

//           relatedType: "expense",

//           actionLink: "/expenses",

//           metadata: {
//             count: deletedExpenses.length,

//             expenseIds: deletedExpenses.map((expense) => expense._id),

//             totalIncomeRestored,

//             totalSavingsRestored,

//             totalBudgetRestored,
//           },
//         })
//       : null;

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(200).json({
//       success: true,

//       message: `${deletedExpenses.length} expense${
//         deletedExpenses.length === 1 ? "" : "s"
//       } deleted successfully`,

//       count: deletedExpenses.length,

//       data: deletedExpenses,

//       restored: {
//         income: totalIncomeRestored,

//         savings: totalSavingsRestored,

//         budget: totalBudgetRestored,
//       },

//       notification,
//     });
//   } catch (error) {
//     console.error("❌ Bulk delete expenses error:", error);

//     return res.status(error.statusCode || 400).json({
//       success: false,

//       message: error.message || "Failed to bulk delete expenses",
//     });
//   } finally {
//     await session.endSession();
//   }
// };

// // ============================================================
// // CREATE EXPENSE
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
//       confirmBudgetExceeded,
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
//         message: "All expense fields are required",
//       });
//     }

//     // ========================================================
//     // USER ID
//     // ========================================================

//     if (!isValidObjectId(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     // ========================================================
//     // AMOUNT
//     // ========================================================

//     const numericAmount = parsePositiveWholeNumber(amount);

//     if (numericAmount === null) {
//       return res.status(400).json({
//         success: false,
//         message: "Amount must be a positive whole number",
//       });
//     }

//     // ========================================================
//     // DATE
//     // ========================================================

//     const expenseDate = new Date(date);

//     if (Number.isNaN(expenseDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense date",
//       });
//     }

//     // ========================================================
//     // EMAIL
//     // ========================================================

//     const normalizedEmail = normalizeEmail(email);

//     if (!normalizedEmail) {
//       return res.status(400).json({
//         success: false,
//         message: "Valid email is required",
//       });
//     }

//     // ========================================================
//     // CATEGORY
//     // ========================================================

//     const normalizedCategory = normalizeCategory(category);

//     if (!isValidExpenseCategory(normalizedCategory)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense category",
//       });
//     }

//     // ========================================================
//     // TYPE
//     // ========================================================

//     const expenseType = normalizeExpenseType(type);

//     if (expenseType !== "expense") {
//       return res.status(400).json({
//         success: false,
//         message: "This endpoint can only create expense records",
//       });
//     }

//     // ========================================================
//     // CONFIRMATION
//     // ========================================================

//     const budgetExceededConfirmed =
//       confirmBudgetExceeded === true || confirmBudgetExceeded === "true";

//     // ========================================================
//     // EXPENSE MONTH / YEAR
//     // ========================================================

//     const expenseMonth = expenseDate.getMonth();

//     const expenseYear = expenseDate.getFullYear();

//     // ========================================================
//     // VARIABLES
//     // ========================================================

//     let expense = null;

//     let matchedBudget = null;

//     let budgetCheck = null;

//     let notification = null;

//     // ========================================================
//     // TRANSACTION
//     // ========================================================

//     await session.withTransaction(async () => {
//       // ====================================================
//       // 1. FIND MATCHING BUDGET
//       // ====================================================

//       matchedBudget = await Budget.findOne({
//         userId,

//         category: normalizedCategory.toLowerCase(),

//         month: expenseMonth,

//         year: expenseYear,
//       }).session(session);

//       // ====================================================
//       // 2. CHECK BUDGET
//       // ====================================================

//       if (matchedBudget) {
//         budgetCheck = checkBudgetExpense(matchedBudget, numericAmount);

//         if (budgetCheck.exceeds && !budgetExceededConfirmed) {
//           const error = new Error(
//             "Expense exceeds the remaining budget. Confirmation is required.",
//           );

//           error.statusCode = 409;

//           error.code = "BUDGET_EXCEEDED";

//           error.budgetCheck = budgetCheck;

//           throw error;
//         }
//       }

//       // ====================================================
//       // 3. ALLOCATE MONEY FROM INCOME ONLY
//       // ====================================================

//       const allocation = await allocateIncomeOnly({
//         amount: numericAmount,

//         userId,

//         email: normalizedEmail,

//         session,
//       });

//       // ====================================================
//       // 4. BUDGET TRACKING
//       // ====================================================

//       const budgetAmountUsed = matchedBudget ? numericAmount : 0;

//       // ====================================================
//       // 5. CREATE EXPENSE
//       // ====================================================

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

//             // ------------------------------------------
//             // INCOME
//             // ------------------------------------------

//             incomeUsed: allocation.incomeUsed,

//             incomeAllocations: allocation.incomeAllocations,

//             // ------------------------------------------
//             // SAVINGS
//             // ------------------------------------------

//             savingsUsed: 0,

//             savingsAllocations: [],

//             // ------------------------------------------
//             // BUDGET
//             // ------------------------------------------

//             budgetId: matchedBudget ? matchedBudget._id : null,

//             budgetAmountUsed: budgetAmountUsed,
//           },
//         ],
//         {
//           session,
//         },
//       );

//       expense = createdExpenses[0];

//       // ====================================================
//       // 6. UPDATE BUDGET
//       // ====================================================

//       if (matchedBudget) {
//         await applyBudgetAmount({
//           budget: matchedBudget,

//           amount: numericAmount,

//           session,
//         });

//         console.log("✅ BUDGET UPDATED AFTER EXPENSE");

//         console.log({
//           budgetId: matchedBudget._id,

//           category: matchedBudget.category,

//           allocated: matchedBudget.allocatedAmount,

//           spent: matchedBudget.spentAmount,

//           remaining: matchedBudget.remainingAmount,

//           percentage: matchedBudget.percentageUsed,

//           status: matchedBudget.status,

//           expenseAmount: numericAmount,

//           exceeded: budgetCheck ? budgetCheck.exceeds : false,

//           exceededBy: budgetCheck ? budgetCheck.exceededBy : 0,
//         });
//       } else {
//         console.log("ℹ️ NO MATCHING BUDGET - EXPENSE CONTINUES USING INCOME");

//         console.log({
//           userId,

//           category: normalizedCategory,

//           month: expenseMonth,

//           year: expenseYear,

//           amount: numericAmount,
//         });
//       }
//     });

//     // ========================================================
//     // NOTIFICATION
//     // ========================================================

//     try {
//       notification = await createNotificationSafely({
//         userEmail: normalizedEmail,

//         userId,

//         title: "💸 Expense Added",

//         message:
//           `Expense of RWF ` +
//           `${numericAmount.toLocaleString()} ` +
//           `for ${normalizedCategory} ` +
//           `was added.`,

//         type: "expense",

//         severity:
//           matchedBudget && budgetCheck && budgetCheck.exceeds
//             ? "high"
//             : "medium",

//         relatedId: expense._id,

//         relatedType: "expense",

//         actionLink: `/expenses/${expense._id}`,

//         metadata: {
//           expenseId: expense._id,

//           amount: numericAmount,

//           category: normalizedCategory,

//           // ------------------------------------------
//           // FUNDING
//           // ------------------------------------------

//           incomeUsed: expense.incomeUsed,

//           incomeAllocations: expense.incomeAllocations,

//           savingsUsed: 0,

//           savingsAllocations: [],

//           // ------------------------------------------
//           // BUDGET
//           // ------------------------------------------

//           budgetId: expense.budgetId,

//           budgetAmountUsed: expense.budgetAmountUsed,

//           budgetAllocated: matchedBudget ? matchedBudget.allocatedAmount : 0,

//           budgetSpent: matchedBudget ? matchedBudget.spentAmount : 0,

//           budgetRemaining: matchedBudget ? matchedBudget.remainingAmount : 0,

//           budgetPercentage: matchedBudget ? matchedBudget.percentageUsed : 0,

//           budgetStatus: matchedBudget ? matchedBudget.status : null,

//           budgetExceeded:
//             matchedBudget && budgetCheck ? budgetCheck.exceeds : false,

//           budgetExceededBy:
//             matchedBudget && budgetCheck ? budgetCheck.exceededBy : 0,

//           budgetExceededConfirmed: budgetExceededConfirmed,
//         },
//       });
//     } catch (notificationError) {
//       console.error("⚠️ Expense notification failed:", notificationError);
//     }

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(201).json({
//       success: true,

//       message:
//         matchedBudget && budgetCheck && budgetCheck.exceeds
//           ? "Expense created successfully. Budget was exceeded."
//           : "Expense created successfully",

//       data: expense,

//       budget: matchedBudget
//         ? {
//             _id: matchedBudget._id,

//             category: matchedBudget.category,

//             month: matchedBudget.month,

//             year: matchedBudget.year,

//             allocatedAmount: matchedBudget.allocatedAmount,

//             spentAmount: matchedBudget.spentAmount,

//             remainingAmount: matchedBudget.remainingAmount,

//             percentageUsed: matchedBudget.percentageUsed,

//             status: matchedBudget.status,

//             exceeded: budgetCheck ? budgetCheck.exceeds : false,

//             exceededBy: budgetCheck ? budgetCheck.exceededBy : 0,

//             confirmed: budgetExceededConfirmed,
//           }
//         : null,

//       // ======================================================
//       // FUNDING RESULT
//       // ======================================================

//       funding: {
//         source: "income",

//         incomeUsed: expense.incomeUsed,

//         incomeAllocations: expense.incomeAllocations,

//         savingsUsed: 0,

//         savingsAllocations: [],
//       },

//       notification,
//     });
//   } catch (error) {
//     // ========================================================
//     // BUDGET EXCEEDED
//     // ========================================================

//     if (error.code === "BUDGET_EXCEEDED") {
//       return res.status(409).json({
//         success: false,

//         code: "BUDGET_EXCEEDED",

//         message:
//           "This expense exceeds the remaining budget. Do you want to proceed?",

//         requiresConfirmation: true,

//         budget: error.budgetCheck,

//         // ----------------------------------------------------
//         // NOTHING WAS CHANGED
//         // ----------------------------------------------------

//         expenseCreated: false,

//         incomeDeducted: false,

//         budgetUpdated: false,
//       });
//     }

//     // ========================================================
//     // NORMAL ERROR
//     // ========================================================

//     console.error("❌ Create expense error:", error);

//     return res.status(error.statusCode || 400).json({
//       success: false,

//       message: error.message || "Failed to create expense",
//     });
//   } finally {
//     await session.endSession();
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

// ============================================================
// STRICT MONEY VALIDATION
// ============================================================

const parsePositiveWholeNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const stringValue = String(value).trim();

  // NO decimals
  if (!/^\d+$/.test(stringValue)) {
    return null;
  }

  const number = Number(stringValue);

  // NO zero
  if (!Number.isSafeInteger(number) || number <= 0) {
    return null;
  }

  return number;
};

const parseNonNegativeWholeNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const stringValue = String(value).trim();

  // NO decimals and NO negative numbers
  if (!/^\d+$/.test(stringValue)) {
    return null;
  }

  const number = Number(stringValue);

  if (!Number.isSafeInteger(number) || number < 0) {
    return null;
  }

  return number;
};

const normalizeCategory = (category) => {
  return String(category || "").trim();
};

const parsePositiveWholeNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || !Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
};

const parseNonNegativeWholeNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || !Number.isInteger(number) || number < 0) {
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
  return EXPENSE_CATEGORIES.includes(normalizeCategory(category));
};

// ============================================================
// BUILD OWNER QUERY
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
    console.error("⚠️ Expense notification creation failed:", error.message);

    return null;
  }
};

// ============================================================
// CREATE INCOME BALANCE ALERTS
//
// IMPORTANT:
// Notification type remains "expense" because your existing
// Notification model uses an enum and previously rejected
// unsupported values such as income_low / income_exhausted.
//
// The actual income alert is identified in metadata.alertLevel.
// ============================================================

const createIncomeBalanceAlerts = async ({
  userId,
  email,
  incomeAlerts = [],
}) => {
  const notifications = [];

  if (!Array.isArray(incomeAlerts)) {
    return notifications;
  }

  for (const alert of incomeAlerts) {
    try {
      if (!alert || !alert.level || !alert.incomeId) {
        continue;
      }

      let title = "";
      let severity = "medium";

      // ======================================================
      // EXHAUSTED
      // ======================================================

      if (alert.level === "exhausted") {
        title = "🚨 Income Exhausted";
        severity = "high";
      }

      // ======================================================
      // LOW
      // ======================================================
      else if (alert.level === "low") {
        title = "⚠️ Income Running Low";
        severity = "high";
      } else {
        continue;
      }

      const notification = await createNotificationSafely({
        userEmail: normalizeEmail(email),

        userId,

        title,

        message: alert.message,

        type: "expense",

        severity,

        relatedId: alert.incomeId,

        relatedType: "income",

        actionLink: "/income",

        metadata: {
          incomeId: alert.incomeId,

          originalAmount: Number(alert.originalAmount || 0),

          amountUsed: Number(alert.amountUsed || 0),

          remainingAmount: Number(alert.remainingAmount || 0),

          remainingPercentage: Number(alert.remainingPercentage || 0),

          alertLevel: alert.level,
        },
      });

      if (notification) {
        notifications.push(notification);
      }
    } catch (error) {
      console.error("⚠️ Income balance alert failed:", error.message);
    }
  }

  return notifications;
};

// ============================================================
// GET EXPENSES
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

    if (category && category.toLowerCase() !== "all") {
      query.category = category.trim();
    }

    // --------------------------------------------------------
    // TYPE
    // --------------------------------------------------------

    if (type && type.toLowerCase() !== "all") {
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
          message: "Month must be an integer between 0 and 11",
        });
      }

      const selectedYear =
        year !== undefined ? Number(year) : new Date().getFullYear();

      if (!Number.isInteger(selectedYear) || selectedYear < 2000) {
        return res.status(400).json({
          success: false,
          message: "Invalid year",
        });
      }

      query.date = {
        ...(query.date || {}),
        $gte: new Date(selectedYear, numericMonth, 1),
        $lt: new Date(selectedYear, numericMonth + 1, 1),
      };
    }

    // --------------------------------------------------------
    // YEAR
    // --------------------------------------------------------

    if (year !== undefined && month === undefined) {
      const numericYear = Number(year);

      if (!Number.isInteger(numericYear) || numericYear < 2000) {
        return res.status(400).json({
          success: false,
          message: "Invalid year",
        });
      }

      query.date = {
        ...(query.date || {}),
        $gte: new Date(numericYear, 0, 1),
        $lt: new Date(numericYear + 1, 0, 1),
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
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );

    const totalIncomeUsed = expenses.reduce(
      (sum, expense) => sum + Number(expense.incomeUsed || 0),
      0,
    );

    const totalSavingsUsed = expenses.reduce(
      (sum, expense) => sum + Number(expense.savingsUsed || 0),
      0,
    );

    const totalBudgetUsed = expenses.reduce(
      (sum, expense) => sum + Number(expense.budgetAmountUsed || 0),
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
    console.error("❌ Get expenses error:", error);

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
    console.error("❌ Get expense error:", error);

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

exports.getExpensesByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const expenses = await Expense.find({
      email: normalizedEmail,
    }).sort({
      date: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Expenses retrieved successfully",
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error("❌ Get expenses by email error:", error);

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
// ============================================================

exports.getStats = async (req, res) => {
  try {
    const expenses = await Expense.find();

    // --------------------------------------------------------
    // BASIC TOTALS
    // --------------------------------------------------------

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0,
    );

    const totalCount = expenses.length;

    // --------------------------------------------------------
    // INCOME
    // --------------------------------------------------------

    const totalIncomeUsed = expenses.reduce(
      (sum, expense) => sum + Number(expense.incomeUsed || 0),
      0,
    );

    // --------------------------------------------------------
    // SAVINGS
    // --------------------------------------------------------

    const totalSavingsUsed = expenses.reduce(
      (sum, expense) => sum + Number(expense.savingsUsed || 0),
      0,
    );

    // --------------------------------------------------------
    // BUDGET
    // --------------------------------------------------------

    const totalBudgetUsed = expenses.reduce(
      (sum, expense) => sum + Number(expense.budgetAmountUsed || 0),
      0,
    );

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

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

      categoryMap[category].total += Number(expense.amount || 0);

      categoryMap[category].count += 1;
    });

    const categoryBreakdown = Object.values(categoryMap).sort(
      (a, b) => b.total - a.total,
    );

    // --------------------------------------------------------
    // TYPE
    // --------------------------------------------------------

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

      typeMap[type].total += Number(expense.amount || 0);

      typeMap[type].count += 1;
    });

    const typeBreakdown = Object.values(typeMap).sort(
      (a, b) => b.total - a.total,
    );

    // --------------------------------------------------------
    // MONTHLY
    // --------------------------------------------------------

    const monthlyMap = {};

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);

      if (Number.isNaN(expenseDate.getTime())) {
        return;
      }

      const expenseYear = expenseDate.getFullYear();

      const expenseMonth = expenseDate.getMonth() + 1;

      const key =
        `${expenseYear}-` + `${String(expenseMonth).padStart(2, "0")}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          year: expenseYear,
          month: expenseMonth,
          total: 0,
          count: 0,
        };
      }

      monthlyMap[key].total += Number(expense.amount || 0);

      monthlyMap[key].count += 1;
    });

    const monthlyBreakdown = Object.values(monthlyMap).sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }

      return b.month - a.month;
    });

    // --------------------------------------------------------
    // INCOME ALLOCATIONS
    // --------------------------------------------------------

    const incomeAllocationMap = {};

    expenses.forEach((expense) => {
      const allocations = expense.incomeAllocations || [];

      allocations.forEach((allocation) => {
        if (!allocation.incomeId) {
          return;
        }

        const incomeId = String(allocation.incomeId);

        if (!incomeAllocationMap[incomeId]) {
          incomeAllocationMap[incomeId] = {
            incomeId: allocation.incomeId,
            amount: 0,
          };
        }

        incomeAllocationMap[incomeId].amount += Number(allocation.amount || 0);
      });
    });

    const incomeAllocations = Object.values(incomeAllocationMap);

    // --------------------------------------------------------
    // SAVINGS ALLOCATIONS
    // --------------------------------------------------------

    const savingsAllocationMap = {};

    expenses.forEach((expense) => {
      const allocations = expense.savingsAllocations || [];

      allocations.forEach((allocation) => {
        if (!allocation.savingsId) {
          return;
        }

        const savingsId = String(allocation.savingsId);

        if (!savingsAllocationMap[savingsId]) {
          savingsAllocationMap[savingsId] = {
            savingsId: allocation.savingsId,
            amount: 0,
          };
        }

        savingsAllocationMap[savingsId].amount += Number(
          allocation.amount || 0,
        );
      });
    });

    const savingsAllocations = Object.values(savingsAllocationMap);

    // --------------------------------------------------------
    // AVERAGE
    // --------------------------------------------------------

    const averageExpense = totalCount > 0 ? totalExpenses / totalCount : 0;

    // --------------------------------------------------------
    // HIGHEST
    // --------------------------------------------------------

    let highestExpense = null;

    if (expenses.length > 0) {
      highestExpense = expenses.reduce((highest, expense) => {
        if (
          !highest ||
          Number(expense.amount || 0) > Number(highest.amount || 0)
        ) {
          return expense;
        }

        return highest;
      }, null);
    }

    return res.status(200).json({
      success: true,

      data: {
        totalExpenses,

        totalCount,

        totalIncomeUsed,

        totalSavingsUsed,

        totalBudgetUsed,

        averageExpense: Number(averageExpense.toFixed(2)),

        highestExpense,

        categoryBreakdown,

        typeBreakdown,

        monthlyBreakdown,

        incomeAllocations,

        savingsAllocations,
      },
    });
  } catch (error) {
    console.error("❌ Get expense statistics error:", error);

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

exports.getExpensesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
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
      message: "Expenses retrieved successfully",
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.error("❌ Get expenses by userId error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve expenses",
      error: error.message,
    });
  }
};

// ============================================================
// ALLOCATE EXPENSE FROM INCOME ONLY
//
// IMPORTANT ACCOUNTING RULES:
//
// income.amount
//     = ORIGINAL INCOME
//     = NEVER CHANGED
//
// income.remainingAmount
//     = CURRENT AVAILABLE BALANCE
//     = ONLY VALUE REDUCED
//
// No savings are used for new expenses.
// No money is created.
// No multiplication occurs.
// ============================================================

// const allocateIncomeOnly = async ({ amount, userId, email, session }) => {
//   const numericAmount = Number(amount);

//   if (
//     !Number.isFinite(numericAmount) ||
//     !Number.isInteger(numericAmount) ||
//     numericAmount <= 0
//   ) {
//     throw new Error("Expense amount must be a positive whole number");
//   }

//   const normalizedEmail = normalizeEmail(email);

//   // ==========================================================
//   // FIND AVAILABLE INCOME
//   // ==========================================================

//   const incomes = await Income.find({
//     userId,

//     email: normalizedEmail,

//     remainingAmount: {
//       $gt: 0,
//     },
//   })
//     .sort({
//       date: 1,
//       createdAt: 1,
//     })
//     .session(session);

//   // ==========================================================
//   // TOTAL AVAILABLE
//   // ==========================================================

//   const totalAvailable = incomes.reduce((total, income) => {
//     return total + Number(income.remainingAmount || 0);
//   }, 0);

//   console.log("=================================================");

//   console.log("💰 INCOME ALLOCATION CHECK");

//   console.log("Expense requested:", numericAmount);

//   console.log("Total income available:", totalAvailable);

//   console.log("User:", userId);

//   console.log("Email:", normalizedEmail);

//   console.log("=================================================");

//   // ==========================================================
//   // NO INCOME
//   // ==========================================================

//   if (totalAvailable <= 0) {
//     const error = new Error(
//       "No income is available. Please add income before creating an expense.",
//     );

//     error.statusCode = 400;
//     error.code = "NO_INCOME_AVAILABLE";

//     error.totalAvailable = 0;
//     error.requiredAmount = numericAmount;
//     error.shortage = numericAmount;

//     throw error;
//   }

//   // ==========================================================
//   // NOT ENOUGH INCOME
//   // ==========================================================

//   if (totalAvailable < numericAmount) {
//     const shortage = numericAmount - totalAvailable;

//     const error = new Error(
//       `Insufficient income. RWF ${shortage.toLocaleString()} is still required.`,
//     );

//     error.statusCode = 400;

//     error.code = "INSUFFICIENT_INCOME";

//     error.totalAvailable = totalAvailable;

//     error.requiredAmount = numericAmount;

//     error.shortage = shortage;

//     throw error;
//   }

//   // ==========================================================
//   // ALLOCATE
//   // ==========================================================

//   let remainingToAllocate = numericAmount;

//   let incomeUsed = 0;

//   const incomeAllocations = [];

//   const incomeAlerts = [];

//   // ==========================================================
//   // PROCESS EACH INCOME
//   // ==========================================================

//   for (const income of incomes) {
//     if (remainingToAllocate <= 0) {
//       break;
//     }

//     // --------------------------------------------------------
//     // ORIGINAL AMOUNT
//     // --------------------------------------------------------

//     const originalAmount = Number(income.amount || 0);

//     // --------------------------------------------------------
//     // CURRENT BALANCE
//     // --------------------------------------------------------

//     const available = Number(income.remainingAmount || 0);

//     if (available <= 0) {
//       continue;
//     }

//     // --------------------------------------------------------
//     // HOW MUCH THIS INCOME PAYS
//     // --------------------------------------------------------

//     const amountFromIncome = Math.min(available, remainingToAllocate);

//     // ========================================================
//     // CRITICAL:
//     //
//     // DO NOT TOUCH income.amount
//     //
//     // ONLY CHANGE remainingAmount
//     // ========================================================

//     const newRemainingAmount = Math.max(available - amountFromIncome, 0);

//     income.remainingAmount = newRemainingAmount;

//     // ========================================================
//     // SAVE
//     // ========================================================

//     await income.save({
//       session,
//     });

//     // ========================================================
//     // RECORD ALLOCATION
//     // ========================================================

//     incomeAllocations.push({
//       incomeId: income._id,
//       amount: amountFromIncome,
//     });

//     incomeUsed += amountFromIncome;

//     remainingToAllocate -= amountFromIncome;

//     // ========================================================
//     // CALCULATE BALANCE PERCENTAGE
//     // ========================================================

//     let remainingPercentage = 0;

//     if (originalAmount > 0) {
//       remainingPercentage = (newRemainingAmount / originalAmount) * 100;
//     }

//     // ========================================================
//     // ZERO BALANCE
//     // ========================================================

//     if (newRemainingAmount === 0) {
//       incomeAlerts.push({
//         level: "exhausted",

//         incomeId: income._id,

//         originalAmount,

//         amountUsed: amountFromIncome,

//         remainingAmount: 0,

//         remainingPercentage: 0,

//         message:
//           `Income of RWF ${originalAmount.toLocaleString()} ` +
//           `has been fully used. No balance remains.`,
//       });
//     }

//     // ========================================================
//     // 20% OR LESS
//     // ========================================================
//     else if (originalAmount > 0 && remainingPercentage <= 20) {
//       incomeAlerts.push({
//         level: "low",

//         incomeId: income._id,

//         originalAmount,

//         amountUsed: amountFromIncome,

//         remainingAmount: newRemainingAmount,

//         remainingPercentage: Number(remainingPercentage.toFixed(2)),

//         message:
//           `Income balance is running low. ` +
//           `Only RWF ${newRemainingAmount.toLocaleString()} ` +
//           `(${remainingPercentage.toFixed(2)}%) remains.`,
//       });
//     }

//     // ========================================================
//     // LOG
//     // ========================================================

//     console.log("-------------------------------------------------");

//     console.log("Income ID:", income._id);

//     console.log("Original income:", originalAmount);

//     console.log("Used:", amountFromIncome);

//     console.log("Remaining:", newRemainingAmount);

//     console.log("Remaining percentage:", `${remainingPercentage.toFixed(2)}%`);

//     console.log("-------------------------------------------------");
//   }

//   // ==========================================================
//   // FINAL ALLOCATION CHECK
//   // ==========================================================

//   if (remainingToAllocate > 0) {
//     const error = new Error(
//       `Insufficient income. RWF ${remainingToAllocate.toLocaleString()} is still required.`,
//     );

//     error.statusCode = 400;
//     error.code = "INSUFFICIENT_INCOME";

//     throw error;
//   }

//   // ==========================================================
//   // SAFETY CHECK
//   // ==========================================================

//   if (incomeUsed !== numericAmount) {
//     throw new Error(
//       `Income allocation mismatch: incomeUsed (${incomeUsed}) must equal expense amount (${numericAmount})`,
//     );
//   }

//   // ==========================================================
//   // RETURN
//   // ==========================================================

//   return {
//     incomeUsed,

//     incomeAllocations,

//     savingsUsed: 0,

//     savingsAllocations: [],

//     incomeAlerts,

//     totalIncomeBefore: totalAvailable,

//     totalIncomeAfter: totalAvailable - numericAmount,
//   };
// };

// ============================================================
// ALLOCATE INCOME ONLY
// ============================================================

const allocateIncomeOnly = async ({
  amount,
  userId,
  email,
  session,
}) => {
  const numericAmount =
    parsePositiveWholeNumber(amount);

  if (numericAmount === null) {
    const error = new Error(
      "Expense amount must be a positive whole number."
    );

    error.statusCode = 400;
    error.code = "INVALID_AMOUNT";

    throw error;
  }

  const normalizedEmail =
    normalizeEmail(email);

  const incomes = await Income.find({
    userId,
    email: normalizedEmail,

    remainingAmount: {
      $gt: 0,
    },
  })
    .sort({
      date: 1,
      createdAt: 1,
    })
    .session(session);

  let totalAvailable = 0;

  for (const income of incomes) {
    const remaining =
      parseNonNegativeWholeNumber(
        income.remainingAmount
      );

    if (remaining === null) {
      const error = new Error(
        `Income ${income._id} contains an invalid remaining amount.`
      );

      error.statusCode = 400;
      error.code = "INVALID_INCOME_AMOUNT";

      throw error;
    }

    totalAvailable += remaining;
  }

  // ==========================================================
  // NO MONEY
  // ==========================================================

  if (totalAvailable <= 0) {
    const error = new Error(
      "No income is available. You cannot create an expense."
    );

    error.statusCode = 400;
    error.code = "NO_INCOME_AVAILABLE";

    throw error;
  }

  // ==========================================================
  // INCOME INSUFFICIENT
  // ==========================================================

  if (totalAvailable < numericAmount) {
    const shortage =
      numericAmount - totalAvailable;

    const error = new Error(
      `Insufficient income. RWF ${shortage.toLocaleString()} is still required.`
    );

    error.statusCode = 400;
    error.code = "INSUFFICIENT_INCOME";

    throw error;
  }

  let remainingToAllocate =
    numericAmount;

  let incomeUsed = 0;

  const incomeAllocations = [];

  // ==========================================================
  // DEDUCT EXACT AMOUNT
  // ==========================================================

  for (const income of incomes) {
    if (remainingToAllocate <= 0) {
      break;
    }

    const available =
      parseNonNegativeWholeNumber(
        income.remainingAmount
      );

    if (available === null || available <= 0) {
      continue;
    }

    const amountFromIncome =
      Math.min(
        available,
        remainingToAllocate
      );

    // ========================================================
    // EXACT DEDUCTION
    // ========================================================

    const newRemaining =
      available - amountFromIncome;

    // Never negative.
    income.remainingAmount =
      Math.max(newRemaining, 0);

    await income.save({
      session,
    });

    incomeAllocations.push({
      incomeId: income._id,
      amount: amountFromIncome,
    });

    incomeUsed += amountFromIncome;

    remainingToAllocate -=
      amountFromIncome;
  }

  // ==========================================================
  // FINAL SAFETY CHECK
  // ==========================================================

  if (remainingToAllocate !== 0) {
    throw new Error(
      "Income allocation failed. No expense was created."
    );
  }

  if (incomeUsed !== numericAmount) {
    throw new Error(
      "Income allocation mismatch. No expense was created."
    );
  }

  return {
    incomeUsed,
    incomeAllocations,

    savingsUsed: 0,
    savingsAllocations: [],
  };
};

// ============================================================
// REVERSE MONEY ALLOCATIONS
// ============================================================

// const reverseMoneyAllocations = async (expense, session) => {
//   // ==========================================================
//   // RESTORE INCOME
//   // ==========================================================

//   for (const allocation of expense.incomeAllocations || []) {
//     if (!allocation.incomeId) {
//       continue;
//     }

//     const income = await Income.findById(allocation.incomeId).session(session);

//     if (!income) {
//       throw new Error(`Income record ${allocation.incomeId} no longer exists.`);
//     }

//     const allocationAmount = Number(allocation.amount || 0);

//     if (allocationAmount <= 0) {
//       continue;
//     }

//     const originalAmount = Number(income.amount || 0);

//     // ========================================================
//     // RESTORE EXACT AMOUNT
//     // ========================================================

//     income.remainingAmount =
//       Number(income.remainingAmount || 0) + allocationAmount;

//     // ========================================================
//     // NEVER EXCEED ORIGINAL
//     // ========================================================

//     if (originalAmount > 0 && income.remainingAmount > originalAmount) {
//       income.remainingAmount = originalAmount;
//     }

//     await income.save({
//       session,
//     });

//     console.log("↩️ Income restored:", {
//       incomeId: income._id,

//       restored: allocationAmount,

//       remaining: income.remainingAmount,

//       original: originalAmount,
//     });
//   }

//   // ==========================================================
//   // RESTORE OLD SAVINGS
//   //
//   // Only for legacy records.
//   // New expenses do not use savings.
//   // ==========================================================

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

//     const allocationAmount = Number(allocation.amount || 0);

//     if (allocationAmount <= 0) {
//       continue;
//     }

//     saving.currentAmount = Number(saving.currentAmount || 0) + allocationAmount;

//     if (saving.currentAmount < 0) {
//       saving.currentAmount = 0;
//     }

//     await saving.save({
//       session,
//     });
//   }
// };

// ============================================================
// REVERSE MONEY ALLOCATIONS
// ============================================================

const reverseMoneyAllocations = async (
  expense,
  session
) => {
  // ==========================================================
  // RESTORE INCOME
  // ==========================================================

  for (
    const allocation of
    expense.incomeAllocations || []
  ) {
    if (!allocation.incomeId) {
      continue;
    }

    const amount =
      parsePositiveWholeNumber(
        allocation.amount
      );

    if (amount === null) {
      throw new Error(
        `Invalid income allocation amount for ${allocation.incomeId}.`
      );
    }

    const income =
      await Income.findById(
        allocation.incomeId
      ).session(session);

    if (!income) {
      throw new Error(
        `Income ${allocation.incomeId} no longer exists.`
      );
    }

    const originalAmount =
      parseNonNegativeWholeNumber(
        income.amount
      );

    const currentRemaining =
      parseNonNegativeWholeNumber(
        income.remainingAmount
      );

    if (
      originalAmount === null ||
      currentRemaining === null
    ) {
      throw new Error(
        `Income ${income._id} contains an invalid amount.`
      );
    }

    // ========================================================
    // RESTORE EXACT AMOUNT
    // ========================================================

    income.remainingAmount =
      Math.min(
        currentRemaining + amount,
        originalAmount
      );

    await income.save({
      session,
    });
  }

  // ==========================================================
  // OLD SAVINGS ALLOCATIONS
  // ==========================================================

  for (
    const allocation of
    expense.savingsAllocations || []
  ) {
    if (!allocation.savingsId) {
      continue;
    }

    const amount =
      parsePositiveWholeNumber(
        allocation.amount
      );

    if (amount === null) {
      continue;
    }

    const saving =
      await Savings.findById(
        allocation.savingsId
      ).session(session);

    if (!saving) {
      throw new Error(
        `Savings ${allocation.savingsId} no longer exists.`
      );
    }

    const current =
      parseNonNegativeWholeNumber(
        saving.currentAmount
      );

    if (current === null) {
      throw new Error(
        `Savings ${saving._id} contains an invalid amount.`
      );
    }

    saving.currentAmount =
      current + amount;

    await saving.save({
      session,
    });
  }
};

// ============================================================
// FIND BUDGET FOR EXPENSE
// ============================================================

const findBudgetForExpense = async ({ userId, category, date, session }) => {
  const expenseDate = new Date(date);

  if (Number.isNaN(expenseDate.getTime())) {
    return null;
  }

  const month = expenseDate.getMonth();

  const year = expenseDate.getFullYear();

  const budget = await Budget.findOne({
    userId,

    category: normalizeCategory(category).toLowerCase(),

    month,

    year,
  }).session(session);

  return budget;
};

// ============================================================
// APPLY EXPENSE TO BUDGET
// ============================================================

// const applyBudgetAmount = async ({ budget, amount, session }) => {
//   if (!budget) {
//     return 0;
//   }

//   const numericAmount = Number(amount);

//   if (
//     !Number.isFinite(numericAmount) ||
//     !Number.isInteger(numericAmount) ||
//     numericAmount <= 0
//   ) {
//     return 0;
//   }

//   budget.spentAmount = Number(budget.spentAmount || 0) + numericAmount;

//   // ==========================================================
//   // USE MODEL METHOD
//   // ==========================================================

//   if (typeof budget.addExpense === "function") {
//     budget.addExpense(numericAmount);
//   } else if (typeof budget.calculateValues === "function") {
//     budget.calculateValues();
//   }

//   // ==========================================================
//   // FALLBACK
//   // ==========================================================
//   else {
//     budget.remainingAmount =
//       Number(budget.allocatedAmount || 0) - Number(budget.spentAmount || 0);

//     const allocated = Number(budget.allocatedAmount || 0);

//     budget.percentageUsed =
//       allocated > 0
//         ? Number(
//             ((Number(budget.spentAmount || 0) / allocated) * 100).toFixed(2),
//           )
//         : 0;

//     if (Number(budget.spentAmount || 0) > allocated) {
//       budget.status = "over-budget";
//     } else if (
//       allocated > 0 &&
//       Number(budget.spentAmount || 0) >= allocated * 0.8
//     ) {
//       budget.status = "approaching-limit";
//     } else {
//       budget.status = "on-track";
//     }
//   }

//   await budget.save({
//     session,
//   });

//   return numericAmount;
// };

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

  const numericAmount = parsePositiveWholeNumber(amount);

  if (numericAmount === null) {
    throw new Error(
      "Budget expense amount must be a positive whole number."
    );
  }

  const currentSpent = parseNonNegativeWholeNumber(
    budget.spentAmount
  );

  const allocatedAmount = parseNonNegativeWholeNumber(
    budget.allocatedAmount
  );

  if (currentSpent === null) {
    throw new Error(
      "Budget spentAmount contains an invalid value."
    );
  }

  if (allocatedAmount === null) {
    throw new Error(
      "Budget allocatedAmount contains an invalid value."
    );
  }

  // IMPORTANT:
  // ADD THE EXPENSE EXACTLY ONCE.
  budget.spentAmount =
    currentSpent + numericAmount;

  // NEVER use budget.addExpense() here.
  // NEVER add numericAmount anywhere else.

  budget.remainingAmount =
    allocatedAmount - budget.spentAmount;

  budget.percentageUsed =
    allocatedAmount > 0
      ? Number(
          (
            (budget.spentAmount /
              allocatedAmount) *
            100
          ).toFixed(2)
        )
      : 0;

  if (budget.spentAmount > allocatedAmount) {
    budget.status = "over-budget";
  } else if (
    allocatedAmount > 0 &&
    budget.spentAmount >=
      allocatedAmount * 0.8
  ) {
    budget.status = "approaching-limit";
  } else {
    budget.status = "on-track";
  }

  await budget.save({
    session,
  });

  return numericAmount;
};

// ============================================================
// REMOVE EXPENSE FROM BUDGET
// ============================================================

// const reverseBudgetAmount = async ({ budgetId, amount, session }) => {
//   if (!budgetId) {
//     return;
//   }

//   const numericAmount = Number(amount);

//   if (
//     !Number.isFinite(numericAmount) ||
//     !Number.isInteger(numericAmount) ||
//     numericAmount <= 0
//   ) {
//     return;
//   }

//   const budget = await Budget.findById(budgetId).session(session);

//   if (!budget) {
//     throw new Error(`Budget ${budgetId} no longer exists.`);
//   }

//   budget.spentAmount = Math.max(
//     Number(budget.spentAmount || 0) - numericAmount,
//     0,
//   );

//   // ==========================================================
//   // RECALCULATE
//   // ==========================================================

//   if (typeof budget.calculateValues === "function") {
//     budget.calculateValues();
//   } else {
//     budget.remainingAmount =
//       Number(budget.allocatedAmount || 0) - Number(budget.spentAmount || 0);

//     const allocated = Number(budget.allocatedAmount || 0);

//     budget.percentageUsed =
//       allocated > 0
//         ? Number(
//             ((Number(budget.spentAmount || 0) / allocated) * 100).toFixed(2),
//           )
//         : 0;

//     if (Number(budget.spentAmount || 0) > allocated) {
//       budget.status = "over-budget";
//     } else if (
//       allocated > 0 &&
//       Number(budget.spentAmount || 0) >= allocated * 0.8
//     ) {
//       budget.status = "approaching-limit";
//     } else {
//       budget.status = "on-track";
//     }
//   }

//   await budget.save({
//     session,
//   });
// };

// ============================================================
// REVERSE BUDGET AMOUNT
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
    parsePositiveWholeNumber(amount);

  if (numericAmount === null) {
    throw new Error(
      "Budget restoration amount must be a positive whole number."
    );
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

  const spent =
    parseNonNegativeWholeNumber(
      budget.spentAmount
    );

  const allocated =
    parseNonNegativeWholeNumber(
      budget.allocatedAmount
    );

  if (
    spent === null ||
    allocated === null
  ) {
    throw new Error(
      "Budget contains an invalid amount."
    );
  }

  // SUBTRACT EXACTLY ONCE.
  budget.spentAmount =
    Math.max(
      spent - numericAmount,
      0
    );

  budget.remainingAmount =
    allocated -
    budget.spentAmount;

  budget.percentageUsed =
    allocated > 0
      ? Number(
          (
            (budget.spentAmount /
              allocated) *
            100
          ).toFixed(2)
        )
      : 0;

  if (
    budget.spentAmount >
    allocated
  ) {
    budget.status =
      "over-budget";
  } else if (
    allocated > 0 &&
    budget.spentAmount >=
      allocated * 0.8
  ) {
    budget.status =
      "approaching-limit";
  } else {
    budget.status =
      "on-track";
  }

  await budget.save({
    session,
  });
};

// ============================================================
// CHECK BUDGET
// ============================================================

const checkBudgetExpense = (budget, amount) => {
  if (!budget) {
    return {
      exceeds: false,
      exceededBy: 0,
      remainingBefore: null,
      remainingAfter: null,
      allocatedAmount: 0,
      spentAmount: 0,
    };
  }

  const numericAmount = Number(amount) || 0;

  const allocatedAmount = Number(budget.allocatedAmount || 0);

  const spentAmount = Number(budget.spentAmount || 0);

  const remainingBefore = allocatedAmount - spentAmount;

  const remainingAfter = remainingBefore - numericAmount;

  const exceeds = remainingAfter < 0;

  const exceededBy = exceeds ? Math.abs(remainingAfter) : 0;

  return {
    exceeds,

    exceededBy,

    remainingBefore,

    remainingAfter,

    allocatedAmount,

    spentAmount,

    expenseAmount: numericAmount,
  };
};

// ============================================================
// UPDATE EXPENSE
// ============================================================

exports.updateExpense = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense id",
      });
    }

    const {
      description,
      category,
      type,
      amount,
      date,
      user,
      email,
      userId,
      confirmBudgetExceeded,
    } = req.body;

    // ========================================================
    // FIND EXISTING EXPENSE
    // ========================================================

    const existingExpense = await Expense.findById(id);

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // ========================================================
    // FINAL VALUES
    // ========================================================

    const finalDescription =
      description !== undefined
        ? String(description).trim()
        : String(existingExpense.description || "").trim();

    const finalCategory =
      category !== undefined
        ? normalizeCategory(category)
        : normalizeCategory(existingExpense.category);

    const finalType =
      type !== undefined
        ? normalizeExpenseType(type)
        : normalizeExpenseType(existingExpense.type);

    const finalAmount =
      amount !== undefined
        ? parsePositiveWholeNumber(amount)
        : parsePositiveWholeNumber(existingExpense.amount);

    const finalDate =
      date !== undefined ? new Date(date) : new Date(existingExpense.date);

    const finalUser =
      user !== undefined
        ? String(user).trim()
        : String(existingExpense.user || "").trim();

    const finalEmail =
      email !== undefined
        ? normalizeEmail(email)
        : normalizeEmail(existingExpense.email);

    const finalUserId = userId !== undefined ? userId : existingExpense.userId;

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!finalDescription) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    if (!finalCategory) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!finalUser) {
      return res.status(400).json({
        success: false,
        message: "User is required",
      });
    }

    if (!finalEmail) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    if (!finalUserId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!isValidObjectId(finalUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    if (finalAmount === null) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive whole number",
      });
    }

    if (Number.isNaN(finalDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense date",
      });
    }

    if (!isValidExpenseCategory(finalCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense category",
      });
    }

    if (finalType !== "expense") {
      return res.status(400).json({
        success: false,
        message: "This endpoint can only update expense records",
      });
    }

    const budgetExceededConfirmed =
      confirmBudgetExceeded === true || confirmBudgetExceeded === "true";

    let updatedExpense = null;

    let matchedBudget = null;

    let budgetCheck = null;

    let allocation = null;

    // ========================================================
    // TRANSACTION
    // ========================================================

    await session.withTransaction(async () => {
      // ====================================================
      // RELOAD EXPENSE
      // ====================================================

      const expense = await Expense.findById(id).session(session);

      if (!expense) {
        const error = new Error("Expense not found");

        error.statusCode = 404;

        throw error;
      }

      // ====================================================
      // RESTORE OLD INCOME
      // ====================================================

      await reverseMoneyAllocations(expense, session);

      // ====================================================
      // RESTORE OLD BUDGET
      // ====================================================

      if (expense.budgetId && Number(expense.budgetAmountUsed || 0) > 0) {
        await reverseBudgetAmount({
          budgetId: expense.budgetId,

          amount: expense.budgetAmountUsed,

          session,
        });
      }

      // ====================================================
      // FIND NEW BUDGET
      // ====================================================

      matchedBudget = await findBudgetForExpense({
        userId: finalUserId,

        category: finalCategory,

        date: finalDate,

        session,
      });

      // ====================================================
      // CHECK BUDGET
      // ====================================================

      if (matchedBudget) {
        budgetCheck = checkBudgetExpense(matchedBudget, finalAmount);

        if (budgetCheck.exceeds && !budgetExceededConfirmed) {
          const error = new Error(
            "Expense exceeds the remaining budget. Confirmation is required.",
          );

          error.statusCode = 409;

          error.code = "BUDGET_EXCEEDED";

          error.budgetCheck = budgetCheck;

          throw error;
        }
      }

      // ====================================================
      // ALLOCATE NEW AMOUNT
      // ====================================================

      allocation = await allocateIncomeOnly({
        amount: finalAmount,

        userId: finalUserId,

        email: finalEmail,

        session,
      });

      // ====================================================
      // UPDATE EXPENSE
      // ====================================================

      expense.description = finalDescription;

      expense.category = finalCategory;

      expense.type = "expense";

      expense.amount = finalAmount;

      expense.date = finalDate;

      expense.user = finalUser;

      expense.userId = finalUserId;

      expense.email = finalEmail;

      // ====================================================
      // INCOME
      // ====================================================

      expense.incomeUsed = allocation.incomeUsed;

      expense.incomeAllocations = allocation.incomeAllocations;

      // ====================================================
      // SAVINGS ALWAYS ZERO
      // ====================================================

      expense.savingsUsed = 0;

      expense.savingsAllocations = [];

      // ====================================================
      // BUDGET
      // ====================================================

      expense.budgetId = matchedBudget ? matchedBudget._id : null;

      expense.budgetAmountUsed = matchedBudget ? finalAmount : 0;

      await expense.save({
        session,
      });

      // ====================================================
      // APPLY NEW BUDGET
      // ====================================================

      if (matchedBudget) {
        await applyBudgetAmount({
          budget: matchedBudget,

          amount: finalAmount,

          session,
        });
      }

      updatedExpense = expense;
    });

    // ========================================================
    // NOTIFICATIONS
    // ========================================================

    let notification = null;

    try {
      notification = await createNotificationSafely({
        userEmail: finalEmail,

        userId: finalUserId,

        title: "✏️ Expense Updated",

        message:
          `Expense of RWF ` +
          `${finalAmount.toLocaleString()} ` +
          `for ${finalCategory} ` +
          `was updated.`,

        type: "expense",

        severity:
          matchedBudget && budgetCheck && budgetCheck.exceeds
            ? "high"
            : "medium",

        relatedId: updatedExpense._id,

        relatedType: "expense",

        actionLink: `/expenses/${updatedExpense._id}`,

        metadata: {
          expenseId: updatedExpense._id,

          amount: finalAmount,

          category: finalCategory,

          incomeUsed: updatedExpense.incomeUsed,

          incomeAllocations: updatedExpense.incomeAllocations,

          savingsUsed: 0,

          savingsAllocations: [],

          budgetId: updatedExpense.budgetId,

          budgetAmountUsed: updatedExpense.budgetAmountUsed,

          budgetExceeded:
            matchedBudget && budgetCheck ? budgetCheck.exceeds : false,

          budgetExceededBy:
            matchedBudget && budgetCheck ? budgetCheck.exceededBy : 0,

          budgetExceededConfirmed: budgetExceededConfirmed,
        },
      });

      // ======================================================
      // INCOME ALERTS
      // ======================================================

      if (
        allocation &&
        Array.isArray(allocation.incomeAlerts) &&
        allocation.incomeAlerts.length > 0
      ) {
        await createIncomeBalanceAlerts({
          userId: finalUserId,

          email: finalEmail,

          incomeAlerts: allocation.incomeAlerts,
        });
      }
    } catch (error) {
      console.error("⚠️ Expense update notification failed:", error);
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message:
        matchedBudget && budgetCheck && budgetCheck.exceeds
          ? "Expense updated successfully. Budget was exceeded."
          : "Expense updated successfully",

      data: updatedExpense,

      budget: matchedBudget
        ? {
            _id: matchedBudget._id,

            category: matchedBudget.category,

            month: matchedBudget.month,

            year: matchedBudget.year,

            allocatedAmount: matchedBudget.allocatedAmount,

            spentAmount: matchedBudget.spentAmount,

            remainingAmount: matchedBudget.remainingAmount,

            percentageUsed: matchedBudget.percentageUsed,

            status: matchedBudget.status,

            exceeded: budgetCheck ? budgetCheck.exceeds : false,

            exceededBy: budgetCheck ? budgetCheck.exceededBy : 0,

            confirmed: budgetExceededConfirmed,
          }
        : null,

      funding: {
        source: "income",

        incomeUsed: updatedExpense.incomeUsed,

        incomeAllocations: updatedExpense.incomeAllocations,

        savingsUsed: 0,

        savingsAllocations: [],
      },

      income: {
        totalIncomeBefore: allocation ? allocation.totalIncomeBefore : null,

        totalIncomeAfter: allocation ? allocation.totalIncomeAfter : null,

        alerts: allocation ? allocation.incomeAlerts : [],
      },

      notification,
    });
  } catch (error) {
    // ========================================================
    // BUDGET EXCEEDED
    // ========================================================

    if (error.code === "BUDGET_EXCEEDED") {
      return res.status(409).json({
        success: false,

        code: "BUDGET_EXCEEDED",

        message:
          "This expense exceeds the remaining budget. Do you want to proceed?",

        requiresConfirmation: true,

        budget: error.budgetCheck,

        expenseUpdated: false,

        incomeDeducted: false,

        budgetUpdated: false,
      });
    }

    // ========================================================
    // NO INCOME
    // ========================================================

    if (error.code === "NO_INCOME_AVAILABLE") {
      return res.status(400).json({
        success: false,

        code: "NO_INCOME_AVAILABLE",

        message:
          "You cannot update this expense because there is no income remaining.",

        expenseUpdated: false,

        incomeDeducted: false,

        budgetUpdated: false,

        availableIncome: 0,
      });
    }

    // ========================================================
    // INSUFFICIENT INCOME
    // ========================================================

    if (error.code === "INSUFFICIENT_INCOME") {
      return res.status(400).json({
        success: false,

        code: "INSUFFICIENT_INCOME",

        message: error.message,

        expenseUpdated: false,

        incomeDeducted: false,

        budgetUpdated: false,

        requiredAmount: error.requiredAmount || 0,

        availableIncome: error.totalAvailable || 0,

        shortage: error.shortage || 0,
      });
    }

    console.error("❌ Update expense error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,

      message: error.message || "Failed to update expense",
    });
  } finally {
    await session.endSession();
  }
};

// ============================================================
// DELETE EXPENSE
// ============================================================

exports.deleteExpense = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense id",
      });
    }

    let deletedExpense = null;

    await session.withTransaction(async () => {
      // ====================================================
      // FIND EXPENSE
      // ====================================================

      const expense = await Expense.findById(id).session(session);

      if (!expense) {
        const error = new Error("Expense not found");

        error.statusCode = 404;

        throw error;
      }

      // ====================================================
      // RESTORE MONEY
      // ====================================================

      await reverseMoneyAllocations(expense, session);

      // ====================================================
      // RESTORE BUDGET
      // ====================================================

      if (expense.budgetId && Number(expense.budgetAmountUsed || 0) > 0) {
        await reverseBudgetAmount({
          budgetId: expense.budgetId,

          amount: expense.budgetAmountUsed,

          session,
        });
      }

      // ====================================================
      // COPY
      // ====================================================

      deletedExpense = expense.toObject();

      // ====================================================
      // DELETE
      // ====================================================

      await Expense.deleteOne({
        _id: expense._id,
      }).session(session);
    });

    // ========================================================
    // NOTIFICATION
    // ========================================================

    let notification = null;

    try {
      notification = await createNotificationSafely({
        userEmail: normalizeEmail(deletedExpense.email),

        userId: deletedExpense.userId,

        title: "🗑️ Expense Deleted",

        message:
          `Expense of RWF ` +
          `${Number(deletedExpense.amount || 0).toLocaleString()} ` +
          `for ${deletedExpense.category} ` +
          `was deleted.`,

        type: "expense",

        severity: "medium",

        relatedId: deletedExpense._id,

        relatedType: "expense",

        actionLink: "/expenses",

        metadata: {
          expenseId: deletedExpense._id,

          amount: deletedExpense.amount,

          category: deletedExpense.category,

          incomeRestored: Number(deletedExpense.incomeUsed || 0),

          budgetRestored: Number(deletedExpense.budgetAmountUsed || 0),
        },
      });
    } catch (error) {
      console.error("⚠️ Expense delete notification failed:", error);
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message: "Expense deleted successfully",

      data: deletedExpense,

      restored: {
        income: Number(deletedExpense.incomeUsed || 0),

        savings: Number(deletedExpense.savingsUsed || 0),

        budget: Number(deletedExpense.budgetAmountUsed || 0),
      },

      notification,
    });
  } catch (error) {
    console.error("❌ Delete expense error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,

      message: error.message || "Failed to delete expense",
    });
  } finally {
    await session.endSession();
  }
};

// ============================================================
// BULK DELETE EXPENSES
// ============================================================

exports.bulkDeleteExpenses = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const ids = Array.isArray(req.body.ids)
      ? req.body.ids
      : Array.isArray(req.body.expenseIds)
        ? req.body.expenseIds
        : [];

    // ========================================================
    // VALIDATE IDS
    // ========================================================

    if (!ids.length) {
      return res.status(400).json({
        success: false,
        message: "Expense ids are required",
      });
    }

    const uniqueIds = [...new Set(ids.map((id) => String(id)))];

    const invalidIds = uniqueIds.filter((id) => !isValidObjectId(id));

    if (invalidIds.length) {
      return res.status(400).json({
        success: false,

        message: "One or more expense ids are invalid",

        invalidIds,
      });
    }

    let deletedExpenses = [];

    let totalIncomeRestored = 0;

    let totalSavingsRestored = 0;

    let totalBudgetRestored = 0;

    // ========================================================
    // TRANSACTION
    // ========================================================

    await session.withTransaction(async () => {
      const expenses = await Expense.find({
        _id: {
          $in: uniqueIds,
        },
      }).session(session);

      if (!expenses.length) {
        const error = new Error("No expenses found");

        error.statusCode = 404;

        throw error;
      }

      // ====================================================
      // PROCESS EACH
      // ====================================================

      for (const expense of expenses) {
        // --------------------------------------------------
        // RESTORE MONEY
        // --------------------------------------------------

        await reverseMoneyAllocations(expense, session);

        // --------------------------------------------------
        // RESTORE BUDGET
        // --------------------------------------------------

        if (expense.budgetId && Number(expense.budgetAmountUsed || 0) > 0) {
          await reverseBudgetAmount({
            budgetId: expense.budgetId,

            amount: expense.budgetAmountUsed,

            session,
          });
        }

        // --------------------------------------------------
        // TOTALS
        // --------------------------------------------------

        totalIncomeRestored += Number(expense.incomeUsed || 0);

        totalSavingsRestored += Number(expense.savingsUsed || 0);

        totalBudgetRestored += Number(expense.budgetAmountUsed || 0);

        // --------------------------------------------------
        // COPY
        // --------------------------------------------------

        deletedExpenses.push(expense.toObject());

        // --------------------------------------------------
        // DELETE
        // --------------------------------------------------

        await Expense.deleteOne({
          _id: expense._id,
        }).session(session);
      }

      // ====================================================
      // IDS NOT FOUND
      // ====================================================

      const foundIds = expenses.map((expense) => String(expense._id));

      const notFoundIds = uniqueIds.filter((id) => !foundIds.includes(id));

      if (notFoundIds.length) {
        console.warn("⚠️ Some expense ids were not found:", notFoundIds);
      }
    });

    // ========================================================
    // NOTIFICATION
    // ========================================================

    const notification = deletedExpenses.length
      ? await createNotificationSafely({
          userEmail: normalizeEmail(deletedExpenses[0].email),

          userId: deletedExpenses[0].userId,

          title: "🗑️ Expenses Deleted",

          message:
            `${deletedExpenses.length} ` +
            `expense${
              deletedExpenses.length === 1 ? "" : "s"
            } deleted successfully.`,

          type: "expense",

          severity: "medium",

          relatedType: "expense",

          actionLink: "/expenses",

          metadata: {
            count: deletedExpenses.length,

            expenseIds: deletedExpenses.map((expense) => expense._id),

            totalIncomeRestored,

            totalSavingsRestored,

            totalBudgetRestored,
          },
        })
      : null;

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message: `${deletedExpenses.length} expense${
        deletedExpenses.length === 1 ? "" : "s"
      } deleted successfully`,

      count: deletedExpenses.length,

      data: deletedExpenses,

      restored: {
        income: totalIncomeRestored,

        savings: totalSavingsRestored,

        budget: totalBudgetRestored,
      },

      notification,
    });
  } catch (error) {
    console.error("❌ Bulk delete expenses error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,

      message: error.message || "Failed to bulk delete expenses",
    });
  } finally {
    await session.endSession();
  }
};

// ============================================================
// CREATE EXPENSE
// ============================================================

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
      confirmBudgetExceeded,
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
        message: "All expense fields are required",
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

    const numericAmount = parsePositiveWholeNumber(amount);

    if (numericAmount === null) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive whole number",
      });
    }

    // ========================================================
    // DATE
    // ========================================================

    const expenseDate = new Date(date);

    if (Number.isNaN(expenseDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense date",
      });
    }

    // ========================================================
    // EMAIL
    // ========================================================

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    // ========================================================
    // CATEGORY
    // ========================================================

    const normalizedCategory = normalizeCategory(category);

    if (!isValidExpenseCategory(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense category",
      });
    }

    // ========================================================
    // TYPE
    // ========================================================

    const expenseType = normalizeExpenseType(type);

    if (expenseType !== "expense") {
      return res.status(400).json({
        success: false,
        message: "This endpoint can only create expense records",
      });
    }

    // ========================================================
    // CONFIRMATION
    // ========================================================

    const budgetExceededConfirmed =
      confirmBudgetExceeded === true || confirmBudgetExceeded === "true";

    // ========================================================
    // MONTH / YEAR
    // ========================================================

    const expenseMonth = expenseDate.getMonth();

    const expenseYear = expenseDate.getFullYear();

    // ========================================================
    // VARIABLES
    // ========================================================

    let expense = null;

    let matchedBudget = null;

    let budgetCheck = null;

    let notification = null;

    let allocation = null;

    // ========================================================
    // TRANSACTION
    // ========================================================

    await session.withTransaction(async () => {
      // ====================================================
      // FIND BUDGET
      // ====================================================

      matchedBudget = await Budget.findOne({
        userId,

        category: normalizedCategory.toLowerCase(),

        month: expenseMonth,

        year: expenseYear,
      }).session(session);

      // ====================================================
      // CHECK BUDGET
      // ====================================================

      if (matchedBudget) {
        budgetCheck = checkBudgetExpense(matchedBudget, numericAmount);

        if (budgetCheck.exceeds && !budgetExceededConfirmed) {
          const error = new Error(
            "Expense exceeds the remaining budget. Confirmation is required.",
          );

          error.statusCode = 409;

          error.code = "BUDGET_EXCEEDED";

          error.budgetCheck = budgetCheck;

          throw error;
        }
      }

      // ====================================================
      // ALLOCATE INCOME ONLY
      // ====================================================

      allocation = await allocateIncomeOnly({
        amount: numericAmount,

        userId,

        email: normalizedEmail,

        session,
      });

      // ====================================================
      // BUDGET AMOUNT
      // ====================================================

      const budgetAmountUsed = matchedBudget ? numericAmount : 0;

      // ====================================================
      // CREATE EXPENSE
      // ====================================================

      const createdExpenses = await Expense.create(
        [
          {
            description: String(description).trim(),

            category: normalizedCategory,

            type: "expense",

            amount: numericAmount,

            date: expenseDate,

            user: String(user).trim(),

            userId,

            email: normalizedEmail,

            // --------------------------------------
            // INCOME
            // --------------------------------------

            incomeUsed: allocation.incomeUsed,

            incomeAllocations: allocation.incomeAllocations,

            // --------------------------------------
            // SAVINGS
            // --------------------------------------

            savingsUsed: 0,

            savingsAllocations: [],

            // --------------------------------------
            // BUDGET
            // --------------------------------------

            budgetId: matchedBudget ? matchedBudget._id : null,

            budgetAmountUsed: budgetAmountUsed,
          },
        ],
        {
          session,
        },
      );

      expense = createdExpenses[0];

      // ====================================================
      // UPDATE BUDGET
      // ====================================================

      if (matchedBudget) {
        await applyBudgetAmount({
          budget: matchedBudget,

          amount: numericAmount,

          session,
        });

        console.log("✅ BUDGET UPDATED AFTER EXPENSE");

        console.log({
          budgetId: matchedBudget._id,

          category: matchedBudget.category,

          allocated: matchedBudget.allocatedAmount,

          spent: matchedBudget.spentAmount,

          remaining: matchedBudget.remainingAmount,

          percentage: matchedBudget.percentageUsed,

          status: matchedBudget.status,

          expenseAmount: numericAmount,

          exceeded: budgetCheck ? budgetCheck.exceeds : false,

          exceededBy: budgetCheck ? budgetCheck.exceededBy : 0,
        });
      } else {
        console.log("ℹ️ NO MATCHING BUDGET - EXPENSE CONTINUES USING INCOME");

        console.log({
          userId,

          category: normalizedCategory,

          month: expenseMonth,

          year: expenseYear,

          amount: numericAmount,
        });
      }
    });

    // ========================================================
    // NOTIFICATIONS
    // ========================================================

    try {
      // ======================================================
      // EXPENSE NOTIFICATION
      // ======================================================

      notification = await createNotificationSafely({
        userEmail: normalizedEmail,

        userId,

        title: "💸 Expense Added",

        message:
          `Expense of RWF ` +
          `${numericAmount.toLocaleString()} ` +
          `for ${normalizedCategory} ` +
          `was added.`,

        type: "expense",

        severity:
          matchedBudget && budgetCheck && budgetCheck.exceeds
            ? "high"
            : "medium",

        relatedId: expense._id,

        relatedType: "expense",

        actionLink: `/expenses/${expense._id}`,

        metadata: {
          expenseId: expense._id,

          amount: numericAmount,

          category: normalizedCategory,

          // ------------------------------------------
          // FUNDING
          // ------------------------------------------

          incomeUsed: expense.incomeUsed,

          incomeAllocations: expense.incomeAllocations,

          savingsUsed: 0,

          savingsAllocations: [],

          // ------------------------------------------
          // BUDGET
          // ------------------------------------------

          budgetId: expense.budgetId,

          budgetAmountUsed: expense.budgetAmountUsed,

          budgetAllocated: matchedBudget ? matchedBudget.allocatedAmount : 0,

          budgetSpent: matchedBudget ? matchedBudget.spentAmount : 0,

          budgetRemaining: matchedBudget ? matchedBudget.remainingAmount : 0,

          budgetPercentage: matchedBudget ? matchedBudget.percentageUsed : 0,

          budgetStatus: matchedBudget ? matchedBudget.status : null,

          budgetExceeded:
            matchedBudget && budgetCheck ? budgetCheck.exceeds : false,

          budgetExceededBy:
            matchedBudget && budgetCheck ? budgetCheck.exceededBy : 0,

          budgetExceededConfirmed: budgetExceededConfirmed,
        },
      });

      // ======================================================
      // INCOME BALANCE ALERTS
      // ======================================================

      if (
        allocation &&
        Array.isArray(allocation.incomeAlerts) &&
        allocation.incomeAlerts.length > 0
      ) {
        await createIncomeBalanceAlerts({
          userId,

          email: normalizedEmail,

          incomeAlerts: allocation.incomeAlerts,
        });
      }
    } catch (notificationError) {
      console.error("⚠️ Expense notification failed:", notificationError);
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,

      message:
        matchedBudget && budgetCheck && budgetCheck.exceeds
          ? "Expense created successfully. Budget was exceeded."
          : "Expense created successfully",

      data: expense,

      budget: matchedBudget
        ? {
            _id: matchedBudget._id,

            category: matchedBudget.category,

            month: matchedBudget.month,

            year: matchedBudget.year,

            allocatedAmount: matchedBudget.allocatedAmount,

            spentAmount: matchedBudget.spentAmount,

            remainingAmount: matchedBudget.remainingAmount,

            percentageUsed: matchedBudget.percentageUsed,

            status: matchedBudget.status,

            exceeded: budgetCheck ? budgetCheck.exceeds : false,

            exceededBy: budgetCheck ? budgetCheck.exceededBy : 0,

            confirmed: budgetExceededConfirmed,
          }
        : null,

      // ======================================================
      // FUNDING
      // ======================================================

      funding: {
        source: "income",

        incomeUsed: expense.incomeUsed,

        incomeAllocations: expense.incomeAllocations,

        savingsUsed: 0,

        savingsAllocations: [],
      },

      // ======================================================
      // INCOME BALANCE
      // ======================================================

      income: {
        totalIncomeBefore: allocation ? allocation.totalIncomeBefore : null,

        totalIncomeAfter: allocation ? allocation.totalIncomeAfter : null,

        alerts: allocation ? allocation.incomeAlerts : [],
      },

      notification,
    });
  } catch (error) {
    // ========================================================
    // BUDGET EXCEEDED
    // ========================================================

    if (error.code === "BUDGET_EXCEEDED") {
      return res.status(409).json({
        success: false,

        code: "BUDGET_EXCEEDED",

        message:
          "This expense exceeds the remaining budget. Do you want to proceed?",

        requiresConfirmation: true,

        budget: error.budgetCheck,

        expenseCreated: false,

        incomeDeducted: false,

        budgetUpdated: false,
      });
    }

    // ========================================================
    // NO INCOME AVAILABLE
    // ========================================================

    if (error.code === "NO_INCOME_AVAILABLE") {
      return res.status(400).json({
        success: false,

        code: "NO_INCOME_AVAILABLE",

        message:
          "You cannot create an expense because there is no income remaining.",

        expenseCreated: false,

        incomeDeducted: false,

        budgetUpdated: false,

        availableIncome: 0,

        requiredAmount: error.requiredAmount || numericAmount,
      });
    }

    // ========================================================
    // INSUFFICIENT INCOME
    // ========================================================

    if (error.code === "INSUFFICIENT_INCOME") {
      return res.status(400).json({
        success: false,

        code: "INSUFFICIENT_INCOME",

        message: error.message,

        expenseCreated: false,

        incomeDeducted: false,

        budgetUpdated: false,

        requiredAmount: error.requiredAmount || numericAmount,

        availableIncome: error.totalAvailable || 0,

        shortage: error.shortage || 0,
      });
    }

    // ========================================================
    // NORMAL ERROR
    // ========================================================

    console.error("❌ Create expense error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,

      message: error.message || "Failed to create expense",
    });
  } finally {
    await session.endSession();
  }
};
