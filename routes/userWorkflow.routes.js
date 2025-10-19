const express = require("express");
const checkUserWorkflowAccess = require("../middlewares/checkUserWorkflowAccess");
const {
  startUserWorkflow,
  getUserWorkflow,
  getAllUserWorkflows,
} = require("../controllers/userWorkflows.controller");
const workflowExecutionsRoutes = require("./workflowExecutions.routes");

const router = express.Router();

router.param("userWorkflowId", checkUserWorkflowAccess);

router.use("/:userWorkflowId/executions", workflowExecutionsRoutes);

router.get("/:userWorkflowId", getUserWorkflow);
router.get("/", getAllUserWorkflows);

router.post("/:userWorkflowId/start", startUserWorkflow);

module.exports = userWorkflowRoutes = router;
