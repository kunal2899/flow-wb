const { pick, has } = require("lodash");
const { NODE_TYPE, ON_ERROR_ACTION } = require("../../../../constants/node");
const {
  WORKFLOW_NODE_EXECUTION_STATUS,
} = require("../../../../constants/workflowExecution");
const processActionNode = require("./processActionNode");
const processConditionNode = require("./processConditionNode");
const abortForCancelledNode = require("../../helpers/abortForCancelledNode");

const processNode = async ({ nodeExecution, workflowNode, globalContext }) => {
  const updateData = {};
  try {
    const {
      id: workflowNodeId,
      node: currentNode,
      prevNode = "trigger",
      onErrorAction,
    } = workflowNode;

    await abortForCancelledNode(nodeExecution);

    await nodeExecution.update({
      status: WORKFLOW_NODE_EXECUTION_STATUS.RUNNING,
      startedAt: new Date(),
      input: globalContext.nodes[prevNode],
    });

    switch (currentNode.type) {
      case NODE_TYPE.ACTION:
        const output = await processActionNode(nodeExecution, workflowNode, globalContext);
        if (output.success) {
          updateData.output = output.data;
          globalContext.nodes[`wn_${workflowNodeId}`] = output;
        } else {
          switch (onErrorAction) {
            case ON_ERROR_ACTION.CONTINUE:
              updateData.output = pick(output, "error");
              globalContext.nodes[`wn_${workflowNodeId}`] = output;
              break;
            case ON_ERROR_ACTION.STOP:
            default:
              console.info(
                "Stopping workflow execution due to an error in API call, Error ref -",
                output.error
              );
              throw { ...output.error, type: "ACTION_API_ERROR" };
          }
        }
        Object.assign(updateData, {
          status: WORKFLOW_NODE_EXECUTION_STATUS.COMPLETED,
          endedAt: new Date(),
        });
        break;
      case NODE_TYPE.CONDITION:
        const matchedRuleIds = await processConditionNode(
          workflowNode,
          globalContext
        );
        Object.assign(updateData, {
          output: { matchedRuleIds },
          status: WORKFLOW_NODE_EXECUTION_STATUS.COMPLETED,
          endedAt: new Date(),
        });
        globalContext.nodes[`wn_${workflowNodeId}`] = { matchedRuleIds };
        break;
    }
  } catch (error) {
    if (error.code === "WF-ABORT") throw error;
    await nodeExecution.update({
      status: WORKFLOW_NODE_EXECUTION_STATUS.FAILED,
      endedAt: new Date(),
      reason: has(error, "message") ? error.message : String(error),
    });
    if (!["ACTION_API_ERROR"].includes(error.type)) {
      console.error("Error in processors.processNode - ", error);
    }
    throw error;
  } finally {
    await nodeExecution.reload();
    if (
      nodeExecution &&
      nodeExecution.status !== WORKFLOW_NODE_EXECUTION_STATUS.CANCELLED
    ) {
      await nodeExecution.update(updateData);
    }
  }
};

module.exports = processNode;
