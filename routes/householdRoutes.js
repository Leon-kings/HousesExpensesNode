const express = require("express");

const router = express.Router();

const {
  getMyHousehold,
  addMember,
  updateMember,
  deleteMember,
} = require("../controllers/householdController");


router.get("/", getMyHousehold);

router.post("/create", addMember);

router.put("/:memberId", updateMember);

router.delete("/:memberId", deleteMember);

module.exports = router;
