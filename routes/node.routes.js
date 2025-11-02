const express = require('express');
const checkWorkflowNodeExistence = require('@middlewares/checkWorkflowNodeExistence');
const { getNode, updateNode, deleteNode } = require('@controllers/nodes.controller');
const validateUpdateWorkflowNode = require('@middlewares/validators/nodes/validateUpdateWorkflowNode');

const router = express.Router();

router.param("workflowNodeId", checkWorkflowNodeExistence);

router.get("/:workflowNodeId", getNode);

router.put("/:workflowNodeId", validateUpdateWorkflowNode, updateNode);

router.delete("/:workflowNodeId", deleteNode);

module.exports = nodeRoutes = router;