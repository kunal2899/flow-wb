const { map, get } = require("lodash");
const { NODE_TYPE } = require("@constants/node");
const { Op } = require("sequelize");

const getNextNodes = async ({ workflowNode, nodeExecution }) => {
  try {
    const {
      id: workflowNodeId,
      node: { type: nodeType },
    } = workflowNode;
    console.log("Getting next nodes", { workflowNodeId, nodeType });
    const nextNodesFilter = {
      sourceNodeId: workflowNodeId,
      isActive: true,
    };
    if (nodeType === NODE_TYPE.CONDITION) {
      const matchedRuleIds = get(nodeExecution, "output.matchedRuleIds", []);
      nextNodesFilter.ruleId = Array.isArray(matchedRuleIds)
        ? {
            [Op.in]: get(nodeExecution, "output.matchedRuleIds", []),
          }
        : matchedRuleIds ?? null;
    }
    const nextNodesData = await WorkflowNodeConnection.scope("plain").findAll({
      where: nextNodesFilter,
      include: [
        {
          model: WorkflowNode,
          as: "destinationNode",
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          include: [
            {
              model: Node,
              attributes: {
                exclude: [
                  "createdAt",
                  "updatedAt",
                  "deletedAt",
                  "name",
                  "description",
                ],
              },
            },
          ],
        },
      ],
    });
    if (!nextNodesData) return [];
    const nextNodes = map(nextNodesData, (nodeData) => ({
      ...nodeData.destinationNode,
      ruleId: nodeData.ruleId,
      prevNode: `wn_${workflowNodeId}`,
    }));
    console.log("Next nodes fetched successfully", {
      workflowNodeId,
      nextNodesIds: map(nextNodes, "id"),
    });
    return nextNodes;
  } catch (error) {
    console.error("Error in helpers.getNextNodes - ", error);
  }
};

module.exports = getNextNodes;
