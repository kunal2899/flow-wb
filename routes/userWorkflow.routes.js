const express = require("express");
const checkUserWorkflowAccess = require("@middlewares/checkUserWorkflowAccess");
const {
  startUserWorkflow,
  getUserWorkflow,
  getAllUserWorkflows,
  addUserWorkflowTrigger,
} = require("@controllers/userWorkflows.controller");
const workflowExecutionsRoutes = require("./workflowExecutions.routes");
const validateAddTrigger = require("@middlewares/validators/userWorkflows/validateAddTrigger");

const router = express.Router();

router.param("userWorkflowId", checkUserWorkflowAccess);

router.use("/:userWorkflowId/executions", workflowExecutionsRoutes);

router.get("/:userWorkflowId", getUserWorkflow);
router.get("/", getAllUserWorkflows);

router.post("/:userWorkflowId/start", startUserWorkflow);
router.post(
  "/:userWorkflowId/triggers",
  validateAddTrigger,
  addUserWorkflowTrigger
);

module.exports = userWorkflowRoutes = router;
