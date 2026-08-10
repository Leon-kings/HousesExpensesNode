const Expense = require("../models/Expense");
const mongoose = require("mongoose");
const Income = require("../models/Income");
const Savings = require("../models/Savings");
const createNotification = require("../utils/createNotification");
const Budget = require("../models/Budget");

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

// Make sure createNotification is imported

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

// ============================================================
// CREATE EXPENSE
// ============================================================
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
//     // 1. VALIDATION
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

//     // ============================================================
//     // 2. NORMALIZE DATA
//     // ============================================================
//     const normalizedEmail = email.toLowerCase().trim();
//     const normalizedCategory = category.toLowerCase().trim();

//     // ============================================================
//     // 3. VALIDATE USER ID
//     // ============================================================
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     // ============================================================
//     // 4. VALIDATE DATE
//     // ============================================================
//     const expenseDate = new Date(date);

//     if (isNaN(expenseDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense date",
//       });
//     }

//     // JavaScript months:
//     // January = 0
//     // February = 1
//     // ...
//     // August = 7
//     // December = 11

//     const budgetMonth = expenseDate.getMonth();
//     const budgetYear = expenseDate.getFullYear();

//     // ============================================================
//     // 5. START TRANSACTION
//     // ============================================================
//     session.startTransaction();

//     // ============================================================
//     // 6. FIND INCOME
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
//     // 7. USE INCOME FIRST
//     // ============================================================
//     if (incomeBalance > 0) {
//       incomeUsed = Math.min(
//         incomeBalance,
//         remainingExpense
//       );

//       income.balance = incomeBalance - incomeUsed;

//       await income.save({
//         session,
//       });

//       remainingExpense -= incomeUsed;
//     }

//     // ============================================================
//     // 8. USE SAVINGS AFTER INCOME REACHES ZERO
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
//           remainingExpense
//         );

//         saving.currentAmount =
//           availableSavings - amountFromSaving;

//         if (saving.currentAmount < 0) {
//           saving.currentAmount = 0;
//         }

//         await saving.save({
//           session,
//         });

//         savingsUsed += amountFromSaving;

//         remainingExpense -= amountFromSaving;
//       }
//     }

//     // ============================================================
//     // 9. CHECK AVAILABLE MONEY
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
//     // 10. CREATE EXPENSE
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
//       {
//         session,
//       }
//     );

//     // ============================================================
//     // 11. FIND MATCHING BUDGET
//     //
//     // IMPORTANT:
//     // Your current Budget model has NO userId.
//     //
//     // Therefore we match using:
//     //
//     // category
//     // month
//     // year
//     // email
//     //
//     // The email makes sure one user's budget
//     // is not accidentally updated.
//     // ============================================================
//     const budget = await Budget.findOne({
//       email: normalizedEmail,
//       category: normalizedCategory,
//       month: budgetMonth,
//       year: budgetYear,
//     }).session(session);

//     let budgetUpdated = false;

//     // ============================================================
//     // 12. UPDATE BUDGET
//     // ============================================================
//     if (budget) {
//       // Add expense to spent amount
//       budget.spentAmount =
//         Number(budget.spentAmount || 0) +
//         expenseAmount;

//       /*
//        * IMPORTANT:
//        *
//        * budget.save() triggers your
//        * BudgetSchema.pre("save") middleware.
//        *
//        * That middleware automatically updates:
//        *
//        * remainingAmount
//        * percentageUsed
//        * status
//        */
//       await budget.save({
//         session,
//       });

//       budgetUpdated = true;
//     }

//     // ============================================================
//     // 13. CREATE NOTIFICATION
//     // ============================================================
//     const [notification] = await Notification.create(
//       [
//         {
//           userEmail: normalizedEmail,

//           userId,

//           title: "💸 Expense Recorded",

//           message: `You spent ${expenseAmount} on ${normalizedCategory}`,

//           type: "info",

//           severity: "low",

//           relatedId: expense._id,

//           relatedModel: "Expense",
//         },
//       ],
//       {
//         session,
//       }
//     );

//     // ============================================================
//     // 14. COMMIT TRANSACTION
//     // ============================================================
//     await session.commitTransaction();

//     // ============================================================
//     // 15. RESPONSE
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
//         income.balance,

//       budgetUpdated,

//       budget: budgetUpdated
//         ? {
//             id: budget._id,

//             category: budget.category,

//             month: budget.month,

//             year: budget.year,

//             allocatedAmount:
//               budget.allocatedAmount,

//             spentAmount:
//               budget.spentAmount,

//             remainingAmount:
//               budget.remainingAmount,

//             percentageUsed:
//               budget.percentageUsed,

//             status: budget.status,
//           }
//         : null,

//       notification: {
//         id: notification._id,

//         title: notification.title,

//         message: notification.message,

//         type: notification.type,

//         severity: notification.severity,

//         relatedId: notification.relatedId,

//         relatedModel: notification.relatedModel,
//       },
//     });
//   } catch (error) {
//     // ============================================================
//     // ROLLBACK TRANSACTION
//     // ============================================================
//     try {
//       await session.abortTransaction();
//     } catch (abortError) {
//       console.error(
//         "❌ Transaction abort error:",
//         abortError
//       );
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
//     // ============================================================
//     // END SESSION
//     // ============================================================
//     await session.endSession();
//   }
// };

