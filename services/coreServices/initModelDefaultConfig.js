const { Model } = require("sequelize");

const initModelDefaultConfig = () => {
  const originalInit = Model.init;
  Model.init = function (attributes, options) {
    return originalInit.call(this, attributes, {
      ...options,
      timestamps: true,
      paranoid: true,
    });
  };
};

module.exports = initModelDefaultConfig;