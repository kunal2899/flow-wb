const USER_WORKFLOW_ROLE = {
  OWNER: "owner",
  VIEWER: "viewer",
  EDITOR: "editor",
};

const USER_WORKFLOW_TRIGGER_TYPE = {
  CRON: "cron",
  WEBHOOK: "webhook",
  SCHEDULE: "schedule",
};

const CRON_TRIGGER_FREQUENCY_TYPE = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  CUSTOM: "custom",
};

module.exports = {
  USER_WORKFLOW_ROLE,
  USER_WORKFLOW_TRIGGER_TYPE,
  CRON_TRIGGER_FREQUENCY_TYPE,
};
