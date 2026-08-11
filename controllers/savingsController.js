// // ============================================================
// // CONTROLLERS / SAVINGS.CONTROLLER.JS
// // ============================================================

// const mongoose = require("mongoose");

// const Savings = require("../models/Savings");
// const createNotification = require("../utils/createNotification");

// // ============================================================
// // GET ALL SAVINGS
// // ============================================================
// // Supports:
// // ?userId=...
// // ?email=...
// // ?category=...
// // ?isCompleted=true/false
// // ============================================================

// exports.getSavings = async (req, res) => {
//   try {
//     const { category, isCompleted, userId, email } = req.query;

//     // ========================================================
//     // BUILD QUERY
//     // ========================================================

//     const query = {};

//     // --------------------------------------------------------
//     // USER ID
//     // --------------------------------------------------------

//     if (userId) {
//       if (!mongoose.Types.ObjectId.isValid(userId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid userId",
//         });
//       }

//       query.userId = userId;
//     }

//     // --------------------------------------------------------
//     // EMAIL FALLBACK
//     // --------------------------------------------------------
//     else if (email) {
//       query.email = String(email).trim().toLowerCase();
//     }

//     // --------------------------------------------------------
//     // CATEGORY
//     // --------------------------------------------------------

//     if (category && category.toLowerCase() !== "all") {
//       query.category = category.trim();
//     }

//     // --------------------------------------------------------
//     // COMPLETION FILTER
//     // --------------------------------------------------------

//     if (isCompleted !== undefined) {
//       if (isCompleted !== "true" && isCompleted !== "false") {
//         return res.status(400).json({
//           success: false,
//           message: "isCompleted must be true or false",
//         });
//       }

//       query.isCompleted = isCompleted === "true";
//     }

//     // ========================================================
//     // FETCH SAVINGS
//     // ========================================================

//     const savings = await Savings.find(query).sort({
//       priority: -1,
//       createdAt: -1,
//     });

//     // ========================================================
//     // SUMMARY
//     // ========================================================

//     const totalTarget = savings.reduce(
//       (sum, item) => sum + (Number(item.targetAmount) || 0),
//       0,
//     );

//     const totalCurrent = savings.reduce(
//       (sum, item) => sum + (Number(item.currentAmount) || 0),
//       0,
//     );

//     const overallProgress =
//       totalTarget > 0 ? Math.min(100, (totalCurrent / totalTarget) * 100) : 0;

//     const completedCount = savings.filter((item) => item.isCompleted).length;

