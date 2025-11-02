const { updateWorkflowStatusSchema } = require("../../../schemas/workflow");
const validateEntity = require("../../../utils/validateEntity");

const validateUpdateWorkflowStatus = (req, res, next) => {
  try {
    const workflowStatus = req.body;
    validateEntity({
      schema: updateWorkflowStatusSchema,
      entity: workflowStatus,
      onSuccess: next,
    });
  } catch (error) {
    console.error("Error in validators.validateUpdateWorkflowStatus - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
};

module.exports = validateUpdateWorkflowStatus;
