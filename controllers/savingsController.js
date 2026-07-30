const Savings = require('../models/Savings');
const Notification = require('../models/IncomeNotification');

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

// @desc    Get all savings goals
// @route   GET /api/savings
// @access  Private
exports.getSavings = async (req, res) => {
  try {
    const { category, isCompleted } = req.query;

    const query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === "true";
    }

    const savings = await Savings.find(query).sort({
      priority: 1,
      createdAt: -1,
    });

    // Calculate totals
    const totalTarget = savings.reduce(
      (sum, s) => sum + s.targetAmount,
      0
    );

    const totalCurrent = savings.reduce(
      (sum, s) => sum + s.currentAmount,
      0
    );

    const overallProgress =
      totalTarget > 0
        ? (totalCurrent / totalTarget) * 100
        : 0;

    res.status(200).json({
      success: true,
      count: savings.length,
      data: savings,
      summary: {
        totalTarget,
        totalCurrent,
        overallProgress,
        completedCount: savings.filter((s) => s.isCompleted).length,
        inProgressCount: savings.filter((s) => !s.isCompleted).length,
      },
    });
  } catch (error) {
    console.error("Get savings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch savings goals",
      error: error.message,
    });
  }
};

// @desc    Create savings goal
// @route   POST /api/savings
// @access  Private
exports.createSavings = async (req, res) => {
  try {
    const { category, targetAmount, currentAmount, deadline, description, priority, email } = req.body;

    if (!category || !targetAmount || !email) {
      return res.status(400).json({
        success: false,
        message: "Category, target amount, and email are required",
      });
    }

    const savings = await Savings.create({
      category,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline: deadline || null,
      description: description || '',
      priority: priority || 'medium',
      email: email.toLowerCase(),
    });

    // Create notification
    let severity = 'low';
    if (priority === 'high') severity = 'medium';
    if (priority === 'critical') severity = 'high';

    await createNotification(
      email,
      `🎯 New Savings Goal: ${category}`,
      `You have set a new savings goal of $${targetAmount.toFixed(2)} for ${category}. ${currentAmount ? `Current savings: $${currentAmount.toFixed(2)}` : 'Start saving today!'}`,
      'savings_milestone',
      severity,
      savings._id,
      'Savings'
    );

    res.status(201).json({
      success: true,
      message: "Savings goal created successfully",
      data: savings,
    });
  } catch (error) {
    console.error('Create savings error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create savings goal",
      error: error.message,
    });
  }
};


// Get Savings By Email
exports.getSavingsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const savings = await Savings.find({
      email: email.toLowerCase(),
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Savings goals retrieved successfully",
      count: savings.length,
      data: savings,
    });
  } catch (error) {
    console.error("Get savings by email error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve savings goals",
      error: error.message,
    });
  }
};  

// @desc    Update savings goal
// @route   PUT /api/savings/:id
// @access  Private
exports.updateSavings = async (req, res) => {
  try {
    const savings = await Savings.findById(req.params.id);

    if (!savings) {
      return res.status(404).json({
        success: false,
        message: "Savings goal not found",
      });
    }

    const oldAmount = savings.currentAmount;
    const updatedSavings = await Savings.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    // Check for milestones
    if (updatedSavings.currentAmount > oldAmount) {
      const progress = updatedSavings.progress;
      const oldProgress = savings.targetAmount > 0 ? (oldAmount / savings.targetAmount) * 100 : 0;
      
      // Milestone notifications at 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];
      
      for (const milestone of milestones) {
        if (oldProgress < milestone && progress >= milestone) {
          let message = `🎊 ${milestone}% milestone reached! You have saved $${updatedSavings.currentAmount.toFixed(2)} towards your ${savings.category} goal.`;
          
          if (milestone === 100) {
            message = `🎉 Congratulations! You have completed your ${savings.category} savings goal of $${savings.targetAmount.toFixed(2)}! 🎉`;
            await createNotification(
              savings.email,
              `🏆 Savings Goal Achieved: ${savings.category}`,
              message,
              'savings_milestone',
              'high',
              updatedSavings._id,
              'Savings'
            );
          } else {
            await createNotification(
              savings.email,
              `🏆 Savings Milestone: ${milestone}%`,
              message,
              'savings_milestone',
              'medium',
              updatedSavings._id,
              'Savings'
            );
          }
          break;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Savings goal updated successfully",
      data: updatedSavings,
    });
  } catch (error) {
    console.error('Update savings error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update savings goal",
      error: error.message,
    });
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings/:id
// @access  Private
exports.deleteSavings = async (req, res) => {
  try {
    const savings = await Savings.findById(req.params.id);

    if (!savings) {
      return res.status(404).json({
        success: false,
        message: "Savings goal not found",
      });
    }

    await Savings.findByIdAndDelete(req.params.id);

    await createNotification(
      savings.email,
      `🗑️ Savings Goal Deleted: ${savings.category}`,
      `Your ${savings.category} savings goal has been deleted.`,
      'warning',
      'medium'
    );

    res.status(200).json({
      success: true,
      message: "Savings goal deleted successfully",
    });
  } catch (error) {
    console.error('Delete savings error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete savings goal",
      error: error.message,
    });
  }
};