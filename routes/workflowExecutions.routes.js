const express = require("express");
const { getExecutionLog, getExecutionsHistory, stopWorkflowExecution } = require("../controllers/workflowExecutions.controller");
const checkWorkflowExecutionExistence = require("../middlewares/checkWorkflowExecutionExistence");
const router = express.Router({ mergeParams: true });

router.param("workflowExecutionId", checkWorkflowExecutionExistence);

router.get("/:workflowExecutionId", getExecutionLog);
router.get("/", getExecutionsHistory);

router.post("/:workflowExecutionId/stop", stopWorkflowExecution);

module.exports = workflowExecutionRoutes = router;