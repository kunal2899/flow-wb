const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");
const { VISIBILITY_OPTION } = require("../constants/common");
const { WORKFLOW_STATUS } = require("../constants/workflow");

const Workflow = sequelize.define(
  "workflow",
  {
    identifier: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    visibility: {
      type: DataTypes.ENUM,
      values: Object.values(VISIBILITY_OPTION),
      defaultValue: VISIBILITY_OPTION.PRIVATE,
    },
    status: {
      type: DataTypes.ENUM,
      values: Object.values(WORKFLOW_STATUS),
      defaultValue: WORKFLOW_STATUS.DRAFT,
    },
  },
  { tableName: "workflows" }
);

Workflow.associate = function (models) {
  Workflow.hasMany(models.userWorkflow, { foreignKey: "workflowId" });
  Workflow.hasMany(models.workflowNode, { foreignKey: "workflowId" });
};

module.exports = Workflow;
