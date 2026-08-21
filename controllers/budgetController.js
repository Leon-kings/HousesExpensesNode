// // ============================================================
// // CONTROLLERS / BUDGETCONTROLLER.JS
// // ============================================================

// const mongoose = require("mongoose");
// const Budget = require("../models/Budget");

// // ============================================================
// // NOTIFICATION HELPER
// // ============================================================

// const createNotification = require("../utils/createNotification");

// // ============================================================
// // GET ALL BUDGETS
// //
// // Supports:
// // ?userId=...
// // ?email=...
// // ?month=...
// // ?year=...
// // ?category=...
// //
// // userId is the primary ownership identifier.
// // Email remains supported for compatibility.
// // ============================================================

// exports.getBudgets = async (req, res) => {
//   try {
//     const { userId, email, month, year, category } = req.query;

//     const query = {};

//     // ----------------------------------------------------------
//     // USER ID
//     // ----------------------------------------------------------

//     if (userId) {
//       if (!mongoose.Types.ObjectId.isValid(userId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid userId",
//         });
//       }

//       query.userId = userId;
//     }

//     // ----------------------------------------------------------
//     // EMAIL
//     // ----------------------------------------------------------

//     if (email) {
//       query.email = String(email).trim().toLowerCase();
//     }

//     // ----------------------------------------------------------
//     // MONTH
//     // ----------------------------------------------------------

//     if (month !== undefined) {
//       const parsedMonth = Number(month);

//       if (
//         !Number.isInteger(parsedMonth) ||
//         parsedMonth < 0 ||
//         parsedMonth > 11
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Month must be an integer between 0 and 11",
//         });
//       }

//       query.month = parsedMonth;
//     }

//     // ----------------------------------------------------------
//     // YEAR
//     // ----------------------------------------------------------

//     if (year !== undefined) {
//       const parsedYear = Number(year);

//       if (!Number.isInteger(parsedYear) || parsedYear < 2000) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid year",
//         });
//       }

//       query.year = parsedYear;
//     }

//     // ----------------------------------------------------------
//     // CATEGORY
//     // ----------------------------------------------------------

//     if (category && String(category).toLowerCase() !== "all") {
//       query.category = String(category).trim().toLowerCase();
//     }

//     // ----------------------------------------------------------
//     // FIND BUDGETS
//     // ----------------------------------------------------------

//     const budgets = await Budget.find(query).sort({
//       year: -1,
//       month: -1,
//       category: 1,
//     });

//     // ----------------------------------------------------------
//     // SUMMARY
//     // ----------------------------------------------------------

//     const totalAllocated = budgets.reduce(
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

//     const percentage =
//       totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

//     return res.status(200).json({
//       success: true,

//       count: budgets.length,

//       data: budgets,

//       summary: {
//         totalAllocated,
//         totalSpent,
//         totalRemaining,
//         percentage: Number(percentage.toFixed(2)),
//       },
//     });
//   } catch (error) {
//     console.error("❌ Get budgets error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch budgets",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET BUDGETS BY EMAIL
// // ============================================================

// exports.getBudgetsByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const normalizedEmail = String(email).trim().toLowerCase();

//     const budgets = await Budget.find({
//       email: normalizedEmail,
//     }).sort({
//       year: -1,
//       month: -1,
//       category: 1,
//     });

//     return res.status(200).json({
//       success: true,
//       count: budgets.length,
//       data: budgets,
//     });
//   } catch (error) {
//     console.error("❌ Get budgets by email error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch budgets",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET BUDGETS BY USER ID
// // ============================================================

// exports.getBudgetsByUserId = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     const budgets = await Budget.find({
//       userId,
//     }).sort({
//       year: -1,
//       month: -1,
//       category: 1,
//     });

//     return res.status(200).json({
//       success: true,
//       count: budgets.length,
//       data: budgets,
//     });
//   } catch (error) {
//     console.error("❌ Get budgets by userId error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch budgets by userId",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET SINGLE BUDGET
// // ============================================================

// exports.getBudget = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid budget ID",
//       });
//     }

//     const budget = await Budget.findById(id);

//     if (!budget) {
//       return res.status(404).json({
//         success: false,
//         message: "Budget not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: budget,
//     });
//   } catch (error) {
//     console.error("❌ Get budget error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch budget",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // CREATE BUDGET
// // ============================================================

