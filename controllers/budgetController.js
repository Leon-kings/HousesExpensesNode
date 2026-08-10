// const Budget = require("../models/Budget");
// const Income = require("../models/Income");
// const Notification = require("../models/Notification");

// // Create notification helper
// const createNotification = async (
//   email,
//   title,
//   message,
//   type = "info",
//   severity = "low",
//   relatedId = null,
//   relatedModel = null,
// ) => {
//   try {
//     return await Notification.create({
//       email: email.toLowerCase(),
//       title,
//       message,
//       type,
//       severity,
//       relatedId,
//       relatedModel,
//     });
//   } catch (error) {
//     console.error("Notification creation failed:", error.message);

//     return null;
//   }
// };

// // GET ALL BUDGETS


// exports.getBudgets = async (req, res) => {
//   try {
//     const {
//       month,
//       year,
//       category,
//       email,
//     } = req.query;

//     // ============================================================
//     // BUILD QUERY
//     // ============================================================
//     const query = {};

//     if (email) {
//       query.email = email
//         .toLowerCase()
//         .trim();
//     }

//     if (month !== undefined) {
//       query.month = Number(month);
//     }

//     if (year !== undefined) {
//       query.year = Number(year);
//     }

//     if (
//       category &&
//       category.toLowerCase() !== "all"
//     ) {
//       query.category = category
//         .toLowerCase()
//         .trim();
//     }

//     // ============================================================
//     // FETCH BUDGETS
//     // ============================================================
//     const budgets = await Budget.find(query).sort({
//       year: -1,
//       month: -1,
//     });

//     // ============================================================
//     // CALCULATE SUMMARY
//     // ============================================================
//     const totalAllocated = budgets.reduce(
//       (sum, budget) =>
//         sum +
//         Number(
//           budget.allocatedAmount || 0
//         ),
//       0
//     );

//     const totalSpent = budgets.reduce(
//       (sum, budget) =>
//         sum +
//         Number(
//           budget.spentAmount || 0
//         ),
//       0
//     );

//     const totalRemaining =
//       totalAllocated - totalSpent;

//     const percentage =
//       totalAllocated > 0
//         ? (totalSpent /
//             totalAllocated) *
//           100
//         : 0;

//     // ============================================================
//     // RESPONSE
//     // ============================================================
//     return res.status(200).json({
//       success: true,

//       count: budgets.length,

//       data: budgets,

//       summary: {
//         totalAllocated,

//         totalSpent,

//         totalRemaining,

//         percentage:
//           Number(percentage.toFixed(2)),
//       },
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get budgets error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,

//       message: "Failed to fetch budgets",

//       error: error.message,
//     });
//   }
// };

// // GET BUDGETS BY EMAIL
// exports.getBudgetsByEmail = async (req, res) => {
//   try {
//     const email = req.params.email;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email required",
//       });
//     }

//     const budgets = await Budget.find({
//       email: email.toLowerCase(),
//     }).sort({
//       year: -1,
//       month: -1,
//     });

//     res.json({
//       success: true,

//       count: budgets.length,

//       data: budgets,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,

//       message: error.message,
//     });
//   }
// };

// // CREATE BUDGET

// exports.createBudget = async (req, res) => {
//   try {
//     const { category, allocatedAmount, month, year, email, description } =
//       req.body;

