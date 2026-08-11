// // const express = require("express");
// // const   router = express.Router();
// // const {
// //   getExpenses,
// //   getExpense,
// //   createExpense,
// //   updateExpense,
// //   deleteExpense,
// //   getStats,
// //   bulkDeleteExpenses,
// // } = require("../controllers/expenseController");

// // // GET and POST expenses
// // router.route("/").get(getExpenses).post(createExpense);

// // // Get statistics
// // router.get("/stats", getStats);

// // // Bulk delete
// // router.delete("/bulk", bulkDeleteExpenses);

// // // GET, PUT, DELETE single expense
// // router.route("/:id").get(getExpense).put(updateExpense).delete(deleteExpense);

// // module.exports = router;

// const express = require("express");
// const router = express.Router();

// const {
//   getExpenses,
//   getExpense,
//   getExpensesByEmail,
//   createExpense,
//   updateExpense,
//   deleteExpense,
//   bulkDeleteExpenses,
//   getStats,
//   getAllExpenses,
// } = require("../controllers/expenseController");

// // CRUD
// router.get("/all", getExpenses);
// router.get("/email/:email", getExpensesByEmail);
// router.get("/", getAllExpenses);
// router.get("/stats", getStats);

// router.get("/:id", getExpense);

// router.post("/", createExpense);

// router.put("/:id", updateExpense);

// router.delete("/bulk", bulkDeleteExpenses);
// router.delete("/:id", deleteExpense);

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

// ============================================================
// GET ALL EXPENSES
// GET /api/expenses/all
// ============================================================

router.get("/all", getAllExpenses);

// ============================================================
// GET EXPENSES BY EMAIL
// GET /api/expenses/email/:email
// ============================================================

router.get(
  "/email/:email",
  getExpensesByEmail
);

// ============================================================
// GET EXPENSE STATISTICS
// GET /api/expenses/stats
// ============================================================

router.get("/stats", getStats);

// ============================================================
// GET EXPENSES WITH FILTERS
// GET /api/expenses
// ============================================================

router.get("/", getExpenses);

// ============================================================
// CREATE EXPENSE
// POST /api/expenses
// ============================================================

router.post("/", createExpense);

// ============================================================
// BULK DELETE
// DELETE /api/expenses/bulk
// ============================================================

router.delete(
  "/bulk",
  bulkDeleteExpenses
);

// ============================================================
// GET SINGLE EXPENSE
// GET /api/expenses/:id
// ============================================================

router.get("/:id", getExpense);

// ============================================================
// UPDATE EXPENSE
// PUT /api/expenses/:id
// ============================================================

router.put("/:id", updateExpense);

// ============================================================
// DELETE EXPENSE
// DELETE /api/expenses/:id
// ============================================================

router.delete(
  "/:id",
  deleteExpense
);

module.exports = router;