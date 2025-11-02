const { DataTypes } = require("sequelize");
const sequelize = require("@configs/dbConfig");

const WorkflowNodeConnection = sequelize.define(
  "workflowNodeConnection",
  {
    workflowId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
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

WorkflowNodeConnection.associate = function (models) {
  WorkflowNodeConnection.belongsTo(models.workflow, {
    foreignKey: "workflowId",
  });
  WorkflowNodeConnection.belongsTo(models.workflowNode, {
    foreignKey: "sourceNodeId",
    as: "sourceNode",
  });
  WorkflowNodeConnection.belongsTo(models.workflowNode, {
    foreignKey: "destinationNodeId",
    as: "destinationNode",
  });
  WorkflowNodeConnection.belongsTo(models.rule, {
    foreignKey: "ruleId",
  });
};

module.exports = WorkflowNodeConnection;
