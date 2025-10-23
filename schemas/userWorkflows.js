const Joi = require("joi");
const {
  USER_WORKFLOW_TRIGGER_TYPE,
  CRON_TRIGGER_FREQUENCY_TYPE,
} = require("@constants/userWorkflow");
const { pickFields } = require("@utils/joiUtils");

const timeOfDayValidator = Joi.string().pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
const cronExpressionValidator = Joi.string().pattern(
  /^(@(yearly|monthly|weekly|daily|minutely|secondly|weekdays|weekends))|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5})$/
);
const dayOfWeekValidator = Joi.number().min(1).max(7);
const dayOfMonthValidator = Joi.number().min(1).max(31);

const cronTriggerConfig = Joi.object().keys({
  frequency: Joi.string()
    .valid(...Object.values(CRON_TRIGGER_FREQUENCY_TYPE))
    .required(),
  // Daily
  timeOfDay: Joi.when('frequency', {
    is: CRON_TRIGGER_FREQUENCY_TYPE.DAILY,
    then: timeOfDayValidator.required(),
    otherwise: timeOfDayValidator.optional().default('00:00'),
  }),
  // Weekly
  daysOfWeek: Joi.when('frequency', {
    is: CRON_TRIGGER_FREQUENCY_TYPE.WEEKLY,
    then: Joi.alternatives()
      .try(
        dayOfWeekValidator,
        Joi.array().items(dayOfWeekValidator).unique()
      )
      .required(),
    otherwise: Joi.forbidden(),
  }),
  // Monthly
  daysOfMonth: Joi.when('frequency', {
    is: CRON_TRIGGER_FREQUENCY_TYPE.MONTHLY,
    then: Joi.alternatives()
      .try(
        dayOfMonthValidator,
        Joi.array().items(dayOfMonthValidator).unique(),
        Joi.string().valid('L') // last day of month
      )
      .required(),
    otherwise: Joi.forbidden(),
  }),
  // Custom
  expression: Joi.when('frequency', {
    is: CRON_TRIGGER_FREQUENCY_TYPE.CUSTOM,
    then: cronExpressionValidator.required(),
    otherwise: Joi.forbidden(),
  }),
});

const validationRules = {
  name: Joi.string(),
  description: Joi.string(),
  type: Joi.string().valid(...Object.values(USER_WORKFLOW_TRIGGER_TYPE)),
  isActive: Joi.boolean(),
};

const addUserWorkflowTriggerSchema = Joi.object().keys({
  ...pickFields(validationRules, [], ["name", "type"]),
  config: Joi.alternatives().conditional("type", [
    {
      is: USER_WORKFLOW_TRIGGER_TYPE.CRON,
      then: cronTriggerConfig.required(),
    },
    {
      is: USER_WORKFLOW_TRIGGER_TYPE.SCHEDULE,
      then: Joi.object().keys({
        scheduleAt: Joi.date().greater('now').required(),
      }),
    },
  ]),
});

module.exports = {
  addUserWorkflowTriggerSchema,
};
