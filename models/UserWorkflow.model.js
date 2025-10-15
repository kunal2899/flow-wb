const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");
const { USER_WORKFLOW_ROLE } = require("../constants/userWorkflow");

const UserWorkflow = sequelize.define(
  "userWorkflow",
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
      defaultValue: USER_WORKFLOW_ROLE.OWNER,
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
  UserWorkflow.belongsTo(models.user, { foreignKey: "userId" });
  UserWorkflow.belongsTo(models.workflow, { foreignKey: "workflowId" });
  UserWorkflow.hasMany(models.userWorkflowTrigger, {
    foreignKey: "userWorkflowId",
  });
};

module.exports = UserWorkflow;