//     if (
//       !category ||
//       allocatedAmount === undefined ||
//       month === undefined ||
//       year === undefined ||
//       !email
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const budget = await Budget.create({
//       category,
//       allocatedAmount: Number(allocatedAmount),
//       month: Number(month),
//       year: Number(year),
//       email: email.toLowerCase(),
//     });

//     res.status(201).json({
//       success: true,
//       message: "Budget created successfully",
//       budget,
//     });
//   } catch (error) {
//     console.log("==============================");
//     console.log("CREATE BUDGET ERROR");
//     console.log("Error Name:", error.name);
//     console.log("Error Message:", error.message);
//     console.log("Stack Trace:");
//     console.log(error.stack);
//     console.log("==============================");

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // UPDATE BUDGET

// exports.updateBudget = async (req, res) => {
//   try {
//     const budget = await Budget.findById(req.params.id);

//     if (!budget) {
//       return res.status(404).json({
//         success: false,

//         message: "Budget not found",
//       });
//     }

//     const updated = await Budget.findByIdAndUpdate(
//       req.params.id,

//       req.body,

//       {
//         new: true,
//         runValidators: true,
//       },
//     );

//     res.json({
//       success: true,

//       data: updated,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,

//       message: error.message,
//     });
//   }
// };

// // DELETE BUDGET

// exports.deleteBudget = async (req, res) => {
//   try {
//     const budget = await Budget.findById(req.params.id);

//     if (!budget) {
//       return res.status(404).json({
//         success: false,

//         message: "Budget not found",
//       });
//     }

//     await budget.deleteOne();

//     await createNotification(
//       budget.email,

//       "🗑 Budget Deleted",

//       `${budget.category} budget deleted`,

//       "warning",

//       "medium",
//     );

//     res.json({
//       success: true,

//       message: "Budget deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,

//       message: error.message,
//     });
//   }
// };

// function getMonthName(month) {
//   const months = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   return months[month] || "";
// }
















// const Budget = require("../models/Budget");
// const Notification = require("../models/Notification");

// // ============================================================
// // CREATE NOTIFICATION
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
// }) => {
//   try {
//     return await Notification.create({
//       userEmail: userEmail.toLowerCase().trim(),

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
//     });
//   } catch (error) {
//     console.error(
//       "❌ Notification creation failed:",
//       error.message,
//     );

//     return null;
//   }
// };

// // ============================================================
// // GET ALL BUDGETS
// // ============================================================

// exports.getBudgets = async (req, res) => {
//   try {
//     const {
//       month,
//       year,
//       category,
//       email,
//     } = req.query;

//     const query = {};

//     if (email) {
//       query.email = email.trim().toLowerCase();
//     }

//     if (month !== undefined) {
//       query.month = Number(month);
//     }

//     if (year !== undefined) {
//       query.year = Number(year);
//     }

//     if (
//       category &&
//       category.toLowerCase() !== "all"
//     ) {
//       query.category = category.trim().toLowerCase();
//     }

//     const budgets = await Budget.find(query).sort({
//       year: -1,
//       month: -1,
//       category: 1,
//     });

//     const totalAllocated = budgets.reduce(
//       (sum, budget) =>
//         sum + Number(budget.allocatedAmount || 0),
//       0,
//     );

//     const totalSpent = budgets.reduce(
//       (sum, budget) =>
//         sum + Number(budget.spentAmount || 0),
//       0,
//     );

//     const totalRemaining =
//       totalAllocated - totalSpent;

//     const percentage =
//       totalAllocated > 0
//         ? (totalSpent / totalAllocated) * 100
//         : 0;

//     return res.status(200).json({
//       success: true,

//       count: budgets.length,

//       data: budgets,

//       summary: {
//         totalAllocated,

//         totalSpent,

//         totalRemaining,

//         percentage: Number(
//           percentage.toFixed(2),
//         ),
//       },
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get budgets error:",
//       error,
//     );

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
//     const email = req.params.email;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email required",
//       });
//     }

//     const budgets = await Budget.find({
//       email: email.trim().toLowerCase(),
//     }).sort({
//       year: -1,
//       month: -1,
//     });

//     return res.status(200).json({
//       success: true,

//       count: budgets.length,

//       data: budgets,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Get budgets by email error:",
//       error,
//     );

//     return res.status(500).json({
//       success: false,

//       message: "Failed to fetch budgets",

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

//     if (
//       !category ||
//       allocatedAmount === undefined ||
//       month === undefined ||
//       year === undefined ||
//       !email
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const amount = Number(allocatedAmount);

//     if (!Number.isFinite(amount) || amount < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Allocated amount must be a valid number",
//       });
//     }

//     const normalizedEmail =
//       email.trim().toLowerCase();

//     const normalizedCategory =
//       category.trim().toLowerCase();

//     const budget = await Budget.create({
//       category: normalizedCategory,

//       allocatedAmount: amount,

//       spentAmount: 0,

//       month: Number(month),

//       year: Number(year),

//       email: normalizedEmail,

//       description:
//         description?.trim() || "",
//     });

//     // ========================================================
//     // BUDGET CREATION NOTIFICATION
//     // ========================================================

//     const notification =
//       await createNotification({
//         userEmail: normalizedEmail,

//         userId,

//         title: "📊 Budget Created",

//         message:
//           `${normalizedCategory} budget created with ` +
//           `RWF ${amount.toLocaleString()}.`,

//         type: "budget",

//         severity: "low",

//         relatedId: budget._id,

//         relatedType: "Budget",

//         actionLink: "/budgets",

//         metadata: {
//           budgetId: budget._id,

//           category: normalizedCategory,

//           allocatedAmount: amount,

//           spentAmount: 0,

//           remainingAmount: amount,
//         },
//       });

//     return res.status(201).json({
//       success: true,

//       message: "Budget created successfully",

//       budget,

//       notification,
//     });
//   } catch (error) {
//     console.error(
//       "❌ CREATE BUDGET ERROR:",
//       error,
//     );

//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,

//         message:
//           "A budget already exists for this category, month, and year.",
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
//     const budget =
//       await Budget.findById(req.params.id);

//     if (!budget) {
//       return res.status(404).json({
//         success: false,
//         message: "Budget not found",
//       });
//     }

//     const {
//       category,
//       allocatedAmount,
//       month,
//       year,
//       description,
//     } = req.body;

//     if (category !== undefined) {
//       budget.category =
//         category.trim().toLowerCase();
//     }

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

//     if (month !== undefined) {
//       budget.month = Number(month);
//     }

//     if (year !== undefined) {
//       budget.year = Number(year);
//     }

//     if (description !== undefined) {
//       budget.description =
//         description.trim();
//     }

//     // IMPORTANT:
//     // Do NOT modify spentAmount here.
//     //
//     // spentAmount belongs to actual expenses.

//     await budget.save();

//     return res.status(200).json({
//       success: true,

//       message: "Budget updated successfully",

//       data: budget,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Update budget error:",
//       error,
//     );

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
//     const budget =
//       await Budget.findById(req.params.id);

//     if (!budget) {
//       return res.status(404).json({
//         success: false,
//         message: "Budget not found",
//       });
//     }

//     await budget.deleteOne();

//     await createNotification({
//       userEmail: budget.email,

//       title: "🗑️ Budget Deleted",

//       message:
//         `${budget.category} budget was deleted.`,

//       type: "budget",

//       severity: "medium",

//       relatedId: budget._id,

//       relatedType: "Budget",

//       actionLink: "/budgets",
//     });

//     return res.status(200).json({
//       success: true,

//       message: "Budget deleted successfully",
//     });
//   } catch (error) {
//     console.error(
//       "❌ Delete budget error:",
//       error,
//     );

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
const Notification = require("../models/Notification");

// ============================================================
// CREATE NOTIFICATION
// ============================================================

const createNotification = async ({
  userEmail,
  userId = null,
  title,
  message,
  type = "info",
  severity = "low",
  relatedId = null,
  relatedType = null,
  actionLink = null,
  metadata = {},
}) => {
  try {
    if (!userEmail) {
      console.error(
        "❌ Notification creation failed: userEmail is required"
      );

      return null;
    }

    return await Notification.create({
      userEmail: userEmail
        .trim()
        .toLowerCase(),

      userId,

      title,

      message,

      type,

      severity,

      isRead: false,

      relatedId,

      relatedType,

      actionLink,

      metadata,
    });
  } catch (error) {
    console.error(
      "❌ Notification creation failed:",
      error.message
    );

    return null;
  }
};

// ============================================================
// GET ALL BUDGETS
//
// Supports:
// ?userId=...
// ?email=...
// ?month=...
// ?year=...
// ?category=...
//
// If userId is supplied, it is the primary ownership filter.
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

    // ----------------------------------------------------------
    // USER ID
    // ----------------------------------------------------------

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId",
        });
      }

      query.userId = userId;
    }

    // ----------------------------------------------------------
    // EMAIL
    //
    // Kept for compatibility.
    // ----------------------------------------------------------

    if (email) {
      query.email = email
        .trim()
        .toLowerCase();
    }

    // ----------------------------------------------------------
    // MONTH
    // ----------------------------------------------------------

    if (month !== undefined) {
      const parsedMonth = Number(month);

      if (
        !Number.isInteger(parsedMonth) ||
        parsedMonth < 0 ||
        parsedMonth > 11
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Month must be an integer between 0 and 11",
        });
      }

      query.month = parsedMonth;
    }

    // ----------------------------------------------------------
    // YEAR
    // ----------------------------------------------------------

    if (year !== undefined) {
      const parsedYear = Number(year);

      if (
        !Number.isInteger(parsedYear) ||
        parsedYear < 2000
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid year",
        });
      }

      query.year = parsedYear;
    }

    // ----------------------------------------------------------
    // CATEGORY
    // ----------------------------------------------------------

    if (
      category &&
      category.toLowerCase() !== "all"
    ) {
      query.category = category
        .trim()
        .toLowerCase();
    }

    // ----------------------------------------------------------
    // FIND BUDGETS
    // ----------------------------------------------------------

    const budgets = await Budget.find(query)
      .sort({
        year: -1,
        month: -1,
        category: 1,
      });

    // ----------------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------------

    const totalAllocated = budgets.reduce(
      (sum, budget) =>
        sum +
        Number(
          budget.allocatedAmount || 0
        ),
      0
    );

    const totalSpent = budgets.reduce(
      (sum, budget) =>
        sum +
        Number(
          budget.spentAmount || 0
        ),
      0
    );

    const totalRemaining = budgets.reduce(
      (sum, budget) =>
        sum +
        Number(
          budget.remainingAmount || 0
        ),
      0
    );

    const percentage =
      totalAllocated > 0
        ? (totalSpent /
            totalAllocated) *
          100
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
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

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
      !mongoose.Types.ObjectId.isValid(userId)
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
// CREATE BUDGET
// ============================================================