// exports.createBudget = async (req, res) => {
//   try {
//     const {
//       category,
//       allocatedAmount,
//       month,
//       year,
//       email,
//       description,
//       userId,
//     } = req.body;

//     // --------------------------------------------------------
//     // REQUIRED FIELDS
//     // --------------------------------------------------------

//     if (
//       !category ||
//       allocatedAmount === undefined ||
//       month === undefined ||
//       year === undefined ||
//       !email ||
//       !userId
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Category, allocatedAmount, month, year, email and userId are required",
//       });
//     }

//     // --------------------------------------------------------
//     // USER ID
//     // --------------------------------------------------------

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     // --------------------------------------------------------
//     // AMOUNT
//     // --------------------------------------------------------

//     const amount = Number(allocatedAmount);

//     if (!Number.isFinite(amount) || amount < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Allocated amount must be a valid number",
//       });
//     }

//     // --------------------------------------------------------
//     // MONTH
//     // --------------------------------------------------------

//     const parsedMonth = Number(month);

//     if (!Number.isInteger(parsedMonth) || parsedMonth < 0 || parsedMonth > 11) {
//       return res.status(400).json({
//         success: false,
//         message: "Month must be an integer between 0 and 11",
//       });
//     }

//     // --------------------------------------------------------
//     // YEAR
//     // --------------------------------------------------------

//     const parsedYear = Number(year);

//     if (!Number.isInteger(parsedYear) || parsedYear < 2000) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid year",
//       });
//     }

//     // --------------------------------------------------------
//     // NORMALIZE
//     // --------------------------------------------------------

//     const normalizedEmail = String(email).trim().toLowerCase();

//     const normalizedCategory = String(category).trim().toLowerCase();

//     const normalizedDescription = String(description || "").trim();

//     // --------------------------------------------------------
//     // CREATE BUDGET
//     //
//     // Budget model pre-save calculates:
//     // remainingAmount
//     // percentageUsed
//     // status
//     // --------------------------------------------------------

//     const budget = await Budget.create({
//       category: normalizedCategory,

//       allocatedAmount: amount,

//       spentAmount: 0,

//       month: parsedMonth,

//       year: parsedYear,

//       email: normalizedEmail,

//       userId,

//       description: normalizedDescription,
//     });

//     // --------------------------------------------------------
//     // NOTIFICATION
//     //
//     // Notification.js accepts:
//     // info | warning | alert
//     // --------------------------------------------------------

//     const notification = await createNotification({
//       userId,
//       email: normalizedEmail,

//       title: "📊 Budget Created",

//       message:
//         `${normalizedCategory} budget created ` +
//         `with RWF ${amount.toLocaleString()}.`,

//       type: "info",

//       referenceId: budget._id,

//       referenceModel: "Budget",
//     });

//     return res.status(201).json({
//       success: true,

//       message: "Budget created successfully",

//       data: budget,

//       notification,
//     });
//   } catch (error) {
//     console.error("❌ CREATE BUDGET ERROR:", error);

//     // --------------------------------------------------------
//     // DUPLICATE BUDGET
//     // --------------------------------------------------------

//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,

//         message:
//           "A budget already exists for this category, month, year, and user.",
//       });
//     }

//     // --------------------------------------------------------
//     // VALIDATION
//     // --------------------------------------------------------

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,

//         message: "Budget validation failed",

//         errors: Object.values(error.errors).map((err) => err.message),
//       });
//     }

//     return res.status(500).json({
//       success: false,

//       message: "Failed to create budget",

//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // UPDATE BUDGET
// // ============================================================

// exports.updateBudget = async (req, res) => {
//   try {
//     const budget = await Budget.findById(req.params.id);

//     if (!budget) {
//       return res.status(404).json({
//         success: false,
//         message: "Budget not found",
//       });
//     }

//     const { category, allocatedAmount, month, year, description } = req.body;

//     // --------------------------------------------------------
//     // CATEGORY
//     // --------------------------------------------------------

//     if (category !== undefined) {
//       if (typeof category !== "string" || !category.trim()) {
//         return res.status(400).json({
//           success: false,
//           message: "Category cannot be empty",
//         });
//       }

//       budget.category = category.trim().toLowerCase();
//     }

//     // --------------------------------------------------------
//     // ALLOCATED AMOUNT
//     // --------------------------------------------------------

