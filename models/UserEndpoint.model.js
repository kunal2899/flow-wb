const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");

const UserEndpoint = sequelize.define(
  "UserEndpoint",
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
    indexes: [
      {
        unique: true,
        fields: ['userId', 'endpointId']
      }
    ]
  }
);

// Define associations
UserEndpoint.associate = function(models) {
  UserEndpoint.belongsTo(models.User, { foreignKey: "userId" });
  UserEndpoint.belongsTo(models.Endpoint, { foreignKey: "endpointId" });
  UserEndpoint.hasMany(models.ActionNodeConfig, { foreignKey: "userEndpointId" });
};

module.exports = UserEndpoint;
