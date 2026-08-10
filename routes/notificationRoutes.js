const express = require("express");

const router = express.Router();

const notificationController = require("../controllers/notificationController");

router.get("/statistics",notificationController.statistics);

router.get("/user/:email",notificationController.getNotifications);

router.get("/all",notificationController.getAllNotifications);
router.get("/:id",notificationController.getNotification);

router.put("/read/:id",notificationController.markAsRead);

router.delete("/:id",notificationController.deleteNotification);

module.exports = router;