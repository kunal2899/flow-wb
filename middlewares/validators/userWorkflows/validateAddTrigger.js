const { addUserWorkflowTriggerSchema } = require("@schemas/userWorkflows");
const validateEntity = require("@utils/validateEntity");

const validateAddTrigger = (req, res, next) => {
  try {
    const triggerConfig = req.body;
    validateEntity({
      schema: addUserWorkflowTriggerSchema,
      entity: triggerConfig,
      onSuccess: next,
    });
  } catch (error) {
    console.error("Error in validators.validateAddTrigger - ", error);
    return res.status(400).send({ message: "Something went wrong!" });
  }
}

module.exports = validateAddTrigger;