// const Budget = require('../models/Budget');
// const Income = require('../models/Income');
// const Notification = require('../models/IncameNotification');

// // Helper function to create notification
// const createNotification = async (email, title, message, type, severity = 'medium', relatedId = null, relatedModel = null) => {
//   try {
//     const notification = await Notification.create({
//       email,
//       title,
//       message,
//       type,
//       severity,
//       relatedId,
//       relatedModel,
//     });
//     return notification;
//   } catch (error) {
//     console.error('Failed to create notification:', error);
//     return null;
//   }
// };

// // @desc    Get all budgets
// // @route   GET /api/budgets
// // @access  Private
// exports.getBudgets = async (req, res) => {
//   try {
//     const { month, year, category } = req.query;

//     const query = {};

//     if (month !== undefined && month !== "") {
//       query.month = parseInt(month);
//     }

//     if (year) {
//       query.year = parseInt(year);
//     }

//     if (category && category !== "all") {
//       query.category = category;
//     }

//     const budgets = await Budget.find(query).sort({ category: 1 });

//     // Calculate totals
//     const totalAllocated = budgets.reduce(
//       (sum, b) => sum + b.allocatedAmount,
//       0
//     );

//     const totalSpent = budgets.reduce(
//       (sum, b) => sum + (b.spentAmount || 0),
//       0
//     );

//     const totalRemaining = totalAllocated - totalSpent;

//     const overallPercentage =
//       totalAllocated > 0
//         ? (totalSpent / totalAllocated) * 100
//         : 0;

//     res.status(200).json({
//       success: true,
//       count: budgets.length,
//       data: budgets,
//       summary: {
//         totalAllocated,
//         totalSpent,
//         totalRemaining,
//         overallPercentage,
//         status:
//           overallPercentage > 100
//             ? "over-budget"
//             : overallPercentage > 80
//             ? "approaching-limit"
//             : overallPercentage < 50 && totalSpent > 0
//             ? "under-budget"
//             : "on-track",
//       },
//     });
//   } catch (error) {
//     console.error("Get budgets error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch budgets",
//       error: error.message,
//     });
//   }
// };

// exports.getBudgetsByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const budgets = await Budget.find({
//       email: email.toLowerCase(),
//     }).sort({
//       year: -1,
//       month: -1,
//       createdAt: -1,
//     });

//     res.status(200).json({
//       success: true,
//       count: budgets.length,
//       data: budgets,
//     });
//   } catch (error) {
//     console.error("Get budgets by email error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to retrieve budgets",
//       error: error.message,
//     });
//   }
// };

// // @desc    Create budget
// // @route   POST /api/budgets
// // @access  Private
// // exports.createBudget = async (req, res) => {
// //   try {
// //     const { category, allocatedAmount, month, year, description, email } = req.body;

// //     if (!category || !allocatedAmount || month === undefined || !year || !email) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "All fields are required",
// //       });
// //     }

// //     // Check if budget already exists
// //     const existingBudget = await Budget.findOne({
// //       email: email.toLowerCase(),
// //       category,
// //       month: parseInt(month),
// //       year: parseInt(year),
// //     });

// //     if (existingBudget) {
// //       return res.status(400).json({
// //         success: false,
// //         message: `Budget for ${category} in ${getMonthName(month)} ${year} already exists`,
// //       });
// //     }

// //     // Calculate spent amount from existing incomes
// //     const incomes = await Income.find({
// //       email: email.toLowerCase(),
// //       category: category,
// //       date: {
// //         $gte: new Date(year, month, 1),
// //         $lt: new Date(year, month + 1, 1),
// //       },
// //     });

// //     const spentAmount = incomes.reduce((sum, inc) => sum + inc.amount, 0);

// //     const budget = await Budget.create({
// //       category,
// //       allocatedAmount,
// //       month: parseInt(month),
// //       year: parseInt(year),
// //       description: description || '',
// //       email: email.toLowerCase(),
// //       spentAmount: spentAmount,
// //     });

// //     // Check budget status and create notification
// //     let severity = 'low';
// //     let message = `You have set a ${category} budget of $${allocatedAmount.toFixed(2)} for ${getMonthName(month)} ${year}.`;

// //     if (budget.percentageUsed > 80) {
// //       severity = 'medium';
// //       message = `You have set a ${category} budget of $${allocatedAmount.toFixed(2)} but already spent $${spentAmount.toFixed(2)} (${budget.percentageUsed.toFixed(1)}%). Consider adjusting your budget.`;
// //     }

// //     await createNotification(
// //       email,
// //       `📊 Budget Set: ${category}`,
// //       message,
// //       'info',
// //       severity,
// //       budget._id,
// //       'Budget'
// //     );

// //     res.status(201).json({
// //       success: true,
// //       message: "Budget created successfully",
// //       data: budget,
// //     });
// //   } catch (error) {
// //     console.error('Create budget error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Failed to create budget",
// //       error: error.message,
// //     });
// //   }
// // };

// exports.createBudget = async (req, res) => {
//   try {
//     let {
//       category,
//       allocatedAmount,
//       month,
//       year,
//       description,
//       email,
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
//         message: "All fields are required.",
//       });
//     }