// exports.createExpense = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const { description, category, type, amount, date, user, email, userId } =
//       req.body;

//     // ========================================================
//     // 1. VALIDATION
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
//         message: "Required fields are missing",
//       });
//     }

//     // ========================================================
//     // 2. VALIDATE USER ID
//     // ========================================================

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     // ========================================================
//     // 3. VALIDATE AMOUNT
//     // ========================================================

//     const expenseAmount = Number(amount);

//     if (!Number.isFinite(expenseAmount) || expenseAmount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Expense amount must be greater than 0",
//       });
//     }

//     // ========================================================
//     // 4. NORMALIZE DATA
//     // ========================================================

//     const normalizedEmail = String(email).trim().toLowerCase();

//     const normalizedCategory = String(category).trim().toLowerCase();

//     const normalizedDescription = String(description).trim();

//     const normalizedUser = String(user).trim();

//     // ========================================================
//     // 5. VALIDATE DATE
//     // ========================================================

//     const expenseDate = new Date(date);

//     if (isNaN(expenseDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense date",
//       });
//     }

//     // JavaScript:
//     // January = 0
//     // February = 1
//     // ...
//     // December = 11

//     const budgetMonth = expenseDate.getMonth();

//     const budgetYear = expenseDate.getFullYear();

//     // ========================================================
//     // 6. START TRANSACTION
//     // ========================================================

//     session.startTransaction();

//     // ========================================================
//     // 7. FIND INCOME
//     // ========================================================

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

//     // ========================================================
//     // 8. FIND SAVINGS
//     // ========================================================

//     const savingsList = await Savings.find({
//       email: normalizedEmail,

//       currentAmount: {
//         $gt: 0,
//       },
//     })
//       .sort({
//         currentAmount: -1,
//       })
//       .session(session);

//     const totalSavings = savingsList.reduce(
//       (total, saving) => total + (Number(saving.currentAmount) || 0),
//       0,
//     );

//     // ========================================================
//     // 9. TOTAL AVAILABLE MONEY
//     // ========================================================

//     const totalAvailable = incomeBalance + totalSavings;

//     // ========================================================
//     // 10. BLOCK IF NO MONEY EXISTS
//     // ========================================================

//     if (totalAvailable <= 0) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,

//         message:
//           "Cannot create expense. Your income and savings balance have reached 0.",

//         expenseAmount,

//         incomeBalance: 0,

//         totalSavings: 0,

//         availableBalance: 0,
//       });
//     }

//     // ========================================================
//     // 11. BLOCK IF MONEY IS INSUFFICIENT
//     // ========================================================

//     if (expenseAmount > totalAvailable) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,

//         message: "Insufficient income and savings to cover this expense.",

//         expenseAmount,

//         incomeBalance,

//         totalSavings,

//         availableBalance: totalAvailable,

//         missingAmount: expenseAmount - totalAvailable,
//       });
//     }

//     // ========================================================
//     // 12. TRACK MONEY
//     // ========================================================

//     let remainingExpense = expenseAmount;

//     let incomeUsed = 0;

//     let savingsUsed = 0;

//     // ========================================================
//     // 13. USE INCOME FIRST
//     // ========================================================

//     if (incomeBalance > 0) {
//       incomeUsed = Math.min(incomeBalance, remainingExpense);

//       income.balance = incomeBalance - incomeUsed;

//       if (income.balance < 0) {
//         income.balance = 0;
//       }

//       await income.save({
//         session,
//       });

//       remainingExpense -= incomeUsed;
//     }

//     // ========================================================
//     // 14. USE SAVINGS AFTER INCOME REACHES ZERO
//     // ========================================================

//     if (remainingExpense > 0) {
//       for (const saving of savingsList) {
//         if (remainingExpense <= 0) {
//           break;
//         }

//         const availableSavings = Number(saving.currentAmount) || 0;

//         if (availableSavings <= 0) {
//           continue;
//         }

//         const amountFromSaving = Math.min(availableSavings, remainingExpense);

//         saving.currentAmount = availableSavings - amountFromSaving;

//         if (saving.currentAmount < 0) {
//           saving.currentAmount = 0;
//         }

//         await saving.save({
//           session,
//         });

//         savingsUsed += amountFromSaving;

//         remainingExpense -= amountFromSaving;
//       }
//     }

//     // ========================================================
//     // 15. FINAL MONEY CHECK
//     // ========================================================

//     if (remainingExpense > 0) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,

//         message: "Insufficient income and savings to cover this expense.",

//         expenseAmount,

//         incomeUsed,

//         savingsUsed,

//         remainingAmount: remainingExpense,
//       });
//     }

//     // ========================================================
//     // 16. CREATE EXPENSE
//     // ========================================================

//     const [expense] = await Expense.create(
//       [
//         {
//           description: normalizedDescription,

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

//     // ========================================================
//     // 17. FIND MATCHING BUDGET
//     // ========================================================

//     const budget = await Budget.findOne({
//       email: normalizedEmail,

//       category: normalizedCategory,

//       month: budgetMonth,

//       year: budgetYear,
//     }).session(session);

//     let budgetUpdated = false;

//     // ========================================================
//     // 18. UPDATE BUDGET
//     // ========================================================

//     if (budget) {
//       budget.spentAmount = (Number(budget.spentAmount) || 0) + expenseAmount;

