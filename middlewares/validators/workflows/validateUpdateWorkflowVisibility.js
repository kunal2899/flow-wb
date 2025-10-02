const { updateWorkflowVisibilitySchema } = require("../../../schemas/workflow");
const validateEntity = require("../../../utils/validateEntity");

const validateUpdateWorkflowVisibility = (req, res, next) => {
  try {
    const workflowVisibility = req.body;
    validateEntity({
      schema: updateWorkflowVisibilitySchema,
      entity: workflowVisibility,
      onSuccess: next,
    });
  } catch (error) {
    console.error("Error in validators.validateUpdateWorkflowVisibility - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
}

module.exports = validateUpdateWorkflowVisibility;