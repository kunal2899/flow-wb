const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");

const WorkflowNode = sequelize.define(
  "WorkflowNode",
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
  WorkflowNode.belongsTo(models.Workflow, { foreignKey: "workflowId" });
  WorkflowNode.belongsTo(models.Node, { foreignKey: "nodeId" });
  WorkflowNode.hasMany(models.ActionNodeConfig, {
    foreignKey: "workflowNodeId",
  });
  WorkflowNode.hasMany(models.DelayNodeConfig, {
    foreignKey: "workflowNodeId",
  });
  WorkflowNode.hasMany(models.ConditionNodeConfig, {
    foreignKey: "workflowNodeId",
  });
  WorkflowNode.hasMany(models.WorkflowNodeConnections, {
    foreignKey: "sourceNodeId",
    as: "SourceNode",
  });
  WorkflowNode.hasMany(models.WorkflowNodeConnections, {
    foreignKey: "destinationNodeId",
    as: "DestinationNode",
  });
  WorkflowNode.hasMany(models.WorkflowNodeExecution, {
    foreignKey: "workflowNodeId",
  });
};

module.exports = WorkflowNode;
