const { USER_WORKFLOW_TRIGGER_TYPE } = require("@constants/userWorkflow");
const executeWorkflow = require("@helpers/executeWorkflow");

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
 *               $ref: '#/components/apiSchemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ErrorResponse'
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
 *               $ref: '#/components/apiSchemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User doesn't have access to this workflow
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ErrorResponse'
 *       404:
 *         description: Workflow not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ErrorResponse'
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

/**
 * @swagger
 * /user-workflows/{userWorkflowId}/start:
 *   post:
 *     summary: Start a user-workflow
 *     description: Starts the execution of a specific user-workflow by its ID.
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               triggerId:
 *                 type: integer
 *                 description: The ID of the trigger to execute
 *                 example: 123
 *               triggerPayload:
 *                 type: object
 *                 description: Additional payload for the trigger
 *                 example: {}
 *     responses:
 *       200:
 *         description: Workflow execution started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Workflow execution started
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ErrorResponse'
 */
const startUserWorkflow = async (req, res) => {
  try {
    const { userWorkflowId } = req.params;
    const { triggerId = null, triggerPayload = {} } = req.body || {};
    await executeWorkflow({ userWorkflowId, triggerId, triggerPayload });
    return res
      .status(200)
      .json({ success: true, message: "Workflow execution started" });
  } catch (error) {
    console.error(
      "Error in userWorkflowsController.startUserWorkflow - ",
      error
    );
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /user-workflows/{userWorkflowId}/triggers:
 *   post:
 *     summary: Add a trigger to a user-workflow
 *     description: Adds a trigger to a specific user-workflow by its ID.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of trigger to add
 *                 enum: [CRON, SCHEDULE, WEBHOOK]
 *                 example: CRON
 *               config:
 *                 type: object
 *                 description: Configuration for the trigger
 *                 example: { cronExpression: "0 0 * * *" }
 *     responses:
 *       200:
 *         description: Trigger added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Trigger added successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ErrorResponse'
 *       409:
 *         description: Conflict - Trigger already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/apiSchemas/ErrorResponse'
 */
const addUserWorkflowTrigger = async (req, res) => {
  try {
    const { userWorkflowId } = req.params;
    const { type } = req.body;
    switch (type) {
      case USER_WORKFLOW_TRIGGER_TYPE.CRON:
        await UserWorkflowTrigger.addCronTrigger(userWorkflowId, req.body);
        break;
      case USER_WORKFLOW_TRIGGER_TYPE.SCHEDULE:
        await UserWorkflowTrigger.addScheduleTrigger(userWorkflowId, req.body);
        break;
      case USER_WORKFLOW_TRIGGER_TYPE.WEBHOOK:
        break;
      default:
        throw new Error("Unsupported trigger type");
    }
    return res
      .status(200)
      .json({ success: true, message: "Trigger added successfully" });
  } catch (error) {
    console.error(
      "Error in userWorkflowsController.addUserWorkflowTrigger - ",
      error
    );
    if (error.message === "Validation error") {
      return res.status(409).json({
        success: false,
        message: "This type of trigger with similar config already exists",
      });
    }
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

module.exports = {
  getAllUserWorkflows,
  getUserWorkflow,
  startUserWorkflow,
  addUserWorkflowTrigger,
};
