const Joi = require("joi");
const { NODE_TYPE } = require("@constants/node");
const { BACKOFF_STRATEGY, TIME_UNIT } = require("@constants/common");
const { pickFields } = require("@utils/joiUtils");
const { endpointSchema } = require("./endpoint");

const retryConfigSchema = Joi.object().keys({
  maxAttempts: Joi.number(),
  backoffStrategy: Joi.string().valid(...Object.values(BACKOFF_STRATEGY)),
  baseDelayMs: Joi.number(),
  maxDelayMs: Joi.number(),
  jitter: Joi.boolean(),
});

const actionNodeConfigSchema = Joi.object()
  .keys({
    endpointId: Joi.number(),
    endpoint: endpointSchema,
    overrides: Joi.object(),
  })
  .or("endpointId", "endpoint");

const conditionNodeConfigSchema = Joi.object().keys({
  expression: Joi.object().required(),
  label: Joi.string(),
});

const delayNodeConfigSchema = Joi.object().keys({
  duration: Joi.number().required(),
  unit: Joi.string().valid(...Object.values(TIME_UNIT)),
});

const validationRules = {
  name: Joi.string(),
  description: Joi.string(),
  type: Joi.string().valid(...Object.values(NODE_TYPE)),
  overrideConfig: Joi.object().keys({
    retry: retryConfigSchema,
  }),
};

const createWorkflowNodeSchema = Joi.object().keys({
  ...pickFields(validationRules, [], ["name", "type"]),
  data: Joi.alternatives().conditional("type", [
    {
      is: NODE_TYPE.ACTION,
      then: actionNodeConfigSchema.required(),
    },
    {
      is: NODE_TYPE.CONDITION,
      then: conditionNodeConfigSchema.required(),
    },
    {
      is: NODE_TYPE.DELAY,
      then: delayNodeConfigSchema.required(),
      otherwise: {},
    },
  ]),
});

const updateWorkflowNodeSchema = Joi.object().keys({
  overrideConfig: validationRules.overrideConfig.required(),
});

module.exports = {
  createWorkflowNodeSchema,
  updateWorkflowNodeSchema,
};