//       // Budget pre-save automatically updates:
//       // remainingAmount
//       // percentageUsed
//       // status

//       await budget.save({
//         session,
//       });

//       budgetUpdated = true;
//     }

//     // ========================================================
//     // 19. DETERMINE NOTIFICATION SEVERITY
//     // ========================================================

//     let notificationSeverity = "low";

//     if (budgetUpdated && budget.percentageUsed >= 100) {
//       notificationSeverity = "high";
//     } else if (budgetUpdated && budget.percentageUsed >= 80) {
//       notificationSeverity = "medium";
//     }

//     // ========================================================
//     // 20. CREATE EXPENSE NOTIFICATION
//     // ========================================================

//     const notificationData = {
//       userEmail: normalizedEmail,

//       userId,

//       title: "💳 Expense Added",

//       message: `New expense of RWF ${expenseAmount.toLocaleString()} for ${normalizedCategory} was recorded successfully.`,

//       type: "expense",

//       severity: notificationSeverity,

//       isRead: false,

//       relatedId: expense._id,

//       relatedType: "expense",

//       actionLink: `/expenses/${expense._id}`,

//       metadata: {
//         expenseId: expense._id,

//         amount: expenseAmount,

//         category: normalizedCategory,

//         description: normalizedDescription,

//         incomeUsed,

//         savingsUsed,

//         budgetUpdated,

//         budgetId: budget ? budget._id : null,

//         budgetAllocated: budget ? budget.allocatedAmount : 0,

//         budgetSpent: budget ? budget.spentAmount : 0,

//         budgetRemaining: budget ? budget.remainingAmount : 0,

//         budgetPercentage: budget ? budget.percentageUsed : 0,

//         budgetStatus: budget ? budget.status : null,
//       },
//     };

//     const [notification] = await Notification.create([notificationData], {
//       session,
//     });

//     // ========================================================
//     // 21. FINAL BALANCES
//     // ========================================================

//     const remainingIncomeBalance = Number(income.balance) || 0;

//     const remainingSavings = savingsList.reduce(
//       (total, saving) => total + (Number(saving.currentAmount) || 0),
//       0,
//     );

//     const remainingTotalMoney = remainingIncomeBalance + remainingSavings;

//     // ========================================================
//     // 22. COMMIT TRANSACTION
//     // ========================================================

//     await session.commitTransaction();

//     // ========================================================
//     // 23. RESPONSE
//     // ========================================================

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
//         income: remainingIncomeBalance,

//         savings: remainingSavings,

//         total: remainingTotalMoney,
//       },

//       budgetUpdated,

//       budget: budgetUpdated
//         ? {
//             id: budget._id,

//             category: budget.category,

//             month: budget.month,

//             year: budget.year,

//             allocatedAmount: budget.allocatedAmount,

//             spentAmount: budget.spentAmount,

//             remainingAmount: budget.remainingAmount,

//             percentageUsed: budget.percentageUsed,

//             status: budget.status,
//           }
//         : null,

//       notification: {
//         id: notification._id,

//         title: notification.title,

//         message: notification.message,

//         type: notification.type,

//         severity: notification.severity,

//         isRead: notification.isRead,

//         relatedId: notification.relatedId,

//         relatedType: notification.relatedType,
//       },
//     });
//   } catch (error) {
//     // ========================================================
//     // ROLLBACK
//     // ========================================================

//     try {
//       if (session.inTransaction()) {
//         await session.abortTransaction();
//       }
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
//     await session.endSession();
//   }
// };

// exports.createExpense = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const { description, category, type, amount, date, user, email, userId } =
//       req.body;

//     // ============================================================
//     // 1. VALIDATION
//     // ============================================================

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

//     // ============================================================
//     // 2. VALIDATE USER ID
//     // ============================================================

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     // ============================================================
//     // 3. NORMALIZE
//     // ============================================================

//     const normalizedEmail = email.trim().toLowerCase();

//     const normalizedCategory = category.trim().toLowerCase();

//     const normalizedDescription = description.trim();

//     // ============================================================
//     // 4. VALIDATE DATE
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
//     // 5. START TRANSACTION
//     // ============================================================

//     session.startTransaction();

//     // ============================================================
//     // 6. FIND INCOME
//     // ============================================================

//     const income = await Income.findOne({
//       userId: userId,
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
//     // 7. USE INCOME FIRST
//     // ============================================================

//     if (incomeBalance > 0) {
//       incomeUsed = Math.min(incomeBalance, remainingExpense);

//       income.balance = incomeBalance - incomeUsed;

//       if (income.balance < 0) {
//         income.balance = 0;
//       }

//       await income.save({
//         session,
//       });

//       remainingExpense -= incomeUsed;
//     }

//     // ============================================================
//     // 8. USE SAVINGS AFTER INCOME REACHES ZERO
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

//         const availableSavings = Number(saving.currentAmount) || 0;

//         if (availableSavings <= 0) {
//           continue;
//         }

//         const amountFromSaving = Math.min(availableSavings, remainingExpense);

//         saving.currentAmount = availableSavings - amountFromSaving;

//         if (saving.currentAmount < 0) {
//           saving.currentAmount = 0;
//         }

//         await saving.save({
//           session,
//         });

//         savingsUsed += amountFromSaving;

//         remainingExpense -= amountFromSaving;
//       }
//     }