//     const inProgressCount = savings.filter((item) => !item.isCompleted).length;

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(200).json({
//       success: true,

//       count: savings.length,

//       data: savings,

//       summary: {
//         totalTarget,

//         totalCurrent,

//         overallProgress: Number(overallProgress.toFixed(2)),

//         completedCount,

//         inProgressCount,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Get savings error:", error);

//     return res.status(500).json({
//       success: false,

//       message: "Failed to fetch savings goals",

//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET SINGLE SAVINGS GOAL
// // ============================================================

// exports.getSavingsById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid savings ID",
//       });
//     }

//     const savings = await Savings.findById(id);

//     if (!savings) {
//       return res.status(404).json({
//         success: false,
//         message: "Savings goal not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: savings,
//     });
//   } catch (error) {
//     console.error("❌ Get savings by ID error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch savings goal",
//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // CREATE SAVINGS
// // ============================================================

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

//     // ========================================================
//     // VALIDATION
//     // ========================================================

//     if (!category || targetAmount === undefined || !email || !userId) {
//       return res.status(400).json({
//         success: false,
//         message: "Category, target amount, email, and userId are required",
//       });
//     }

//     // --------------------------------------------------------
//     // USER ID
//     // --------------------------------------------------------

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     // --------------------------------------------------------
//     // TARGET
//     // --------------------------------------------------------

//     const numericTarget = Number(targetAmount);

//     if (!Number.isFinite(numericTarget) || numericTarget <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Target amount must be greater than zero",
//       });
//     }

//     // --------------------------------------------------------
//     // CURRENT
//     // --------------------------------------------------------

//     const numericCurrent =
//       currentAmount === undefined ? 0 : Number(currentAmount);

//     if (!Number.isFinite(numericCurrent) || numericCurrent < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Current amount cannot be negative",
//       });
//     }

//     if (numericCurrent > numericTarget) {
//       return res.status(400).json({
//         success: false,
//         message: "Current savings cannot exceed the target amount",
//       });
//     }

//     // --------------------------------------------------------
//     // EMAIL
//     // --------------------------------------------------------

//     const normalizedEmail = String(email).trim().toLowerCase();

//     // ========================================================
//     // DEADLINE VALIDATION
//     // ========================================================

//     let normalizedDeadline = null;

//     if (deadline) {
//       const parsedDeadline = new Date(deadline);

//       if (Number.isNaN(parsedDeadline.getTime())) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid savings deadline",
//         });
//       }

//       normalizedDeadline = parsedDeadline;
//     }

//     // ========================================================
//     // PRIORITY
//     // ========================================================

//     const validPriorities = ["low", "medium", "high", "critical"];

//     const normalizedPriority = priority || "medium";

//     if (!validPriorities.includes(normalizedPriority)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid savings priority",
//       });
//     }

//     // ========================================================
//     // CREATE SAVINGS
//     // ========================================================

//     const savings = await Savings.create({
//       category: category.trim(),

//       targetAmount: numericTarget,

//       currentAmount: numericCurrent,

//       deadline: normalizedDeadline,

//       description: description ? String(description).trim() : "",

//       priority: normalizedPriority,

//       email: normalizedEmail,

//       userId,
//     });

//     // ========================================================
//     // NOTIFICATION
//     // ========================================================
//     //
//     // Notification.js supports:
//     // info
//     // warning
//     // alert
//     //
//     // Therefore DO NOT use:
//     // type: "savings"
//     // ========================================================

//     let notificationType = "info";
//     let severity = "low";

//     if (normalizedPriority === "high") {
//       notificationType = "warning";
//       severity = "medium";
//     }

//     if (normalizedPriority === "critical") {
//       notificationType = "alert";
//       severity = "high";
//     }

//     const notification = await createNotification({
//       userEmail: normalizedEmail,

//       userId,

//       title: "🎯 Savings Goal Created",

//       message:
//         `You created a savings goal of RWF ` +
//         `${numericTarget.toLocaleString()} ` +
//         `for ${savings.category}.`,

//       type: notificationType,

//       severity,

//       relatedId: savings._id,

//       relatedType: "Savings",

//       actionLink: `/savings/${savings._id}`,

//       metadata: {
//         savingsId: savings._id,

//         category: savings.category,

//         targetAmount: savings.targetAmount,

//         currentAmount: savings.currentAmount,

//         progress: savings.progress,

//         priority: savings.priority,
//       },
//     });

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(201).json({
//       success: true,

//       message: "Savings goal created successfully",

//       data: savings,

//       notification,
//     });
//   } catch (error) {
//     console.error("❌ Create savings error:", error);

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         message: "Savings validation failed",
//         errors: Object.values(error.errors).map((err) => err.message),
//       });
//     }

//     return res.status(500).json({
//       success: false,

//       message: "Failed to create savings goal",

//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET SAVINGS BY EMAIL
// // ============================================================

// exports.getSavingsByEmail = async (req, res) => {
//   try {
//     const { email } = req.params;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const normalizedEmail = String(email).trim().toLowerCase();

//     const savings = await Savings.find({
//       email: normalizedEmail,
//     }).sort({
//       priority: -1,
//       createdAt: -1,
//     });

//     return res.status(200).json({
//       success: true,

//       message: "Savings goals retrieved successfully",

//       count: savings.length,

//       data: savings,
//     });
//   } catch (error) {
//     console.error("❌ Get savings by email error:", error);

//     return res.status(500).json({
//       success: false,

//       message: "Failed to retrieve savings goals",

//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // GET SAVINGS BY USER ID
// // ============================================================

// exports.getSavingsByUserId = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid userId",
//       });
//     }

//     const savings = await Savings.find({
//       userId,
//     }).sort({
//       priority: -1,
//       createdAt: -1,
//     });

//     return res.status(200).json({
//       success: true,

//       message: "Savings goals retrieved successfully",

//       count: savings.length,

//       data: savings,
//     });
//   } catch (error) {
//     console.error("❌ Get savings by userId error:", error);

//     return res.status(500).json({
//       success: false,

//       message: "Failed to retrieve savings goals",

//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // UPDATE SAVINGS
// // ============================================================

// exports.updateSavings = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid savings ID",
//       });
//     }

//     const savings = await Savings.findById(id);

//     if (!savings) {
//       return res.status(404).json({
//         success: false,
//         message: "Savings goal not found",
//       });
//     }

//     // ========================================================
//     // SAVE OLD VALUES
//     // ========================================================

//     const oldProgress = Number(savings.progress) || 0;

//     const oldCompleted = savings.isCompleted;

//     // ========================================================
//     // UPDATE ALLOWED FIELDS ONLY
//     // ========================================================

//     const {
//       category,
//       targetAmount,
//       currentAmount,
//       deadline,
//       description,
//       priority,
//     } = req.body;

//     // --------------------------------------------------------
//     // CATEGORY
//     // --------------------------------------------------------

//     if (category !== undefined) {
//       const normalizedCategory = String(category).trim();

//       if (!normalizedCategory) {
//         return res.status(400).json({
//           success: false,
//           message: "Category cannot be empty",
//         });
//       }

//       savings.category = normalizedCategory;
//     }

//     // --------------------------------------------------------
//     // TARGET
//     // --------------------------------------------------------

//     if (targetAmount !== undefined) {
//       const newTarget = Number(targetAmount);

//       if (!Number.isFinite(newTarget) || newTarget <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Target amount must be greater than zero",
//         });
//       }

//       savings.targetAmount = newTarget;
//     }

//     // --------------------------------------------------------
//     // CURRENT AMOUNT
//     // --------------------------------------------------------

//     if (currentAmount !== undefined) {
//       const newCurrent = Number(currentAmount);

//       if (!Number.isFinite(newCurrent) || newCurrent < 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Current amount must be zero or greater",
//         });
//       }

//       savings.currentAmount = newCurrent;
//     }

//     // --------------------------------------------------------
//     // DEADLINE
//     // --------------------------------------------------------

//     if (deadline !== undefined) {
//       if (!deadline) {
//         savings.deadline = null;
//       } else {
//         const parsedDeadline = new Date(deadline);

//         if (Number.isNaN(parsedDeadline.getTime())) {
//           return res.status(400).json({
//             success: false,
//             message: "Invalid savings deadline",
//           });
//         }

//         savings.deadline = parsedDeadline;
//       }
//     }

//     // --------------------------------------------------------
//     // DESCRIPTION
//     // --------------------------------------------------------

//     if (description !== undefined) {
//       savings.description = String(description).trim();
//     }

//     // --------------------------------------------------------
//     // PRIORITY
//     // --------------------------------------------------------

//     if (priority !== undefined) {
//       const validPriorities = ["low", "medium", "high", "critical"];

//       if (!validPriorities.includes(priority)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid savings priority",
//         });
//       }

//       savings.priority = priority;
//     }

//     // ========================================================
//     // SAVE
//     // ========================================================
//     //
//     // This triggers Savings.pre("save"):
//     //
//     // - progress
//     // - isCompleted
//     // - completedDate
//     // - currentAmount protection
//     //
//     // ========================================================

//     await savings.save();

//     // ========================================================
//     // NOTIFICATION
//     // ========================================================

//     let notification = null;

//     // --------------------------------------------------------
//     // 100% COMPLETION
//     // --------------------------------------------------------

//     if (savings.progress >= 100 && oldProgress < 100) {
//       notification = await createNotification({
//         userEmail: savings.email,

//         userId: savings.userId,

//         title: "🎉 Savings Goal Completed",

//         message:
//           `Congratulations! You completed ` +
//           `your ${savings.category} savings goal.`,

//         type: "alert",

//         severity: "high",

//         relatedId: savings._id,

//         relatedType: "Savings",

//         actionLink: `/savings/${savings._id}`,

//         metadata: {
//           savingsId: savings._id,

//           category: savings.category,

//           progress: 100,

//           currentAmount: savings.currentAmount,

//           targetAmount: savings.targetAmount,

//           completed: savings.isCompleted,
//         },
//       });
//     }

//     // --------------------------------------------------------
//     // 25% MILESTONE
//     // --------------------------------------------------------
//     //
//     // Only create this if the 100% notification
//     // was not already created.
//     // --------------------------------------------------------
//     else if (savings.progress >= 25 && oldProgress < 25) {
//       notification = await createNotification({
//         userEmail: savings.email,

//         userId: savings.userId,

//         title: "🏆 Savings Milestone",

//         message:
//           `You reached 25% of your ` + `${savings.category} savings goal.`,

//         type: "warning",

//         severity: "medium",

//         relatedId: savings._id,

//         relatedType: "Savings",

//         actionLink: `/savings/${savings._id}`,

//         metadata: {
//           savingsId: savings._id,

//           category: savings.category,

//           progress: savings.progress,

//           currentAmount: savings.currentAmount,

//           targetAmount: savings.targetAmount,
//         },
//       });
//     }

//     // --------------------------------------------------------
//     // NORMAL UPDATE
//     // --------------------------------------------------------
//     else {
//       notification = await createNotification({
//         userEmail: savings.email,

//         userId: savings.userId,

//         title: "📝 Savings Goal Updated",

//         message: `Your ${savings.category} savings goal was updated.`,

//         type: "info",

//         severity: "low",

//         relatedId: savings._id,

//         relatedType: "Savings",

//         actionLink: `/savings/${savings._id}`,

//         metadata: {
//           savingsId: savings._id,

//           category: savings.category,

//           targetAmount: savings.targetAmount,

//           currentAmount: savings.currentAmount,

//           progress: savings.progress,

//           previousProgress: oldProgress,

//           previouslyCompleted: oldCompleted,
//         },
//       });
//     }

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(200).json({
//       success: true,

//       message: "Savings updated successfully",

//       data: savings,

//       notification,
//     });
//   } catch (error) {
//     console.error("❌ Update savings error:", error);

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,

//         message: "Savings validation failed",

//         errors: Object.values(error.errors).map((err) => err.message),
//       });
//     }

//     return res.status(500).json({
//       success: false,

//       message: "Failed to update savings goal",

//       error: error.message,
//     });
//   }
// };

// // ============================================================
// // DELETE SAVINGS
// // ============================================================

// exports.deleteSavings = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid savings ID",
//       });
//     }

//     const savings = await Savings.findById(id);

//     if (!savings) {
//       return res.status(404).json({
//         success: false,
//         message: "Savings goal not found",
//       });
//     }

//     // ========================================================
//     // SAVE VALUES BEFORE DELETE
//     // ========================================================

//     const savingsId = savings._id;

//     const savingsEmail = savings.email;

//     const savingsUserId = savings.userId;

//     const savingsCategory = savings.category;

//     const savingsTarget = Number(savings.targetAmount) || 0;

//     const savingsCurrent = Number(savings.currentAmount) || 0;

//     // ========================================================
//     // DELETE
//     // ========================================================

//     await savings.deleteOne();

//     // ========================================================
//     // HISTORICAL NOTIFICATION
//     // ========================================================

//     const notification = await createNotification({
//       userEmail: savingsEmail,

//       userId: savingsUserId,

//       title: "🗑️ Savings Goal Deleted",

//       message: `Your ${savingsCategory} ` + `savings goal was deleted.`,

//       type: "warning",

//       severity: "medium",

//       relatedId: savingsId,

//       relatedType: "Savings",

//       actionLink: "/savings",

//       metadata: {
//         savingsId,

//         category: savingsCategory,

//         targetAmount: savingsTarget,

//         currentAmount: savingsCurrent,
//       },
//     });

//     // ========================================================
//     // RESPONSE
//     // ========================================================

//     return res.status(200).json({
//       success: true,

//       message: "Savings deleted successfully",

//       notification,
//     });
//   } catch (error) {
//     console.error("❌ Delete savings error:", error);

//     return res.status(500).json({
//       success: false,

//       message: "Failed to delete savings goal",

//       error: error.message,
//     });
//   }
// };

// ============================================================
// CONTROLLERS / SAVINGS.CONTROLLER.JS
// ============================================================

const mongoose = require("mongoose");

const Savings = require("../models/Savings");
const createNotification = require("../utils/createNotification");

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

const normalizeCategory = (category) => {
  return String(category || "").trim();
};

const VALID_PRIORITIES = ["low", "medium", "high", "critical"];

// ============================================================
// GET ALL SAVINGS
//
// Supports:
//
// ?userId=...
// ?email=...
// ?category=...
// ?isCompleted=true
// ?isCompleted=false
//
// userId is the primary ownership identifier.
// Email remains supported for compatibility.
// ============================================================

exports.getSavings = async (req, res) => {
  try {
    const { category, isCompleted, userId, email } = req.query;

    // ========================================================
    // BUILD QUERY
    // ========================================================

    const query = {};

    // --------------------------------------------------------
    // USER ID
    // --------------------------------------------------------

    if (userId) {
      if (!isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid userId",
        });
      }

      query.userId = userId;
    }

    // --------------------------------------------------------
    // EMAIL FALLBACK
    // --------------------------------------------------------
    else if (email) {
      query.email = normalizeEmail(email);
    }

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (category && String(category).trim().toLowerCase() !== "all") {
      query.category = normalizeCategory(category);
    }

    // --------------------------------------------------------
    // COMPLETION FILTER
    // --------------------------------------------------------

    if (isCompleted !== undefined) {
      if (isCompleted !== "true" && isCompleted !== "false") {
        return res.status(400).json({
          success: false,
          message: "isCompleted must be true or false",
        });
      }

      query.isCompleted = isCompleted === "true";
    }

    // ========================================================
    // FIND SAVINGS
    // ========================================================

    const savings = await Savings.find(query).sort({
      priority: -1,
      createdAt: -1,
    });

    // ========================================================
    // SUMMARY
    // ========================================================

    const totalTarget = savings.reduce(
      (sum, item) => sum + Number(item.targetAmount || 0),
      0,
    );

    const totalCurrent = savings.reduce(
      (sum, item) => sum + Number(item.currentAmount || 0),
      0,
    );

    const overallProgress =
      totalTarget > 0 ? Math.min(100, (totalCurrent / totalTarget) * 100) : 0;

    const completedCount = savings.filter((item) => item.isCompleted).length;

    const inProgressCount = savings.filter((item) => !item.isCompleted).length;

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      count: savings.length,

      data: savings,

      summary: {
        totalTarget,

        totalCurrent,

        overallProgress: Number(overallProgress.toFixed(2)),

        completedCount,

        inProgressCount,
      },
    });
  } catch (error) {
    console.error("❌ Get savings error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch savings goals",

      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE SAVINGS GOAL
// ============================================================

exports.getSavingsById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid savings ID",
      });
    }

    const savings = await Savings.findById(id);

    if (!savings) {
      return res.status(404).json({
        success: false,
        message: "Savings goal not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: savings,
    });
  } catch (error) {
    console.error("❌ Get savings by ID error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch savings goal",

      error: error.message,
    });
  }
};

