const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");
const { BACKOFF_STRATEGY } = require("../constants/common");
const {
  WORKFLOW_NODE_EXECUTION_STATUS,
} = require("../constants/workflowExecution");

const WorkflowNodeExecution = sequelize.define(
  "workflowNodeExecution",
  {
    workflowExecutionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workflowNodeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: Object.values(WORKFLOW_NODE_EXECUTION_STATUS),
      allowNull: false,
    },
    startedAt: {
      type: DataTypes.DATE,
    },
    endedAt: {
      type: DataTypes.DATE,
    },
    reason: {
      type: DataTypes.TEXT,
    },
    output: {
      type: DataTypes.JSON,
    },
    input: {
      type: DataTypes.JSON,
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    maxAttempts: {
      type: DataTypes.INTEGER,
    },
    backoffStrategy: {
      type: DataTypes.ENUM,
      values: Object.values(BACKOFF_STRATEGY),
      defaultValue: BACKOFF_STRATEGY.EXPONENTIAL,
    },
  },
  { tableName: "workflow_node_executions" }
);

WorkflowNodeExecution.associate = function (models) {
  WorkflowNodeExecution.belongsTo(models.workflowExecution, {
    foreignKey: "workflowExecutionId",
  });
  WorkflowNodeExecution.belongsTo(models.workflowNode, {
    foreignKey: "workflowNodeId",
  });
};

module.exports = WorkflowNodeExecution;
