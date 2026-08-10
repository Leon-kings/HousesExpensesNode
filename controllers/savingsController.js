// const Savings = require("../models/Savings");
// const Notification = require("../models/Notification");

// // ===============================
// // CREATE NOTIFICATION HELPER
// // ===============================
// const createNotification = require("../utils/createNotification");

// // ===============================
// // GET ALL SAVINGS
// // ===============================
// exports.getSavings = async (req, res) => {
//   try {
//     const { category, isCompleted } = req.query;

//     const query = {};

//     if (category && category !== "all") {
//       query.category = category;
//     }

//     if (isCompleted !== undefined) {
//       query.isCompleted = isCompleted === "true";
//     }

//     const savings = await Savings.find(query).sort({
//       priority: 1,
//       createdAt: -1,
//     });

//     const totalTarget = savings.reduce(
//       (sum, item) => sum + item.targetAmount,
//       0,
//     );

//     const totalCurrent = savings.reduce(
//       (sum, item) => sum + item.currentAmount,
//       0,
//     );

//     res.status(200).json({
//       success: true,
//       count: savings.length,
//       data: savings,
//       summary: {
//         totalTarget,
//         totalCurrent,
//         overallProgress:
//           totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0,
//         completedCount: savings.filter((item) => item.isCompleted).length,
//         inProgressCount: savings.filter((item) => !item.isCompleted).length,
//       },
//     });
//   } catch (error) {
//     console.error("Get savings error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch savings goals",
//       error: error.message,
//     });
//   }
// };

// // ===============================
// // CREATE SAVINGS
// // ===============================
// // exports.createSavings = async (req, res) => {
// //   try {

// //     const {
// //       category,
// //       targetAmount,
// //       currentAmount,
// //       deadline,
// //       description,
// //       priority,
// //       email,
// //     } = req.body;

// //     if (!category || !targetAmount || !email) {
// //       return res.status(400).json({
// //         success: false,
// //         message:
// //           "Category, target amount, and email are required",
// //       });
// //     }

// //     const savings = await Savings.create({
// //       category,
// //       targetAmount: Number(targetAmount),
// //       currentAmount: Number(currentAmount) || 0,
// //       deadline: deadline || null,
// //       description: description || "",
// //       priority: priority || "medium",
// //       email: email.toLowerCase(),
// //     });

// //     let severity = "low";

// //     if (priority === "high") {
// //       severity = "medium";
// //     }

// //     if (priority === "critical") {
// //       severity = "high";
// //     }

// //     await createNotification(
// //       email,
// //       `🎯 New Savings Goal: ${category}`,
// //       `You created a savings goal of $${Number(
// //         targetAmount
// //       ).toFixed(2)} for ${category}.`,
// //       "savings_milestone",
// //       severity,
// //       savings._id,
// //       "system"
// //     );

// //     res.status(201).json({
// //       success: true,
// //       message: "Savings goal created successfully",
// //       data: savings,
// //     });

// //   } catch (error) {

// //     console.error("Create savings error:", error);

// //     res.status(500).json({
// //       success: false,
// //       message: "Failed to create savings goal",
// //       error: error.message,
// //     });

// //   }
// // };

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
//       userId,
//     } = req.body;

//     // ✅ VALIDATION
//     if (!category || !targetAmount || !email) {
//       return res.status(400).json({
//         success: false,
//         message: "Category, target amount, and email are required",
//       });
//     }

//     // ✅ CREATE SAVINGS
//     const savings = await Savings.create({
//       category,
//       targetAmount: Number(targetAmount),
//       currentAmount: Number(currentAmount) || 0,
//       deadline: deadline || null,
//       description: description || "",
//       priority: priority || "medium",
//       email: email.toLowerCase(),
//     });

//     // ✅ PRIORITY → TYPE
//     let type = "info";
//     if (priority === "high") type = "warning";
//     if (priority === "critical") type = "alert";

//     // ✅ NOTIFICATION (USE HELPER)
//     await createNotification({
//       userId,
//       email,
//       title: "🎯 Savings Goal Created",
//       message: `Target: ${targetAmount} for ${category}`,
//       type,
//       referenceId: savings._id,
//       referenceModel: "Savings",
//     });

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

// // ===============================
// // GET SAVINGS BY EMAIL
// // ===============================
// exports.getSavingsByEmail = async (req, res) => {
//   try {
//     const email = req.params.email.toLowerCase();

