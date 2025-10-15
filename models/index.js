const fs = require("fs");
const { startCase } = require("lodash");
const path = require("path");

const models = {};

// Load all model files
const modelFiles = fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf(".") !== 0 &&
      file !== "index.js" &&
      file.slice(-9) === ".model.js"
    );
  });

// Import all models first (without associations)
modelFiles.forEach(file => {
  const model = require(path.join(__dirname, file));
  if (model && model.name) {
    models[model.name] = model;
  }
});

// Setup associations and scopes after all models are loaded
Object.keys(models).forEach((modelName) => {
  const model = models[modelName];
  // Associations
  if (model.associate) {
    model.associate(models);
  }
  // Scopes
  model.addScope("plain", {
    raw: true,
    nest: true,
  });
  model.addScope("active", {
    where: { deletedAt: null },
  });
});

module.exports = models;
