const { DataTypes } = require("sequelize");
const sequelize = require("@configs/dbConfig");
const { ON_ERROR_ACTION } = require("@constants/node");

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
    isStart: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    onErrorAction: {
      type: DataTypes.ENUM,
      values: Object.values(ON_ERROR_ACTION),
      defaultValue: ON_ERROR_ACTION.STOP,
    },
  },
  {
    tableName: "workflow_nodes",
    indexes: [
      {
        name: "unique_start_node_per_workflow",
        unique: true,
        fields: ["workflowId"],
        where: {
          isStart: true,
        },
      },
    ],
  }
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
  WorkflowNode.hasMany(models.rule, {
    foreignKey: "workflowNodeId",
  });
  WorkflowNode.hasMany(models.workflowNodeConnection, {
    foreignKey: "sourceNodeId",
    as: "sourceNode",
  });
  WorkflowNode.hasMany(models.workflowNodeConnection, {
    foreignKey: "destinationNodeId",
    as: "destinationNode",
  });
  WorkflowNode.hasMany(models.workflowNodeExecution, {
    foreignKey: "workflowNodeId",
  });
};

// This ensures that start node cannot be updated to false
WorkflowNode.beforeUpdate(async node => {
  if (node.changed("isStart") && !node.isStart) {
    const startNode = await WorkflowNode.findOne({
      where: {
        workflowId: node.workflowId,
        isStart: true,
      }
    });
    if (startNode.id === node.id) {
      throw new Error("Workflow must have at least one start node");
    }
  }
});

// This ensures that start node cannot be deleted
WorkflowNode.beforeDestroy(async node => {
  if (node.isStart) {
    throw new Error("Start node cannot be deleted");
  }
});

// This ensures that first created node is the start node
// and no other node can be created as start node
WorkflowNode.beforeCreate(async node => {
  const existingStartNode = await WorkflowNode.findOne({
    where: {
      workflowId: node.workflowId,
      isStart: true,
    }
  });
  node.isStart = !existingStartNode || false;
});

module.exports = WorkflowNode;