//     const savings = await Savings.find({
//       email,
//     }).sort({
//       createdAt: -1,
//     });

//     res.status(200).json({
//       success: true,
//       count: savings.length,
//       data: savings,
//     });
//   } catch (error) {
//     console.error("Get savings by email error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to retrieve savings goals",
//       error: error.message,
//     });
//   }
// };

// // ===============================
// // UPDATE SAVINGS
// // ===============================
// exports.updateSavings = async (req, res) => {
//   try {
//     const savings = await Savings.findById(req.params.id);

//     if (!savings) {
//       return res.status(404).json({
//         success: false,
//         message: "Savings goal not found",
//       });
//     }

//     const oldProgress = savings.progress;

//     const updatedSavings = await Savings.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       },
//     );

//     if (updatedSavings.progress >= 25 && oldProgress < 25) {
//       await createNotification(
//         updatedSavings.email,
//         "🏆 Savings Milestone",
//         `You reached 25% of your ${updatedSavings.category} goal.`,
//         "savings_milestone",
//         "medium",
//         updatedSavings._id,
//         "system",
//       );
//     }

//     if (updatedSavings.progress >= 100 && oldProgress < 100) {
//       await createNotification(
//         updatedSavings.email,
//         "🎉 Savings Goal Completed",
//         `Congratulations! You completed your ${updatedSavings.category} savings goal.`,
//         "savings_milestone",
//         "high",
//         updatedSavings._id,
//         "system",
//       );
//     }

//     res.status(200).json({
//       success: true,
//       message: "Savings updated successfully",
//       data: updatedSavings,
//     });
//   } catch (error) {
//     console.error("Update savings error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to update savings goal",
//       error: error.message,
//     });
//   }
// };

// // ===============================
// // DELETE SAVINGS
// // ===============================
// exports.deleteSavings = async (req, res) => {
//   try {
//     const savings = await Savings.findById(req.params.id);

//     if (!savings) {
//       return res.status(404).json({
//         success: false,
//         message: "Savings goal not found",
//       });
//     }

//     await Savings.findByIdAndDelete(req.params.id);

//     await createNotification(
//       savings.email,
//       "🗑️ Savings Goal Deleted",
//       `Your ${savings.category} savings goal was deleted.`,
//       "warning",
//       "medium",
//       savings._id,
//       "system",
//     );

//     res.status(200).json({
//       success: true,
//       message: "Savings deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete savings error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to delete savings goal",
//       error: error.message,
//     });
//   }
// };












// ============================================================
// CONTROLLERS / SAVINGS.CONTROLLER.JS
// ============================================================

const Savings = require("../models/Savings");
const createNotification = require("../utils/createNotification");

// ============================================================
// GET ALL SAVINGS
// ============================================================

