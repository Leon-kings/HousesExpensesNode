// const Notification = require("../models/Notification");

// /* ===========================================
//                Get User Notifications
//             =========================================== */

// // exports.getNotifications = async (req, res) => {
// //   try {
// //     const notifications = await Notification.find({
// //       userEmail: req.params.email,
// //     }).sort({ createdAt: -1 });

// //     res.json({
// //       success: true,
// //       notifications,
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: error.message,
// //     });
// //   }
// // };

// exports.getNotifications = async (req, res) => {
//   try {
//     const notifications = await Notification.find({
//       userEmail: req.params.email.toLowerCase(),
//     }).sort({ createdAt: -1 });

//     return res.json({
//       success: true,
//       count: notifications.length,
//       notifications,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // exports.getAllNotifications = async (req, res) => {
// //   try {
// //     const notifications = await Notification.find({}).sort({ createdAt: -1 });

// //     return res.status(200).json({
// //       success: true,
// //       count: notifications.length,
// //       notifications,
// //     });
// //   } catch (error) {
// //     console.error("❌ Error fetching notifications:", error);

// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to fetch notifications",
// //       error: error.message,
// //     });
// //   }
// // };

// // exports.getAllNotifications = async (req, res) => {
// //   try {
// //     const notifications = await Notification.find({}).sort({ createdAt: -1 });

// //     return res.status(200).json({
// //       success: true,

// //       count: notifications.length,

// //       notifications,
// //     });
// //   } catch (error) {
// //     console.error("❌ Error fetching all notifications:", error);

// //     return res.status(500).json({
// //       success: false,

// //       message: "Failed to fetch notifications",

// //       error: error.message,
// //     });
// //   }
// // };

// exports.getAllNotifications = async (req, res) => {
//   try {
//     const notifications = await Notification.find({}).sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       count: notifications.length,
//       notifications,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching all notifications:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch notifications",
//       error: error.message,
//     });
//   }
// };

// /* ===========================================
//                Get Notification By ID
//             =========================================== */

// exports.getNotification = async (req, res) => {
//   try {
//     const notification = await Notification.findById(req.params.id);

//     if (!notification) {
//       return res.status(404).json({
//         success: false,
//         message: "Notification not found",
//       });
//     }

//     res.json(notification);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* ===========================================
//                Mark As Read
//             =========================================== */

// exports.markAsRead = async (req, res) => {
//   try {
//     const notification = await Notification.findById(req.params.id);

//     if (!notification) {
//       return res.status(404).json({
//         success: false,
//         message: "Notification not found",
//       });
//     }

//     notification.isRead = true;

//     await notification.save();

//     res.json({
//       success: true,
//       message: "Notification marked as read.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* ===========================================
//                Delete Notification
//             =========================================== */

// exports.deleteNotification = async (req, res) => {
//   try {
//     await Notification.findByIdAndDelete(req.params.id);

//     res.json({
//       success: true,
//       message: "Notification deleted.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* ===========================================
//                Statistics
//             =========================================== */

// exports.statistics = async (req, res) => {
//   try {
//     const total = await Notification.countDocuments();

//     const unread = await Notification.countDocuments({
//       isRead: false,
//     });

//     const read = await Notification.countDocuments({
//       isRead: true,
//     });

//     res.json({
//       total,
//       read,
//       unread,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// ============================================================
// CONTROLLERS / NOTIFICATIONCONTROLLER.JS
// ============================================================

const Notification = require("../models/Notification");

// ============================================================
// GET NOTIFICATIONS BY USER EMAIL
// @route GET /api/notifications/:email
// ============================================================

exports.getNotifications = async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const notifications = await Notification.find({
      userEmail: normalizedEmail,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("❌ Get user notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// ============================================================
// GET ALL NOTIFICATIONS
// @route GET /api/notifications/all
// ============================================================

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("❌ Get all notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// ============================================================
// GET NOTIFICATION BY ID
// @route GET /api/notifications/:id
// ============================================================

exports.getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("❌ Get notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
      error: error.message,
    });
  }
};

// ============================================================
// MARK ONE NOTIFICATION AS READ
// @route PUT /api/notifications/:id/read
// ============================================================

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("❌ Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// ============================================================
// MARK ALL USER NOTIFICATIONS AS READ
// @route PUT /api/notifications/read-all/:email
// ============================================================

exports.markAllAsRead = async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const readAt = new Date();

    const result = await Notification.updateMany(
      {
        userEmail: normalizedEmail,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Mark all notifications as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE ONE NOTIFICATION
// @route DELETE /api/notifications/:id
// ============================================================

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: notification,
    });
  } catch (error) {
    console.error("❌ Delete notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE ALL NOTIFICATIONS FOR USER
// @route DELETE /api/notifications/user/:email
// ============================================================

exports.deleteAllUserNotifications = async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await Notification.deleteMany({
      userEmail: normalizedEmail,
    });

    return res.status(200).json({
      success: true,
      message: "All user notifications deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Delete all user notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user notifications",
      error: error.message,
    });
  }
};

// ============================================================
// BULK MARK NOTIFICATIONS AS READ
// @route PUT /api/notifications/bulk-read
// ============================================================

exports.bulkMarkAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of notification IDs",
      });
    }

    const readAt = new Date();

    const result = await Notification.updateMany(
      {
        _id: {
          $in: notificationIds,
        },
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Notifications marked as read successfully",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Bulk mark notifications as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
};

// ============================================================
// BULK DELETE NOTIFICATIONS
// @route DELETE /api/notifications/bulk
// ============================================================

exports.bulkDeleteNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of notification IDs",
      });
    }

    const result = await Notification.deleteMany({
      _id: {
        $in: notificationIds,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Notifications deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Bulk delete notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notifications",
      error: error.message,
    });
  }
};

// ============================================================
// NOTIFICATION STATISTICS
// @route GET /api/notifications/statistics
// ============================================================

exports.statistics = async (req, res) => {
  try {
    const total = await Notification.countDocuments();

    const unread = await Notification.countDocuments({
      isRead: false,
    });

    const read = await Notification.countDocuments({
      isRead: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        total,
        read,
        unread,
      },
    });
  } catch (error) {
    console.error("❌ Notification statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification statistics",
      error: error.message,
    });
  }
};

// ============================================================
// USER NOTIFICATION STATISTICS
// @route GET /api/notifications/statistics/:email
// ============================================================

exports.userStatistics = async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const userEmail = email.trim().toLowerCase();

    const total = await Notification.countDocuments({
      userEmail,
    });

    const unread = await Notification.countDocuments({
      userEmail,
      isRead: false,
    });

    const read = await Notification.countDocuments({
      userEmail,
      isRead: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        total,
        read,
        unread,
      },
    });
  } catch (error) {
    console.error("❌ User notification statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user notification statistics",
      error: error.message,
    });
  }
};