//     if (allocatedAmount !== undefined) {
//       const amount = Number(allocatedAmount);

//       if (!Number.isFinite(amount) || amount < 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid allocated amount",
//         });
//       }

//       budget.allocatedAmount = amount;
//     }

//     // --------------------------------------------------------
//     // MONTH
//     // --------------------------------------------------------

//     if (month !== undefined) {
//       const parsedMonth = Number(month);

//       if (
//         !Number.isInteger(parsedMonth) ||
//         parsedMonth < 0 ||
//         parsedMonth > 11
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Month must be an integer between 0 and 11",
//         });
//       }

//       budget.month = parsedMonth;
//     }

//     // --------------------------------------------------------
//     // YEAR
//     // --------------------------------------------------------

//     if (year !== undefined) {
//       const parsedYear = Number(year);

//       if (!Number.isInteger(parsedYear) || parsedYear < 2000) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid year",
//         });
//       }

//       budget.year = parsedYear;
//     }

//     // --------------------------------------------------------
//     // DESCRIPTION
//     // --------------------------------------------------------

//     if (description !== undefined) {
//       budget.description = String(description || "").trim();
//     }

//     // --------------------------------------------------------
//     // IMPORTANT
//     //
//     // Do NOT modify:
//     // spentAmount
//     // userId
//     // email
//     //
//     // spentAmount belongs to expenses.
//     // Ownership should remain unchanged.
//     // --------------------------------------------------------

//     await budget.save();

//     // --------------------------------------------------------
//     // NOTIFICATION
//     // --------------------------------------------------------

//     const notification = await createNotification({
//       userId: budget.userId,

//       email: budget.email,

//       title: "📊 Budget Updated",

//       message: `${budget.category} budget was updated.`,

//       type: "info",

//       referenceId: budget._id,

//       referenceModel: "Budget",
//     });

//     return res.status(200).json({
//       success: true,

//       message: "Budget updated successfully",

//       data: budget,

//       notification,
//     });
//   } catch (error) {
//     console.error("❌ Update budget error:", error);

//     // --------------------------------------------------------
//     // DUPLICATE BUDGET
//     // --------------------------------------------------------

//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,

//         message:
//           "A budget already exists for this category, month, year, and user.",
//       });
//     }

//     // --------------------------------------------------------
//     // VALIDATION
//     // --------------------------------------------------------

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,

//         message: "Budget validation failed",

//         errors: Object.values(error.errors).map((err) => err.message),
//       });
//     }

//     return res.status(500).json({
//       success: false,

//       message: "Failed to update budget",

//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // DELETE BUDGET
// // ============================================================

// exports.deleteBudget = async (req, res) => {
//   try {
//     const budget = await Budget.findById(req.params.id);

//     if (!budget) {
//       return res.status(404).json({
//         success: false,
//         message: "Budget not found",
//       });
//     }

//     // --------------------------------------------------------
//     // SAVE INFORMATION BEFORE DELETE
//     // --------------------------------------------------------

//     const budgetId = budget._id;
//     const budgetEmail = budget.email;
//     const budgetUserId = budget.userId;
//     const budgetCategory = budget.category;

//     // --------------------------------------------------------
//     // DELETE
//     // --------------------------------------------------------

//     await budget.deleteOne();

//     // --------------------------------------------------------
//     // HISTORICAL NOTIFICATION
//     // --------------------------------------------------------

//     const notification = await createNotification({
//       userId: budgetUserId,

//       email: budgetEmail,

//       title: "🗑️ Budget Deleted",

//       message: `${budgetCategory} budget was deleted.`,

//       type: "warning",

//       referenceId: budgetId,

//       referenceModel: "Budget",
//     });

//     return res.status(200).json({
//       success: true,

//       message: "Budget deleted successfully",

//       notification,
//     });
//   } catch (error) {
//     console.error("❌ Delete budget error:", error);

//     return res.status(500).json({
//       success: false,

//       message: "Failed to delete budget",

//       error: error.message,
//     });
//   }
// };










// ============================================================
// CONTROLLERS / BUDGETCONTROLLER.JS
// ============================================================

const mongoose = require("mongoose");
const Budget = require("../models/Budget");

// ============================================================
// NOTIFICATION HELPER
// ============================================================

const createNotification = require("../utils/createNotification");