// ============================================================
// GET SAVINGS BY EMAIL
// ============================================================

exports.getSavingsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const savings = await Savings.find({
      email: normalizedEmail,
    }).sort({
      priority: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,

      message: "Savings goals retrieved successfully",

      count: savings.length,

      data: savings,
    });
  } catch (error) {
    console.error("❌ Get savings by email error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to retrieve savings goals",

      error: error.message,
    });
  }
};

// ============================================================
// GET SAVINGS BY USER ID
// ============================================================

exports.getSavingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const savings = await Savings.find({
      userId,
    }).sort({
      priority: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,

      message: "Savings goals retrieved successfully",

      count: savings.length,

      data: savings,
    });
  } catch (error) {
    console.error("❌ Get savings by userId error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to retrieve savings goals",

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
    // REQUIRED FIELDS
    // ========================================================

    if (!category || targetAmount === undefined || !email || !userId) {
      return res.status(400).json({
        success: false,

        message: "Category, target amount, email, and userId are required",
      });
    }

    // ========================================================
    // USER ID
    // ========================================================

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // ========================================================
    // CATEGORY
    // ========================================================

    const normalizedCategory = normalizeCategory(category);

    if (!normalizedCategory) {
      return res.status(400).json({
        success: false,
        message: "Savings category cannot be empty",
      });
    }

    // ========================================================
    // TARGET AMOUNT
    // ========================================================

    const numericTarget = Number(targetAmount);

    if (!Number.isFinite(numericTarget) || numericTarget <= 0) {
      return res.status(400).json({
        success: false,

        message: "Target amount must be greater than zero",
      });
    }

    if (!Number.isInteger(numericTarget)) {
      return res.status(400).json({
        success: false,

        message: "Target amount must be a whole number",
      });
    }

    // ========================================================
    // CURRENT AMOUNT
    // ========================================================

    const numericCurrent =
      currentAmount === undefined ? 0 : Number(currentAmount);

    if (!Number.isFinite(numericCurrent) || numericCurrent < 0) {
      return res.status(400).json({
        success: false,

        message: "Current amount cannot be negative",
      });
    }

    if (!Number.isInteger(numericCurrent)) {
      return res.status(400).json({
        success: false,

        message: "Current amount must be a whole number",
      });
    }

    if (numericCurrent > numericTarget) {
      return res.status(400).json({
        success: false,

        message: "Current savings cannot exceed the target amount",
      });
    }

    // ========================================================
    // EMAIL
    // ========================================================

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    // ========================================================
    // DEADLINE
    // ========================================================

    let normalizedDeadline = null;

    if (deadline) {
      const parsedDeadline = new Date(deadline);

      if (Number.isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({
          success: false,

          message: "Invalid savings deadline",
        });
      }

      normalizedDeadline = parsedDeadline;
    }

    // ========================================================
    // PRIORITY
    // ========================================================

    const normalizedPriority = priority || "medium";

    if (!VALID_PRIORITIES.includes(normalizedPriority)) {
      return res.status(400).json({
        success: false,

        message: "Invalid savings priority",
      });
    }

    // ========================================================
    // DESCRIPTION
    // ========================================================

    const normalizedDescription = String(description || "").trim();

    // ========================================================
    // CREATE SAVINGS
    // ========================================================

    const savings = await Savings.create({
      category: normalizedCategory,

      targetAmount: numericTarget,

      currentAmount: numericCurrent,

      deadline: normalizedDeadline,

      description: normalizedDescription,

      priority: normalizedPriority,

      email: normalizedEmail,

      userId,
    });

    // ========================================================
    // NOTIFICATION
    // ========================================================

    let notificationType = "info";

    let severity = "low";

    if (normalizedPriority === "high") {
      notificationType = "warning";

      severity = "medium";
    }

    if (normalizedPriority === "critical") {
      notificationType = "alert";

      severity = "high";
    }

    const notification = await createNotification({
      userEmail: normalizedEmail,

      userId,

      title: "🎯 Savings Goal Created",

      message:
        `You created a savings goal of RWF ` +
        `${numericTarget.toLocaleString()} ` +
        `for ${savings.category}.`,

      type: notificationType,

      severity,

      relatedId: savings._id,

      relatedType: "Savings",

      actionLink: `/savings/${savings._id}`,

      metadata: {
        savingsId: savings._id,

        category: savings.category,

        targetAmount: savings.targetAmount,

        currentAmount: savings.currentAmount,

        progress: savings.progress,

        priority: savings.priority,
      },
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,

      message: "Savings goal created successfully",

      data: savings,

      notification,
    });
  } catch (error) {
    console.error("❌ Create savings error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,

        message: "Savings validation failed",

        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,

      message: "Failed to create savings goal",

      error: error.message,
    });
  }
};