//     // ============================================================
//     // 9. NO MONEY LEFT
//     // ============================================================

//     if (remainingExpense > 0) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,

//         message: "Insufficient money. Income and savings are both exhausted.",

//         expenseAmount,

//         incomeUsed,

//         savingsUsed,

//         remainingAmount: remainingExpense,

//         remainingIncomeBalance: Math.max(Number(income.balance) || 0, 0),
//       });
//     }

//     // ============================================================
//     // 10. CREATE EXPENSE
//     // ============================================================

//     const [expense] = await Expense.create(
//       [
//         {
//           description: normalizedDescription,

//           category: normalizedCategory,

//           type: type || "expense",

//           amount: expenseAmount,

//           date: expenseDate,

//           user: user.trim(),

//           userId,

//           email: normalizedEmail,
//         },
//       ],
//       {
//         session,
//       },
//     );

//     // ============================================================
//     // 11. FIND MATCHING BUDGET
//     // ============================================================

//     const budget = await Budget.findOne({
//       email: normalizedEmail,

//       category: normalizedCategory,

//       month: budgetMonth,

//       year: budgetYear,
//     }).session(session);

//     let budgetUpdated = false;
//     let budgetNotification = null;

//     // ============================================================
//     // 12. UPDATE BUDGET
//     // ============================================================

//     if (budget) {
//       budget.spentAmount = Number(budget.spentAmount) + expenseAmount;

//       /*
//        * IMPORTANT:
//        *
//        * budget.save() triggers the Budget
//        * pre("save") middleware.
//        *
//        * Therefore:
//        * spentAmount
//        * remainingAmount
//        * percentageUsed
//        * status
//        *
//        * are recalculated automatically.
//        */

//       await budget.save({
//         session,
//       });

//       budgetUpdated = true;

//       // ==========================================================
//       // 13. BUDGET NOTIFICATION
//       // ==========================================================

//       let severity = "low";
//       let budgetTitle = "📊 Budget Updated";

//       if (budget.percentageUsed >= 100) {
//         severity = "high";

//         budgetTitle = "🚨 Budget Exceeded";
//       } else if (budget.percentageUsed >= 80) {
//         severity = "medium";

//         budgetTitle = "⚠️ Budget Almost Used";
//       }

//       const [createdBudgetNotification] = await Notification.create(
//         [
//           {
//             userEmail: normalizedEmail,

//             userId,

//             title: budgetTitle,

//             message:
//               `${normalizedCategory} budget updated. ` +
//               `Spent: RWF ${budget.spentAmount.toFixed(2)}. ` +
//               `Remaining: RWF ${budget.remainingAmount.toFixed(2)}. ` +
//               `Used: ${budget.percentageUsed.toFixed(1)}%.`,

//             type: "warning",

//             severity,

//             relatedId: budget._id,

//             relatedType: "budget",

//             actionLink: "/budgets",

//             metadata: {
//               category: normalizedCategory,

//               expenseId: expense._id,

//               allocatedAmount: budget.allocatedAmount,

//               spentAmount: budget.spentAmount,

//               remainingAmount: budget.remainingAmount,

//               percentageUsed: budget.percentageUsed,

//               status: budget.status,
//             },
//           },
//         ],
//         {
//           session,
//         },
//       );

//       budgetNotification = createdBudgetNotification;
//     }

//     // ============================================================
//     // 14. EXPENSE NOTIFICATION
//     // ============================================================

//     const [notification] = await Notification.create(
//       [
//         {
//           userEmail: normalizedEmail,

//           userId,

//           title: "💸 Expense Recorded",

//           message: `You spent RWF ${expenseAmount.toFixed(
//             2,
//           )} on ${normalizedCategory}.`,

//           type: "expense",

//           severity: "low",

//           relatedId: expense._id,

//           relatedType: "expense",

//           actionLink: `/expenses/${expense._id}`,

//           metadata: {
//             expenseId: expense._id,

//             amount: expenseAmount,

//             category: normalizedCategory,

//             description: normalizedDescription,

//             incomeUsed,

//             savingsUsed,

//             budgetUpdated,
//           },
//         },
//       ],
//       {
//         session,
//       },
//     );

//     // ============================================================
//     // 15. COMMIT
//     // ============================================================

//     await session.commitTransaction();

//     // ============================================================
//     // 16. RESPONSE
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

//       remainingIncomeBalance: Number(income.balance) || 0,

//       budgetUpdated,

//       budget: budgetUpdated
//         ? {
//             id: budget._id,

//             category: budget.category,

//             month: budget.month,

//             year: budget.year,

//             allocatedAmount: budget.allocatedAmount,

//             spentAmount: budget.spentAmount,

//             remainingAmount: budget.remainingAmount,

//             percentageUsed: budget.percentageUsed,

//             status: budget.status,
//           }
//         : null,

//       notification: {
//         id: notification._id,

//         title: notification.title,

//         message: notification.message,

//         type: notification.type,

//         severity: notification.severity,

//         relatedId: notification.relatedId,

//         relatedType: notification.relatedType,
//       },

//       budgetNotification: budgetNotification
//         ? {
//             id: budgetNotification._id,

//             title: budgetNotification.title,

//             message: budgetNotification.message,

