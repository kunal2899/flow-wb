const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");

const ConditionNodeConfig = sequelize.define(
  "ConditionNodeConfig",
  {
    workflowNodeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expression: {
      type: DataTypes.JSON,
    },
    label: {
      type: DataTypes.STRING,
    },
  },
  { tableName: "condition_node_configs" }
);

ConditionNodeConfig.associate = function (models) {
  ConditionNodeConfig.belongsTo(models.WorkflowNode, {
    foreignKey: "workflowNodeId",
  });
};

module.exports = ConditionNodeConfig;
