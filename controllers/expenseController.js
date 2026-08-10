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
//     const { description, category, type, amount, date, user, email, userId } =
//       req.body;

//     // ============================================================
//     // VALIDATION
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

//     if (!Number.isFinite(expenseAmount) || expenseAmount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Expense amount must be greater than 0",
//       });
//     }

//     // ============================================================
//     // NORMALIZE
//     // ============================================================

//     const normalizedEmail = email.trim().toLowerCase();

//     const normalizedCategory = category.trim().toLowerCase();

//     const normalizedDescription = description.trim();

//     const normalizedUser = user.trim();

//     const expenseDate = new Date(date);

//     if (isNaN(expenseDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid expense date",
//       });
//     }

//     // JS month:
//     // January = 0
//     // December = 11

//     const budgetMonth = expenseDate.getMonth();

//     const budgetYear = expenseDate.getFullYear();

//     // ============================================================
//     // START TRANSACTION
//     // ============================================================

//     session.startTransaction();

//     // ============================================================
//     // FIND INCOME
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

//     // ============================================================
//     // FIND SAVINGS
//     // ============================================================

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

//     const totalAvailable = incomeBalance + totalSavings;

//     // ============================================================
//     // BLOCK WHEN EVERYTHING IS ZERO
//     // ============================================================

//     if (totalAvailable <= 0) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,

//         message:
//           "Cannot create expense. Your income and savings have reached 0.",

//         availableBalance: 0,
//       });
//     }

//     // ============================================================
//     // BLOCK IF NOT ENOUGH MONEY
//     // ============================================================

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

//     // ============================================================
//     // MONEY TRACKING
//     // ============================================================

//     let remainingExpense = expenseAmount;

//     let incomeUsed = 0;

//     let savingsUsed = 0;

//     // ============================================================
//     // USE INCOME FIRST
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
//     // USE SAVINGS AFTER INCOME = 0
//     // ============================================================

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

//     // ============================================================
//     // FINAL MONEY CHECK
//     // ============================================================

//     if (remainingExpense > 0) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,

//         message: "Insufficient income and savings.",

//         expenseAmount,

//         incomeUsed,

//         savingsUsed,

//         remainingAmount: remainingExpense,
//       });
//     }

//     // ============================================================
//     // CREATE EXPENSE
//     // ============================================================

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

//     // ============================================================
//     // FIND BUDGET
//     // ============================================================

//     const budget = await Budget.findOne({
//       email: normalizedEmail,

//       category: normalizedCategory,

//       month: budgetMonth,

//       year: budgetYear,
//     }).session(session);

//     let budgetUpdated = false;

//     // ============================================================
//     // UPDATE BUDGET SPENT AMOUNT
//     // ============================================================

//     if (budget) {
//       const currentSpent = Number(budget.spentAmount) || 0;

//       budget.spentAmount = currentSpent + expenseAmount;

//       /*
//        * budget.save() triggers:
//        *
//        * pre("save")
//        *
//        * which calculates:
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
//     // DETERMINE BUDGET NOTIFICATION
//     // ============================================================

//     let budgetSeverity = "low";

//     let budgetTitle = "📊 Budget Updated";

//     if (budget && budget.percentageUsed >= 100) {
//       budgetSeverity = "high";

//       budgetTitle = "🚨 Budget Exceeded";
//     } else if (budget && budget.percentageUsed >= 80) {
//       budgetSeverity = "medium";

//       budgetTitle = "⚠️ Budget Almost Used";
//     }

//     // ============================================================
//     // EXPENSE NOTIFICATION
//     // ============================================================

//     const [expenseNotification] = await Notification.create(
//       [
//         {
//           userEmail: normalizedEmail,

//           userId,

//           title: "💸 Expense Recorded",

//           message: `You spent RWF ${expenseAmount.toLocaleString()} on ${normalizedCategory}.`,

//           type: "expense",

//           severity: "low",

//           isRead: false,

//           // LINK TO EXPENSE
//           relatedId: expense._id,

//           relatedType: "Expense",

//           actionLink: `/expenses/${expense._id}`,

//           metadata: {
//             expenseId: expense._id,

//             amount: expenseAmount,

//             category: normalizedCategory,

//             incomeUsed,

//             savingsUsed,

//             budgetUpdated,

//             budgetId: budget ? budget._id : null,
//           },
//         },
//       ],
//       {
//         session,
//       },
//     );

//     // ============================================================
//     // BUDGET NOTIFICATION
//     // ============================================================

//     let budgetNotification = null;

//     if (budget) {
//       const [createdBudgetNotification] = await Notification.create(
//         [
//           {
//             userEmail: normalizedEmail,

//             userId,

//             title: budgetTitle,

//             message: `${normalizedCategory} budget: spent RWF ${budget.spentAmount.toLocaleString()} of RWF ${budget.allocatedAmount.toLocaleString()}. Remaining: RWF ${budget.remainingAmount.toLocaleString()}.`,

//             type: "budget",

