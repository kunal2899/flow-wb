const { updateWorkflowSchema } = require("../../../schemas/workflow");
const validateEntity = require("../../../utils/validateEntity");

const validateUpdateWorkflow = (req, res, next) => {
  try {
    const workflow = req.body;
    validateEntity({
      schema: updateWorkflowSchema,
      entity: workflow,
      onSuccess: next,
    });
  } catch (error) {
    console.error("Error in validators.validateUpdateWorkflow - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
}

module.exports = validateUpdateWorkflow;