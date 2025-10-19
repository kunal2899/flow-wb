const { Promise } = require("bluebird");
const { convertTimeToMs } = require("../../../../utils/timeUtils");
const workflowQueue = require("../../../../services/queueServices/workflowQueue.service");
const {
  WORKFLOW_NODE_EXECUTION_STATUS,
} = require("../../../../constants/workflowExecution");
const abortForCancelledNode = require("../../helpers/abortForCancelledNode");

const scheduleDelayNodeSuccessors = async ({
  workflowExecutionId,
  userWorkflowId,
  workflowNodeId,
  nextNodes,
  globalContext,
  nodeExecution,
}) => {
  const updateData = {};
  try {
    const delayNodeConfig = await DelayNodeConfig.findOne({
      where: { workflowNodeId },
      attributes: { include: ["duration", "unit"] },
    });
    if (!delayNodeConfig) throw new Error("Invalid delay node config");
    const { duration, unit } = delayNodeConfig;
    const delayInMs = convertTimeToMs(duration, unit);
    await Promise.map(
      nextNodes,
      async (nextNode) => {
        await abortForCancelledNode(nodeExecution);
        await WorkflowNodeExecution.create({
          workflowExecutionId,
          workflowNodeId: nextNode.id,
          status: WORKFLOW_NODE_EXECUTION_STATUS.QUEUED,
        });
        await workflowQueue.enqueueWorkflowJob(
          {
            workflowExecutionId,
            userWorkflowId,
            startNodeId: nextNode.id,
            globalContext,
          },
          {
            jobId: `wf-${workflowExecutionId}-delay-${nextNode.id}`,
            delay: delayInMs,
          }
        );
      },
      { concurrency: 3 }
    );
    Object.assign(updateData, {
      output: {
        willResumeAt: new Date(Date.now() + delayInMs + 5.5 * 60 * 60 * 1000)
          .toISOString()
          .replace("T", " ")
          .replace("Z", " IST"),
      },
      status: WORKFLOW_NODE_EXECUTION_STATUS.COMPLETED,
      endedAt: new Date(),
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
