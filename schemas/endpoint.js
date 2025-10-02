const Joi = require("joi");
const { HTTP_METHOD, URL_PATTERN } = require("../constants/common");
const { pickFields } = require("../utils/joiUtils");

const validationRules = {
  name: Joi.string(),
  description: Joi.string(),
  url: Joi.string().pattern(URL_PATTERN),
  method: Joi.string().valid(...Object.values(HTTP_METHOD)),
  headers: Joi.object().keys({
    key: Joi.string(),
    value: Joi.string(),
  }),
  body: Joi.object().keys({
    key: Joi.string(),
    value: Joi.string(),
  }),
  authConfig: Joi.object().keys({
    key: Joi.string(),
    value: Joi.string(),
  }),
};

const endpointSchema = {
  ...pickFields(validationRules, [], ['name', 'url', 'method']),
};

module.exports = {
  endpointSchema,
}