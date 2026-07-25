const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, type, startDate, endDate, search } = req.query;

    // Build query
    const query = { userId: mongoose.Types.ObjectId(userId) };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Search by description or user
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { user: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Get statistics
    const stats = await Expense.getStats(userId);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
      stats,
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
      error: error.message,
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense',
      error: error.message,
    });
  }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    const { description, category, type, amount, date, user } = req.body;

    // Validate required fields
    if (!description || !category || !amount || !date || !user) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    // Create expense
    const expense = await Expense.create({
      description,
      category,
      type: type || 'expense',
      amount: parseFloat(amount),
      date: new Date(date),
      user,
      userId: req.user.id,
    });

    // Get updated statistics
    const stats = await Expense.getStats(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
      stats,
    });
  } catch (error) {
    console.error('Create expense error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
      error: error.message,
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    const { description, category, type, amount, date, user } = req.body;

    // Find expense
    let expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Update fields
    const updateData = {};
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (type) updateData.type = type;
    if (amount) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0',
        });
      }
      updateData.amount = parseFloat(amount);
    }
    if (date) updateData.date = new Date(date);
    if (user) updateData.user = user;
    updateData.updatedAt = Date.now();

    // Update expense
    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    // Get updated statistics
    const stats = await Expense.getStats(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
      stats,
    });
  } catch (error) {
    console.error('Update expense error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message,
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Get updated statistics
    const stats = await Expense.getStats(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: expense,
      stats,
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
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