// ============================================================
// HELPERS
// ============================================================

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const normalizeCategory = (category) =>
  String(category || "")
    .trim()
    .toLowerCase();

const normalizeDescription = (description) =>
  String(description || "").trim();

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const parseWholeNumber = (value) => {
  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    !Number.isInteger(number)
  ) {
    return null;
  }

  return number;
};

const parseNonNegativeWholeNumber = (value) => {
  const number = parseWholeNumber(value);

  if (number === null || number < 0) {
    return null;
  }

  return number;
};

const parseMonth = (value) => {
  const month = Number(value);

  if (
    !Number.isInteger(month) ||
    month < 0 ||
    month > 11
  ) {
    return null;
  }

  return month;
};

const parseYear = (value) => {
  const year = Number(value);

  if (
    !Number.isInteger(year) ||
    year < 2000
  ) {
    return null;
  }

  return year;
};

// ============================================================
// GET ALL BUDGETS
//
// Supports:
//
// ?userId=...
// ?email=...
// ?month=...
// ?year=...
// ?category=...
//
// If no filters are supplied, ALL budgets are returned.
// ============================================================

exports.getBudgets = async (req, res) => {
  try {
    const {
      userId,
      email,
      month,
      year,
      category,
    } = req.query;

    const query = {};

    // --------------------------------------------------------
    // USER ID
    // --------------------------------------------------------

    if (userId !== undefined) {
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

    if (email !== undefined) {
      const normalizedEmail =
        normalizeEmail(email);

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Invalid email",
        });
      }

      query.email = normalizedEmail;
    }

    // --------------------------------------------------------
    // MONTH
    // --------------------------------------------------------

    if (month !== undefined) {
      const parsedMonth = parseMonth(month);

      if (parsedMonth === null) {
        return res.status(400).json({
          success: false,
          message:
            "Month must be an integer between 0 and 11",
        });
      }

      query.month = parsedMonth;
    }

    // --------------------------------------------------------
    // YEAR
    // --------------------------------------------------------

    if (year !== undefined) {
      const parsedYear = parseYear(year);

      if (parsedYear === null) {
        return res.status(400).json({
          success: false,
          message: "Invalid year",
        });
      }

      query.year = parsedYear;
    }

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (
      category !== undefined &&
      String(category).trim().toLowerCase() !== "all"
    ) {
      const normalizedCategory =
        normalizeCategory(category);

      if (!normalizedCategory) {
        return res.status(400).json({
          success: false,
          message: "Invalid category",
        });
      }

      query.category = normalizedCategory;
    }

    // --------------------------------------------------------
    // FIND
    // --------------------------------------------------------

    const budgets = await Budget.find(query).sort({
      year: -1,
      month: -1,
      category: 1,
    });

    // --------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------

    const totalAllocated =
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

    const percentage =
      totalAllocated > 0
        ? (totalSpent / totalAllocated) * 100
        : 0;

    return res.status(200).json({
      success: true,

      count: budgets.length,

      data: budgets,

      summary: {
        totalAllocated,
        totalSpent,
        totalRemaining,

        percentage: Number(
          percentage.toFixed(2)
        ),
      },
    });
  } catch (error) {
    console.error(
      "❌ Get budgets error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch budgets",
      error: error.message,
    });
  }
};

// ============================================================
// GET BUDGETS BY EMAIL
// ============================================================

exports.getBudgetsByEmail = async (
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

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    const budgets = await Budget.find({
      email: normalizedEmail,
    }).sort({
      year: -1,
      month: -1,
      category: 1,
    });

    return res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    console.error(
      "❌ Get budgets by email error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch budgets",
      error: error.message,
    });
  }
};

// ============================================================
// GET BUDGETS BY USER ID
// ============================================================

exports.getBudgetsByUserId = async (
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

    const budgets = await Budget.find({
      userId,
    }).sort({
      year: -1,
      month: -1,
      category: 1,
    });

    return res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    console.error(
      "❌ Get budgets by userId error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch budgets by userId",
      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE BUDGET
// ============================================================

exports.getBudget = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget ID",
      });
    }

    const budget =
      await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    console.error(
      "❌ Get budget error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch budget",
      error: error.message,
    });
  }
};

// ============================================================
// CREATE BUDGET
// ============================================================

