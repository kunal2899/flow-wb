const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");

const DelayNodeConfig = sequelize.define("DelayNodeConfig", {
  workflowNodeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
  },
}, { tableName: "delay_node_configs" });

// Define associations
DelayNodeConfig.associate = function(models) {
  DelayNodeConfig.belongsTo(models.WorkflowNode, { foreignKey: "workflowNodeId" });
};

module.exports = DelayNodeConfig;