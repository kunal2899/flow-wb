const { set } = require("lodash");
const runtimeStateManager = require("../states/runtimeStateManager");

const updateGlobalContext = ({
  workflowExecutionId,
  globalContext,
  key,
  data,
}) => {
  try {
    set(globalContext, key, data);
    runtimeStateManager.setExecutionContext(
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