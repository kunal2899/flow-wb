const { DataTypes } = require("sequelize");
const sequelize = require("@configs/dbConfig");

const ActionNodeConfig = sequelize.define(
  "actionNodeConfig",
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

ActionNodeConfig.associate = function (models) {
  ActionNodeConfig.belongsTo(models.workflowNode, {
    foreignKey: "workflowNodeId",
  });
  ActionNodeConfig.belongsTo(models.userEndpoint, {
    foreignKey: "userEndpointId",
  });
};

module.exports = ActionNodeConfig;
