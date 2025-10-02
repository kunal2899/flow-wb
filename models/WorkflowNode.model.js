const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");

const WorkflowNode = sequelize.define(
  "workflowNode",
  {
    workflowId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nodeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    overrideConfig: {
      type: DataTypes.JSON,
    },
  },
  { tableName: "workflow_nodes" }
);

WorkflowNode.associate = function (models) {
  WorkflowNode.belongsTo(models.workflow, { foreignKey: "workflowId" });
  WorkflowNode.belongsTo(models.node, { foreignKey: "nodeId" });
  WorkflowNode.hasMany(models.actionNodeConfig, {
    foreignKey: "workflowNodeId",
  });
  WorkflowNode.hasMany(models.delayNodeConfig, {
    foreignKey: "workflowNodeId",
  });
  WorkflowNode.hasMany(models.conditionNodeConfig, {
    foreignKey: "workflowNodeId",
  });
  WorkflowNode.hasMany(models.workflowNodeConnections, {
    foreignKey: "sourceNodeId",
    as: "sourceNode",
  });
  WorkflowNode.hasMany(models.workflowNodeConnections, {
    foreignKey: "destinationNodeId",
    as: "destinationNode",
  });
  WorkflowNode.hasMany(models.workflowNodeExecution, {
    foreignKey: "workflowNodeId",
  });
};

module.exports = WorkflowNode;
