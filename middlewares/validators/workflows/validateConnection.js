const WorkflowNode = require("../../../models/WorkflowNode.model");
const {
  connectionSchema,
  updateConnectionStatusSchema,
} = require("../../../schemas/connection");
const {
  checkConnectionValidity,
} = require("../../../services/connections.service");
const validateEntity = require("../../../utils/validateEntity");

const validateConnection = async (req, res, next) => {
  try {
    const { workflowId } = req.params;
    console.log({ params: req.params })
    const connection = req.body;
    validateEntity({
      schema: connectionSchema,
      entity: connection,
    });
    // check source and destination nodes belong to same workflow
    const { valid, reason } = await checkConnectionValidity(
      connection.sourceNodeId,
      connection.destinationNodeId,
      workflowId,
    );
    if (!valid) {
      return res.status(400).send({ message: reason });
    }
    next();
  } catch (error) {
    console.error("Error in validators.validateConnection - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
};

const validateConnectionStatus = (req, res, next) => {
  try {
    const connectionStatus = req.body;
    validateEntity({
      schema: updateConnectionStatusSchema,
      entity: connectionStatus,
      onSuccess: next,
    });
  } catch (error) {
    console.error("Error in validators.validateConnectionStatus - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
};

module.exports = {
  validateConnection,
  validateConnectionStatus,
};
