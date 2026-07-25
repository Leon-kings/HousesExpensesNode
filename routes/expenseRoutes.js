const express = require("express");
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getStats,
  bulkDeleteExpenses,
} = require("../controllers/expenseController");

// GET and POST expenses
router.route("/").get(getExpenses).post(createExpense);

// Get statistics
router.get("/stats", getStats);

// Bulk delete
router.delete("/bulk", bulkDeleteExpenses);

// GET, PUT, DELETE single expense
router.route("/:id").get(getExpense).put(updateExpense).delete(deleteExpense);

module.exports = router;