//             severity: budgetSeverity,

//             isRead: false,

//             /*
//              * IMPORTANT:
//              *
//              * Link this notification
//              * directly to the EXPENSE.
//              */

//             relatedId: expense._id,

//             relatedType: "Expense",

//             actionLink: `/expenses/${expense._id}`,

//             metadata: {
//               expenseId: expense._id,

//               budgetId: budget._id,

//               category: budget.category,

//               allocatedAmount: budget.allocatedAmount,

//               spentAmount: budget.spentAmount,

//               remainingAmount: budget.remainingAmount,

//               percentageUsed: budget.percentageUsed,

//               status: budget.status,

//               expenseAmount: expenseAmount,
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
//     // FINAL BALANCES
//     // ============================================================

//     const remainingIncome = Number(income.balance) || 0;

//     const remainingSavings = savingsList.reduce(
//       (total, saving) => total + (Number(saving.currentAmount) || 0),
//       0,
//     );

//     const remainingTotal = remainingIncome + remainingSavings;

//     // ============================================================
//     // COMMIT
//     // ============================================================

//     await session.commitTransaction();

//     // ============================================================
//     // RESPONSE
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

//             allocatedAmount: budget.allocatedAmount,

//             spentAmount: budget.spentAmount,

//             remainingAmount: budget.remainingAmount,

//             percentageUsed: budget.percentageUsed,

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
//     try {
//       if (session.inTransaction()) {
//         await session.abortTransaction();
//       }
//     } catch (abortError) {
//       console.error("❌ Abort transaction error:", abortError);
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