exports.getSavings = async (req, res) => {
  try {
    const {
      category,
      isCompleted,
      userId,
      email,
    } = req.query;

    // ========================================================
    // BUILD QUERY
    // ========================================================

    const query = {};

    // Primary ownership
    if (userId) {
      query.userId = userId;
    } else if (email) {
      // Compatibility fallback
      query.email = email.trim().toLowerCase();
    }

    // Category filter
    if (
      category &&
      category.toLowerCase() !== "all"
    ) {
      query.category = category.trim();
    }

    // Completion filter
    if (isCompleted !== undefined) {
      query.isCompleted =
        isCompleted === "true";
    }

    // ========================================================
    // FETCH SAVINGS
    // ========================================================

    const savings = await Savings.find(query).sort({
      priority: -1,
      createdAt: -1,
    });

    // ========================================================
    // SUMMARY
    // ========================================================

    const totalTarget = savings.reduce(
      (sum, item) =>
        sum + (Number(item.targetAmount) || 0),
      0
    );

    const totalCurrent = savings.reduce(
      (sum, item) =>
        sum + (Number(item.currentAmount) || 0),
      0
    );

    const overallProgress =
      totalTarget > 0
        ? Math.min(
            100,
            (totalCurrent / totalTarget) * 100
          )
        : 0;

    const completedCount =
      savings.filter(
        (item) => item.isCompleted
      ).length;

    const inProgressCount =
      savings.filter(
        (item) => !item.isCompleted
      ).length;

    return res.status(200).json({
      success: true,

      count: savings.length,

      data: savings,

      summary: {
        totalTarget,

        totalCurrent,

        overallProgress: Number(
          overallProgress.toFixed(2)
        ),

        completedCount,

        inProgressCount,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get savings error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch savings goals",

      error: error.message,
    });
  }
};

// ============================================================
// CREATE SAVINGS
// ============================================================

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

    // ========================================================
    // VALIDATION
    // ========================================================

    if (
      !category ||
      targetAmount === undefined ||
      !email ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Category, target amount, email, and userId are required",
      });
    }

    // Validate userId
    const mongoose = require("mongoose");

    if (
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const normalizedCategory =
      category.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

    const amount = Number(targetAmount);

    const initialAmount =
      currentAmount === undefined
        ? 0
        : Number(currentAmount);

    // Target validation
    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Target amount must be greater than zero",
      });
    }

    // Current amount validation
    if (
      !Number.isFinite(initialAmount) ||
      initialAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current amount must be a valid number greater than or equal to zero",
      });
    }

    // ========================================================
    // CREATE SAVINGS
    // ========================================================

    const savings =
      await Savings.create({
        category: normalizedCategory,

        targetAmount: amount,

        currentAmount: Math.min(
          initialAmount,
          amount
        ),

        deadline:
          deadline || null,

        description:
          description?.trim() || "",

        priority:
          priority || "medium",

        email: normalizedEmail,

        userId,
      });

    // ========================================================
    // PRIORITY → NOTIFICATION SEVERITY
    // ========================================================

    let severity = "low";

    if (savings.priority === "high") {
      severity = "medium";
    }

    if (savings.priority === "critical") {
      severity = "high";
    }

    // ========================================================
    // CREATE NOTIFICATION
    // ========================================================

    const notification =
      await createNotification({
        userEmail: normalizedEmail,

        userId,

        title:
          "🎯 Savings Goal Created",

        message:
          `You created a savings goal of RWF ` +
          `${amount.toLocaleString()} ` +
          `for ${normalizedCategory}.`,

        type: "savings",

        severity,

        relatedId: savings._id,

        relatedType: "Savings",

        actionLink:
          `/savings/${savings._id}`,

        metadata: {
          savingsId: savings._id,

          category:
            normalizedCategory,

          targetAmount: amount,

          currentAmount:
            savings.currentAmount,

          progress:
            savings.progress,

          priority:
            savings.priority,
        },
      });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,

      message:
        "Savings goal created successfully",

      data: savings,

      notification,
    });
  } catch (error) {
    console.error(
      "❌ Create savings error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to create savings goal",

      error: error.message,
    });
  }
};

// ============================================================
// GET SAVINGS BY EMAIL
// ============================================================

exports.getSavingsByEmail = async (
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
      email.trim().toLowerCase();

    const savings =
      await Savings.find({
        email: normalizedEmail,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      count: savings.length,

      data: savings,
    });
  } catch (error) {
    console.error(
      "❌ Get savings by email error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to retrieve savings goals",

      error: error.message,
    });
  }
};

// ============================================================
// GET SAVINGS BY USER ID
// ============================================================

exports.getSavingsByUserId = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    const mongoose = require("mongoose");

    if (
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const savings =
      await Savings.find({
        userId,
      }).sort({
        priority: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      count: savings.length,

      data: savings,
    });
  } catch (error) {
    console.error(
      "❌ Get savings by userId error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to retrieve savings goals",

      error: error.message,
    });
  }
};

// ============================================================
// UPDATE SAVINGS
// ============================================================