// exports.createBudget = async (
//   req,
//   res
// ) => {
//   try {
//     const {
//       category,
//       allocatedAmount,
//       month,
//       year,
//       email,
//       description,
//       userId,
//     } = req.body;

//     // --------------------------------------------------------
//     // REQUIRED FIELDS
//     // --------------------------------------------------------

//     if (
//       !category ||
//       allocatedAmount === undefined ||
//       month === undefined ||
//       year === undefined ||
//       !email ||
//       !userId
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Category, allocatedAmount, month, year, email and userId are required",
//       });
//     }

//     // --------------------------------------------------------
//     // USER ID
//     // --------------------------------------------------------

//     if (!isValidObjectId(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     // --------------------------------------------------------
//     // CATEGORY
//     // --------------------------------------------------------

//     const normalizedCategory =
//       normalizeCategory(category);

//     if (!normalizedCategory) {
//       return res.status(400).json({
//         success: false,
//         message: "Category cannot be empty",
//       });
//     }

//     // --------------------------------------------------------
//     // AMOUNT
//     // --------------------------------------------------------

//     const amount =
//       parseNonNegativeWholeNumber(
//         allocatedAmount
//       );

//     if (amount === null) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Allocated amount must be a valid non-negative whole number",
//       });
//     }

//     // --------------------------------------------------------
//     // MONTH
//     // --------------------------------------------------------

//     const parsedMonth =
//       parseMonth(month);

//     if (parsedMonth === null) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Month must be an integer between 0 and 11",
//       });
//     }

//     // --------------------------------------------------------
//     // YEAR
//     // --------------------------------------------------------

//     const parsedYear =
//       parseYear(year);

//     if (parsedYear === null) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid year",
//       });
//     }

//     // --------------------------------------------------------
//     // EMAIL
//     // --------------------------------------------------------

//     const normalizedEmail =
//       normalizeEmail(email);

//     if (!normalizedEmail) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email",
//       });
//     }

//     // --------------------------------------------------------
//     // DESCRIPTION
//     // --------------------------------------------------------

//     const normalizedDescription =
//       normalizeDescription(
//         description
//       );

//     // --------------------------------------------------------
//     // DUPLICATE CHECK
//     //
//     // Matches the unique index:
//     //
//     // userId + category + month + year
//     // --------------------------------------------------------

//     const existingBudget =
//       await Budget.findOne({
//         userId,
//         category: normalizedCategory,
//         month: parsedMonth,
//         year: parsedYear,
//       });

//     if (existingBudget) {
//       return res.status(409).json({
//         success: false,
//         message:
//           "A budget already exists for this category, month, year, and user.",
//       });
//     }

//     // --------------------------------------------------------
//     // CREATE
//     // --------------------------------------------------------

//     const budget =
//       await Budget.create({
//         category:
//           normalizedCategory,

//         allocatedAmount:
//           amount,

//         spentAmount: 0,

//         month:
//           parsedMonth,

//         year:
//           parsedYear,

//         email:
//           normalizedEmail,

//         userId,

//         description:
//           normalizedDescription,
//       });

//     // --------------------------------------------------------
//     // NOTIFICATION
//     // --------------------------------------------------------

//     let notification = null;

//     try {
//       notification =
//         await createNotification({
//           userId,

//           email:
//             normalizedEmail,

//           title:
//             "📊 Budget Created",

//           message:
//             `${normalizedCategory} budget created ` +
//             `with RWF ${amount.toLocaleString()}.`,

//           type: "info",

//           referenceId:
//             budget._id,

//           referenceModel:
//             "Budget",
//         });
//     } catch (notificationError) {
//       console.error(
//         "⚠️ Budget notification failed:",
//         notificationError
//       );
//     }

//     return res.status(201).json({
//       success: true,

//       message:
//         "Budget created successfully",

//       data: budget,

//       notification,
//     });
//   } catch (error) {
//     console.error(
//       "❌ CREATE BUDGET ERROR:",
//       error
//     );

//     // --------------------------------------------------------
//     // DUPLICATE KEY
//     // --------------------------------------------------------

//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,

//         message:
//           "A budget already exists for this category, month, year, and user.",
//       });
//     }

//     // --------------------------------------------------------
//     // VALIDATION
//     // --------------------------------------------------------

//     if (
//       error.name ===
//       "ValidationError"
//     ) {
//       return res.status(400).json({
//         success: false,

