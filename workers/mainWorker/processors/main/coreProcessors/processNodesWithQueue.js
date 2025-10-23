const { Promise } = require("bluebird");
const { NODE_TYPE } = require("@constants/node");
const getNextNodes = require("../../../helpers/getNextNodes");
const getStartNode = require("../../../helpers/getStartNode");
const processNode = require("../nodeProcessors/processNode");
const scheduleDelayNodeSuccessors = require("../nodeProcessors/scheduleDelayNodeSuccessors");
const {
  WORKFLOW_NODE_EXECUTION_STATUS,
  WORKFLOW_EXECUTION_STATUS,
} = require("@constants/workflowExecution");
const WorkflowNodeExecution = require("@models/WorkflowNodeExecution.model");

const processNodesWithQueue = async ({
  startNodeId,
  workflowId,
  globalContext,
  workflowExecution,
  userWorkflowId,
}) => {
  try {
    const { id: workflowExecutionId } = workflowExecution;
    let nodeQueue = [];
    const startNode = await getStartNode({
      startNodeId,
      workflowId,
    });
    if (!startNode) {
      throw new Error("Unable to find a valid start node for the workflow");
    }
    nodeQueue.push(startNode);

    const visitedNodes = new Set();

    while (nodeQueue.length > 0) {
      await Promise.map(
        nodeQueue,
        async (workflowNode) => {
          if (!workflowNode) return;
          const { id: workflowNodeId, node: { type: nodeType } = {} } =
            workflowNode;
          if (!workflowNodeId || visitedNodes.has(workflowNodeId)) return;
          visitedNodes.add(workflowNodeId);

          const [nodeExecution] = await WorkflowNodeExecution.findOrCreate({
            where: { workflowExecutionId, workflowNodeId },
            defaults: {
              workflowExecutionId,
              workflowNodeId,
              status: WORKFLOW_NODE_EXECUTION_STATUS.QUEUED,
            },
          });

          await workflowExecution.reload();
          
          if (workflowExecution.status === WORKFLOW_EXECUTION_STATUS.STOPPED) {
            const error = new Error("Workflow execution has been stopped");
            error.code = "WF-ABORT";
            throw error;
          }

          await processNode({
            nodeExecution,
            workflowNode,
            globalContext,
          });

          const nextNodes = await getNextNodes({
            workflowNode,
            nodeExecution,
          });

          if (nodeType === NODE_TYPE.DELAY) {
            await scheduleDelayNodeSuccessors({
              workflowExecutionId,
              userWorkflowId,
              workflowNodeId,
              nextNodes,
              globalContext,
              nodeExecution,
            });
          } else {
            nodeQueue.push(...nextNodes);
          }
        },
        { concurrency: 3 }
      );
      // Remove visited nodes, prevent infinite loop due to failed filtering
      const remainingNodes = nodeQueue.filter(
        (node) => node && !visitedNodes.has(node.id)
      );
      nodeQueue.length = 0;
      nodeQueue.push(...remainingNodes);
    }
  } catch (error) {
    console.error("Error in coreProcessors.processNodesWithQueue - ", error);
    throw error;
  }
};

module.exports = processNodesWithQueue;
