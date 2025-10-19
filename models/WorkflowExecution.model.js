const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");
const { WORKFLOW_EXECUTION_STATUS } = require("../constants/workflowExecution");

const WorkflowExecution = sequelize.define(
  "workflowExecution",
  {
    triggerId: {
      type: DataTypes.INTEGER,
    },
    userWorkflowId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: Object.values(WORKFLOW_EXECUTION_STATUS),
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
    triggerPayload: {
      type: DataTypes.JSON,
    },
    retryOf: {
      type: DataTypes.INTEGER,
    },
  },
  { tableName: "workflow_executions" }
);

WorkflowExecution.associate = function (models) {
  WorkflowExecution.belongsTo(models.userWorkflowTrigger, {
    foreignKey: "triggerId",
  });
  WorkflowExecution.belongsTo(models.userWorkflow, {
    foreignKey: "userWorkflowId",
  });
  WorkflowExecution.hasMany(models.workflowNodeExecution, {
    foreignKey: "workflowExecutionId",
  });
};

module.exports = WorkflowExecution;
