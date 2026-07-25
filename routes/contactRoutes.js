const express = require("express");

const router = express.Router();

const contactController = require("../controllers/contactController");

router.post("/",contactController.sendMessage);

router.get("/",contactController.getMessages);

router.get("/statistics",contactController.statistics);

router.get("/:id",contactController.getMessage);

router.put("/reply/:id",contactController.replyMessage);

router.delete("/:id",contactController.deleteMessage);

module.exports = router;