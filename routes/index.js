const express = require("express");
const usersRoutes = require("./users.routes");
const workflowRoutes = require("./workflow.routes");
const checkUserAuthenticity = require("../middlewares/auth");
const nodeRoutes = require("./node.routes");
const userWorkflowRoutes = require("./userWorkflow.routes");
const router = express.Router();

// Public routes
router.use("/users", usersRoutes);

// Protected routes
router.use(
  "/workflows",
  checkUserAuthenticity,
  workflowRoutes
);
router.use(
  "/nodes",
  checkUserAuthenticity,
  nodeRoutes
);
router.use(
  "/user-workflows",
  checkUserAuthenticity,
  userWorkflowRoutes
);

module.exports = router;