exports.updateSavings = async (
  req,
  res
) => {
  try {
    const savings =
      await Savings.findById(
        req.params.id
      );

    if (!savings) {
      return res.status(404).json({
        success: false,
        message:
          "Savings goal not found",
      });
    }

    // ========================================================
    // SAVE OLD VALUES
    // ========================================================

    const oldProgress =
      Number(savings.progress) || 0;

    const oldCompleted =
      savings.isCompleted;

    // ========================================================
    // UPDATE ONLY ALLOWED FIELDS
    // ========================================================

    const {
      category,
      targetAmount,
      currentAmount,
      deadline,
      description,
      priority,
    } = req.body;

    if (category !== undefined) {
      const normalizedCategory =
        String(category).trim();

      if (!normalizedCategory) {
        return res.status(400).json({
          success: false,
          message:
            "Category cannot be empty",
        });
      }

      savings.category =
        normalizedCategory;
    }

    if (targetAmount !== undefined) {
      const newTarget =
        Number(targetAmount);

      if (
        !Number.isFinite(newTarget) ||
        newTarget <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Target amount must be greater than zero",
        });
      }

      savings.targetAmount =
        newTarget;
    }

    if (currentAmount !== undefined) {
      const newCurrent =
        Number(currentAmount);

      if (
        !Number.isFinite(newCurrent) ||
        newCurrent < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Current amount must be zero or greater",
        });
      }

      savings.currentAmount =
        newCurrent;
    }

    if (deadline !== undefined) {
      savings.deadline =
        deadline || null;
    }

    if (description !== undefined) {
      savings.description =
        String(description).trim();
    }

    if (priority !== undefined) {
      const validPriorities = [
        "low",
        "medium",
        "high",
        "critical",
      ];

      if (
        !validPriorities.includes(
          priority
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid savings priority",
        });
      }

      savings.priority =
        priority;
    }

    // ========================================================
    // IMPORTANT
    //
    // Use .save() so the Savings model's
    // pre-save hook recalculates:
    //
    // progress
    // isCompleted
    // completedDate
    // currentAmount safety
    // ========================================================

    await savings.save();

    // ========================================================
    // MILESTONE NOTIFICATIONS
    // ========================================================

    let milestoneNotification =
      null;

    // 25% milestone
    if (
      savings.progress >= 25 &&
      oldProgress < 25
    ) {
      milestoneNotification =
        await createNotification({
          userEmail: savings.email,

          userId: savings.userId,

          title:
            "🏆 Savings Milestone",

          message:
            `You reached 25% of your ` +
            `${savings.category} savings goal.`,

          type: "savings",

          severity: "medium",

          relatedId: savings._id,

          relatedType: "Savings",

          actionLink:
            `/savings/${savings._id}`,

          metadata: {
            savingsId: savings._id,

            category:
              savings.category,

            progress:
              savings.progress,

            currentAmount:
              savings.currentAmount,

            targetAmount:
              savings.targetAmount,
          },
        });
    }

    // 100% completion
    if (
      savings.progress >= 100 &&
      oldProgress < 100
    ) {
      milestoneNotification =
        await createNotification({
          userEmail: savings.email,

          userId: savings.userId,

          title:
            "🎉 Savings Goal Completed",

          message:
            `Congratulations! You completed ` +
            `your ${savings.category} savings goal.`,

          type: "savings",

          severity: "high",

          relatedId: savings._id,

          relatedType: "Savings",

          actionLink:
            `/savings/${savings._id}`,

          metadata: {
            savingsId: savings._id,

            category:
              savings.category,

            progress: 100,

            currentAmount:
              savings.currentAmount,

            targetAmount:
              savings.targetAmount,

            completed:
              savings.isCompleted,
          },
        });
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message:
        "Savings updated successfully",

      data: savings,

      notification:
        milestoneNotification,
    });
  } catch (error) {
    console.error(
      "❌ Update savings error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to update savings goal",

      error: error.message,
    });
  }
};

// ============================================================
// DELETE SAVINGS
// ============================================================

exports.deleteSavings = async (
  req,
  res
) => {
  try {
    const savings =
      await Savings.findById(
        req.params.id
      );

    if (!savings) {
      return res.status(404).json({
        success: false,
        message:
          "Savings goal not found",
      });
    }

    // ========================================================
    // DELETE SAVINGS
    // ========================================================

    await savings.deleteOne();

    // ========================================================
    // DELETE NOTIFICATION
    // IS NOT DONE HERE
    //
    // The notification is historical.
    // ========================================================

    const notification =
      await createNotification({
        userEmail: savings.email,

        userId: savings.userId,

        title:
          "🗑️ Savings Goal Deleted",

        message:
          `Your ${savings.category} ` +
          `savings goal was deleted.`,

        type: "savings",

        severity: "medium",

        relatedId: savings._id,

        relatedType: "Savings",

        actionLink:
          "/savings",

        metadata: {
          savingsId: savings._id,

          category:
            savings.category,

          targetAmount:
            savings.targetAmount,

          currentAmount:
            savings.currentAmount,
        },
      });

    return res.status(200).json({
      success: true,

      message:
        "Savings deleted successfully",

      notification,
    });
  } catch (error) {
    console.error(
      "❌ Delete savings error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to delete savings goal",

      error: error.message,
    });
  }
};