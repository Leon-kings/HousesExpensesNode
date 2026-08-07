// const express = require("express");
// const   router = express.Router();
// const {
//   getExpenses,
//   getExpense,
//   createExpense,
//   updateExpense,
//   deleteExpense,
//   getStats,
//   bulkDeleteExpenses,
// } = require("../controllers/expenseController");

// // GET and POST expenses
// router.route("/").get(getExpenses).post(createExpense);

// // Get statistics
// router.get("/stats", getStats);

// // Bulk delete
// router.delete("/bulk", bulkDeleteExpenses);

// // GET, PUT, DELETE single expense
// router.route("/:id").get(getExpense).put(updateExpense).delete(deleteExpense);

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  getExpenses,
  getExpense,
  getExpensesByEmail,
  createExpense,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses,
  getStats,
  getAllExpenses,
} = require("../controllers/expenseController");

// CRUD
router.get("/all", getExpenses);
router.get("/email/:email", getExpensesByEmail);
router.get("/", getAllExpenses);
router.get("/stats", getStats);

router.get("/:id", getExpense);

router.post("/", createExpense);

router.put("/:id", updateExpense);

router.delete("/bulk", bulkDeleteExpenses);
router.delete("/:id", deleteExpense);

module.exports = router;