//         message:
//           "Budget validation failed",

//         errors:
//           Object.values(
//             error.errors
//           ).map(
//             (err) =>
//               err.message
//           ),
//       });
//     }

//     return res.status(500).json({
//       success: false,

//       message:
//         "Failed to create budget",

//       error:
//         error.message,
//     });
//   }
// };

exports.createBudget = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      category,
      allocatedAmount,
      month,
      year,
      email,
      description,
      userId,
    } = req.body;

    // --------------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------------

    if (
      !category ||
      allocatedAmount === undefined ||
      month === undefined ||
      year === undefined ||
      !email ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Category, allocatedAmount, month, year, email and userId are required",
      });
    }

    // --------------------------------------------------------
    // USER ID
    // --------------------------------------------------------

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    const normalizedCategory =
      normalizeCategory(category);

    if (!normalizedCategory) {
      return res.status(400).json({
        success: false,
        message: "Category cannot be empty",
      });
    }

    // --------------------------------------------------------
    // AMOUNT
    // --------------------------------------------------------

    const amount =
      parseNonNegativeWholeNumber(
        allocatedAmount
      );

    if (amount === null) {
      return res.status(400).json({
        success: false,
        message:
          "Allocated amount must be a valid non-negative whole number",
      });
    }

    // --------------------------------------------------------
    // MONTH
    // --------------------------------------------------------

    const parsedMonth =
      parseMonth(month);

    if (parsedMonth === null) {
      return res.status(400).json({
        success: false,
        message:
          "Month must be an integer between 0 and 11",
      });
    }

    // --------------------------------------------------------
    // YEAR
    // --------------------------------------------------------

    const parsedYear =
      parseYear(year);

    if (parsedYear === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid year",
      });
    }

    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    const normalizedEmail =
      normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    // --------------------------------------------------------
    // DESCRIPTION
    // --------------------------------------------------------

    const normalizedDescription =
      normalizeDescription(description);

    // ========================================================
    // TRANSACTION
    // ========================================================

    let budget;
    let previousExpenses = [];
    let existingExpenseTotal = 0;

    await session.withTransaction(async () => {
      // ------------------------------------------------------
      // DUPLICATE CHECK
      // ------------------------------------------------------

      const existingBudget =
        await Budget.findOne({
          userId,
          category: normalizedCategory,
          month: parsedMonth,
          year: parsedYear,
        }).session(session);

      if (existingBudget) {
        const error =
          new Error(
            "A budget already exists for this category, month, year, and user."
          );

        error.statusCode = 409;

        throw error;
      }

      // ------------------------------------------------------
      // DATE RANGE
      //
      // Month is 0-11
      // ------------------------------------------------------

      const startDate = new Date(
        parsedYear,
        parsedMonth,
        1,
        0,
        0,
        0,
        0
      );

      const endDate = new Date(
        parsedYear,
        parsedMonth + 1,
        1,
        0,
        0,
        0,
        0
      );

      // ------------------------------------------------------
      // FIND EXPENSES CREATED BEFORE THE BUDGET
      //
      // Match:
      // userId
      // category
      // email
      // expense date month
      // expense date year
      // type = expense
      // ------------------------------------------------------

      previousExpenses =
        await Expense.find({
          userId,
          email: normalizedEmail,
          category: normalizedCategory,
          type: "expense",
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        }).session(session);

      // ------------------------------------------------------
      // CALCULATE ALREADY USED MONEY
      // ------------------------------------------------------

      existingExpenseTotal =
        previousExpenses.reduce(
          (total, expense) => {
            return (
              total +
              Number(expense.amount || 0)
            );
          },
          0
        );

      // ------------------------------------------------------
      // CALCULATE BUDGET VALUES
      // ------------------------------------------------------

      const spentAmount =
        existingExpenseTotal;

      const remainingAmount =
        amount - spentAmount;

      let percentageUsed = 0;

      if (amount > 0) {
        percentageUsed =
          (spentAmount / amount) * 100;
      }

      // ------------------------------------------------------
      // DETERMINE STATUS
      // ------------------------------------------------------

      let status = "on-track";

      if (amount === 0) {
        status =
          spentAmount > 0
            ? "over-budget"
            : "under-budget";
      } else if (
        spentAmount > amount
      ) {
        status = "over-budget";
      } else if (
        spentAmount >= amount * 0.8
      ) {
        status =
          "approaching-limit";
      } else {
        status = "on-track";
      }

      // ------------------------------------------------------
      // CREATE BUDGET
      // ------------------------------------------------------

      const createdBudgets =
        await Budget.create(
          [
            {
              category:
                normalizedCategory,

              allocatedAmount:
                amount,

              spentAmount:
                spentAmount,

              remainingAmount:
                remainingAmount,

              percentageUsed:
                percentageUsed,

              status:
                status,

              month:
                parsedMonth,

              year:
                parsedYear,

              email:
                normalizedEmail,

              userId,

              description:
                normalizedDescription,
            },
          ],
          {
            session,
          }
        );

      budget =
        createdBudgets[0];

      // ------------------------------------------------------
      // LINK OLD EXPENSES TO THE NEW BUDGET
      //
      // These expenses existed before the budget.
      // They now become part of the budget usage.
      // ------------------------------------------------------

      if (
        previousExpenses.length > 0
      ) {
        await Expense.updateMany(
          {
            _id: {
              $in:
                previousExpenses.map(
                  (expense) =>
                    expense._id
                ),
            },
          },
          {
            $set: {
              budgetId:
                budget._id,

              budgetAmountUsed:
                // Each matching expense uses
                // its own amount from this budget.
                undefined,
            },
          },
          {
            session,
          }
        );

        // ----------------------------------------------------
        // IMPORTANT:
        // We cannot use undefined in MongoDB as a useful
        // stored value. Update budgetAmountUsed separately.
        // ----------------------------------------------------

        for (
          const expense of previousExpenses
        ) {
          await Expense.updateOne(
            {
              _id:
                expense._id,
            },
            {
              $set: {
                budgetId:
                  budget._id,

                budgetAmountUsed:
                  Number(
                    expense.amount || 0
                  ),
              },
            },
            {
              session,
            }
          );
        }
      }
    });

    // ========================================================
    // NOTIFICATION
    // ========================================================

    let notification = null;

    try {
      notification =
        await createNotification({
          userId,

          email:
            normalizedEmail,

          title:
            "📊 Budget Created",

          message:
            `${normalizedCategory} budget created ` +
            `with RWF ${amount.toLocaleString()}. ` +
            `Existing expenses of RWF ` +
            `${existingExpenseTotal.toLocaleString()} ` +
            `were automatically included.`,

          type: "info",

          referenceId:
            budget._id,

          referenceModel:
            "Budget",
        });
    } catch (notificationError) {
      console.error(
        "⚠️ Budget notification failed:",
        notificationError
      );
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,

      message:
        "Budget created successfully",

      data: budget,

      budgetSummary: {
        allocatedAmount:
          Number(
            budget.allocatedAmount || 0
          ),

        spentAmount:
          Number(
            budget.spentAmount || 0
          ),

        remainingAmount:
          Number(
            budget.remainingAmount || 0
          ),

        percentageUsed:
          Number(
            budget.percentageUsed || 0
          ),

        status:
          budget.status,

        previousExpensesCount:
          previousExpenses.length,

        previousExpensesAmount:
          existingExpenseTotal,
      },

      notification,
    });
  } catch (error) {
    console.error(
      "❌ CREATE BUDGET ERROR:",
      error
    );

    // --------------------------------------------------------
    // DUPLICATE BUDGET
    // --------------------------------------------------------

    if (
      error.statusCode === 409 ||
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,

        message:
          "A budget already exists for this category, month, year, and user.",
      });
    }

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Budget validation failed",

        errors:
          Object.values(
            error.errors
          ).map(
            (err) =>
              err.message
          ),
      });
    }

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to create budget",
    });
  } finally {
    await session.endSession();
  }
};

