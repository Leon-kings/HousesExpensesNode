const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config();

/* ---------------- ROUTES ---------------- */
const { verifyConnection } = require("./mail/contactMail");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const householdRoutes = require("./routes/householdRoutes");
const expenseRoutes = require('./routes/expenseRoutes');

const incomeRoutes = require('./routes/incomeRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const savingsRoutes = require('./routes/savingsRoutes');



/* ---------------- APP ---------------- */
const app = express();

/* ---------------- GLOBAL MIDDLEWARE ---------------- */
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/* ---------------- ROUTES ---------------- */

app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/households", householdRoutes);
app.use('/api/expenses', expenseRoutes);

app.use('/api/incomes', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings', savingsRoutes);


/* ---------------- HEALTH CHECK ---------------- */
app.get("/health", (req, res) => { 
  res.json({
    status: "OK",
    dbState: mongoose.connection.readyState,
    time: new Date().toISOString(),
  });
});

/* ---------------- ROOT ---------------- */
app.get("/", (req, res) => {
  res.json({
    message: "House hold Expense API is running",
    version: "1.0.0",
  });
});

/* ---------------- 404 ---------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* ---------------- DB CONNECTION ---------------- */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    setTimeout(connectDB, 5000); // retry
  }
};

/* ---------------- SERVER START ---------------- */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Verify Email Service
  try {
    await verifyConnection();

    console.log("✅ Email service connected successfully");
  } catch (error) {
    console.error("❌ Email service connection failed:", error.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  /* ---------------- GRACEFUL SHUTDOWN ---------------- */

  const shutdown = async (signal) => {
    console.log(`⚠️ ${signal} received`);

    server.close(async () => {
      await mongoose.connection.close();

      console.log("🔌 MongoDB disconnected");

      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

startServer();