// ============================================================
// UPDATE SAVINGS
// ============================================================

exports.updateSavings = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================================
    // ID
    // ========================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid savings ID",
      });
    }

    // ========================================================
    // FIND
    // ========================================================

    const savings = await Savings.findById(id);

    if (!savings) {
      return res.status(404).json({
        success: false,

        message: "Savings goal not found",
      });
    }

    // ========================================================
    // OLD VALUES
    // ========================================================

    const oldProgress = Number(savings.progress) || 0;

    const oldCompleted = Boolean(savings.isCompleted);

    const oldCurrentAmount = Number(savings.currentAmount) || 0;

    const oldTargetAmount = Number(savings.targetAmount) || 0;

    // ========================================================
    // REQUEST DATA
    // ========================================================

    const {
      category,
      targetAmount,
      currentAmount,
      deadline,
      description,
      priority,
    } = req.body;

    // ========================================================
    // CATEGORY
    // ========================================================

    if (category !== undefined) {
      const normalizedCategory = normalizeCategory(category);

      if (!normalizedCategory) {
        return res.status(400).json({
          success: false,

          message: "Category cannot be empty",
        });
      }

      savings.category = normalizedCategory;
    }

    // ========================================================
    // TARGET
    // ========================================================

    if (targetAmount !== undefined) {
      const newTarget = Number(targetAmount);

      if (!Number.isFinite(newTarget) || newTarget <= 0) {
        return res.status(400).json({
          success: false,

          message: "Target amount must be greater than zero",
        });
      }

      if (!Number.isInteger(newTarget)) {
        return res.status(400).json({
          success: false,

          message: "Target amount must be a whole number",
        });
      }

      savings.targetAmount = newTarget;
    }

    // ========================================================
    // CURRENT AMOUNT
    // ========================================================

    if (currentAmount !== undefined) {
      const newCurrent = Number(currentAmount);

      if (!Number.isFinite(newCurrent) || newCurrent < 0) {
        return res.status(400).json({
          success: false,

          message: "Current amount must be zero or greater",
        });
      }

      if (!Number.isInteger(newCurrent)) {
        return res.status(400).json({
          success: false,

          message: "Current amount must be a whole number",
        });
      }

      const targetAfterUpdate = Number(savings.targetAmount) || 0;

      if (newCurrent > targetAfterUpdate) {
        return res.status(400).json({
          success: false,

          message: "Current savings cannot exceed the target amount",
        });
      }

      savings.currentAmount = newCurrent;
    }

    // ========================================================
    // DEADLINE
    // ========================================================

    if (deadline !== undefined) {
      if (!deadline) {
        savings.deadline = null;
      } else {
        const parsedDeadline = new Date(deadline);

        if (Number.isNaN(parsedDeadline.getTime())) {
          return res.status(400).json({
            success: false,

            message: "Invalid savings deadline",
          });
        }

        savings.deadline = parsedDeadline;
      }
    }

    // ========================================================
    // DESCRIPTION
    // ========================================================

    if (description !== undefined) {
      savings.description = String(description || "").trim();
    }

    // ========================================================
    // PRIORITY
    // ========================================================

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({
          success: false,

          message: "Invalid savings priority",
        });
      }

      savings.priority = priority;
    }

    // ========================================================
    // SAVE
    //
    // Savings.pre("save") automatically updates:
    //
    // currentAmount
    // progress
    // isCompleted
    // completedDate
    // ========================================================

    await savings.save();

    // ========================================================
    // DETERMINE NOTIFICATION
    // ========================================================

    let notification = null;

    // --------------------------------------------------------
    // COMPLETED
    // --------------------------------------------------------

    if (savings.progress >= 100 && oldProgress < 100) {
      notification = await createNotification({
        userEmail: savings.email,

        userId: savings.userId,

        title: "🎉 Savings Goal Completed",

        message:
          `Congratulations! You completed ` +
          `your ${savings.category} savings goal.`,

        type: "alert",

        severity: "high",

        relatedId: savings._id,

        relatedType: "Savings",

        actionLink: `/savings/${savings._id}`,

        metadata: {
          savingsId: savings._id,

          category: savings.category,

          progress: savings.progress,

          currentAmount: savings.currentAmount,

          targetAmount: savings.targetAmount,

          completed: savings.isCompleted,
        },
      });
    }

    // --------------------------------------------------------
    // 75% MILESTONE
    // --------------------------------------------------------
    else if (savings.progress >= 75 && oldProgress < 75) {
      notification = await createNotification({
        userEmail: savings.email,

        userId: savings.userId,

        title: "🏆 Savings Milestone",

        message:
          `You reached 75% of your ` + `${savings.category} savings goal.`,

        type: "warning",

        severity: "medium",

        relatedId: savings._id,

        relatedType: "Savings",

        actionLink: `/savings/${savings._id}`,

        metadata: {
          savingsId: savings._id,

          category: savings.category,

          progress: savings.progress,

          currentAmount: savings.currentAmount,

          targetAmount: savings.targetAmount,
        },
      });
    }

    // --------------------------------------------------------
    // 50% MILESTONE
    // --------------------------------------------------------
    else if (savings.progress >= 50 && oldProgress < 50) {
      notification = await createNotification({
        userEmail: savings.email,

        userId: savings.userId,

        title: "🏆 Savings Milestone",

        message:
          `You reached 50% of your ` + `${savings.category} savings goal.`,

        type: "warning",

        severity: "medium",

        relatedId: savings._id,

        relatedType: "Savings",

        actionLink: `/savings/${savings._id}`,

        metadata: {
          savingsId: savings._id,

          category: savings.category,

          progress: savings.progress,

          currentAmount: savings.currentAmount,

          targetAmount: savings.targetAmount,
        },
      });
    }

    // --------------------------------------------------------
    // 25% MILESTONE
    // --------------------------------------------------------
    else if (savings.progress >= 25 && oldProgress < 25) {
      notification = await createNotification({
        userEmail: savings.email,

        userId: savings.userId,

        title: "🏆 Savings Milestone",

        message:
          `You reached 25% of your ` + `${savings.category} savings goal.`,

        type: "warning",

        severity: "medium",

        relatedId: savings._id,

        relatedType: "Savings",

        actionLink: `/savings/${savings._id}`,

        metadata: {
          savingsId: savings._id,

          category: savings.category,

          progress: savings.progress,

          currentAmount: savings.currentAmount,

          targetAmount: savings.targetAmount,
        },
      });
    }

    // --------------------------------------------------------
    // NORMAL UPDATE
    // --------------------------------------------------------
    else {
      notification = await createNotification({
        userEmail: savings.email,

        userId: savings.userId,

        title: "📝 Savings Goal Updated",

        message: `Your ${savings.category} ` + `savings goal was updated.`,

        type: "info",

        severity: "low",

        relatedId: savings._id,

        relatedType: "Savings",

        actionLink: `/savings/${savings._id}`,

        metadata: {
          savingsId: savings._id,

          category: savings.category,

          targetAmount: savings.targetAmount,

          currentAmount: savings.currentAmount,

          progress: savings.progress,

          previousProgress: oldProgress,

          previousCurrentAmount: oldCurrentAmount,

          previousTargetAmount: oldTargetAmount,

          previouslyCompleted: oldCompleted,
        },
      });
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message: "Savings updated successfully",

      data: savings,

      notification,
    });
  } catch (error) {
    console.error("❌ Update savings error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,

        message: "Savings validation failed",

        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,

      message: "Failed to update savings goal",

      error: error.message,
    });
  }
};

