const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const {
      category,
      type,
      startDate,
      endDate,
      search,
    } = req.query;

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
//     } = req.body;

//     if (
//       !description ||
//       !category ||
//       !amount ||
//       !date ||
//       !user ||
//       !email
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const expense = await Expense.create({
//       description,
//       category,
//       type: type || "expense",
//       amount,
//       date,
//       user,
//       email: email.toLowerCase(),
//     });

//     res.status(201).json({
//       success: true,
//       message: "Expense created successfully",
//       data: expense,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to create expense",
//       error: error.message,
//     });
//   }
// };


exports.createExpense = async (req, res) => {
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


    // Validate required fields
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
        message:
          "Description, category, amount, date, user, email, and userId are required",
      });
    }


    // Validate amount
if (!Number.isInteger(Number(amount)) || Number(amount) <= 0) {
  return res.status(400).json({
    success: false,
    message: "Amount must be a positive whole number (no decimals)",
  });
}


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


    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
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
      }
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
            category: '$category',
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.category',
          expenses: {
            $push: {
              type: '$_id.type',
              total: '$total',
              count: '$count',
            },
          },
          totalAmount: { $sum: '$total' },
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
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month',
          },
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0],
            },
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0],
            },
          },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
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
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
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
        message: 'Please provide an array of expense IDs',
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
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expenses',
      error: error.message,
    });
  }
};