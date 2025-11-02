const Joi = require("joi");
const { pickFields } = require("@utils/joiUtils");

const validationRules = {
  sourceNodeId: Joi.number(),
  destinationNodeId: Joi.number(),
  ruleId: Joi.number(),
  isActive: Joi.boolean(),
};

const connectionSchema = Joi.object().keys({
  ...pickFields(validationRules, [], ["sourceNodeId", "destinationNodeId"]),
});

const updateConnectionStatusSchema = Joi.object().keys({
  isActive: validationRules.isActive.required(),
});

module.exports = {
  connectionSchema,
  updateConnectionStatusSchema,
};
