const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");
const { HTTP_METHOD } = require("../constants/common");

const Endpoint = sequelize.define(
  "endpoint",
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
      defaultValue: false,
    },
    provider: {
      type: DataTypes.STRING,
    },
  },
  { tableName: "endpoints" }
);

Endpoint.associate = function (models) {
  Endpoint.hasMany(models.userEndpoint, { foreignKey: "endpointId" });
};

module.exports = Endpoint;
