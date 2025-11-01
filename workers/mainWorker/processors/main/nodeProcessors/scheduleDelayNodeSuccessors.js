const { Promise } = require("bluebird");
const { convertTimeToMs } = require("@utils/timeUtils");
const workflowQueue = require("@services/queueServices/workflowQueue.service");
const {
  WORKFLOW_NODE_EXECUTION_STATUS,
} = require("@constants/workflowExecution");
const abortForCancelledNode = require("../../../helpers/abortForCancelledNode");
const { updateGlobalContext } = require("../../../helpers/globalContext");
const sequelize = require("../../../../../configs/dbConfig");
const { formatTimeInIST } = require("../../../utils");

const scheduleDelayNodeSuccessors = async ({
  workflowExecutionId,
  workflowNodeId,
  nextNodes,
  globalContext,
  nodeExecution,
}) => {
  const updateData = {};
  try {
    if (nodeExecution.status === WORKFLOW_NODE_EXECUTION_STATUS.COMPLETED)
      return;
    console.log("Scheduling delay node successors", { workflowNodeId });
    const delayNodeConfig = await DelayNodeConfig.findOne({
      where: { workflowNodeId },
      attributes: { include: ["duration", "unit"] },
    });
    if (!delayNodeConfig) throw new Error("Invalid delay node config");
    const { duration, unit } = delayNodeConfig;
    const delayInMs = convertTimeToMs(duration, unit);

    await Promise.map(
      nextNodes,
      async (nextNode, index) => {
        await abortForCancelledNode(nodeExecution);
        await sequelize.transaction(async (transaction) => {
          const [_, isCreated] = await WorkflowNodeExecution.findOrCreate({
            where: {
              workflowExecutionId,
              workflowNodeId: nextNode.id,
            },
            defaults: {
              workflowExecutionId,
              workflowNodeId: nextNode.id,
              status: WORKFLOW_NODE_EXECUTION_STATUS.QUEUED,
            },
            transaction,
          });
          console.log("Successor node execution queued", {
            nextNode: nextNode.id,
          });
          if (!isCreated) return;
          await workflowQueue.enqueueWorkflowJob({
            payload: { workflowExecutionId, startNodeId: nextNode.id },
            options: {
              jobId: `wf-${workflowExecutionId}-delay-${nextNode.id}`,
              delay: delayInMs,
            },
          });
          console.log("Delay job enqueued", {
            workflowExecutionId,
            resumeNodeId: nextNode.id,
          });
        });
        await updateGlobalContext({
          workflowExecutionId,
          globalContext,
          key: `nodes.wn_${workflowNodeId}.startNodeIds[${index}]`,
          data: nextNode.id,
        });
      },
      { concurrency: 3 }
    );
    const willResumeAt = formatTimeInIST({ addMs: delayInMs });
    Object.assign(updateData, {
      output: { willResumeAt },
      status: WORKFLOW_NODE_EXECUTION_STATUS.COMPLETED,
      endedAt: new Date(),
    });
    console.log("Delay node successors scheduled", {
      workflowNodeId,
      willResumeAt,
    });
  } catch (error) {
    console.error(
      "Error in nodeProcessors.scheduleDelayNodeSuccessors - ",
      error
    );
    Object.assign(updateData, {
      status: WORKFLOW_NODE_EXECUTION_STATUS.FAILED,
      endedAt: new Date(),
      reason: error.message,
    });
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

module.exports = scheduleDelayNodeSuccessors;
