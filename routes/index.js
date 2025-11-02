const express = require("express");
const globalModelsLoader = require("@helpers/globalModelsLoader");
globalModelsLoader();
const usersRoutes = require("./users.routes");
const workflowRoutes = require("./workflow.routes");
const checkUserAuthenticity = require("@middlewares/auth");
const nodeRoutes = require("./node.routes");
const userWorkflowRoutes = require("./userWorkflow.routes");
const workflowExecutionsRoutes = require("./workflowExecutions.routes");
const userWorkflowTriggerRoutes = require("./userWorkflowTrigger.routes");
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
router.use(
  "/user-workflow-triggers",
  checkUserAuthenticity,
  userWorkflowTriggerRoutes
);
router.use(
  "/workflow-executions",
  checkUserAuthenticity,
  workflowExecutionsRoutes
);

module.exports = router;
