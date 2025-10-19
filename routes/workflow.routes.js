const express = require("express");
const validateCreateWorkflow = require("../middlewares/validators/workflows/validateCreateWorkflow");
const validateUpdateWorkflow = require("../middlewares/validators/workflows/validateUpdateWorkflow");
const validateUpdateWorkflowStatus = require("../middlewares/validators/workflows/validateUpdateWorkflowStatus");
const validateUpdateWorkflowVisibility = require("../middlewares/validators/workflows/validateUpdateWorkflowVisibility");
const {
  createWorkflow,
  updateWorkflow,
  updateWorkflowStatus,
  updateWorkflowVisibility,
  deleteWorkflow,
  createWorkflowNode,
  getWorkflowNodes,
  getWorkflowGraph,
} = require("../controllers/workflows.controller");
const checkWorkflowAccess = require("../middlewares/checkWorkflowAccess");
const validateCreateWorkflowNode = require("../middlewares/validators/nodes/validateCreateWorkflowNode");
const connectionRoutes = require("./connection.routes");

const router = express.Router();

router.param("workflowId", checkWorkflowAccess);

router.use("/:workflowId/connections", connectionRoutes);

router.get("/:workflowId/nodes", getWorkflowNodes);
router.get("/:workflowId/graph", getWorkflowGraph);

router.post(
  "/:workflowId/nodes",
  validateCreateWorkflowNode,
  createWorkflowNode
);
router.post("/", validateCreateWorkflow, createWorkflow);

router.put("/:workflowId", validateUpdateWorkflow, updateWorkflow);

router.patch(
  "/:workflowId/status",
  validateUpdateWorkflowStatus,
  updateWorkflowStatus
);
router.patch(
  "/:workflowId/visibility",
  validateUpdateWorkflowVisibility,
  updateWorkflowVisibility
);

router.delete("/:workflowId", deleteWorkflow);

module.exports = workflowRoutes = router;
