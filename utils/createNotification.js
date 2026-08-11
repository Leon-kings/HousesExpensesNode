// const Notification = require("../models/Notification");

// /**
//  * Universal notification creator
//  */
// const createNotification = async ({
//   userId = null,
//   email = null,
//   title = "",
//   message,
//   type = "info", // info | warning | alert
//   referenceId = null,
//   referenceModel = null,
// }) => {
//   try {
//     if (!message) {
//       throw new Error("Notification message is required");
//     }

//     const notification = await Notification.create({
//       userId,
//       email,
//       title,
//       message,
//       type,
//       referenceId,
//       referenceModel,
//     });

//     return notification;
//   } catch (error) {
//     console.error("Notification error:", error.message);
//     return null;
//   }
// };

// module.exports = createNotification;











// ============================================================
// UTILS / CREATENOTIFICATION.JS
// ============================================================

const Notification = require("../models/Notification");

const createNotification = async ({
  userEmail,
  email,

  userId,

  title,
  message,

  type = "info",
  severity = "low",

  relatedId = null,
  relatedType = null,

  referenceId = null,
  referenceModel = null,

  actionLink = null,

  metadata = {},
}) => {
  try {
    const finalEmail =
      userEmail ||
      email;

    const finalRelatedId =
      relatedId ||
      referenceId ||
      null;

    const finalRelatedType =
      relatedType ||
      referenceModel ||
      null;

    if (!userId) {
      console.error(
        "❌ Notification creation failed: userId is required"
      );

      return null;
    }

    if (!finalEmail) {
      console.error(
        "❌ Notification creation failed: email is required"
      );

      return null;
    }

    if (!title || !message) {
      console.error(
        "❌ Notification creation failed: title and message are required"
      );

      return null;
    }

    return await Notification.create({
      userId,

      userEmail: finalEmail
        .trim()
        .toLowerCase(),

      title,

      message,

      type,

      severity,

      isRead: false,

      relatedId: finalRelatedId,

      relatedType: finalRelatedType,

      actionLink,

      metadata,
    });
  } catch (error) {
    console.error(
      "❌ Notification creation failed:",
      error.message
    );

    return null;
  }
};

module.exports = createNotification;