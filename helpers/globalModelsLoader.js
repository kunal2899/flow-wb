const models = require("@models");

const globalModelsLoader = () => {
  try {
    Object.keys(models).forEach(modelName => {
      const globalName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
      global[globalName] = models[modelName];
    });
    console.log('Models registered globally');
  } catch (error) {
    console.error('Error registering models globally - ', error);
    throw error;
  }
}

module.exports = globalModelsLoader;