const sequelize = require("../configs/dbConfig");
const { WORKFLOW_EXECUTION_STATUS } = require("../constants/workflowExecution");
const workflowQueue = require("../services/queueServices/workflowQueue.service");

/**
 * @swagger
 * /user-workflows:
 *   get:
 *     summary: Get all user-workflows for the authenticated user
 *     description: Retrieves all workflows associated with the authenticated user
 *     tags: [User Workflows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved workflows
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserWorkflow'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const getAllUserWorkflows = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const userWorkflows = await UserWorkflow.findAll({
      where: {
        userId,
      },
      attributes: {
        exclude: ["workflowId", "createdAt", "updatedAt", "deletedAt"],
      },
      include: [
        {
          model: Workflow,
          as: "workflow",
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        },
      ],
    });
    return res.status(200).json({ success: true, data: userWorkflows });
  } catch (error) {
    console.error("Error in workflowsController.getAllWorkflows - ", error);
    return res
      .status(400)
      .send({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /user-workflows/{userWorkflowId}:
 *   get:
 *     summary: Get a specific user-workflow by ID
 *     description: Retrieves a specific workflow by its ID. The user must have access to this workflow.
 *     tags: [User Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userWorkflowId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user-workflow ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved workflow
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserWorkflow'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User doesn't have access to this workflow
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Workflow not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const getUserWorkflow = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: req.userWorkflow });
  } catch (error) {
    console.error("Error in workflowsController.getWorkflow - ", error);
    return res
      .status(400)
      .send({ success: false, message: "Something went wrong!" });
  }
};

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
      await workflowQueue.enqueueWorkflowJob(
        {
          workflowExecutionId: workflowExecution.id,
          userWorkflowId,
        },
        { jobId: `wf-${workflowExecution.id}` }
      );
    });
    return res.status(200).json({ success: true, message: "Workflow execution started" });
  } catch (error) {
    console.error("Error in userWorkflowsController.startUserWorkflow - ", error);
    return res.status(400).json({ success: false, message: "Something went wrong!" });
  }
}

module.exports = {
  getAllUserWorkflows,
  getUserWorkflow,
  startUserWorkflow,
}