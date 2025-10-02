const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");

const UserEndpoint = sequelize.define(
  "userEndpoint",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    endpointId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    headers: {
      type: DataTypes.JSON,
    },
    body: {
      type: DataTypes.JSON,
    },
    authConfig: {
      type: DataTypes.JSON,
    },
  },
  {
    tableName: "user_endpoints",
  }
);

UserEndpoint.associate = function (models) {
  UserEndpoint.belongsTo(models.user, { foreignKey: "userId" });
  UserEndpoint.belongsTo(models.endpoint, { foreignKey: "endpointId" });
  UserEndpoint.hasMany(models.actionNodeConfig, {
    foreignKey: "userEndpointId",
  });
};

module.exports = UserEndpoint;