//             severity: budgetNotification.severity,
//           }
//         : null,
//     });
//   } catch (error) {
//     // ==========================================================
//     // ROLLBACK
//     // ==========================================================

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
//     await session.endSession();
//   }
// };

// ============================================================
// CREATE EXPENSE
// ============================================================
// POST /api/expenses
// ============================================================

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

//     // ==========================================================
//     // 1. VALIDATION
//     // ==========================================================

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
//           "Description, category, amount, date, user, email and userId are required",
//       });
//     }

//     // ==========================================================
//     // 2. VALIDATE USER ID
//     // ==========================================================

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     // ==========================================================
//     // 3. VALIDATE AMOUNT
//     // ==========================================================

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

//     // ==========================================================
//     // 4. NORMALIZE
//     // ==========================================================

//     const normalizedEmail = String(email)
//       .trim()
//       .toLowerCase();

//     const normalizedCategory = String(category)
//       .trim()
//       .toLowerCase();

//     const normalizedDescription =
//       String(description).trim();

//     const normalizedUser =
//       String(user).trim();

//     // ==========================================================
//     // 5. VALIDATE DATE
//     // ==========================================================

//     const expenseDate = new Date(date);

//     if (isNaN(expenseDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense date",
//       });
//     }

//     // JavaScript months:
//     //
//     // January = 0
//     // February = 1
//     // ...
//     // December = 11

//     const budgetMonth = expenseDate.getMonth();

//     const budgetYear = expenseDate.getFullYear();

//     // ==========================================================
//     // 6. START TRANSACTION
//     // ==========================================================

//     session.startTransaction();

//     // ==========================================================
//     // 7. FIND USER'S INCOME
//     // ==========================================================

//     const income = await Income.findOne({
//       userId: userId,
//     }).session(session);

//     if (!income) {
//       await session.abortTransaction();

//       return res.status(404).json({
//         success: false,
//         message: "Income record not found",
//       });
//     }

//     // ==========================================================
//     // 8. CURRENT INCOME BALANCE
//     // ==========================================================

//     let incomeBalance =
//       Number(income.balance) || 0;

//     // ==========================================================
//     // 9. FIND SAVINGS
//     // ==========================================================

//     const savingsList = await Savings.find({
//       email: normalizedEmail,

//       currentAmount: {
//         $gt: 0,
//       },
//     })
//       .sort({
//         currentAmount: -1,
//       })
//       .session(session);

//     // ==========================================================
//     // 10. TOTAL SAVINGS
//     // ==========================================================

//     let totalSavings = savingsList.reduce(
//       (total, saving) => {
//         return (
//           total +
//           (Number(saving.currentAmount) || 0)
//         );
//       },
//       0
//     );

//     // ==========================================================
//     // 11. TOTAL AVAILABLE MONEY
//     // ==========================================================

//     const totalAvailable =
//       incomeBalance + totalSavings;

//     // ==========================================================
//     // 12. BLOCK IF EVERYTHING IS ZERO
//     // ==========================================================

//     if (totalAvailable <= 0) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,

//         message:
//           "Cannot create expense. Your income and savings have reached 0.",

//         expenseAmount,

//         incomeBalance: 0,

//         totalSavings: 0,

//         availableBalance: 0,
//       });
//     }

//     // ==========================================================
//     // 13. BLOCK IF EXPENSE IS GREATER THAN AVAILABLE MONEY
//     // ==========================================================

//     if (expenseAmount > totalAvailable) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,

//         message:
//           "Insufficient income and savings to cover this expense.",

//         expenseAmount,

//         incomeBalance,

//         totalSavings,

//         availableBalance: totalAvailable,

//         missingAmount:
//           expenseAmount - totalAvailable,
//       });
//     }

//     // ==========================================================
//     // 14. TRACK MONEY
//     // ==========================================================

//     let remainingExpense = expenseAmount;

//     let incomeUsed = 0;

//     let savingsUsed = 0;

//     // ==========================================================
//     // 15. USE INCOME FIRST
//     // ==========================================================

//     if (incomeBalance > 0) {
//       incomeUsed = Math.min(
//         incomeBalance,
//         remainingExpense
//       );

//       income.balance =
//         incomeBalance - incomeUsed;

//       if (income.balance < 0) {
//         income.balance = 0;
//       }

//       await income.save({
//         session,
//       });

//       remainingExpense -= incomeUsed;
//     }

//     // ==========================================================
//     // 16. USE SAVINGS AFTER INCOME REACHES ZERO
//     // ==========================================================

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

//         const amountFromSaving =
//           Math.min(
//             availableSavings,
//             remainingExpense
//           );

//         saving.currentAmount =
//           availableSavings -
//           amountFromSaving;

//         if (saving.currentAmount < 0) {
//           saving.currentAmount = 0;
//         }

//         await saving.save({
//           session,
//         });

//         savingsUsed += amountFromSaving;

//         remainingExpense -=
//           amountFromSaving;
//       }
//     }

//     // ==========================================================
//     // 17. FINAL MONEY CHECK
//     // ==========================================================

//     if (remainingExpense > 0) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,

//         message:
//           "Insufficient income and savings to cover this expense.",

//         expenseAmount,

//         incomeUsed,

//         savingsUsed,

//         remainingAmount:
//           remainingExpense,
//       });
//     }

//     // ==========================================================
//     // 18. CREATE EXPENSE
//     // ==========================================================

