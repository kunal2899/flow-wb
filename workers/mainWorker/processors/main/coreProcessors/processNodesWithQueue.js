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
const runtimeStateManager = require("../../../states/runtimeStateManager");
const { Op } = require("sequelize");
const { get } = require("lodash");

const addNodeToQueue = async ({ workflowExecutionId, nodeQueue, node }) => {
  console.log({ node });
  if (!node) return;
  nodeQueue.push(node);
  await runtimeStateManager.addNodeToQueue(workflowExecutionId, node.id);
};

const popNodeFromQueue = async ({ workflowExecutionId, nodeQueue, index = 0 }) => {
  const nodeIdToRemove = get(nodeQueue, `[${index}].id`, null);
  if (!nodeIdToRemove) return;
  nodeQueue.splice(index, 1);
  await runtimeStateManager.removeNodeFromQueue(
    workflowExecutionId,
    nodeIdToRemove
  );
};

const processNodesWithQueue = async ({
  startNodeId,
  workflowId,
  globalContext,
  workflowExecution,
  isResume,
}) => {
  try {
    const { id: workflowExecutionId } = workflowExecution;
    let nodeQueue = [];
    const queuedNodeIds = await runtimeStateManager.getQueuedNodeIds(
      workflowExecutionId
    );
    const visitedNodes = await runtimeStateManager.getVisitedNodes(workflowExecutionId);
    if (
      isResume &&
      ((startNodeId && visitedNodes.includes(startNodeId)) ||
        queuedNodeIds.length > 0)
    ) {
      const workflowNodes = await WorkflowNode.scope("plain").findAll({
        where: { id: { [Op.in]: queuedNodeIds } },
        include: [
          {
            model: Node,
            attributes: {
              exclude: [
                "createdAt",
                "updatedAt",
                "deletedAt",
                "name",
                "description",
              ],
            },
          },
        ],
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      });
      nodeQueue.push(...workflowNodes);
    } else {
      const startNode = await getStartNode({
        startNodeId,
        workflowId,
      });
      if (!startNode) {
        throw new Error("Unable to find a valid start node for the workflow");
      }
      await runtimeStateManager.flushQueuedNodes(workflowExecutionId);
      await addNodeToQueue({ workflowExecutionId, nodeQueue, node: startNode });
    }

    while (nodeQueue.length > 0) {
      await Promise.map(
        nodeQueue,
        async (workflowNode, index) => {
          if (!workflowNode) return;
          const { id: workflowNodeId, node: { type: nodeType } = {} } =
            workflowNode;
          const isNodeVisited = await runtimeStateManager.isNodeVisited(
            workflowExecutionId,
            workflowNodeId
          );
          if (!workflowNodeId || isNodeVisited) return;

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
            workflowExecutionId,
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
              workflowNodeId,
              nextNodes,
              globalContext,
              nodeExecution,
            });
          } else {
            await Promise.map(nextNodes, async (nextNode) => {
              await addNodeToQueue({
                workflowExecutionId,
                nodeQueue,
                node: nextNode,
              });
            });
          }
          await runtimeStateManager.markNodeAsVisited(
            workflowExecutionId,
            workflowNodeId
          );
          await popNodeFromQueue({ workflowExecutionId, nodeQueue, index });
        },
        { concurrency: 3 }
      );
      // Remove visited nodes, prevent infinite loop due to failed filtering
      let remainingNodes = await Promise.reduce(
        nodeQueue,
        async (acc, node) => {
          if (!node) return acc;
          const workflowNodeId = node.id;
          const isNodeVisited = await runtimeStateManager.isNodeVisited(
            workflowExecutionId,
            workflowNodeId
          );
          if (isNodeVisited) {
            return acc;
          }
          acc.push(node);
          return acc;
        },
        []
      );
      nodeQueue.length = 0;
      await runtimeStateManager.flushQueuedNodes(workflowExecutionId);
      await Promise.map(remainingNodes, async remainingNode => {
        await runtimeStateManager.addNodeToQueue(
          workflowExecutionId,
          remainingNode.id
        );
        nodeQueue.push(remainingNode);
      });
    }
  } catch (error) {
    console.error("Error in coreProcessors.processNodesWithQueue - ", error);
    throw error;
  }
};

module.exports = processNodesWithQueue;
