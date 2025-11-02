const { createWorkflowSchema } = require("../../../schemas/workflow");
const validateEntity = require("../../../utils/validateEntity");

const validateCreateWorkflow = (req, res, next) => {
  try {
    const workflow = req.body;
    validateEntity({
      schema: createWorkflowSchema,
      entity: workflow,
      onSuccess: next,
    });
  } catch (error) {
    console.error("Error in validators.validateCreateWorkflow - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
}

module.exports = validateCreateWorkflow;