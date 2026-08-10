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
    return await Notification.create({
      userEmail: userEmail.toLowerCase().trim(),

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
      error.message,
    );

    return null;
  }
};

// ============================================================
// GET ALL BUDGETS
// ============================================================

exports.getBudgets = async (req, res) => {
  try {
    const {
      month,
      year,
      category,
      email,
    } = req.query;

    const query = {};

    if (email) {
      query.email = email.trim().toLowerCase();
    }

    if (month !== undefined) {
      query.month = Number(month);
    }

    if (year !== undefined) {
      query.year = Number(year);
    }

    if (
      category &&
      category.toLowerCase() !== "all"
    ) {
      query.category = category.trim().toLowerCase();
    }

    const budgets = await Budget.find(query).sort({
      year: -1,
      month: -1,
      category: 1,
    });

    const totalAllocated = budgets.reduce(
      (sum, budget) =>
        sum + Number(budget.allocatedAmount || 0),
      0,
    );

    const totalSpent = budgets.reduce(
      (sum, budget) =>
        sum + Number(budget.spentAmount || 0),
      0,
    );

    const totalRemaining =
      totalAllocated - totalSpent;

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
          percentage.toFixed(2),
        ),
      },
    });
  } catch (error) {
    console.error(
      "❌ Get budgets error:",
      error,
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

exports.getBudgetsByEmail = async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const budgets = await Budget.find({
      email: email.trim().toLowerCase(),
    }).sort({
      year: -1,
      month: -1,
    });

    return res.status(200).json({
      success: true,

      count: budgets.length,

      data: budgets,
    });
  } catch (error) {
    console.error(
      "❌ Get budgets by email error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message: "Failed to fetch budgets",

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

    if (
      !category ||
      allocatedAmount === undefined ||
      month === undefined ||
      year === undefined ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const amount = Number(allocatedAmount);

    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Allocated amount must be a valid number",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedCategory =
      category.trim().toLowerCase();

    const budget = await Budget.create({
      category: normalizedCategory,

      allocatedAmount: amount,

      spentAmount: 0,

      month: Number(month),

      year: Number(year),

      email: normalizedEmail,

      description:
        description?.trim() || "",
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

        relatedType: "Budget",

        actionLink: "/budgets",

        metadata: {
          budgetId: budget._id,

          category: normalizedCategory,

          allocatedAmount: amount,

          spentAmount: 0,

          remainingAmount: amount,
        },
      });

    return res.status(201).json({
      success: true,

      message: "Budget created successfully",

      budget,

      notification,
    });
  } catch (error) {
    console.error(
      "❌ CREATE BUDGET ERROR:",
      error,
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,

        message:
          "A budget already exists for this category, month, and year.",
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

exports.updateBudget = async (req, res) => {
  try {
    const budget =
      await Budget.findById(req.params.id);

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

    if (category !== undefined) {
      budget.category =
        category.trim().toLowerCase();
    }

    if (allocatedAmount !== undefined) {
      const amount = Number(allocatedAmount);

      if (!Number.isFinite(amount) || amount < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid allocated amount",
        });
      }

      budget.allocatedAmount = amount;
    }

    if (month !== undefined) {
      budget.month = Number(month);
    }

    if (year !== undefined) {
      budget.year = Number(year);
    }

    if (description !== undefined) {
      budget.description =
        description.trim();
    }

    // IMPORTANT:
    // Do NOT modify spentAmount here.
    //
    // spentAmount belongs to actual expenses.

    await budget.save();

    return res.status(200).json({
      success: true,

      message: "Budget updated successfully",

      data: budget,
    });
  } catch (error) {
    console.error(
      "❌ Update budget error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message: "Failed to update budget",

      error: error.message,
    });
  }
};

// ============================================================
// DELETE BUDGET
// ============================================================

exports.deleteBudget = async (req, res) => {
  try {
    const budget =
      await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    await budget.deleteOne();

    await createNotification({
      userEmail: budget.email,

      title: "🗑️ Budget Deleted",

      message:
        `${budget.category} budget was deleted.`,

      type: "budget",

      severity: "medium",

      relatedId: budget._id,

      relatedType: "Budget",

      actionLink: "/budgets",
    });

    return res.status(200).json({
      success: true,

      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error(
      "❌ Delete budget error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message: "Failed to delete budget",

      error: error.message,
    });
  }
};