//     const [expense] =
//       await Expense.create(
//         [
//           {
//             description:
//               normalizedDescription,

//             category:
//               normalizedCategory,

//             type:
//               type || "expense",

//             amount:
//               expenseAmount,

//             date:
//               expenseDate,

//             user:
//               normalizedUser,

//             userId:

//               userId,

//             email:
//               normalizedEmail,
//           },
//         ],
//         {
//           session,
//         }
//       );

//     // ==========================================================
//     // 19. FIND MATCHING BUDGET
//     // ==========================================================

//     const budget =
//       await Budget.findOne({
//         email:
//           normalizedEmail,

//         category:
//           normalizedCategory,

//         month:
//           budgetMonth,

//         year:
//           budgetYear,
//       }).session(session);

//     let budgetUpdated = false;

//     // ==========================================================
//     // 20. UPDATE BUDGET
//     // ==========================================================

//     if (budget) {
//       // --------------------------------------------------------
//       // Add this expense to budget spent amount
//       // --------------------------------------------------------

//       budget.spentAmount =
//         (Number(
//           budget.spentAmount
//         ) || 0) +
//         expenseAmount;

//       // --------------------------------------------------------
//       // Recalculate budget manually
//       // --------------------------------------------------------

//       budget.allocatedAmount =
//         Number(
//           budget.allocatedAmount
//         ) || 0;

//       budget.remainingAmount =
//         Math.max(
//           budget.allocatedAmount -
//             budget.spentAmount,
//           0
//         );

//       budget.percentageUsed =
//         budget.allocatedAmount > 0
//           ? (
//               budget.spentAmount /
//               budget.allocatedAmount
//             ) * 100
//           : 0;

//       // --------------------------------------------------------
//       // Budget status
//       // --------------------------------------------------------

//       if (
//         budget.percentageUsed >= 100
//       ) {
//         budget.status =
//           "over-budget";
//       } else if (
//         budget.percentageUsed >= 80
//       ) {
//         budget.status =
//           "approaching-limit";
//       } else if (
//         budget.spentAmount > 0 &&
//         budget.percentageUsed < 50
//       ) {
//         budget.status =
//           "under-budget";
//       } else {
//         budget.status =
//           "on-track";
//       }

//       // --------------------------------------------------------
//       // SAVE BUDGET
//       // --------------------------------------------------------

//       await budget.save({
//         session,
//       });

//       budgetUpdated = true;
//     }

//     // ==========================================================
//     // 21. CREATE EXPENSE NOTIFICATION
//     // ==========================================================

//     const [expenseNotification] =
//       await Notification.create(
//         [
//           {
//             // IMPORTANT:
//             // Your Notification schema requires userEmail
//             userEmail:
//               normalizedEmail,

//             userId:

//               userId,

//             title:
//               "💸 Expense Recorded",

//             message:
//               `You spent RWF ${expenseAmount.toLocaleString()} on ${normalizedCategory}.`,

//             type:
//               "expense",

//             severity:
//               "low",

//             isRead:
//               false,

//             relatedId:
//               expense._id,

//             relatedType:
//               "expense",

//             actionLink:
//               `/expenses/${expense._id}`,

//             metadata: {
//               expenseId:
//                 expense._id,

//               amount:
//                 expenseAmount,

//               category:
//                 normalizedCategory,

//               description:
//                 normalizedDescription,

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

//     // ==========================================================
//     // 22. BUDGET NOTIFICATION
//     // ==========================================================

//     let budgetNotification =
//       null;

//     if (budgetUpdated) {
//       let severity = "low";

//       let title =
//         "📊 Budget Updated";

//       if (
//         budget.percentageUsed >= 100
//       ) {
//         severity = "high";

//         title =
//           "🚨 Budget Exceeded";
//       } else if (
//         budget.percentageUsed >= 80
//       ) {
//         severity = "medium";

//         title =
//           "⚠️ Budget Almost Used";
//       }

//       const [
//         createdBudgetNotification,
//       ] = await Notification.create(
//         [
//           {
//             userEmail:
//               normalizedEmail,

//             userId:

//               userId,

//             title,

//             message:
//               `${normalizedCategory} budget updated. Spent: RWF ${budget.spentAmount.toLocaleString()}. Remaining: RWF ${budget.remainingAmount.toLocaleString()}. Used: ${budget.percentageUsed.toFixed(1)}%.`,

//             type:
//               "budget",

//             severity,

//             isRead:
//               false,

//             relatedId:
//               budget._id,

//             relatedType:
//               "budget",

//             actionLink:
//               "/budgets",

//             metadata: {
//               budgetId:
//                 budget._id,

//               expenseId:
//                 expense._id,

//               category:
//                 normalizedCategory,

//               allocatedAmount:
//                 budget.allocatedAmount,

//               spentAmount:
//                 budget.spentAmount,

//               remainingAmount:
//                 budget.remainingAmount,

//               percentageUsed:
//                 budget.percentageUsed,

//               status:
//                 budget.status,
//             },
//           },
//         ],
//         {
//           session,
//         }
//       );

//       budgetNotification =
//         createdBudgetNotification;
//     }

//     // ==========================================================
//     // 23. FINAL BALANCES
//     // ==========================================================

//     const remainingIncomeBalance =
//       Number(income.balance) || 0;

