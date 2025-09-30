const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");

const User = sequelize.define(
  "User",
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    identifier: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { tableName: "users" }
);

// Define associations
User.associate = function(models) {
  // Use hasMany for both UserWorkflow and UserEndpoint since they have additional business fields
  User.hasMany(models.UserWorkflow, { foreignKey: "userId" });
  User.hasMany(models.UserEndpoint, { foreignKey: "userId" });
};

module.exports = User;