//     // Convert values
//     allocatedAmount = Number(allocatedAmount);
//     month = Number(month);
//     year = Number(year);

//     if (isNaN(allocatedAmount) || allocatedAmount < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Allocated amount must be a valid number.",
//       });
//     }

//     email = email.toLowerCase();

//     // Check existing budget
//     const existingBudget = await Budget.findOne({
//       email,
//       category,
//       month,
//       year,
//     });

//     if (existingBudget) {
//       return res.status(400).json({
//         success: false,
//         message: `Budget for ${category} in ${getMonthName(month)} ${year} already exists.`,
//       });
//     }

//     // Calculate spent amount
//     const incomes = await Income.find({
//       email,
//       category,
//       date: {
//         $gte: new Date(year, month, 1),
//         $lt: new Date(year, month + 1, 1),
//       },
//     });

//     const spentAmount = incomes.reduce(
//       (sum, income) => sum + Number(income.amount || 0),
//       0
//     );

//     // Create budget
//     const budget = await Budget.create({
//       category,
//       allocatedAmount,
//       month,
//       year,
//       description: description || "",
//       email,
//       spentAmount,
//     });

//     // Prepare notification
//     let severity = "low";

//     let message = `You have set a ${category} budget of $${allocatedAmount.toFixed(
//       2
//     )} for ${getMonthName(month)} ${year}.`;

//     if (budget.percentageUsed >= 80) {
//       severity = "medium";

//       message = `You have set a ${category} budget of $${allocatedAmount.toFixed(
//         2
//       )} but have already spent $${spentAmount.toFixed(
//         2
//       )} (${budget.percentageUsed.toFixed(
//         1
//       )}%). Consider increasing your budget.`;
//     }

//     // Don't let notification failure stop budget creation
//     try {
//       await createNotification(
//         email,
//         `📊 Budget Set: ${category}`,
//         message,
//         "info",
//         severity,
//         budget._id,
//         "Budget"
//       );
//     } catch (notificationError) {
//       console.error(
//         "Notification Error:",
//         notificationError.stack || notificationError
//       );
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Budget created successfully.",
//       data: budget,
//     });
//   } catch (error) {
//     console.error("Create Budget Error:");
//     console.error(error.stack || error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create budget.",
//       error: error.message,
//     });
//   }
// };

// // @desc    Update budget
// // @route   PUT /api/budgets/:id
// // @access  Private
// exports.updateBudget = async (req, res) => {
//   try {
//     const budget = await Budget.findById(req.params.id);

//     if (!budget) {
//       return res.status(404).json({
//         success: false,
//         message: "Budget not found",
//       });
//     }

//     const updatedBudget = await Budget.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     // Check if budget is over
//     if (updatedBudget.percentageUsed > 100) {
//       await createNotification(
//         budget.email,
//         `⚠️ Budget Alert: ${updatedBudget.category} Over Budget`,
//         `You have exceeded your ${updatedBudget.category} budget. Spent: $${updatedBudget.spentAmount.toFixed(2)} vs Budget: $${updatedBudget.allocatedAmount.toFixed(2)}`,
//         'budget_alert',
//         'high',
//         updatedBudget._id,
//         'Budget'
//       );
//     }

//     res.status(200).json({
//       success: true,
//       message: "Budget updated successfully",
//       data: updatedBudget,
//     });
//   } catch (error) {
//     console.error('Update budget error:', error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update budget",
//       error: error.message,
//     });
//   }
// };

// // @desc    Delete budget
// // @route   DELETE /api/budgets/:id
// // @access  Private
// exports.deleteBudget = async (req, res) => {
//   try {
//     const budget = await Budget.findById(req.params.id);

//     if (!budget) {
//       return res.status(404).json({
//         success: false,
//         message: "Budget not found",
//       });
//     }

//     await Budget.findByIdAndDelete(req.params.id);

//     await createNotification(
//       budget.email,
//       `🗑️ Budget Deleted: ${budget.category}`,
//       `Your ${budget.category} budget for ${getMonthName(budget.month)} ${budget.year} has been deleted.`,
//       'warning',
//       'medium'
//     );

//     res.status(200).json({
//       success: true,
//       message: "Budget deleted successfully",
//     });
//   } catch (error) {
//     console.error('Delete budget error:', error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete budget",
//       error: error.message,
//     });
//   }
// };

// // Helper function
// function getMonthName(month) {
//   const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//   return months[month] || '';
// }

const Budget = require("../models/Budget");
const Income = require("../models/Income");
const Notification = require("../models/IncomeNotification");

// Create notification helper
const createNotification = async (
  email,
  title,
  message,
  type = "info",
  severity = "low",
  relatedId = null,
  relatedModel = null,
) => {
  try {
    return await Notification.create({
      email: email.toLowerCase(),
      title,
      message,
      type,
      severity,
      relatedId,
      relatedModel,
    });
  } catch (error) {
    console.error("Notification creation failed:", error.message);

    return null;
  }
};

