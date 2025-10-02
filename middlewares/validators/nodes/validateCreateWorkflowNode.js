const { createWorkflowNodeSchema } = require("../../../schemas/node");
const validateEntity = require("../../../utils/validateEntity");

const validateCreateWorkflowNode = (req, res, next) => {
  try {
    const workflowNode = req.body;
    validateEntity({
      schema: createWorkflowNodeSchema,
      entity: workflowNode,
      onSuccess: next,
    });
  } catch (error) {
    console.error("Error in validators.validateCreateWorkflowNode - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
}

module.exports = validateCreateWorkflowNode;