const Notification = require("../models/Notification");

/**
 * Universal notification creator
 */
const createNotification = async ({
  userId = null,
  email = null,
  title = "",
  message,
  type = "info", // info | warning | alert
  referenceId = null,
  referenceModel = null,
}) => {
  try {
    if (!message) {
      throw new Error("Notification message is required");
    }

    const notification = await Notification.create({
      userId,
      email,
      title,
      message,
      type,
      referenceId,
      referenceModel,
    });

    return notification;
  } catch (error) {
    console.error("Notification error:", error.message);
    return null;
  }
};

module.exports = createNotification;