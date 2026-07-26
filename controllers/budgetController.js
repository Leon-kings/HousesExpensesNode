const Budget = require('../models/Budget');
const Income = require('../models/Income');
const Notification = require('../models/incameNotification');

// Helper function to create notification
const createNotification = async (email, title, message, type, severity = 'medium', relatedId = null, relatedModel = null) => {
  try {
    const notification = await Notification.create({
      email,
      title,
      message,
      type,
      severity,
      relatedId,
      relatedModel,
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
  try {
    const { month, year, category } = req.query;

    const query = {};

    if (month !== undefined && month !== "") {
      query.month = parseInt(month);
    }

    if (year) {
      query.year = parseInt(year);
    }

    if (category && category !== "all") {
      query.category = category;
    }

    const budgets = await Budget.find(query).sort({ category: 1 });

    // Calculate totals
    const totalAllocated = budgets.reduce(
      (sum, b) => sum + b.allocatedAmount,
      0
    );

    const totalSpent = budgets.reduce(
      (sum, b) => sum + (b.spentAmount || 0),
      0
    );

    const totalRemaining = totalAllocated - totalSpent;

    const overallPercentage =
      totalAllocated > 0
        ? (totalSpent / totalAllocated) * 100
        : 0;

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets,
      summary: {
        totalAllocated,
        totalSpent,
        totalRemaining,
        overallPercentage,
        status:
          overallPercentage > 100
            ? "over-budget"
            : overallPercentage > 80
            ? "approaching-limit"
            : overallPercentage < 50 && totalSpent > 0
            ? "under-budget"
            : "on-track",
      },
    });
  } catch (error) {
    console.error("Get budgets error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch budgets",
      error: error.message,
    });
  }
};



exports.getBudgetsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const budgets = await Budget.find({
      email: email.toLowerCase(),
    }).sort({
      year: -1,
      month: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    console.error("Get budgets by email error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve budgets",
      error: error.message,
    });
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res) => {
  try {
    const { category, allocatedAmount, month, year, description, email } = req.body;

    if (!category || !allocatedAmount || month === undefined || !year || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if budget already exists
    const existingBudget = await Budget.findOne({
      email: email.toLowerCase(),
      category,
      month: parseInt(month),
      year: parseInt(year),
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: `Budget for ${category} in ${getMonthName(month)} ${year} already exists`,
      });
    }

    // Calculate spent amount from existing incomes
    const incomes = await Income.find({
      email: email.toLowerCase(),
      category: category,
      date: {
        $gte: new Date(year, month, 1),
        $lt: new Date(year, month + 1, 1),
      },
    });

    const spentAmount = incomes.reduce((sum, inc) => sum + inc.amount, 0);

    const budget = await Budget.create({
      category,
      allocatedAmount,
      month: parseInt(month),
      year: parseInt(year),
      description: description || '',
      email: email.toLowerCase(),
      spentAmount: spentAmount,
    });

    // Check budget status and create notification
    let severity = 'low';
    let message = `You have set a ${category} budget of $${allocatedAmount.toFixed(2)} for ${getMonthName(month)} ${year}.`;
    
    if (budget.percentageUsed > 80) {
      severity = 'medium';
      message = `You have set a ${category} budget of $${allocatedAmount.toFixed(2)} but already spent $${spentAmount.toFixed(2)} (${budget.percentageUsed.toFixed(1)}%). Consider adjusting your budget.`;
    }

    await createNotification(
      email,
      `📊 Budget Set: ${category}`,
      message,
      'info',
      severity,
      budget._id,
      'Budget'
    );

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      data: budget,
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create budget",
      error: error.message,
    });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    // Check if budget is over
    if (updatedBudget.percentageUsed > 100) {
      await createNotification(
        budget.email,
        `⚠️ Budget Alert: ${updatedBudget.category} Over Budget`,
        `You have exceeded your ${updatedBudget.category} budget. Spent: $${updatedBudget.spentAmount.toFixed(2)} vs Budget: $${updatedBudget.allocatedAmount.toFixed(2)}`,
        'budget_alert',
        'high',
        updatedBudget._id,
        'Budget'
      );
    }

    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      data: updatedBudget,
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update budget",
      error: error.message,
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    await Budget.findByIdAndDelete(req.params.id);

    await createNotification(
      budget.email,
      `🗑️ Budget Deleted: ${budget.category}`,
      `Your ${budget.category} budget for ${getMonthName(budget.month)} ${budget.year} has been deleted.`,
      'warning',
      'medium'
    );

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete budget",
      error: error.message,
    });
  }
};

// Helper function
function getMonthName(month) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month] || '';
}