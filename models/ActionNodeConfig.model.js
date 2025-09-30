const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");

const ActionNodeConfig = sequelize.define(
  "ActionNodeConfig",
  {
    workflowNodeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userEndpointId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    overrides: {
      type: DataTypes.JSON,
    },
  },
  { tableName: "action_node_configs" }
);

// Define associations
ActionNodeConfig.associate = function(models) {
  ActionNodeConfig.belongsTo(models.WorkflowNode, { foreignKey: "workflowNodeId" });
  ActionNodeConfig.belongsTo(models.UserEndpoint, { foreignKey: "userEndpointId" });
};

module.exports = ActionNodeConfig;
