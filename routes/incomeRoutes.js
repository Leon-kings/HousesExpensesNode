// const express = require('express');
// const router = express.Router();
// const {
//   getIncomes,
//   getIncome,
//   createIncome,
//   updateIncome,
//   deleteIncome,
//   getBudgetSummary,
//   getIncomeStats,
// } = require('../controllers/incomeController');

// // Budget summary route (must be before /:id)
// router.get('/budget-summary', getBudgetSummary);

// // Stats route
// router.get('/stats', getIncomeStats);

// // CRUD routes
// router.route('/')
//   .get(getIncomes)
//   .post(createIncome);

// router.route('/:id')
//   .get(getIncome)
//   .put(updateIncome)
//   .delete(deleteIncome);

// module.exports = router;


const express = require("express");
const router = express.Router();

const {
  getIncomes,
  getIncomesByEmail,
  createIncome,
  updateIncome,
  deleteIncome,
} = require("../controllers/incomeController");

// Get all incomes / Create income
router.route("/")
  .get(getIncomes)
  .post(createIncome);

// Get incomes by email
router.get("/email/:email", getIncomesByEmail);

// Update/Delete income by ID
router.route("/:id")
  .put(updateIncome)
  .delete(deleteIncome);

module.exports = router;