//     const remainingSavings =
//       savingsList.reduce(
//         (total, saving) => {
//           return (
//             total +
//             (Number(
//               saving.currentAmount
//             ) || 0)
//           );
//         },
//         0
//       );

//     const remainingTotalMoney =
//       remainingIncomeBalance +
//       remainingSavings;

//     // ==========================================================
//     // 24. COMMIT TRANSACTION
//     // ==========================================================

//     await session.commitTransaction();

//     // ==========================================================
//     // 25. RESPONSE
//     // ==========================================================

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
//           remainingIncomeBalance,

//         savings:
//           remainingSavings,

//         total:
//           remainingTotalMoney,
//       },

//       budgetUpdated,

//       budget: budgetUpdated
//         ? {
//             id:
//               budget._id,

//             category:
//               budget.category,

//             month:
//               budget.month,

//             year:
//               budget.year,

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
//           }
//         : null,

//       notification: {
//         id:
//           expenseNotification._id,

//         title:
//           expenseNotification.title,

//         message:
//           expenseNotification.message,

//         type:
//           expenseNotification.type,

//         severity:
//           expenseNotification.severity,

//         isRead:
//           expenseNotification.isRead,
//       },

//       budgetNotification:
//         budgetNotification
//           ? {
//               id:
//                 budgetNotification._id,

//               title:
//                 budgetNotification.title,

//               message:
//                 budgetNotification.message,

//               severity:
//                 budgetNotification.severity,
//             }
//           : null,
//     });
//   } catch (error) {
//     // ==========================================================
//     // ROLLBACK
//     // ==========================================================

//     try {
//       if (session.inTransaction()) {
//         await session.abortTransaction();
//       }
//     } catch (abortError) {
//       console.error(
//         "❌ Transaction abort error:",
//         abortError
//       );
//     }

//     console.error(
//       "❌ Create expense error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,

//       message:
//         "Failed to create expense",

