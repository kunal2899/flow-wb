const { updateWorkflowNodeSchema } = require("../../../schemas/node");
const validateEntity = require("../../../utils/validateEntity");

const validateUpdateWorkflowNode = (req, res, next) => {
  try {
    const workflowNode = req.body;
    validateEntity({
      schema: updateWorkflowNodeSchema,
      entity: workflowNode,
      onSuccess: next,
    });
  } catch (error) {
    console.error("Error in validators.validateUpdateWorkflowNode - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
}

module.exports = validateUpdateWorkflowNode;