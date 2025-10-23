const { WORKFLOW_NODE_EXECUTION_STATUS } = require("@constants/workflowExecution");

const abortForCancelledNode = async (nodeExecution) => {
  await nodeExecution.reload();
  if (nodeExecution.status === WORKFLOW_NODE_EXECUTION_STATUS.CANCELLED) {
    const error = new Error("Node execution has been cancelled");
    error.code = "WF-ABORT";
    throw error;
  }
}

module.exports = abortForCancelledNode;