const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");

const DelayNodeConfig = sequelize.define(
  "delayNodeConfig",
  {
    workflowNodeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
    },
  },
  { tableName: "delay_node_configs" }
);

DelayNodeConfig.associate = function (models) {
  DelayNodeConfig.belongsTo(models.workflowNode, {
    foreignKey: "workflowNodeId",
  });
};

module.exports = DelayNodeConfig;