// ============================================================
// DELETE SAVINGS
// ============================================================

exports.deleteSavings = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================================
    // ID
    // ========================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid savings ID",
      });
    }

    // ========================================================
    // FIND
    // ========================================================

    const savings = await Savings.findById(id);

    if (!savings) {
      return res.status(404).json({
        success: false,

        message: "Savings goal not found",
      });
    }

    // ========================================================
    // SAVE VALUES BEFORE DELETE
    // ========================================================

    const savingsId = savings._id;

    const savingsEmail = savings.email;

    const savingsUserId = savings.userId;

    const savingsCategory = savings.category;

    const savingsTarget = Number(savings.targetAmount) || 0;

    const savingsCurrent = Number(savings.currentAmount) || 0;

    // ========================================================
    // DELETE
    // ========================================================

    await savings.deleteOne();

    // ========================================================
    // HISTORICAL NOTIFICATION
    // ========================================================

    const notification = await createNotification({
      userEmail: savingsEmail,

      userId: savingsUserId,

      title: "🗑️ Savings Goal Deleted",

      message: `Your ${savingsCategory} ` + `savings goal was deleted.`,

      type: "warning",

      severity: "medium",

      relatedId: savingsId,

      relatedType: "Savings",

      actionLink: "/savings",

      metadata: {
        savingsId,

        category: savingsCategory,

        targetAmount: savingsTarget,

        currentAmount: savingsCurrent,
      },
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message: "Savings deleted successfully",

      notification,
    });
  } catch (error) {
    console.error("❌ Delete savings error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to delete savings goal",

      error: error.message,
    });
  }
};
