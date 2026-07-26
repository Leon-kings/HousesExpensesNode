// const express = require('express');
// const router = express.Router();
// const {
//   getSavings,
//   createSavings,
//   updateSavings,
//   deleteSavings,
// } = require('../controllers/savingsController');

// router.route('/')
//   .get(getSavings)
//   .post(createSavings);

// router.route('/:id')
//   .put(updateSavings)
//   .delete(deleteSavings);

// module.exports = router;



const express = require("express");
const router = express.Router();

const {
  getSavings,
  getSavingsByEmail,
  createSavings,
  updateSavings,
  deleteSavings,
} = require("../controllers/savingsController");

// Get all savings / Create savings
router.route("/")
  .get(getSavings)
  .post(createSavings);

// Get savings by email
router.get("/email/:email", getSavingsByEmail);

// Update/Delete savings by ID
router.route("/:id")
  .put(updateSavings)
  .delete(deleteSavings);

module.exports = router;