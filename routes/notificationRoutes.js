// const express = require("express");

// const router = express.Router();

// const notificationController = require("../controllers/notificationController");

// router.get("/statistics",notificationController.statistics);

// router.get("/user/:email",notificationController.getNotifications);

// router.get("/all",notificationController.getAllNotifications);
// router.get("/:id",notificationController.getNotification);

// router.put("/read/:id",notificationController.markAsRead);

// router.delete("/:id",notificationController.deleteNotification);

// module.exports = router;








const express = require("express");

const router = express.Router();

const {
  getNotifications,
  getNotificationsByUserId,
  getAllNotifications,
  getNotification,

  markAsRead,
  markAllAsRead,
  markAllAsReadByUserId,

  deleteNotification,
  deleteAllUserNotifications,
  deleteAllUserNotificationsByUserId,

  bulkMarkAsRead,
  bulkDeleteNotifications,

  statistics,
  userStatistics,
  userStatisticsByUserId,
} = require("../controllers/notificationController");

// ============================================================
// GET ROUTES
// ============================================================

// Get all notifications
// GET /api/notifications/all
router.get("/all", getAllNotifications);

// Get notification statistics
// GET /api/notifications/statistics
router.get("/statistics", statistics);

// Get notifications by email
// GET /api/notifications/email/:email
router.get("/email/:email", getNotifications);

// Get notifications by user ID
// GET /api/notifications/user/:userId
router.get("/user/:userId", getNotificationsByUserId);

// Get user statistics by email
// GET /api/notifications/statistics/email/:email
router.get(
  "/statistics/email/:email",
  userStatistics
);

// Get user statistics by user ID
// GET /api/notifications/statistics/user/:userId
router.get(
  "/statistics/user/:userId",
  userStatisticsByUserId
);

// Get one notification
// GET /api/notifications/:id
router.get("/:id", getNotification);

// ============================================================
// READ ROUTES
// ============================================================

// Mark one notification as read
// PUT /api/notifications/:id/read
router.put("/:id/read", markAsRead);

// Mark all notifications as read by email
// PUT /api/notifications/read-all/email/:email
router.put(
  "/read-all/email/:email",
  markAllAsRead
);

// Mark all notifications as read by user ID
// PUT /api/notifications/read-all/user/:userId
router.put(
  "/read-all/user/:userId",
  markAllAsReadByUserId
);

// Bulk mark as read
// PUT /api/notifications/bulk-read
router.put(
  "/bulk-read",
  bulkMarkAsRead
);

// ============================================================
// DELETE ROUTES
// ============================================================

// Delete all notifications by email
// DELETE /api/notifications/user/email/:email
router.delete(
  "/user/email/:email",
  deleteAllUserNotifications
);

// Delete all notifications by user ID
// DELETE /api/notifications/user/:userId
router.delete(
  "/user/:userId",
  deleteAllUserNotificationsByUserId
);

// Bulk delete
// DELETE /api/notifications/bulk
router.delete(
  "/bulk",
  bulkDeleteNotifications
);

// Delete one notification
// DELETE /api/notifications/:id
router.delete(
  "/:id",
  deleteNotification
);

module.exports = router;

