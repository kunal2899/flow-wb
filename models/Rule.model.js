const { DataTypes } = require("sequelize");
const sequelize = require("@configs/dbConfig");

const Rule = sequelize.define("rule", {
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
}, { tableName: "rules" });

Rule.associate = function (models) {
  Rule.belongsTo(models.workflowNode, {
    foreignKey: "workflowNodeId",
  });
};

module.exports = Rule;