//       error:
//         error.message,
//     });
//   } finally {
//     await session.endSession();
//   }
// };


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
      amount === undefined ||
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

    if (
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const expenseAmount = Number(amount);

    if (
      !Number.isFinite(expenseAmount) ||
      expenseAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Expense amount must be greater than 0",
      });
    }

    // ============================================================
    // NORMALIZE
    // ============================================================

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedCategory =
      category.trim().toLowerCase();

    const normalizedDescription =
      description.trim();

    const normalizedUser =
      user.trim();

    const expenseDate = new Date(date);

    if (isNaN(expenseDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense date",
      });
    }

    // JS month:
    // January = 0
    // December = 11

    const budgetMonth =
      expenseDate.getMonth();

    const budgetYear =
      expenseDate.getFullYear();

    // ============================================================
    // START TRANSACTION
    // ============================================================

    session.startTransaction();

    // ============================================================
    // FIND INCOME
    // ============================================================

    const income =
      await Income.findOne({
        userId,
      }).session(session);

    if (!income) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Income record not found",
      });
    }

    let incomeBalance =
      Number(income.balance) || 0;

    // ============================================================
    // FIND SAVINGS
    // ============================================================

    const savingsList =
      await Savings.find({
        email: normalizedEmail,

        currentAmount: {
          $gt: 0,
        },
      })
        .sort({
          currentAmount: -1,
        })
        .session(session);

    const totalSavings =
      savingsList.reduce(
        (total, saving) =>
          total +
          (Number(
            saving.currentAmount,
          ) || 0),
        0,
      );

    const totalAvailable =
      incomeBalance + totalSavings;

    // ============================================================
    // BLOCK WHEN EVERYTHING IS ZERO
    // ============================================================

    if (totalAvailable <= 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,

        message:
          "Cannot create expense. Your income and savings have reached 0.",

        availableBalance: 0,
      });
    }

    // ============================================================
    // BLOCK IF NOT ENOUGH MONEY
    // ============================================================

    if (expenseAmount > totalAvailable) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,

        message:
          "Insufficient income and savings to cover this expense.",

        expenseAmount,

        incomeBalance,

        totalSavings,

        availableBalance:
          totalAvailable,

        missingAmount:
          expenseAmount -
          totalAvailable,
      });
    }

    // ============================================================
    // MONEY TRACKING
    // ============================================================

    let remainingExpense =
      expenseAmount;

    let incomeUsed = 0;

    let savingsUsed = 0;

    // ============================================================
    // USE INCOME FIRST
    // ============================================================

    if (incomeBalance > 0) {
      incomeUsed = Math.min(
        incomeBalance,
        remainingExpense,
      );

      income.balance =
        incomeBalance -
        incomeUsed;

      if (income.balance < 0) {
        income.balance = 0;
      }

      await income.save({
        session,
      });

      remainingExpense -=
        incomeUsed;
    }

    // ============================================================
    // USE SAVINGS AFTER INCOME = 0
    // ============================================================

    if (remainingExpense > 0) {
      for (const saving of savingsList) {
        if (remainingExpense <= 0) {
          break;
        }

        const availableSavings =
          Number(
            saving.currentAmount,
          ) || 0;

        if (availableSavings <= 0) {
          continue;
        }

        const amountFromSaving =
          Math.min(
            availableSavings,
            remainingExpense,
          );

        saving.currentAmount =
          availableSavings -
          amountFromSaving;

        if (
          saving.currentAmount <
          0
        ) {
          saving.currentAmount = 0;
        }

        await saving.save({
          session,
        });

        savingsUsed +=
          amountFromSaving;

        remainingExpense -=
          amountFromSaving;
      }
    }

    // ============================================================
    // FINAL MONEY CHECK
    // ============================================================

    if (remainingExpense > 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,

        message:
          "Insufficient income and savings.",

        expenseAmount,

        incomeUsed,

        savingsUsed,

        remainingAmount:
          remainingExpense,
      });
    }

    // ============================================================
    // CREATE EXPENSE
    // ============================================================

    const [expense] =
      await Expense.create(
        [
          {
            description:
              normalizedDescription,

            category:
              normalizedCategory,

            type:
              type || "expense",

            amount:
              expenseAmount,

            date:
              expenseDate,

            user:
              normalizedUser,

            userId,

            email:
              normalizedEmail,
          },
        ],
        {
          session,
        },
      );

    // ============================================================
    // FIND BUDGET
    // ============================================================

    const budget =
      await Budget.findOne({
        email:
          normalizedEmail,

        category:
          normalizedCategory,

        month:
          budgetMonth,

        year:
          budgetYear,
      }).session(session);

    let budgetUpdated = false;

    // ============================================================
    // UPDATE BUDGET SPENT AMOUNT
    // ============================================================

    if (budget) {
      const currentSpent =
        Number(
          budget.spentAmount,
        ) || 0;

      budget.spentAmount =
        currentSpent +
        expenseAmount;

      /*
       * budget.save() triggers:
       *
       * pre("save")
       *
       * which calculates:
       *
       * remainingAmount
       * percentageUsed
       * status
       */

      await budget.save({
        session,
      });

      budgetUpdated = true;
    }

    // ============================================================
    // DETERMINE BUDGET NOTIFICATION
    // ============================================================

    let budgetSeverity = "low";

    let budgetTitle =
      "📊 Budget Updated";

    if (
      budget &&
      budget.percentageUsed >=
        100
    ) {
      budgetSeverity = "high";

      budgetTitle =
        "🚨 Budget Exceeded";
    } else if (
      budget &&
      budget.percentageUsed >=
        80
    ) {
      budgetSeverity = "medium";

      budgetTitle =
        "⚠️ Budget Almost Used";
    }

    // ============================================================
    // EXPENSE NOTIFICATION
    // ============================================================

    const [expenseNotification] =
      await Notification.create(
        [
          {
            userEmail:
              normalizedEmail,

            userId,

            title:
              "💸 Expense Recorded",

            message:
              `You spent RWF ${expenseAmount.toLocaleString()} on ${normalizedCategory}.`,

            type:
              "expense",

            severity:
              "low",

            isRead:
              false,

            // LINK TO EXPENSE
            relatedId:
              expense._id,

            relatedType:
              "Expense",

            actionLink:
              `/expenses/${expense._id}`,

            metadata: {
              expenseId:
                expense._id,

              amount:
                expenseAmount,

              category:
                normalizedCategory,

              incomeUsed,

              savingsUsed,

              budgetUpdated,

              budgetId:
                budget
                  ? budget._id
                  : null,
            },
          },
        ],
        {
          session,
        },
      );

    // ============================================================
    // BUDGET NOTIFICATION
    // ============================================================

    let budgetNotification =
      null;

    if (budget) {
      const [
        createdBudgetNotification,
      ] =
        await Notification.create(
          [
            {
              userEmail:
                normalizedEmail,

              userId,

              title:
                budgetTitle,

              message:
                `${normalizedCategory} budget: spent RWF ${budget.spentAmount.toLocaleString()} of RWF ${budget.allocatedAmount.toLocaleString()}. Remaining: RWF ${budget.remainingAmount.toLocaleString()}.`,

              type:
                "budget",

              severity:
                budgetSeverity,

              isRead:
                false,

              /*
               * IMPORTANT:
               *
               * Link this notification
               * directly to the EXPENSE.
               */

              relatedId:
                expense._id,

              relatedType:
                "Expense",

              actionLink:
                `/expenses/${expense._id}`,

              metadata: {
                expenseId:
                  expense._id,

                budgetId:
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
                  budget.percentageUsed,

                status:
                  budget.status,

                expenseAmount:
                  expenseAmount,
              },
            },
          ],
          {
            session,
          },
        );

      budgetNotification =
        createdBudgetNotification;
    }

    // ============================================================
    // FINAL BALANCES
    // ============================================================

    const remainingIncome =
      Number(income.balance) || 0;

    const remainingSavings =
      savingsList.reduce(
        (total, saving) =>
          total +
          (Number(
            saving.currentAmount,
          ) || 0),
        0,
      );

    const remainingTotal =
      remainingIncome +
      remainingSavings;

    // ============================================================
    // COMMIT
    // ============================================================

    await session.commitTransaction();

    // ============================================================
    // RESPONSE
    // ============================================================

    return res.status(201).json({
      success: true,

      message:
        "Expense created successfully",

      data: expense,

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
              budget.percentageUsed,

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
    try {
      if (
        session.inTransaction()
      ) {
        await session.abortTransaction();
      }
    } catch (abortError) {
      console.error(
        "❌ Abort transaction error:",
        abortError,
      );
    }

    console.error(
      "❌ Create expense error:",
      error,
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
