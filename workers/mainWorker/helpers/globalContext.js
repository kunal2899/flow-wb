const { set } = require("lodash");
const runtimeStateManager = require("../states/runtimeStateManager");

const updateGlobalContext = async ({
  workflowExecutionId,
  globalContext,
  key,
  data,
}) => {
  try {
    set(globalContext, key, data);
    await runtimeStateManager.setExecutionContext(
      workflowExecutionId,
      JSON.stringify(globalContext)
    );
  } catch (error) {
    console.log("Error in helpers.updateGlobalContext - ", error);
    throw error;
  }
};

module.exports = {
  updateGlobalContext,
}