/**
 * قرعة - qor3a Backend Core
 * DV Lottery Registration System
 *
 * Modular Monolith Entry Point
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { logger } = require("./common/logger");
const { errorHandler } = require("./common/error-handler");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(
  rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  })
);

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API v1 Routes
app.use("/api/v1/auth", require("./modules/auth/auth.routes"));
app.use("/api/v1/users", require("./modules/users/users.routes"));
app.use("/api/v1/orders", require("./modules/orders/orders.routes"));
app.use("/api/v1/payments", require("./modules/payments/payments.routes"));
app.use("/api/v1/notifications", require("./modules/notifications/notifications.routes"));
app.use("/api/v1/admin", require("./modules/admin/admin.routes"));

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`qor3a API running on port ${PORT}`);
});

module.exports = app;
