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
const { get, map } = require("lodash");

const addNodeToQueue = async ({ workflowExecutionId, nodeQueue, node }) => {
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
    console.log("Started processing workflow nodes", {
      workflowExecutionId,
      startNodeId,
      isResume,
    });
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
      console.log("Processing queued nodes", { queuedNodeIds });
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
      console.log(`Found start node`, { startNode: startNode.id });
      await runtimeStateManager.flushQueuedNodes(workflowExecutionId);
      await addNodeToQueue({ workflowExecutionId, nodeQueue, node: startNode });
      console.log("Added start node to queue");
    }

    while (nodeQueue.length > 0) {
      await Promise.map(
        nodeQueue,
        async (workflowNode, index) => {
          if (!workflowNode) return;
          const { id: workflowNodeId, node: { type: nodeType } = {} } =
            workflowNode;
          console.info("Picking node from queue", { workflowNodeId, nodeType });
          const isNodeVisited = await runtimeStateManager.isNodeVisited(
            workflowExecutionId,
            workflowNodeId
          );
          console.info("Checking if node is visited", { workflowNodeId, isNodeVisited });
          if (!workflowNodeId || isNodeVisited) return;

          console.info("Creating node execution", { workflowNodeId });
          const [nodeExecution] = await WorkflowNodeExecution.findOrCreate({
            where: { workflowExecutionId, workflowNodeId },
            defaults: {
              workflowExecutionId,
              workflowNodeId,
              status: WORKFLOW_NODE_EXECUTION_STATUS.QUEUED,
            },
          });
          console.info("Node execution created", { nodeExecution: nodeExecution.id });
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
          console.info("Added next nodes to queue");
          await runtimeStateManager.markNodeAsVisited(
            workflowExecutionId,
            workflowNodeId
          );
          console.info("Marked node as visited", { workflowNodeId });
          await popNodeFromQueue({ workflowExecutionId, nodeQueue, index });
          console.info("Popped node from queue", { workflowNodeId });
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
      console.info("Remaining nodes", { remainingNodeIds: map(remainingNodes, "id") });
      nodeQueue.length = 0;
      await runtimeStateManager.flushQueuedNodes(workflowExecutionId);
      await Promise.map(remainingNodes, async remainingNode => {
        await runtimeStateManager.addNodeToQueue(
          workflowExecutionId,
          remainingNode.id
        );
        nodeQueue.push(remainingNode);
      });
      console.info("Added remaining nodes to queue");
    }
  } catch (error) {
    console.error("Error in coreProcessors.processNodesWithQueue - ", error);
    throw error;
  }
};

module.exports = processNodesWithQueue;
