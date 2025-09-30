const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");
const { USER_WORKFLOW_TRIGGER_TYPE } = require("../constants/userWorkflow");

const UserWorkflowTriggers = sequelize.define(
  "UserWorkflowTriggers",
  {
    userWorkflowId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.ENUM,
      values: Object.values(USER_WORKFLOW_TRIGGER_TYPE),
      allowNull: false,
    },
    config: {
      type: DataTypes.JSON,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  { tableName: "user_workflow_triggers" }
);

UserWorkflowTriggers.associate = function (models) {
  UserWorkflowTriggers.belongsTo(models.UserWorkflow, {
    foreignKey: "userWorkflowId",
  });
};

module.exports = UserWorkflowTriggers;
