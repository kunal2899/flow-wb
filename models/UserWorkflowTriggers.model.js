const { DataTypes } = require("sequelize");
const sequelize = require("@configs/dbConfig");
const {
  USER_WORKFLOW_TRIGGER_TYPE,
  CRON_TRIGGER_FREQUENCY_TYPE,
} = require("@constants/userWorkflow");
const { pick, get } = require("lodash");
const workflowQueue = require("@services/queueServices/workflowQueue.service");
const { parseExpression } = require("@utils/cronUtils");

const UserWorkflowTrigger = sequelize.define(
  "userWorkflowTrigger",
  {
    userWorkflowId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.ENUM,
      values: Object.values(USER_WORKFLOW_TRIGGER_TYPE),
      allowNull: false,
    },
    config: {
      type: DataTypes.JSON,
    },
    configHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastRunAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "user_workflow_triggers",
    indexes: [
      {
        name: "unique_type_config_per_trigger",
        unique: true,
        fields: ["type", "configHash"],
      },
    ],
  }
);

UserWorkflowTrigger.associate = function (models) {
  UserWorkflowTrigger.belongsTo(models.userWorkflow, {
    foreignKey: "userWorkflowId",
  });
};

const crypto = require("crypto");
const { canonicalize } = require("json-canonicalize");
UserWorkflowTrigger.beforeCreate((instance) => {
  if (instance.config) {
    const configText = canonicalize(instance.config);
    instance.configHash = crypto
      .createHash("md5")
      .update(configText)
      .digest("hex");
  }
});

