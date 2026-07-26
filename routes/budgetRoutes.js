// const express = require('express');
// const router = express.Router();
// const {
//   getBudgets,
//   createBudget,
//   updateBudget,
//   deleteBudget,
// } = require('../controllers/budgetController');

// router.route('/')
//   .get(getBudgets)
//   .post(createBudget);

// router.route('/:id')
//   .put(updateBudget)
//   .delete(deleteBudget);

// module.exports = router;


const express = require("express");
const router = express.Router();

const {
  getBudgets,
  getBudgetsByEmail,
  createBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

// Get all budgets / Create budget
router.route("/")
  .get(getBudgets)
  .post(createBudget);

// Get budgets by email
router.get("/email/:email", getBudgetsByEmail);

// Update/Delete budget by ID
router.route("/:id")
  .put(updateBudget)
  .delete(deleteBudget);
    
module.exports = router;