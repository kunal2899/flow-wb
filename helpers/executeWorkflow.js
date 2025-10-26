const sequelize = require("@configs/dbConfig");
const { WORKFLOW_EXECUTION_STATUS } = require("@constants/workflowExecution");
const WorkflowExecution = require("@models/WorkflowExecution.model");
const workflowQueue = require("@services/queueServices/workflowQueue.service");

const executeWorkflow = async ({
  userWorkflowId,
  triggerId = null,
  triggerPayload = {},
}) => {
  try {
    await sequelize.transaction(async (transaction) => {
      const workflowExecution = await WorkflowExecution.create(
        {
          userWorkflowId,
          status: WORKFLOW_EXECUTION_STATUS.QUEUED,
          triggerId,
          triggerPayload,
        },
        { transaction }
      );
      await workflowQueue.enqueueWorkflowJob({
        payload: { workflowExecutionId: workflowExecution.id },
        options: { jobId: `wf-exec-${workflowExecution.id}` },
      });
    });
  } catch (error) {
    console.log("Error in helpers.executeWorkflow - ", error);
    throw error;
  }
};

module.exports = executeWorkflow;