exports.createBudget = async (req, res) => {
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

    // ----------------------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // USER ID
    // ----------------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // ----------------------------------------------------------
    // AMOUNT
    // ----------------------------------------------------------

    const amount = Number(
      allocatedAmount
    );

    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Allocated amount must be a valid number",
      });
    }

    // ----------------------------------------------------------
    // MONTH
    // ----------------------------------------------------------

    const parsedMonth = Number(month);

    if (
      !Number.isInteger(parsedMonth) ||
      parsedMonth < 0 ||
      parsedMonth > 11
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Month must be an integer between 0 and 11",
      });
    }

    // ----------------------------------------------------------
    // YEAR
    // ----------------------------------------------------------

    const parsedYear = Number(year);

    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid year",
      });
    }

    // ----------------------------------------------------------
    // NORMALIZE
    // ----------------------------------------------------------

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedCategory =
      category.trim().toLowerCase();

    const normalizedDescription =
      description?.trim() || "";

    // ----------------------------------------------------------
    // CREATE
    //
    // Budget model pre-save automatically calculates:
    // remainingAmount
    // percentageUsed
    // status
    // ----------------------------------------------------------

    const budget = await Budget.create({
      category: normalizedCategory,

      allocatedAmount: amount,

      spentAmount: 0,

      month: parsedMonth,

      year: parsedYear,

      email: normalizedEmail,

      userId,

      description:
        normalizedDescription,
    });

    // ========================================================
    // BUDGET CREATION NOTIFICATION
    // ========================================================

    const notification =
      await createNotification({
        userEmail: normalizedEmail,

        userId,

        title: "📊 Budget Created",

        message:
          `${normalizedCategory} budget created with ` +
          `RWF ${amount.toLocaleString()}.`,

        type: "budget",

        severity: "low",

        relatedId: budget._id,

        relatedType: "budget",

        actionLink: `/budgets/${budget._id}`,

        metadata: {
          budgetId: budget._id,

          category: normalizedCategory,

          allocatedAmount: amount,

          spentAmount:
            budget.spentAmount,

          remainingAmount:
            budget.remainingAmount,

          percentageUsed:
            budget.percentageUsed,

          status: budget.status,

          month: parsedMonth,

          year: parsedYear,
        },
      });

    return res.status(201).json({
      success: true,

      message:
        "Budget created successfully",

      budget,

      notification,
    });
  } catch (error) {
    console.error(
      "❌ CREATE BUDGET ERROR:",
      error
    );

    // ----------------------------------------------------------
    // DUPLICATE BUDGET
    // ----------------------------------------------------------

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,

        message:
          "A budget already exists for this category, month, year, and user.",
      });
    }

    // ----------------------------------------------------------
    // MONGOOSE VALIDATION
    // ----------------------------------------------------------

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Budget validation failed",

        errors: Object.values(
          error.errors
        ).map(
          (err) => err.message
        ),
      });
    }

    return res.status(500).json({
      success: false,

      message: "Failed to create budget",

      error: error.message,
    });
  }
};

