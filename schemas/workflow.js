const Joi = require('joi');
const { VISIBILITY_OPTION } = require('@constants/common');
const { WORKFLOW_STATUS } = require('@constants/workflow');
const { pickFields } = require('@utils/joiUtils');
const { USER_WORKFLOW_ROLE } = require('@constants/userWorkflow');

const validationRules = {
  name: Joi.string(),
  description: Joi.string(),
  visibility: Joi.string().valid(...Object.values(VISIBILITY_OPTION)),
  status: Joi.string().valid(...Object.values(WORKFLOW_STATUS)),
  role: Joi.string().valid(...Object.values(USER_WORKFLOW_ROLE)),
}

const createWorkflowSchema = Joi.object().keys({
  ...pickFields(validationRules, ['name', 'description', 'visibility'], ['name']),
});

const updateWorkflowSchema = Joi.object().keys({
  ...pickFields(validationRules),
});

const updateWorkflowStatusSchema = Joi.object().keys({
  status: validationRules.status.required(),
});

const updateWorkflowVisibilitySchema = Joi.object().keys({
  visibility: validationRules.visibility.required(),
});

module.exports = {
  createWorkflowSchema,
  updateWorkflowSchema,
  updateWorkflowStatusSchema,
  updateWorkflowVisibilitySchema,
};