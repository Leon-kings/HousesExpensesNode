const Savings = require("../models/Savings");
const Notification = require("../models/Notification");

// ===============================
// CREATE NOTIFICATION HELPER
// ===============================
const createNotification = require("../utils/createNotification");

// ===============================
// GET ALL SAVINGS
// ===============================
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

    const totalTarget = savings.reduce(
      (sum, item) => sum + item.targetAmount,
      0,
    );

    const totalCurrent = savings.reduce(
      (sum, item) => sum + item.currentAmount,
      0,
    );

    res.status(200).json({
      success: true,
      count: savings.length,
      data: savings,
      summary: {
        totalTarget,
        totalCurrent,
        overallProgress:
          totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0,
        completedCount: savings.filter((item) => item.isCompleted).length,
        inProgressCount: savings.filter((item) => !item.isCompleted).length,
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

// ===============================
// CREATE SAVINGS
// ===============================
// exports.createSavings = async (req, res) => {
//   try {

//     const {
//       category,
//       targetAmount,
//       currentAmount,
//       deadline,
//       description,
//       priority,
//       email,
//     } = req.body;

//     if (!category || !targetAmount || !email) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Category, target amount, and email are required",
//       });
//     }

//     const savings = await Savings.create({
//       category,
//       targetAmount: Number(targetAmount),
//       currentAmount: Number(currentAmount) || 0,
//       deadline: deadline || null,
//       description: description || "",
//       priority: priority || "medium",
//       email: email.toLowerCase(),
//     });

//     let severity = "low";

//     if (priority === "high") {
//       severity = "medium";
//     }

//     if (priority === "critical") {
//       severity = "high";
//     }

//     await createNotification(
//       email,
//       `🎯 New Savings Goal: ${category}`,
//       `You created a savings goal of $${Number(
//         targetAmount
//       ).toFixed(2)} for ${category}.`,
//       "savings_milestone",
//       severity,
//       savings._id,
//       "system"
//     );

//     res.status(201).json({
//       success: true,
//       message: "Savings goal created successfully",
//       data: savings,
//     });

//   } catch (error) {

//     console.error("Create savings error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to create savings goal",
//       error: error.message,
//     });

//   }
// };

exports.createSavings = async (req, res) => {
  try {
    const {
      category,
      targetAmount,
      currentAmount,
      deadline,
      description,
      priority,
      email,
      userId,
    } = req.body;

    // ✅ VALIDATION
    if (!category || !targetAmount || !email) {
      return res.status(400).json({
        success: false,
        message: "Category, target amount, and email are required",
      });
    }

    // ✅ CREATE SAVINGS
    const savings = await Savings.create({
      category,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      deadline: deadline || null,
      description: description || "",
      priority: priority || "medium",
      email: email.toLowerCase(),
    });

    // ✅ PRIORITY → TYPE
    let type = "info";
    if (priority === "high") type = "warning";
    if (priority === "critical") type = "alert";

    // ✅ NOTIFICATION (USE HELPER)
    await createNotification({
      userId,
      email,
      title: "🎯 Savings Goal Created",
      message: `Target: ${targetAmount} for ${category}`,
      type,
      referenceId: savings._id,
      referenceModel: "Savings",
    });

    res.status(201).json({
      success: true,
      message: "Savings goal created successfully",
      data: savings,
    });
  } catch (error) {
    console.error("Create savings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create savings goal",
      error: error.message,
    });
  }
};

// ===============================
// GET SAVINGS BY EMAIL
// ===============================
exports.getSavingsByEmail = async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();

    const savings = await Savings.find({
      email,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
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

// ===============================
// UPDATE SAVINGS
// ===============================
exports.updateSavings = async (req, res) => {
  try {
    const savings = await Savings.findById(req.params.id);

    if (!savings) {
      return res.status(404).json({
        success: false,
        message: "Savings goal not found",
      });
    }

    const oldProgress = savings.progress;

    const updatedSavings = await Savings.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (updatedSavings.progress >= 25 && oldProgress < 25) {
      await createNotification(
        updatedSavings.email,
        "🏆 Savings Milestone",
        `You reached 25% of your ${updatedSavings.category} goal.`,
        "savings_milestone",
        "medium",
        updatedSavings._id,
        "system",
      );
    }

    if (updatedSavings.progress >= 100 && oldProgress < 100) {
      await createNotification(
        updatedSavings.email,
        "🎉 Savings Goal Completed",
        `Congratulations! You completed your ${updatedSavings.category} savings goal.`,
        "savings_milestone",
        "high",
        updatedSavings._id,
        "system",
      );
    }

    res.status(200).json({
      success: true,
      message: "Savings updated successfully",
      data: updatedSavings,
    });
  } catch (error) {
    console.error("Update savings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update savings goal",
      error: error.message,
    });
  }
};

// ===============================
// DELETE SAVINGS
// ===============================
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
      "🗑️ Savings Goal Deleted",
      `Your ${savings.category} savings goal was deleted.`,
      "warning",
      "medium",
      savings._id,
      "system",
    );

    res.status(200).json({
      success: true,
      message: "Savings deleted successfully",
    });
  } catch (error) {
    console.error("Delete savings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete savings goal",
      error: error.message,
    });
  }
};
