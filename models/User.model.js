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

User.associate = function (models) {
  User.hasMany(models.UserWorkflow, { foreignKey: "userId" });
  User.hasMany(models.UserEndpoint, { foreignKey: "userId" });
};

module.exports = User;
