const { Op } = require("sequelize");
const sequelize = require("@configs/dbConfig");
const {
  WORKFLOW_EXECUTION_STATUS,
  WORKFLOW_NODE_EXECUTION_STATUS,
} = require("@constants/workflowExecution");
const { pick } = require("lodash");
const workflowQueue = require("@services/queueServices/workflowQueue.service");
const runtimeStateManager = require("@workers/mainWorker/states/runtimeStateManager");

/**
 * @swagger
 * /user-workflows/{userWorkflowId}/executions:
 *   get:
 *     summary: Get execution history for a user workflow
 *     description: Retrieves the execution history of a specific user workflow.
 *     tags: [Workflow Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userWorkflowId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user workflow ID
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           description: Filter by execution status
 *           example: [COMPLETED, FAILED]
 *     responses:
 *       200:
 *         description: Successfully retrieved execution history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ExecutionHistoryResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ErrorResponse'
 */
const getExecutionsHistory = async (req, res) => {
  try {
    const { userWorkflowId } = req.params;
    let { page = 1, limit = 10, status = null } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const offset = (page - 1) * limit;
    const filters = { userWorkflowId };
    if (!isNull(status)) {
      status = Array.isArray(status) ? status : [status];
      status = status.filter((sKey) =>
        Object.values(WORKFLOW_EXECUTION_STATUS).includes(sKey)
      );
      filters.status = { [Op.in]: status };
    }
    const { count: totalExecutionsCount, rows: workflowExecutions } =
      await WorkflowExecution.findAndCountAll({
        where: filters,
        order: [["createdAt", "DESC"]],
        limit,
        offset,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      });
    return res.status(200).json({
      success: true,
      data: { totalExecutionsCount, workflowExecutions },
    });
  } catch (error) {
    console.error(
      "Error in userWorkflowsController.getExecutionsHistory - ",
      error
    );
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /user-workflows/{userWorkflowId}/executions/{workflowExecutionId}:
 *   get:
 *     summary: Get execution log for a workflow execution
 *     description: Retrieves the execution log of a specific workflow execution.
 *     tags: [Workflow Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userWorkflowId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user workflow ID
 *         example: 1
 *       - in: path
 *         name: workflowExecutionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The workflow execution ID
 *         example: 1
 *       - in: query
 *         name: includeNodeLevelLogs
 *         schema:
 *           type: boolean
 *         description: Whether to include node-level logs
 *         example: true
 *     responses:
 *       200:
 *         description: Successfully retrieved execution log
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ExecutionLogResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ErrorResponse'
 */
const getExecutionLog = async (req, res) => {
  try {
    const workflowExecution = req.workflowExecution;
    let { includeNodeLevelLogs = false } = req.query;
    includeNodeLevelLogs = includeNodeLevelLogs === "true";
    if (includeNodeLevelLogs) {
      await workflowExecution.reload({
        include: [
          {
            model: WorkflowNodeExecution,
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
            separate: true,
            order: [["startedAt", "ASC"]],
          },
        ],
      });
    }
    return res
      .status(200)
      .json({ success: true, data: workflowExecution.toJSON() });
  } catch (error) {
    console.error(
      "Error in workflowExecutionsController.getExecutionLog - ",
      error
    );
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /user-workflows/{userWorkflowId}/executions/{workflowExecutionId}/stop:
 *   post:
 *     summary: Stop a workflow execution
 *     description: Stops a running workflow execution.
 *     tags: [Workflow Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userWorkflowId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user workflow ID
 *         example: 1
 *       - in: path
 *         name: workflowExecutionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The workflow execution ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Workflow execution stopped successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/SuccessResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ErrorResponse'
 */
const stopWorkflowExecution = async (req, res) => {
  try {
    const { workflowExecution } = req;
    const { workflowExecutionId } = req.params;
    await sequelize.transaction(async (transaction) => {
      if (
        Object.values(
          pick(WORKFLOW_EXECUTION_STATUS, ["COMPLETED", "FAILED", "STOPPED"])
        ).includes(workflowExecution.status)
      ) {
        return res.status(400).json({
          success: false,
          message: `Cannot stop a workflow execution with status: ${workflowExecution.status}`,
        });
      }
      // Mark the workflow execution as STOPPED
      await WorkflowExecution.update(
        {
          status: WORKFLOW_EXECUTION_STATUS.STOPPED,
          endedAt: new Date(),
          reason: "Stopped manually by user",
        },
        {
          where: { id: workflowExecutionId },
          transaction,
        }
      );
      // Cancel all active node executions related to this workflow execution
      await WorkflowNodeExecution.update(
        {
          status: WORKFLOW_NODE_EXECUTION_STATUS.CANCELLED,
          endedAt: new Date(),
          reason: "Cancelled due to workflow execution being stopped",
        },
        {
          where: {
            workflowExecutionId,
            status: {
              [Op.in]: [
                ...Object.values(
                  pick(WORKFLOW_NODE_EXECUTION_STATUS, [
                    "RUNNING",
                    "QUEUED",
                    "PENDING",
                  ])
                ),
              ],
            },
          },
          transaction,
        }
      );
      // Cancel all jobs related to this workflow execution
      const allWorkflowJobs = await workflowQueue.getWorkflowJobs();
      const jobsToRemove = allWorkflowJobs.filter(
        (job) =>
          job.id.startsWith(`wf-${workflowExecutionId}`) ||
          job.id.startsWith(`wf-exec-${workflowExecutionId}`)
      );
      await Promise.all(jobsToRemove.map((job) => job.remove()));
      await runtimeStateManager.removeFromPendingExecutions(workflowExecutionId);
      return res
        .status(200)
        .json({ success: true, message: "Workflow execution stopped" });
    });
  } catch (error) {
    console.error(
      "Error in workflowExecutionsController.stopWorkflowExecution - ",
      error
    );
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /user-workflows/{userWorkflowId}/executions/{workflowExecutionId}/status:
 *   get:
 *     summary: Get status of a workflow execution
 *     description: Retrieves the current status of a specific workflow execution.
 *     tags: [Workflow Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userWorkflowId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user workflow ID
 *         example: 1
 *       - in: path
 *         name: workflowExecutionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The workflow execution ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved execution status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ExecutionStatusResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ErrorResponse'
 */
const getExecutionStatus = async (req, res) => {
  try {
    const { workflowExecutionId } = req.params;
    const workflowExecution = await WorkflowExecution.findByPk(
      workflowExecutionId,
      {
        attributes: ["id", "status", "startedAt", "endedAt"],
        include: [
          {
            model: WorkflowNodeExecution,
            separate: true,
            attributes: [
              "id",
              "workflowNodeId",
              "status",
              "startedAt",
              "endedAt",
            ],
            order: [["startedAt", "ASC"]],
          },
        ],
      }
    );
    return res
      .status(200)
      .json({ success: true, data: workflowExecution.toJSON() });
  } catch (error) {
    console.error(
      "Error in workflowExecutionsController.getExecutionStatus - ",
      error
    );
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

module.exports = {
  getExecutionsHistory,
  getExecutionLog,
  stopWorkflowExecution,
  getExecutionStatus,
};
