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

exports.createBudget = async (req, res) => {
  try {
    const { category, allocatedAmount, month, year, email, description } =
      req.body;

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
