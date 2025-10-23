const mainWorker = require("./mainWorker");
const globalModelsLoader = require("@helpers/globalModelsLoader");
const {
  connectToServices,
} = require("@services/coreServices/dbConnectionService");

const initialiseWorkers = async () => {
  try {
    await connectToServices();
    globalModelsLoader();
    await mainWorker.init();
  } catch (error) {
    console.error("Error in initializing workers - ", error);
  }
};

(async () => {
  await initialiseWorkers();
})();
