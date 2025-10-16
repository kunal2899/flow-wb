const { pick, has } = require("lodash");
const { NODE_TYPE, ON_ERROR_ACTION } = require("../../../../constants/node");
const {
  WORKFLOW_NODE_EXECUTION_STATUS,
} = require("../../../../constants/workflowExecution");
const processActionNode = require("./processActionNode");
const processConditionNode = require("./processConditionNode");
const { updateGlobalContext } = require("../../helpers/globalContext");

const processNode = async ({
  nodeExecution,
  workflowNode,
  globalContext,
}) => {
  try {
    const {
      id: workflowNodeId,
      node: currentNode,
      prevNode = "trigger",
      onErrorAction,
    } = workflowNode;

    await nodeExecution.update({
      status: WORKFLOW_NODE_EXECUTION_STATUS.RUNNING,
      startedAt: new Date(),
      input: globalContext.nodes[prevNode],
    });

    switch (currentNode.type) {
      case NODE_TYPE.ACTION:
        const output = await processActionNode(workflowNode, globalContext);
        if (output.success) {
          nodeExecution.output = output.data;
          await updateGlobalContext({
            workflowExecutionId,
            globalContext,
            key: `nodes.wn_${workflowNodeId}`,
            data: output,
          });
        } else {
          switch (onErrorAction) {
            case ON_ERROR_ACTION.CONTINUE:
              nodeExecution.output = pick(output, "error");
              await updateGlobalContext({
                workflowExecutionId,
                globalContext,
                key: `nodes.wn_${workflowNodeId}`,
                data: output,
              });
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
        Object.assign(nodeExecution, {
          status: WORKFLOW_NODE_EXECUTION_STATUS.COMPLETED,
          endedAt: new Date(),
        });
        break;
      case NODE_TYPE.CONDITION:
        const matchedRuleIds = await processConditionNode(
          workflowNode,
          globalContext
        );
        Object.assign(nodeExecution, {
          output: { matchedRuleIds },
          status: WORKFLOW_NODE_EXECUTION_STATUS.COMPLETED,
          endedAt: new Date(),
        });
        await updateGlobalContext({
          workflowExecutionId,
          globalContext,
          key: `nodes.wn_${workflowNodeId}`,
          data: { matchedRuleIds },
        });
        break;
    }
  } catch (error) {
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
    await nodeExecution?.save?.();
  }
};

module.exports = processNode;
