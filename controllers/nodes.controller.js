const Node = require("../models/Node.model");
const Rule = require("../models/Rule.model");
const Workflow = require("../models/Workflow.model");
const WorkflowNode = require("../models/WorkflowNode.model");
const WorkflowNodeConnections = require("../models/WorkflowNodeConnections.model");

/**
 * @swagger
 * /nodes/{workflowNodeId}:
 *   get:
 *     summary: Get a specific workflow node
 *     description: Retrieves a specific workflow node by its ID. The user must have access to the associated workflow.
 *     tags: [Workflow Nodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workflowNodeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The workflow node ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved workflow node
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                   description: Indicates if the operation was successful
 *                 data:
 *                   $ref: '#/components/schemas/WorkflowNode'
 *                   description: The retrieved workflow node data
 *                 message:
 *                   type: string
 *                   example: "Node retrieved successfully"
 *                   description: Optional success message
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
 *         description: Forbidden - User doesn't have access to this workflow node
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Workflow node not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const getNode = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.workflowNode,
      message: "Node retrieved successfully",
    });
  } catch (error) {
    console.error("Error in nodesController.getNode - ", error);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /nodes/{workflowNodeId}:
 *   put:
 *     summary: Update a workflow node
 *     description: Updates the configuration of a specific workflow node. The user must have edit access to the associated workflow.
 *     tags: [Workflow Nodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workflowNodeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The workflow node ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkflowNodeRequest'
 *           examples:
 *             retry_config_override:
 *               summary: Retry Configuration Override
 *               value:
 *                 overrideConfig:
 *                   retry:
 *                     maxAttempts: 5
 *                     backoffStrategy: "exponential"
 *                     baseDelayMs: 1000
 *                     maxDelayMs: 60000
 *                     jitter: true
 *             custom_config_override:
 *               summary: Custom Configuration Override
 *               value:
 *                 overrideConfig:
 *                   retry:
 *                     maxAttempts: 3
 *                     backoffStrategy: "linear"
 *                     baseDelayMs: 2000
 *                     maxDelayMs: 30000
 *                     jitter: false
 *     responses:
 *       200:
 *         description: Workflow node updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                   description: Indicates if the operation was successful
 *                 data:
 *                   $ref: '#/components/schemas/WorkflowNode'
 *                   description: The updated workflow node data
 *                 message:
 *                   type: string
 *                   example: "Node updated successfully"
 *                   description: Optional success message
 *       400:
 *         description: Bad request - Invalid input data
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
 *         description: Forbidden - User doesn't have edit access to this workflow node
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Workflow node not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const updateNode = async (req, res) => {
  try {
    const { workflowNodeId } = req.params;
    const workflowNodeData = req.body;
    const [_, [updatedWorkflowNode]] = await WorkflowNode.update(
      workflowNodeData,
      { where: { id: workflowNodeId }, returning: true }
    );
    await updatedWorkflowNode.reload({
      include: [
        {
          model: Node,
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        },
      ],
    });
    return res.status(200).json({
      success: true,
      data: updatedWorkflowNode,
      message: "Node updated successfully",
    });
  } catch (error) {
    console.error("Error in nodesController.updateNode - ", error);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /nodes/{workflowNodeId}:
 *   delete:
 *     summary: Delete a workflow node
 *     description: Deletes a specific workflow node from its associated workflow. The user must have edit access to the associated workflow.
 *     tags: [Workflow Nodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workflowNodeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The workflow node ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Workflow node deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [success, data]
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                   description: Indicates if the operation was successful
 *                 data:
 *                   type: "null"
 *                   description: No data returned for delete operations
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Node deleted successfully"
 *                   description: Optional success message
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
 *         description: Forbidden - User doesn't have edit access to this workflow node
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Workflow node not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const deleteNode = async (req, res) => {
  try {
    const { workflowNodeId } = req.params;
    await WorkflowNode.destroy({ where: { id: workflowNodeId } });
    return res.status(200).json({
      success: true,
      data: null,
      message: "Node deleted successfully",
    });
  } catch (error) {
    console.error("Error in nodesController.deleteNode - ", error);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

module.exports = {
  getNode,
  updateNode,
  deleteNode,
};