// ============================================================
// UPDATE BUDGET
//
// IMPORTANT:
//
// This controller does NOT modify:
//
// - spentAmount
// - remainingAmount
// - percentageUsed
// - status
//
// Those values are controlled by the Expense system.
//
// It also does NOT allow changing:
//
// - userId
// - email
//
// This prevents ownership from accidentally changing.
// ============================================================

exports.updateBudget = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // ID
    // --------------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget ID",
      });
    }

    // --------------------------------------------------------
    // FIND
    // --------------------------------------------------------

    const budget =
      await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    const {
      category,
      allocatedAmount,
      month,
      year,
      description,
    } = req.body;

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (category !== undefined) {
      if (
        typeof category !==
          "string" ||
        !category.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Category cannot be empty",
        });
      }

      budget.category =
        normalizeCategory(
          category
        );
    }

    // --------------------------------------------------------
    // ALLOCATED AMOUNT
    // --------------------------------------------------------

    if (
      allocatedAmount !==
      undefined
    ) {
      const amount =
        parseNonNegativeWholeNumber(
          allocatedAmount
        );

      if (amount === null) {
        return res.status(400).json({
          success: false,
          message:
            "Allocated amount must be a valid non-negative whole number",
        });
      }

      budget.allocatedAmount =
        amount;
    }

    // --------------------------------------------------------
    // MONTH
    // --------------------------------------------------------

    if (month !== undefined) {
      const parsedMonth =
        parseMonth(month);

      if (parsedMonth === null) {
        return res.status(400).json({
          success: false,
          message:
            "Month must be an integer between 0 and 11",
        });
      }

      budget.month =
        parsedMonth;
    }

    // --------------------------------------------------------
    // YEAR
    // --------------------------------------------------------

    if (year !== undefined) {
      const parsedYear =
        parseYear(year);

      if (parsedYear === null) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid year",
        });
      }

      budget.year =
        parsedYear;
    }

    // --------------------------------------------------------
    // DESCRIPTION
    // --------------------------------------------------------

    if (
      description !==
      undefined
    ) {
      budget.description =
        normalizeDescription(
          description
        );
    }

    // --------------------------------------------------------
    // IMPORTANT
    //
    // NEVER DO:
    //
    // budget.spentAmount = 0
    //
    // The current spent amount must remain intact.
    // --------------------------------------------------------

    await budget.save();

    // --------------------------------------------------------
    // NOTIFICATION
    // --------------------------------------------------------

    let notification = null;

    try {
      notification =
        await createNotification({
          userId:
            budget.userId,

          email:
            budget.email,

          title:
            "📊 Budget Updated",

          message:
            `${budget.category} budget was updated.`,

          type: "info",

          referenceId:
            budget._id,

          referenceModel:
            "Budget",
        });
    } catch (notificationError) {
      console.error(
        "⚠️ Budget update notification failed:",
        notificationError
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Budget updated successfully",

      data: budget,

      notification,
    });
  } catch (error) {
    console.error(
      "❌ Update budget error:",
      error
    );

    // --------------------------------------------------------
    // DUPLICATE
    // --------------------------------------------------------

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,

        message:
          "A budget already exists for this category, month, year, and user.",
      });
    }

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Budget validation failed",

        errors:
          Object.values(
            error.errors
          ).map(
            (err) =>
              err.message
          ),
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Failed to update budget",

      error:
        error.message,
    });
  }
};

