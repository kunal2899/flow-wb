const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");

const User = sequelize.define(
  "user",
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
  User.hasMany(models.userWorkflow, { foreignKey: "userId" });
  User.hasMany(models.userEndpoint, { foreignKey: "userId" });
};

module.exports = User;
