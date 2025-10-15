const { Promise } = require("bluebird");
const { NODE_TYPE } = require("../../../../constants/node");
const getNextNodes = require("../../helpers/getNextNodes");
const getStartNode = require("../../helpers/getStartNode");
const processNode = require("../nodeProcessors/processNode");
const scheduleDelayNodeSuccessors = require("../nodeProcessors/scheduleDelayNodeSuccessors");
const { WORKFLOW_NODE_EXECUTION_STATUS } = require("../../../../constants/workflowExecution");
// const runtimeStateManager = require("../../states/runtimeStateManager");
const { Op } = require("sequelize");
const { findIndex } = require("lodash");

const processNodesWithQueue = async ({
  startNodeId,
  workflowId,
  globalContext,
  workflowExecutionId,
  userWorkflowId,
  isResume,
}) => {
  try {
    let nodeQueue = [];
    // if (isResume) {
    //   const queuedNodeIds = await runtimeStateManager.getQueuedNodeIds(
    //     workflowExecutionId
    //   );
    //   const workflowNodes = await WorkflowNode.scope("plain").findAll({
    //     where: { id: { [Op.in]: queuedNodeIds } },
    //     include: [
    //       {
    //         model: Node,
    //         attributes: {
    //           exclude: [
    //             "createdAt",
    //             "updatedAt",
    //             "deletedAt",
    //             "name",
    //             "description",
    //           ],
    //         },
    //       },
    //     ],
    //     attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
    //   });
    //   nodeQueue.push(...workflowNodes);
    // } else {
      const startNode = await getStartNode({
        startNodeId,
        workflowId,
      });
      if (!startNode) {
        throw new Error("Unable to find a valid start node for the workflow");
      }
      nodeQueue.push(startNode);
      // await runtimeStateManager.flushQueuedNodes(workflowExecutionId);
      // await runtimeStateManager.addNodeToQueue(
      //   workflowExecutionId,
      //   startNode.id
      // );
    // }

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
              // nodeQueue,
            });
          } else {
            // await Promise.map(nextNodes, async (nextNode) => {
            //   await runtimeStateManager.addNodeToQueue(
            //     workflowExecutionId,
            //     nextNode.id
            //   );
            //   nodeQueue.push(nextNode);
            // });
            // await runtimeStateManager.removeNodeFromQueue(
            //   workflowExecutionId,
            //   workflowNodeId
            // );
            // nodeQueue = nodeQueue.splice(
            //   findIndex(nodeQueue, { id: workflowNodeId }),
            //   1
            // );
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
      // await runtimeStateManager.flushQueuedNodes(workflowExecutionId);
      // await Promise.map(remainingNodes, async remainingNode => {
      //   await runtimeStateManager.addNodeToQueue(
      //     workflowExecutionId,
      //     remainingNode.id
      //   );
      //   nodeQueue.push(remainingNode);
      // });
      nodeQueue.push(...remainingNodes);
    }
  } catch (error) {
    console.error("Error in coreProcessors.processNodesWithQueue - ", error);
    throw error;
  }
};

module.exports = processNodesWithQueue;