// GET ALL BUDGETS
exports.getBudgets = async (req, res) => {
  try {
    const { month, year, category, email } = req.query;

    const query = {};

    if (email) {
      query.email = email.toLowerCase();
    }

    if (month !== undefined) {
      query.month = Number(month);
    }

    if (year) {
      query.year = Number(year);
    }

    if (category && category !== "all") {
      query.category = category;
    }

    const budgets = await Budget.find(query).sort({
      year: -1,
      month: -1,
    });

    const totalAllocated = budgets.reduce(
      (sum, b) => sum + Number(b.allocatedAmount || 0),
      0,
    );

    const totalSpent = budgets.reduce(
      (sum, b) => sum + Number(b.spentAmount || 0),
      0,
    );

    const totalRemaining = totalAllocated - totalSpent;

    res.status(200).json({
      success: true,

      count: budgets.length,

      data: budgets,

      summary: {
        totalAllocated,
        totalSpent,
        totalRemaining,

        percentage: totalAllocated
          ? ((totalSpent / totalAllocated) * 100).toFixed(2)
          : 0,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch budgets",
      error: error.message,
    });
  }
};

// GET BUDGETS BY EMAIL
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
      email: email.toLowerCase(),
    }).sort({
      year: -1,
      month: -1,
    });

    res.json({
      success: true,

      count: budgets.length,

      data: budgets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// CREATE BUDGET

// exports.createBudget = async (req, res) => {
//   try {
//     let { category, allocatedAmount, month, year, description, email } =
//       req.body;

//     if (
//       !category ||
//       allocatedAmount === undefined ||
//       month === undefined ||
//       !year ||
//       !email
//     ) {
//       return res.status(400).json({
//         success: false,

//         message: "All fields are required",
//       });
//     }

//     allocatedAmount = Number(allocatedAmount);
//     month = Number(month);
//     year = Number(year);

//     email = email.toLowerCase();

//     const exists = await Budget.findOne({
//       email,

//       category,

//       month,

//       year,
//     });

//     if (exists) {
//       return res.status(400).json({
//         success: false,

//         message: "Budget already exists",
//       });
//     }

//     const incomes = await Income.find({
//       email,

//       category,

//       date: {
//         $gte: new Date(year, month, 1),

//         $lt: new Date(year, month + 1, 1),
//       },
//     });

//     const spentAmount = incomes.reduce(
//       (sum, item) => sum + Number(item.amount || 0),

//       0,
//     );

//     const budget = await Budget.create({
//       category,

//       allocatedAmount,

//       month,

//       year,

//       description: description || "",

//       email,

//       spentAmount,
//     });

//     let severity = "low";

//     let message = `You created ${category} budget of $${allocatedAmount.toFixed(2)}`;

//     if (budget.percentageUsed >= 80) {
//       severity = "medium";

//       message = `${category} budget is ${budget.percentageUsed.toFixed(1)}% used`;
//     }

//     await createNotification(
//       email,

//       `📊 Budget Created`,

//       message,

//       "info",

//       severity,

//       budget._id,

//       "Budget",
//     );

//     res.status(201).json({
//       success: true,

//       message: "Budget created successfully",

//       data: budget,
//     });
//   } catch (error) {
//     console.error("CREATE BUDGET ERROR:", error.stack);

//     res.status(500).json({
//       success: false,

//       message: "Failed to create budget",

//       error: error.message,
//     });
//   }
// };

// exports.createBudget = async (req, res) => {
//   try {
//     const {
//       category,
//       allocatedAmount,
//       month,
//       year,
//       email
//     } = req.body;

//     if (!category || !allocatedAmount || !month || !year || !email) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required"
//       });
//     }

//     const budget = await Budget.create({
//       category,
//       allocatedAmount,
//       month,
//       year,
//       email: email.toLowerCase()
//     });

//     res.status(201).json({
//       success: true,
//       budget
//     });

//   } catch (error) {
//     console.error("Create budget error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

exports.createBudget = async (req, res) => {
  try {
    const {
      category,
      allocatedAmount,
      month,
      year,
      email,
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


    const budget = await Budget.create({
      category,
      allocatedAmount: Number(allocatedAmount),
      month: Number(month),
      year: Number(year),
      email: email.toLowerCase(),
    });


    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      budget,
    });


  } catch (error) {

    console.log("==============================");
    console.log("CREATE BUDGET ERROR");
    console.log("Error Name:", error.name);
    console.log("Error Message:", error.message);
    console.log("Stack Trace:");
    console.log(error.stack);
    console.log("==============================");


    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE BUDGET

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,

        message: "Budget not found",
      });
    }

    const updated = await Budget.findByIdAndUpdate(
      req.params.id,

      req.body,

      {
        new: true,
        runValidators: true,
      },
    );

    res.json({
      success: true,

      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// DELETE BUDGET

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,

        message: "Budget not found",
      });
    }

    await budget.deleteOne();

    await createNotification(
      budget.email,

      "🗑 Budget Deleted",

      `${budget.category} budget deleted`,

      "warning",

      "medium",
    );

    res.json({
      success: true,

      message: "Budget deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

function getMonthName(month) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return months[month] || "";
}
