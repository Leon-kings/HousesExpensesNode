// const express = require("express");

// const router = express.Router();

// const contactController = require("../controllers/contactController");

// router.post("/",contactController.sendMessage);

// router.get("/",contactController.getMessages);

// router.get("/statistics",contactController.statistics);

// router.get("/:id",contactController.getMessage);

// router.put("/reply/:id",contactController.replyMessage);

// router.delete("/:id",contactController.deleteMessage);

// module.exports = router;



const express = require("express");

const router = express.Router();

const contactController = require("../controllers/contactController");

// Send contact message
router.post("/", contactController.sendMessage);

// Get all messages
router.get("/", contactController.getMessages);

// Get statistics
router.get("/statistics", contactController.statistics);

// Get messages by email
router.get("/email/:email", contactController.getContactMessagesByEmail);

// Get single message by ID
router.get("/:id", contactController.getMessage);

// Reply to a message
router.put("/reply/:id", contactController.replyMessage);

// Delete a message
router.delete("/:id", contactController.deleteMessage);

module.exports = router;