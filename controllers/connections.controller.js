const Node = require("../models/Node.model");
const Rule = require("../models/Rule.model");
const WorkflowNode = require("../models/WorkflowNode.model");
const WorkflowNodeConnections = require("../models/WorkflowNodeConnections.model");

const definedInclusion = {
  include: [
    {
      model: WorkflowNode,
      as: "sourceNode",
      attributes: {
        exclude: ["createdAt", "updatedAt", "deletedAt", "nodeId"],
      },
      include: [
        {
          model: Node,
          attributes: {
            exclude: ["createdAt", "updatedAt", "deletedAt"],
          },
        },
      ],
    },
    {
      model: WorkflowNode,
      as: "destinationNode",
      attributes: {
        exclude: ["createdAt", "updatedAt", "deletedAt", "nodeId"],
      },
      include: [
        {
          model: Node,
          attributes: {
            exclude: ["createdAt", "updatedAt", "deletedAt"],
          },
        },
      ],
    },
    {
      model: Rule,
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
    },
  ],
};

/**
 * @swagger
 * /workflows/{workflowId}/connections:
 *   post:
 *     summary: Create a connection between workflow nodes
 *     description: Creates a new connection between two workflow nodes. If the source node is a condition node, you can specify a rule ID to determine the flow path.
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConnectionRequest'
 *           examples:
 *             simple_connection:
 *               summary: Simple Connection
 *               value:
 *                 sourceNodeId: 1
 *                 destinationNodeId: 2
 *             conditional_connection:
 *               summary: Conditional Connection
 *               value:
 *                 sourceNodeId: 1
 *                 destinationNodeId: 2
 *                 ruleId: 1
 *     responses:
 *       201:
 *         description: Connection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/WorkflowNodeConnection'
 *                 message:
 *                   type: string
 *                   example: "Connection created successfully"
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
 *         description: Forbidden - User doesn't have access to these workflow nodes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Connection already exists between these nodes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Connection already exists between these nodes"
 *                 connection:
 *                   $ref: '#/components/schemas/WorkflowNodeConnection'
 */
const createConnection = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const connectionData = req.body;
    const connectionObj = { ...connectionData, isActive: true, workflowId };
    const [connection, isCreated] = await WorkflowNodeConnections.findOrCreate({
      where: connectionObj,
      defaults: connectionObj,
    });
    await connection.reload(definedInclusion);
    if (!isCreated) {
      return res.status(409).json({
        success: false,
        data: connection,
        message: "Connection already exists between these nodes",
      });
    }
    return res.status(201).json({
      success: true,
      data: connection,
      message: "Connection created successfully",
    });
  } catch (error) {
    console.error("Error in connectionsController.createConnection - ", error);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /workflows/{workflowId}/connections/{connectionId}:
 *   put:
 *     summary: Update a workflow node connection
 *     description: Updates an existing connection between workflow nodes. Can be used to update the rule ID for conditional connections or to activate/deactivate the connection.
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The workflow ID
 *         example: 1
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The connection ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConnectionRequest'
 *           examples:
 *             update_rule:
 *               summary: Update Condition Rule
 *               value:
 *                 ruleId: 2
 *             deactivate_connection:
 *               summary: Deactivate Connection
 *               value:
 *                 isActive: false
 *     responses:
 *       200:
 *         description: Connection updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/WorkflowNodeConnection'
 *                 message:
 *                   type: string
 *                   example: "Connection updated successfully"
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
 *         description: Forbidden - User doesn't have access to these workflow nodes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Connection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const updateConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const connectionData = req.body;
    const [affectedRows, [updatedConnection]] =
      await WorkflowNodeConnections.update(connectionData, {
        where: { id: connectionId, isActive: true },
        returning: true,
      });
    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Active connection not found",
      });
    }
    await updatedConnection.reload(definedInclusion);
    return res.status(200).json({
      success: true,
      data: updatedConnection,
      message: "Connection updated successfully",
    });
  } catch (error) {
    console.error("Error in connectionsController.updateConnection - ", error);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /workflows/{workflowId}/connections/{connectionId}:
 *   delete:
 *     summary: Delete a workflow node connection
 *     description: Permanently removes a connection between workflow nodes. This action cannot be undone.
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The workflow ID
 *         example: 1
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The connection ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Connection deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Connection deleted successfully"
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
 *         description: Forbidden - User doesn't have access to these workflow nodes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Active connection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const deleteConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    await WorkflowNodeConnections.destroy({
      where: { id: connectionId },
    });
    return res.status(200).json({
      success: true,
      data: null,
      message: "Connection deleted successfully",
    });
  } catch (error) {
    console.error("Error in connectionsController.deleteConnection - ", error);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /workflows/{workflowId}/connections/{connectionId}/status:
 *   patch:
 *     summary: Update connection status
 *     description: Activates or deactivates a workflow node connection. Inactive connections are ignored during workflow execution.
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workflowId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The workflow ID
 *         example: 1
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The connection ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['isActive']
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Whether the connection should be active
 *                 example: true
 *           examples:
 *             activate:
 *               summary: Activate Connection
 *               value:
 *                 isActive: true
 *             deactivate:
 *               summary: Deactivate Connection
 *               value:
 *                 isActive: false
 *     responses:
 *       200:
 *         description: Connection status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                success:
 *                  type: boolean
 *                  example: true
 *                data:
 *                  $ref: '#/components/schemas/WorkflowNodeConnection'
 *                message:
 *                  type: string
 *                  example: "Connection status updated successfully"
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
 *         description: Forbidden - User doesn't have access to these workflow nodes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Connection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const updateConnectionStatus = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { isActive } = req.body;
    const [_, [updatedConnection]] = await WorkflowNodeConnections.update(
      { isActive },
      {
        where: { id: connectionId },
        returning: true,
      }
    );
    await updatedConnection.reload(definedInclusion);
    return res.status(200).json({
      success: true,
      data: updatedConnection,
      message: "Connection status updated successfully",
    });
  } catch (error) {
    console.error(
      "Error in connectionsController.updateConnectionStatus - ",
      error
    );
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

module.exports = {
  createConnection,
  updateConnection,
  deleteConnection,
  updateConnectionStatus,
};
