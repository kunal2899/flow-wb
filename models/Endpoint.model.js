const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");
const { HTTP_METHOD } = require("../constants/common");

const Endpoint = sequelize.define(
  "Endpoint",
  {
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM,
      values: Object.values(HTTP_METHOD),
      allowNull: false,
    },
    headers: {
      type: DataTypes.JSON,
    },
    body: {
      type: DataTypes.JSON,
    },
    isGlobal: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    provider: {
      type: DataTypes.STRING,
    },
  },
  { tableName: "endpoints" }
);

Endpoint.associate = function (models) {
  Endpoint.hasMany(models.UserEndpoint, { foreignKey: "endpointId" });
};

module.exports = Endpoint;