// ============================================================
// UPDATE BUDGET
// ============================================================

exports.updateBudget = async (
  req,
  res
) => {
  try {
    const budget =
      await Budget.findById(
        req.params.id
      );

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

    // ----------------------------------------------------------
    // CATEGORY
    // ----------------------------------------------------------

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
        category
          .trim()
          .toLowerCase();
    }

    // ----------------------------------------------------------
    // ALLOCATED AMOUNT
    // ----------------------------------------------------------

    if (
      allocatedAmount !== undefined
    ) {
      const amount = Number(
        allocatedAmount
      );

      if (
        !Number.isFinite(amount) ||
        amount < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid allocated amount",
        });
      }

      budget.allocatedAmount =
        amount;
    }

    // ----------------------------------------------------------
    // MONTH
    // ----------------------------------------------------------

    if (month !== undefined) {
      const parsedMonth =
        Number(month);

      if (
        !Number.isInteger(
          parsedMonth
        ) ||
        parsedMonth < 0 ||
        parsedMonth > 11
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Month must be an integer between 0 and 11",
        });
      }

      budget.month =
        parsedMonth;
    }

    // ----------------------------------------------------------
    // YEAR
    // ----------------------------------------------------------

    if (year !== undefined) {
      const parsedYear =
        Number(year);

      if (
        !Number.isInteger(
          parsedYear
        ) ||
        parsedYear < 2000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid year",
        });
      }

      budget.year =
        parsedYear;
    }

    // ----------------------------------------------------------
    // DESCRIPTION
    // ----------------------------------------------------------

    if (
      description !== undefined
    ) {
      budget.description =
        String(
          description || ""
        ).trim();
    }

    // ----------------------------------------------------------
    // IMPORTANT:
    //
    // Do NOT modify:
    // spentAmount
    //
    // spentAmount belongs to
    // actual expenses.
    //
    // Do NOT modify:
    // userId
    // email
    //
    // Ownership should remain unchanged.
    // ----------------------------------------------------------

    await budget.save();

    // ========================================================
    // UPDATE NOTIFICATION
    // ========================================================

    const notification =
      await createNotification({
        userEmail:
          budget.email,

        userId:
          budget.userId,

        title:
          "📊 Budget Updated",

        message:
          `${budget.category} budget was updated.`,

        type: "budget",

        severity: "low",

        relatedId:
          budget._id,

        relatedType:
          "budget",

        actionLink:
          `/budgets/${budget._id}`,

        metadata: {
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

          month:
            budget.month,

          year:
            budget.year,
        },
      });

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

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,

        message:
          "A budget already exists for this category, month, year, and user.",
      });
    }

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Budget validation failed",

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
        "Failed to update budget",

      error: error.message,
    });
  }
};

// ============================================================
// DELETE BUDGET
// ============================================================

exports.deleteBudget = async (
  req,
  res
) => {
  try {
    const budget =
      await Budget.findById(
        req.params.id
      );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // ----------------------------------------------------------
    // SAVE INFORMATION BEFORE DELETE
    // ----------------------------------------------------------

    const budgetId =
      budget._id;

    const budgetEmail =
      budget.email;

    const budgetUserId =
      budget.userId;

    const budgetCategory =
      budget.category;

    // ----------------------------------------------------------
    // DELETE
    // ----------------------------------------------------------

    await budget.deleteOne();

    // ========================================================
    // DELETE NOTIFICATION
    // ========================================================

    const notification =
      await createNotification({
        userEmail:
          budgetEmail,

        userId:
          budgetUserId,

        title:
          "🗑️ Budget Deleted",

        message:
          `${budgetCategory} budget was deleted.`,

        type: "budget",

        severity: "medium",

        relatedId:
          budgetId,

        relatedType:
          "budget",

        actionLink:
          "/budgets",

        metadata: {
          budgetId,

          category:
            budgetCategory,
        },
      });

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

      error: error.message,
    });
  }
};