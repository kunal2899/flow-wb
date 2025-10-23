const {
  WORKFLOW_EXECUTION_STATUS,
  WORKFLOW_NODE_EXECUTION_STATUS,
} = require("@constants/workflowExecution");
const { isNull, has, some, set } = require("lodash");
const validateJobPayload = require("../../validators/validateJobPayload");
const processNodesWithQueue = require("./coreProcessors/processNodesWithQueue");
const { Op } = require("sequelize");

const processWorkflow = async (job) => {
  try {
    const {
      workflowExecutionId,
      userWorkflowId,
      startNodeId = null,
      globalContext = {
        nodes: {},
        workflow: {},
      },
    } = job.data;

    validateJobPayload(job.data);

    const workflowExecution = await WorkflowExecution.findByPk(
      workflowExecutionId,
      {
        include: [UserWorkflow],
      }
    );

    if (!workflowExecution) throw new Error("Invalid workflow execution");

    if (
      [
        WORKFLOW_EXECUTION_STATUS.RUNNING,
        WORKFLOW_EXECUTION_STATUS.STOPPED,
      ].includes(workflowExecution.status)
    ) {
      return {
        type: "warning",
        message: `
          Status for workflow execution (id: ${workflowExecutionId}) 
          is ${workflowExecution.status}. Skipping processing.
        `,
      };
    }

    workflowExecution.status = WORKFLOW_EXECUTION_STATUS.RUNNING;
    if (isNull(workflowExecution.startedAt)) {
      workflowExecution.startedAt = new Date();
    }

    await workflowExecution.save();

    const { workflowId } = workflowExecution.userWorkflow;

    if (isNull(startNodeId)) {
      set(globalContext, "nodes.trigger", {
        ...workflowExecution.triggerPayload,
      });
    }

    await processNodesWithQueue({
      startNodeId,
      workflowId,
      globalContext,
      workflowExecution,
      userWorkflowId,
    });

    const activeNodes = await WorkflowNodeExecution.findAll({
      where: {
        workflowExecutionId,
        status: {
          [Op.notIn]: [
            WORKFLOW_NODE_EXECUTION_STATUS.COMPLETED,
            WORKFLOW_NODE_EXECUTION_STATUS.FAILED,
          ],
        },
      },
      attributes: ["status"],
    });

    const updateData = {};

    if (activeNodes.length > 0) {
      if (
        some(activeNodes, { status: WORKFLOW_NODE_EXECUTION_STATUS.PAUSED })
      ) {
        updateData.status = WORKFLOW_EXECUTION_STATUS.PAUSED;
      } else if (
        some(activeNodes, { status: WORKFLOW_NODE_EXECUTION_STATUS.STOPPED })
      ) {
        updateData.status = WORKFLOW_EXECUTION_STATUS.STOPPED;
      } else {
        updateData.status = WORKFLOW_EXECUTION_STATUS.PENDING;
      }
    } else {
      Object.assign(updateData, {
        status: WORKFLOW_EXECUTION_STATUS.COMPLETED,
        endedAt: new Date(),
      });
    }
    await workflowExecution.reload();
    if (workflowExecution.status !== WORKFLOW_EXECUTION_STATUS.STOPPED) {
      await workflowExecution.update(updateData);
    }
  } catch (error) {
    console.error("Error in processors.processWorkflow - ", error);
    if (error.code === "WF-ABORT") throw error;
    await WorkflowExecution.update(
      {
        status: WORKFLOW_EXECUTION_STATUS.FAILED,
        endedAt: new Date(),
        reason: has(error, "message") ? error.message : String(error),
      },
      { where: { id: job.data.workflowExecutionId } }
    );
    throw error;
  }
};

module.exports = processWorkflow;
