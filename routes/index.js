const express = require("express");
const usersRoutes = require("./users.routes");
const workflowRoutes = require("./workflow.routes");
const checkUserAuthenticity = require("../middlewares/auth");
const router = express.Router();

// Public routes
router.use("/users", usersRoutes);

// Protected routes
router.use(
  "/workflows",
  checkUserAuthenticity,
  workflowRoutes
);

module.exports = router;