Object.assign(UserWorkflowTrigger, {
  generateCronExpression: (config) => {
    let cronExpression = "";
    const { frequency, timeOfDay = "00:00", ...rest } = config;
    const [hour, minute] = timeOfDay.split(":").map(Number);
    switch (frequency) {
      case CRON_TRIGGER_FREQUENCY_TYPE.DAILY:
        cronExpression = `${minute} ${hour} * * *`;
        break;
      case CRON_TRIGGER_FREQUENCY_TYPE.WEEKLY:
        const { daysOfWeek } = rest;
        const daysOfWeekExpression = Array.isArray(daysOfWeek)
          ? daysOfWeek.join(",")
          : daysOfWeek;
        cronExpression = `${minute} ${hour} * * ${daysOfWeekExpression}`;
        break;
      case CRON_TRIGGER_FREQUENCY_TYPE.MONTHLY:
        const { daysOfMonth } = rest;
        const daysOfMonthExpression = Array.isArray(daysOfMonth)
          ? daysOfMonth.join(",")
          : daysOfMonth;
        cronExpression = `${minute} ${hour} ${daysOfMonthExpression} * *`;
        break;
      case CRON_TRIGGER_FREQUENCY_TYPE.CUSTOM:
        const { expression } = rest;
        const parsedExpression = parseExpression(expression);
        if (!parsedExpression) throw new Error("Invalid CRON expression");
        cronExpression = parsedExpression;
        break;
      default:
        throw new Error("Unsupported CRON frequency type");
    }
    return cronExpression;
  },
  scheduleCronJob: async ({
    userWorkflowTriggerId,
    userWorkflowId,
    options,
  }) => {
    await workflowQueue.scheduleWorkflowJob({
      jobId: `wf-trig-cron-${userWorkflowTriggerId}`,
      jobName: "workflow-cron",
      payload: { triggerId: userWorkflowTriggerId, userWorkflowId },
      options,
    });
  },
  scheduleJob: async ({
    userWorkflowTriggerId,
    userWorkflowId,
    scheduleAt,
  }) => {
    if (!scheduleAt)
      throw new Error("Missing schedule config key - scheduleAt");
    const delayInMs = new Date(scheduleAt).getTime() - Date.now();
    if (delayInMs >= 0) {
      await workflowQueue.enqueueWorkflowJob({
        jobName: "workflow-schedule",
        payload: { triggerId: userWorkflowTriggerId, userWorkflowId },
        options: {
          jobId: `wf-trig-schedule-${userWorkflowTriggerId}`,
          delay: delayInMs,
        },
      });
    } else {
      const error = new Error(
        `Can't enable trigger as scheduled time has been already passed`
      );
      error.type = "FOR_USER";
      throw error;
    }
  },
  addCronTrigger: async (userWorkflowId, data) => {
    const cronExpression = UserWorkflowTrigger.generateCronExpression(
      data.config
    );
    await sequelize.transaction(async (transaction) => {
      const userWorkflowTrigger = await UserWorkflowTrigger.create(
        {
          userWorkflowId,
          isActive: true,
          ...pick(data, ["name", "description", "type", "config"]),
        },
        { transaction }
      );
      await UserWorkflowTrigger.scheduleCronJob({
        userWorkflowTriggerId: userWorkflowTrigger.id,
        userWorkflowId,
        options: { pattern: cronExpression },
      });
    });
  },
  toggleCronTrigger: async (userWorkflowTrigger, updatedActiveStatus) => {
    const userWorkflowTriggerId = userWorkflowTrigger.id;
    await sequelize.transaction(async (transaction) => {
      await UserWorkflowTrigger.update(
        { isActive: updatedActiveStatus },
        { where: { id: userWorkflowTriggerId }, transaction }
      );
      if (updatedActiveStatus) {
        const { config, userWorkflowId } = userWorkflowTrigger;
        const cronExpression =
          UserWorkflowTrigger.generateCronExpression(config);
        await UserWorkflowTrigger.scheduleCronJob({
          userWorkflowTriggerId,
          userWorkflowId,
          options: { pattern: cronExpression },
        });
      } else {
        await workflowQueue.removeScheduledJob(
          `wf-trig-cron-${userWorkflowTriggerId}`
        );
      }
    });
  },
  toggleScheduleTrigger: async (userWorkflowTrigger, updatedActiveStatus) => {
    const userWorkflowTriggerId = userWorkflowTrigger.id;
    await sequelize.transaction(async (transaction) => {
      await UserWorkflowTrigger.update(
        { isActive: updatedActiveStatus },
        { where: { id: userWorkflowTriggerId }, transaction }
      );
      if (updatedActiveStatus) {
        const { config, userWorkflowId } = userWorkflowTrigger;
        const scheduleAt = config.scheduleAt;
        await UserWorkflowTrigger.scheduleJob({
          userWorkflowId,
          userWorkflowTriggerId,
          scheduleAt,
        });
      } else {
        await workflowQueue.removeWorkflowJob(
          `wf-trig-schedule-${userWorkflowTriggerId}`
        );
      }
    });
  },
  toggleTriggerByType: async (userWorkflowTrigger, updatedActiveStatus) => {
    switch (userWorkflowTrigger.type) {
      case USER_WORKFLOW_TRIGGER_TYPE.CRON:
        await UserWorkflowTrigger.toggleCronTrigger(
          userWorkflowTrigger,
          updatedActiveStatus
        );
        break;
      case USER_WORKFLOW_TRIGGER_TYPE.SCHEDULE:
        await UserWorkflowTrigger.toggleScheduleTrigger(
          userWorkflowTrigger,
          updatedActiveStatus
        );
        break;
      case USER_WORKFLOW_TRIGGER_TYPE.WEBHOOK:
        break;
      default:
        throw new Error("Unsupported trigger type");
    }
  },
  deleteCronTrigger: async (userWorkflowTrigger) => {
    const { id: userWorkflowTriggerId, isActive } = userWorkflowTrigger;
    await sequelize.transaction(async (transaction) => {
      if (isActive) {
        await workflowQueue.removeScheduledJob(
          `wf-trig-cron-${userWorkflowTriggerId}`
        );
      }
      await userWorkflowTrigger.update({ isActive: false });
      await UserWorkflowTrigger.destroy({
        where: { id: userWorkflowTriggerId },
        transaction,
      });
    });
  },
  addScheduleTrigger: async (userWorkflowId, data) => {
    await sequelize.transaction(async (transaction) => {
      const userWorkflowTrigger = await UserWorkflowTrigger.create(
        {
          userWorkflowId,
          isActive: true,
          ...pick(data, ["name", "description", "type", "config"]),
        },
        { transaction }
      );
      const scheduleAt = get(data, "config.scheduleAt", null);
      await UserWorkflowTrigger.scheduleJob({
        userWorkflowId,
        userWorkflowTriggerId: userWorkflowTrigger.id,
        scheduleAt,
      });
    });
  },
});

module.exports = UserWorkflowTrigger;
