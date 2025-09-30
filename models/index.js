const fs = require("fs");
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

// Setup associations after all models are loaded
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;
