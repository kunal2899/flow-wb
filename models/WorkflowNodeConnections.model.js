const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");

const WorkflowNodeConnections = sequelize.define(
  "workflowNodeConnections",
  {
    sourceNodeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    destinationNodeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ruleId: {
      type: DataTypes.INTEGER,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  { tableName: "workflow_node_connections" }
);

WorkflowNodeConnections.associate = function (models) {
  WorkflowNodeConnections.belongsTo(models.workflowNode, {
    foreignKey: "sourceNodeId",
    as: "SourceNode",
  });
  WorkflowNodeConnections.belongsTo(models.workflowNode, {
    foreignKey: "destinationNodeId",
    as: "DestinationNode",
  });
  WorkflowNodeConnections.belongsTo(models.conditionNodeConfig, {
    foreignKey: "ruleId",
  });
};

module.exports = WorkflowNodeConnections;
