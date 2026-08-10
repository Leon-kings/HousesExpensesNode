const Notification = require("../models/Notification");

/* ===========================================
               Get User Notifications
            =========================================== */

// exports.getNotifications = async (req, res) => {
//   try {
//     const notifications = await Notification.find({
//       userEmail: req.params.email,
//     }).sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       notifications,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userEmail: req.params.email.toLowerCase(),
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// exports.getAllNotifications = async (req, res) => {
//   try {
//     const notifications = await Notification.find({}).sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       count: notifications.length,
//       notifications,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching notifications:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch notifications",
//       error: error.message,
//     });
//   }
// };

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

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("❌ Error fetching all notifications:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

/* ===========================================
               Get Notification By ID
            =========================================== */

exports.getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================
               Mark As Read
            =========================================== */

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

    await notification.save();

    res.json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================
               Delete Notification
            =========================================== */

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Notification deleted.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================================
               Statistics
            =========================================== */

exports.statistics = async (req, res) => {
  try {
    const total = await Notification.countDocuments();

    const unread = await Notification.countDocuments({
      isRead: false,
    });

    const read = await Notification.countDocuments({
      isRead: true,
    });

    res.json({
      total,
      read,
      unread,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
