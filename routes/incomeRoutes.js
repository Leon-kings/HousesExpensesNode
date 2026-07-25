const express = require('express');
const router = express.Router();
const {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
  getBudgetSummary,
  getIncomeStats,
} = require('../controllers/incomeController');

// Budget summary route (must be before /:id)
router.get('/budget-summary', getBudgetSummary);

// Stats route
router.get('/stats', getIncomeStats);

// CRUD routes
router.route('/')
  .get(getIncomes)
  .post(createIncome);

router.route('/:id')
  .get(getIncome)
  .put(updateIncome)
  .delete(deleteIncome);

module.exports = router;