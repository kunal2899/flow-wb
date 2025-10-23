const Joi = require("joi");
const validateEntity = require("@utils/validateEntity");

const jobPayloadSchema = Joi.object().keys({
  workflowExecutionId: Joi.number().required(),
  userWorkflowId: Joi.number().required(),
  startNodeId: Joi.number().allow(null),
  globalContext: Joi.object({
    nodes: Joi.object(),
    workflow: Joi.object(),
  }).when('startNodeId', {
    is: Joi.exist().not(null),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const validateJobPayload = payload => {
  try {
    const isValid = validateEntity({
      schema: jobPayloadSchema,
      entity: payload,
    });
    return isValid;
  } catch (error) {
    console.error("Error in validators.validateJobPayload - ", error);
    throw error;
  }
}

module.exports = validateJobPayload;