const UserWorkflow = require("../models/UserWorkflow.model");
const Workflow = require("../models/Workflow.model");
const generateIdentifier = require("../utils/generateIdentifier");
const sequelize = require("../configs/dbConfig");
const { NODE_TYPE } = require("../constants/node");
const { get, pick, omit, map } = require("lodash");
const Endpoint = require("../models/Endpoint.model");
const ActionNodeConfig = require("../models/ActionNodeConfig.model");
const Node = require("../models/Node.model");
const WorkflowNode = require("../models/WorkflowNode.model");
const UserEndpoint = require("../models/UserEndpoint.model");
const DelayNodeConfig = require("../models/DelayNodeConfig.model");
const Rule = require("../models/Rule.model");
const WorkflowNodeConnections = require("../models/WorkflowNodeConnections.model");

/**
 * @swagger
 * /workflows:
 *   post:
 *     summary: Create a new workflow
 *     description: Creates a new workflow and associates it with the authenticated user
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkflowRequest'
 *     responses:
 *       201:
 *         description: Workflow created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Workflow created successfully"
 *                 workflow:
 *                   $ref: '#/components/schemas/Workflow'
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
 */
const createWorkflow = async (req, res) => {
  try {
    const workflowData = req.body;
    await sequelize.transaction(async (t) => {
      const identifier = generateIdentifier(workflowData.name);
      const newWorkflow = await Workflow.create(
        { ...workflowData, identifier },
        { transaction: t, returning: { exclude: ["createdAt", "updatedAt"] } }
      );
      await UserWorkflow.create(
        {
          workflowId: newWorkflow.id,
          userId: req.user.id,
        },
        { transaction: t }
      );
      return res.status(201).json({
        success: true,
        message: "Workflow created successfully",
        data: newWorkflow,
      });
    });
  } catch (error) {
    console.error("Error in workflowsController.createWorkflow - ", error);
    return res
      .status(400)
      .send({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /workflows/{workflowId}:
 *   put:
 *     summary: Update a workflow
 *     description: Updates an existing workflow. The user must have edit access to this workflow.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkflowRequest'
 *     responses:
 *       200:
 *         description: Workflow updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Workflow'
 *                 message:
 *                   type: string
 *                   example: "Workflow updated successfully"
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
 *         description: Forbidden - User doesn't have edit access to this workflow
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
const updateWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const workflowData = req.body;
    const [_, [updatedWorkflow]] = await Workflow.update(workflowData, {
      where: { id: workflowId },
      returning: true,
    });
    return res.status(200).json({
      success: true,
      data: updatedWorkflow,
      message: "Workflow updated successfully",
    });
  } catch (error) {
    console.error("Error in workflowsController.updateWorkflow - ", error);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /workflows/{workflowId}/status:
 *   patch:
 *     summary: Update workflow status
 *     description: Updates the status of an existing workflow. The user must have edit access to this workflow.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkflowStatusRequest'
 *     responses:
 *       200:
 *         description: Workflow status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Workflow'
 *                 message:
 *                   type: string
 *                   example: "Workflow status updated successfully"
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
 *         description: Forbidden - User doesn't have edit access to this workflow
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
const updateWorkflowStatus = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { status } = req.body;
    const [_, [updatedWorkflow]] = await Workflow.update(
      { status },
      { where: { id: workflowId }, returning: true }
    );
    return res.status(200).json({
      success: true,
      data: updatedWorkflow,
      message: "Workflow status updated successfully",
    });
  } catch (error) {
    console.error(
      "Error in workflowsController.updateWorkflowStatus - ",
      error
    );
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /workflows/{workflowId}/visibility:
 *   patch:
 *     summary: Update workflow visibility
 *     description: Updates the visibility of an existing workflow. The user must have edit access to this workflow.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkflowVisibilityRequest'
 *     responses:
 *       200:
 *         description: Workflow visibility updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Workflow'
 *                 message:
 *                   type: string
 *                   example: "Workflow visibility updated successfully"
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
 *         description: Forbidden - User doesn't have edit access to this workflow
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
const updateWorkflowVisibility = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { visibility } = req.body;
    const [_, [updatedWorkflow]] = await Workflow.update(
      { visibility },
      { where: { id: workflowId }, returning: true }
    );
    return res.status(200).json({
      success: true,
      data: updatedWorkflow,
      message: "Workflow visibility updated successfully",
    });
  } catch (error) {
    console.error(
      "Error in workflowsController.updateWorkflowVisibility - ",
      error
    );
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /workflows/{workflowId}:
 *   delete:
 *     summary: Delete a workflow
 *     description: Deletes an existing workflow and removes the user's association with it. The user must be the owner of this workflow.
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
 *     responses:
 *       200:
 *         description: Workflow deleted successfully
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
 *                   example: "Workflow deleted successfully"
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
 *         description: Forbidden - User doesn't have owner access to this workflow
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
const deleteWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    await sequelize.transaction(async (t) => {
      await Workflow.destroy({ where: { id: workflowId }, transaction: t });
      return res.status(200).json({
        success: true,
        data: null,
        message: "Workflow deleted successfully",
      });
    });
  } catch (error) {
    console.error("Error in workflowsController.deleteWorkflow - ", error);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /workflows/{workflowId}/nodes:
 *   get:
 *     summary: Get all nodes in a workflow
 *     description: Retrieves all nodes associated with a specific workflow. The user must have access to this workflow.
 *     tags: [Workflow Nodes]
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
 *     responses:
 *       200:
 *         description: Successfully retrieved workflow nodes
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
 *                     $ref: '#/components/schemas/WorkflowNode'
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
const getWorkflowNodes = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const workflowNodes = await WorkflowNode.findAll({
      where: { workflowId },
      include: [
        {
          model: Node,
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        },
      ],
    });
    return res.status(200).json({
      success: true,
      data: workflowNodes,
    });
  } catch (error) {
    console.error("Error in workflowsController.getWorkflowNodes - ", error);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /workflows/{workflowId}/nodes:
 *   post:
 *     summary: Create a new node in a workflow
 *     description: Creates a new node and adds it to a specific workflow. The user must have edit access to this workflow. Supports different node types (action, condition, delay) with type-specific configuration.
 *     tags: [Workflow Nodes]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkflowNodeRequest'
 *           examples:
 *             action_node:
 *               summary: Action Node Example
 *               value:
 *                 name: "Send Email"
 *                 description: "Sends an email notification to the user"
 *                 type: "action"
 *                 overrideConfig: {}
 *                 data:
 *                   endpointId: 1
 *             action_node_new_endpoint:
 *               summary: Action Node with New Endpoint
 *               value:
 *                 name: "Send SMS"
 *                 description: "Sends an SMS notification"
 *                 type: "action"
 *                 overrideConfig: {}
 *                 data:
 *                   endpoint:
 *                     name: "Twilio SMS API"
 *                     description: "Twilio API for sending SMS"
 *                     url: "https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json"
 *                     method: "post"
 *                     headers:
 *                       Content-Type: "application/x-www-form-urlencoded"
 *                     body:
 *                       From: "+1234567890"
 *                       To: "{{user.phone}}"
 *                       Body: "{{message}}"
 *                     authConfig:
 *                       type: "basic"
 *                       username: "{{twilio.account_sid}}"
 *                       password: "{{twilio.auth_token}}"
 *             condition_node:
 *               summary: Condition Node Example
 *               value:
 *                 name: "Check User Status"
 *                 description: "Checks if user is premium"
 *                 type: "condition"
 *                 overrideConfig: {}
 *                 data:
 *                   expression:
 *                     field: "user.status"
 *                     operator: "equals"
 *                     value: "premium"
 *                   label: "User is premium"
 *             delay_node:
 *               summary: Delay Node Example
 *               value:
 *                 name: "Wait 5 seconds"
 *                 description: "Waits for 5 seconds before proceeding"
 *                 type: "delay"
 *                 overrideConfig: {}
 *                 data:
 *                   duration: 5000
 *     responses:
 *       201:
 *         description: Workflow node created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/ActionNodeConfig'
 *                     - $ref: '#/components/schemas/ConditionNodeConfig'
 *                     - $ref: '#/components/schemas/DelayNodeConfig'
 *                 message:
 *                   type: string
 *                   example: "Workflow node created successfully"
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
 *         description: Forbidden - User doesn't have edit access to this workflow
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
const createWorkflowNode = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const nodeData = req.body;
    await sequelize.transaction(async (transaction) => {
      const node = await Node.create(
        { ...pick(nodeData, ["name", "description", "type"]) },
        { transaction }
      );
      const workflowNode = await WorkflowNode.create(
        { workflowId, nodeId: node.id, ...pick(nodeData, ["overrideConfig"]) },
        { transaction }
      );
      let nodeConfig = null;
      let dataInclusion = [
        {
          model: WorkflowNode,
          attributes: {
            exclude: ["createdAt", "updatedAt", "deletedAt"],
          },
        },
      ];
      switch (nodeData.type) {
        case NODE_TYPE.ACTION:
          let endpointId = get(nodeData, "data.endpointId", null);
          const endpointData = get(nodeData, "data.endpoint", null);
          const userEndpointObj = {
            userId: req.user.id,
            endpointId,
          };
          if (!endpointId) {
            const endpoint = await Endpoint.create(
              {
                ...omit(endpointData, ["headers", "body", "authConfig"]),
              },
              { transaction }
            );
            endpointId = endpoint.id;
            Object.assign(userEndpointObj, {
              endpointId,
              ...pick(endpointData, ["headers", "body", "authConfig"]),
            });
          }
          const [userEndpoint] = await UserEndpoint.findOrCreate({
            where: {
              userId: req.user.id,
              endpointId,
            },
            defaults: userEndpointObj,
            transaction,
          });
          nodeConfig = await ActionNodeConfig.create(
            {
              workflowNodeId: workflowNode.id,
              userEndpointId: userEndpoint.id,
            },
            { transaction, returning: true }
          );
          dataInclusion.push({
            model: UserEndpoint,
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt"],
            },
            include: [
              {
                model: Endpoint,
                attributes: {
                  exclude: ["createdAt", "updatedAt", "deletedAt"],
                },
              },
            ],
          });
          break;
        case NODE_TYPE.CONDITION:
          nodeConfig = await Rule.create(
            {
              workflowNodeId: workflowNode.id,
              ...pick(nodeData.data, ["expression", "label"]),
            },
            { transaction }
          );
          break;
        case NODE_TYPE.DELAY:
          nodeConfig = await DelayNodeConfig.create(
            {
              workflowNodeId: workflowNode.id,
              ...pick(nodeData.data, ["duration", "unit"]),
            },
            { transaction }
          );
          break;
      }
      await nodeConfig.reload({
        include: dataInclusion,
        transaction,
      });
      return res.status(201).json({
        success: true,
        data: nodeConfig,
        message: "Workflow node created successfully",
      });
    });
  } catch (error) {
    console.error("Error in workflowsController.createWorkflowNode - ", error);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

/**
 * @swagger
 * /workflows/{workflowId}/graph:
 *   get:
 *     summary: Get workflow graph structure
 *     description: Retrieves the complete graph structure of a workflow, including all nodes and their connections. Only active connections are included.
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
 *     responses:
 *       200:
 *         description: Successfully retrieved workflow graph
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
 *                   $ref: '#/components/schemas/WorkflowGraph'
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
const getWorkflowGraph = async (req, res) => {
  try {
    const { workflowId } = req.params;
    await sequelize.transaction(async (transaction) => {
      const workflowNodes = await WorkflowNode.findAll({
        where: { workflowId },
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "deletedAt",
            "nodeId",
            "workflowId",
          ],
        },
        include: [
          {
            model: Node,
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          },
        ],
        transaction,
      });
      const workflowNodeConnections = await WorkflowNodeConnections.findAll({
        where: { workflowId, isActive: true },
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "deletedAt",
            "isActive",
            "workflowId",
          ],
        },
        transaction,
      });
      const workflowGraph = {
        workflowNodes,
        connections: workflowNodeConnections,
      };
      return res.status(200).json({
        success: true,
        data: workflowGraph,
      });
    });
  } catch (error) {
    console.error("Error in workflowsController.getWorkflowGraph - ", error);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!" });
  }
};

module.exports = {
  createWorkflow,
  updateWorkflow,
  updateWorkflowStatus,
  updateWorkflowVisibility,
  deleteWorkflow,
  createWorkflowNode,
  getWorkflowNodes,
  getWorkflowGraph,
};
