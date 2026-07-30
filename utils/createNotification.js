const Notification = require("../models/Notification");

const createNotification = async (
  userEmail,
  title,
  message,
  type = "system",
  severity = "low",
  relatedId = null,
  relatedType = "system"
) => {
  try {
    const notification = await Notification.create({
      userEmail,
      title,
      message,
      type,
      severity,
      relatedId,
      relatedType: relatedType.toLowerCase(),
    });

    return notification;
  } catch (error) {
    console.error("Notification Error:", error);
    return null;
  }
};

module.exports = createNotification;