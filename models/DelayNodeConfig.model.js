const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");
const { TIME_UNIT } = require("../constants/common");

const DelayNodeConfig = sequelize.define(
  "delayNodeConfig",
  {
    workflowNodeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit: {
      type: DataTypes.ENUM,
      values: Object.values(TIME_UNIT),
      defaultValue: TIME_UNIT.SECONDS,
    }
  },
  { tableName: "delay_node_configs" }
);

DelayNodeConfig.associate = function (models) {
  DelayNodeConfig.belongsTo(models.workflowNode, {
    foreignKey: "workflowNodeId",
  });
};

module.exports = DelayNodeConfig;
