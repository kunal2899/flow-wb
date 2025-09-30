const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");

const WorkflowNodeConnections = sequelize.define(
  "WorkflowNodeConnections",
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
  WorkflowNodeConnections.belongsTo(models.WorkflowNode, {
    foreignKey: "sourceNodeId",
    as: "SourceNode",
  });
  WorkflowNodeConnections.belongsTo(models.WorkflowNode, {
    foreignKey: "destinationNodeId",
    as: "DestinationNode",
  });
  WorkflowNodeConnections.belongsTo(models.ConditionNodeConfig, {
    foreignKey: "ruleId",
  });
};

module.exports = WorkflowNodeConnections;