exports.createExpense = async (req, res) => {
  const session = await mongoose.startSession();

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
        message: "All fields are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const expenseAmount = Number(amount);

    if (
      !Number.isFinite(expenseAmount) ||
      !Number.isInteger(expenseAmount) ||
      expenseAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive whole number",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDescription = description.trim();
    const normalizedUser = user.trim();

    if (!normalizedDescription) {
      return res.status(400).json({
        success: false,
        message: "Description cannot be empty",
      });
    }

    const expenseDate = new Date(date);

    if (Number.isNaN(expenseDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense date",
      });
    }

    // ========================================================
    // CATEGORY
    // ========================================================

    const validCategories = [
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

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense category",
      });
    }

    // ========================================================
    // START TRANSACTION
    // ========================================================

    session.startTransaction();

    // ========================================================
    // FIND AVAILABLE INCOME
    // ========================================================

    const incomeList = await Income.find({
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
    // ========================================================

    const savingsList = await Savings.find({
      userId,
      currentAmount: {
        $gt: 0,
      },
    })
      .sort({
        priority: -1,
        currentAmount: -1,
      })
      .session(session);

    // ========================================================
    // CALCULATE TOTAL AVAILABLE
    // ========================================================

    const totalIncome = incomeList.reduce(
      (total, income) =>
        total + (Number(income.remainingAmount) || 0),
      0
    );

    const totalSavings = savingsList.reduce(
      (total, saving) =>
        total + (Number(saving.currentAmount) || 0),
      0
    );

    const totalAvailable = totalIncome + totalSavings;

    // ========================================================
    // CHECK AVAILABLE MONEY
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

    if (expenseAmount > totalAvailable) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Insufficient income and savings to cover this expense.",
        expenseAmount,
        totalIncome,
        totalSavings,
        availableBalance: totalAvailable,
        missingAmount:
          expenseAmount - totalAvailable,
      });
    }

    // ========================================================
    // TRACK MONEY USED
    // ========================================================

    let remainingExpense = expenseAmount;

    let incomeUsed = 0;
    let savingsUsed = 0;

    const savingsAllocations = [];

    // ========================================================
    // USE INCOME FIRST
    // ========================================================

    for (const income of incomeList) {
      if (remainingExpense <= 0) {
        break;
      }

      const availableIncome =
        Number(income.remainingAmount) || 0;

      if (availableIncome <= 0) {
        continue;
      }

      const amountFromIncome = Math.min(
        availableIncome,
        remainingExpense
      );

      income.remainingAmount =
        availableIncome - amountFromIncome;

      if (income.remainingAmount < 0) {
        income.remainingAmount = 0;
      }

      await income.save({
        session,
        validateBeforeSave: true,
      });

      incomeUsed += amountFromIncome;

      remainingExpense -= amountFromIncome;
    }

    // ========================================================
    // USE SAVINGS ONLY AFTER INCOME IS EXHAUSTED
    // ========================================================

    if (remainingExpense > 0) {
      for (const saving of savingsList) {
        if (remainingExpense <= 0) {
          break;
        }

        const availableSavings =
          Number(saving.currentAmount) || 0;

        if (availableSavings <= 0) {
          continue;
        }

        const amountFromSavings = Math.min(
          availableSavings,
          remainingExpense
        );

        saving.currentAmount =
          availableSavings - amountFromSavings;

        if (saving.currentAmount < 0) {
          saving.currentAmount = 0;
        }

        await saving.save({
          session,
          validateBeforeSave: true,
        });

        savingsUsed += amountFromSavings;

        remainingExpense -= amountFromSavings;

        savingsAllocations.push({
          savingsId: saving._id,
          amount: amountFromSavings,
        });
      }
    }

    // ========================================================
    // FINAL SAFETY CHECK
    // ========================================================

    if (remainingExpense > 0) {
      throw new Error(
        "Money allocation failed. Transaction rolled back."
      );
    }

    // ========================================================
    // FIND BUDGET
    // ========================================================

    const budgetMonth = expenseDate.getMonth();
    const budgetYear = expenseDate.getFullYear();

    const budget = await Budget.findOne({
      userId,
      category,
      month: budgetMonth,
      year: budgetYear,
    }).session(session);

    let budgetUpdated = false;

    // ========================================================
    // UPDATE BUDGET
    // ========================================================

    if (budget) {
      const currentSpent =
        Number(budget.spentAmount) || 0;

      budget.spentAmount =
        currentSpent + expenseAmount;

      if (budget.spentAmount < 0) {
        budget.spentAmount = 0;
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

    const [expense] = await Expense.create(
      [
        {
          description: normalizedDescription,

          category,

          type: "expense",

          amount: expenseAmount,

          date: expenseDate,

          user: normalizedUser,

          email: normalizedEmail,

          userId,

          incomeUsed,

          savingsUsed,

          savingsAllocations,

          budgetId: budget ? budget._id : null,

          budgetAmountUsed: budget
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

    const [expenseNotification] =
      await Notification.create(
        [
          {
            userEmail: normalizedEmail,

            userId,

            title: "💸 Expense Recorded",

            message:
              `You spent RWF ${expenseAmount.toLocaleString()} ` +
              `on ${category}.`,

            type: "expense",

            severity: "low",

            isRead: false,

            relatedId: expense._id,

            relatedType: "expense",

            actionLink:
              `/expenses/${expense._id}`,

            metadata: {
              expenseId: expense._id,

              amount: expenseAmount,

              category,

              incomeUsed,

              savingsUsed,

              budgetUpdated,
            },
          },
        ],
        {
          session,
        }
      );

    // ========================================================
    // BUDGET NOTIFICATION
    // ========================================================

    let budgetNotification = null;

    if (budget) {
      let budgetSeverity = "low";
      let budgetTitle = "📊 Budget Updated";

      const percentageUsed =
        Number(budget.percentageUsed) || 0;

      if (percentageUsed >= 100) {
        budgetSeverity = "high";
        budgetTitle = "🚨 Budget Exceeded";
      } else if (percentageUsed >= 80) {
        budgetSeverity = "medium";
        budgetTitle = "⚠️ Budget Almost Used";
      }

      const notifications =
        await Notification.create(
          [
            {
              userEmail: normalizedEmail,

              userId,

              title: budgetTitle,

              message:
                `${category} budget: spent RWF ` +
                `${Number(budget.spentAmount).toLocaleString()} ` +
                `of RWF ` +
                `${Number(budget.allocatedAmount).toLocaleString()}. ` +
                `Remaining: RWF ` +
                `${Number(budget.remainingAmount).toLocaleString()}.`,

              type: "budget",

              severity: budgetSeverity,

              isRead: false,

              relatedId: budget._id,

              relatedType: "budget",

              actionLink:
                `/budgets/${budget._id}`,

              metadata: {
                budgetId: budget._id,

                expenseId: expense._id,

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
            },
          ],
          {
            session,
          }
        );

      budgetNotification = notifications[0];
    }

    // ========================================================
    // COMMIT
    // ========================================================

    await session.commitTransaction();

    // ========================================================
    // RESPONSE BALANCES
    // ========================================================

    const remainingIncome =
      totalIncome - incomeUsed;

    const remainingSavings =
      totalSavings - savingsUsed;

    const remainingTotal =
      remainingIncome + remainingSavings;

    return res.status(201).json({
      success: true,

      message: "Expense created successfully",

      data: expense,

      moneyUsed: {
        expenseAmount,
        incomeUsed,
        savingsUsed,
      },

      balances: {
        income: remainingIncome,
        savings: remainingSavings,
        total: remainingTotal,
      },

      budgetUpdated,

      budget: budget
        ? {
            id: budget._id,
            category: budget.category,
            allocatedAmount:
              budget.allocatedAmount,
            spentAmount:
              budget.spentAmount,
            remainingAmount:
              budget.remainingAmount,
            percentageUsed:
              budget.percentageUsed,
            status: budget.status,
            month: budget.month,
            year: budget.year,
          }
        : null,

      notifications: {
        expense: expenseNotification,
        budget: budgetNotification,
      },
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "❌ Create expense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create expense",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

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



// ============================================================
// GET ALL EXPENSES
// @route   GET /api/expenses/all
// @access  Public
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
    console.error("❌ Get all expenses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch all expenses",
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
