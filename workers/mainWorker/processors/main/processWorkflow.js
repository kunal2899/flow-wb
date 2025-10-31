const {
  WORKFLOW_EXECUTION_STATUS,
  WORKFLOW_NODE_EXECUTION_STATUS,
} = require("@constants/workflowExecution");
const { isNull, has, some, set, get } = require("lodash");
const validateJobPayload = require("../../validators/validateJobPayload");
const processNodesWithQueue = require("./coreProcessors/processNodesWithQueue");
const { Op } = require("sequelize");
const { updateGlobalContext } = require("../../helpers/globalContext");
const runtimeStateManager = require("../../states/runtimeStateManager");
const { getExecutionKey } = require("../../utils");

const processWorkflow = async (job) => {
  try {
    validateJobPayload(job.data);
    const {
      workflowExecutionId,
      startNodeId = null,
      isResume = false,
    } = job.data;

    const executionKey = getExecutionKey(workflowExecutionId, startNodeId);
    await runtimeStateManager.addToPendingExecutions(executionKey);

    const globalContext = (await runtimeStateManager.getExecutionContext(
      workflowExecutionId
    )) ?? {
      nodes: {},
      workflow: {},
    };

    const workflowExecution = await WorkflowExecution.findByPk(
      workflowExecutionId,
      {
        include: [UserWorkflow],
      }
    );

    if (!workflowExecution) throw new Error("Invalid workflow execution");

    if (
      [
        WORKFLOW_EXECUTION_STATUS.STOPPED,
        WORKFLOW_EXECUTION_STATUS.COMPLETED,
        WORKFLOW_EXECUTION_STATUS.FAILED,
      ].includes(workflowExecution.status) ||
      (!isResume &&
        workflowExecution.status === WORKFLOW_EXECUTION_STATUS.RUNNING)
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

    if (!has(globalContext, "nodes.trigger")) {
      await updateGlobalContext({
        workflowExecutionId,
        globalContext,
        key: "nodes.trigger",
        data: {
          ...workflowExecution.triggerPayload,
        },
      });
    }

    const { workflowId } = workflowExecution.userWorkflow;

    await processNodesWithQueue({
      startNodeId,
      workflowId,
      globalContext,
      workflowExecution,
      isResume,
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
    if (workflowExecution.status === WORKFLOW_EXECUTION_STATUS.COMPLETED) {
      await runtimeStateManager.deleteExecutionRelatedKeys(workflowExecutionId);
    }
  } catch (error) {
    console.error("Error in processors.processWorkflow - ", error);
    await runtimeStateManager.deleteExecutionRelatedKeys(workflowExecutionId);
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
  } finally {
    const workflowExecutionId = get(job, "data.workflowExecutionId", null);
    if (workflowExecutionId) {
      const startNodeId = get(job, "data.startNodeId", null);
      const executionKey = getExecutionKey(workflowExecutionId, startNodeId);
      await runtimeStateManager.removeFromPendingExecutions(executionKey);
    }
  }
};

module.exports = processWorkflow;
