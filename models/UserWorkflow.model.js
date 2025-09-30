const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");
const { USER_WORKFLOW_ROLE } = require("../constants/userWorkflow");

const UserWorkflow = sequelize.define(
  "UserWorkflow",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workflowId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM,
      values: Object.values(USER_WORKFLOW_ROLE),
      defaultValue: USER_WORKFLOW_ROLE.VIEWER,
    },
  },
  {
    tableName: "user_workflows",
    indexes: [
      {
        unique: true,
        fields: ["userId", "workflowId"],
      },
    ],
  }
);

UserWorkflow.associate = function (models) {
  UserWorkflow.belongsTo(models.User, { foreignKey: "userId" });
  UserWorkflow.belongsTo(models.Workflow, { foreignKey: "workflowId" });
  UserWorkflow.hasMany(models.UserWorkflowTriggers, {
    foreignKey: "userWorkflowId",
  });
};

module.exports = UserWorkflow;