// ============================================================
// DELETE BUDGET
//
// IMPORTANT:
//
// Deleting a budget does NOT delete expenses.
//
// Expense records remain historical records.
// ============================================================

exports.deleteBudget = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // ID
    // --------------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget ID",
      });
    }

    // --------------------------------------------------------
    // FIND
    // --------------------------------------------------------

    const budget =
      await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // --------------------------------------------------------
    // SAVE INFORMATION
    // --------------------------------------------------------

    const budgetId =
      budget._id;

    const budgetEmail =
      budget.email;

    const budgetUserId =
      budget.userId;

    const budgetCategory =
      budget.category;

    // --------------------------------------------------------
    // DELETE
    // --------------------------------------------------------

    await budget.deleteOne();

    // --------------------------------------------------------
    // NOTIFICATION
    // --------------------------------------------------------

    let notification = null;

    try {
      notification =
        await createNotification({
          userId:
            budgetUserId,

          email:
            budgetEmail,

          title:
            "🗑️ Budget Deleted",

          message:
            `${budgetCategory} budget was deleted.`,

          type: "warning",

          referenceId:
            budgetId,

          referenceModel:
            "Budget",
        });
    } catch (notificationError) {
      console.error(
        "⚠️ Budget deletion notification failed:",
        notificationError
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Budget deleted successfully",

      notification,
    });
  } catch (error) {
    console.error(
      "❌ Delete budget error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to delete budget",

      error:
        error.message,
    });
  }
};

