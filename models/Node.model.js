const { DataTypes } = require("sequelize");
const sequelize = require("@configs/dbConfig");
const { NODE_TYPE } = require("@constants/node");

const Node = sequelize.define(
  "node",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.ENUM,
      values: Object.values(NODE_TYPE),
      allowNull: false,
    },
    retryConfig: {
      type: DataTypes.JSON,
      defaultValue: {
        max_attempts: 3,
        backoff_strategy: "exponential",
        base_delay_ms: 2000,
        max_delay_ms: 30000,
        jitter: true,
      },
    },
  },
  { tableName: "nodes" }
);

Node.associate = function (models) {
  Node.hasMany(models.workflowNode, { foreignKey: "nodeId" });
};

module.exports = Node;
