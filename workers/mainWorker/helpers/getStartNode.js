const { isNull } = require("lodash");

const getStartNode = async ({ startNodeId, workflowId }) => {
  try {
    const defaultInclusions = {
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
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
    };
    if (!isNull(startNodeId)) {
      return WorkflowNode.scope("plain").findByPk(
        startNodeId,
        defaultInclusions
      );
    }
    return WorkflowNode.scope("plain").findOne({
      where: {
        workflowId,
        isStart: true,
      },
      ...defaultInclusions,
    });
  } catch (error) {
    console.error("Error in helpers.getStartNode - ", error);
    throw error;
  }
};

module.exports = getStartNode;
