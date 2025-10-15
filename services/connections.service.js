const WorkflowNode = require("../models/WorkflowNode.model");

const checkConnectionValidity = async (
  sourceNodeId,
  destinationNodeId,
  workflowId
) => {
  const sourceNode = await WorkflowNode.findByPk(sourceNodeId);
  const destinationNode = await WorkflowNode.findByPk(destinationNodeId);
  if (!sourceNode || !destinationNode) {
    return { valid: false, reason: "Source or destination node not found" };
  }
  if (sourceNode.workflowId !== destinationNode.workflowId) {
    return {
      valid: false,
      reason: "Source and destination nodes belong to different workflows",
    };
  }
  if (sourceNode.workflowId != workflowId) {
    return {
      valid: false,
      reason: "Nodes doesn't belong to this workflow",
    };
  }
  return { valid: true };
};

module.exports = {
  checkConnectionValidity,
};
