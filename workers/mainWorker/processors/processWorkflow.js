const {
  WORKFLOW_EXECUTION_STATUS,
  WORKFLOW_NODE_EXECUTION_STATUS,
} = require("../../../constants/workflowExecution");
const { isNull, has, some, set } = require("lodash");
const validateJobPayload = require("../validators/validateJobPayload");
const processNodesWithQueue = require("./coreProcessors/processNodesWithQueue");
const { Op } = require("sequelize");
const { updateGlobalContext } = require("../helpers/globalContext");

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
      isResume = false,
    } = job.data;

    validateJobPayload(job.data);

    const workflowExecution = await WorkflowExecution.findByPk(workflowExecutionId, {
      include: [UserWorkflow],
    });

    if (!workflowExecution) throw new Error("Invalid workflow execution");
    
    if (!isResume && workflowExecution.status === WORKFLOW_EXECUTION_STATUS.RUNNING) {
      return {
        type: "warning",
        message: `Workflow execution (id: ${workflowExecutionId}) already running`,
      };
    }

    workflowExecution.status = WORKFLOW_EXECUTION_STATUS.RUNNING;
    if (isNull(workflowExecution.startedAt)) {
      workflowExecution.startedAt = new Date();
    }
    
    await workflowExecution.save();

    const { workflowId } = workflowExecution.userWorkflow;

    if (isNull(startNodeId)) {
      // updateGlobalContext({
      //   workflowExecutionId,
      //   globalContext,
      //   key: "nodes.trigger",
      //   data: {
      //     ...workflowExecution.triggerPayload,
      //   },
      // });
      set(globalContext, "nodes.trigger", {
        ...workflowExecution.triggerPayload,
      });
    }

    await processNodesWithQueue({
      startNodeId,
      workflowId,
      globalContext,
      workflowExecutionId,
      userWorkflowId,
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

    if (activeNodes.length > 0) {
      if (
        some(activeNodes, { status: WORKFLOW_NODE_EXECUTION_STATUS.PAUSED })
      ) {
        workflowExecution.status = WORKFLOW_EXECUTION_STATUS.PAUSED;
      } else if (
        some(activeNodes, { status: WORKFLOW_NODE_EXECUTION_STATUS.STOPPED })
      ) {
        workflowExecution.status = WORKFLOW_EXECUTION_STATUS.STOPPED;
      } else {
        workflowExecution.status = WORKFLOW_EXECUTION_STATUS.PENDING;
      }
    } else {
      Object.assign(workflowExecution, {
        status: WORKFLOW_EXECUTION_STATUS.COMPLETED,
        endedAt: new Date(),
      });
    }
    await workflowExecution.save();
  } catch (error) {
    console.error("Error in processors.processWorkflow - ", error);
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
