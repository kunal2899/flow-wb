const sequelize = require("../configs/dbConfig");
const { WORKFLOW_EXECUTION_STATUS } = require("../constants/workflowExecution");
const WorkflowExecution = require("../models/WorkflowExecution.model");
const workflowQueue = require("../services/queueServices/workflowQueue.service");

const startUserWorkflow = async (req, res) => {
  try {
    const { userWorkflowId } = req.params;
    const { triggerId = null, triggerPayload = {} } = req.body || {};
    await sequelize.transaction(async transaction => {
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
        workflowExecutionId: workflowExecution.id,
        userWorkflowId,
      });
    });
    return res.status(200).json({ success: true, message: "Workflow execution started" });
  } catch (error) {
    console.error("Error in userWorkflowsController.startUserWorkflow - ", error);
    return res.status(400).json({ success: false, message: "Something went wrong!" });
  }
}

module.exports = {
  startUserWorkflow,
}