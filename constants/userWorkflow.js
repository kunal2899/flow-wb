const USER_WORKFLOW_ROLE = {
  OWNER: "owner",
  VIEWER: "viewer",
  EDITOR: "editor",
};

const USER_WORKFLOW_TRIGGER_TYPE = {
  CRON: "cron",
  WEBHOOK: "webhook",
  HTTP: "http",
};

module.exports = { USER_WORKFLOW_ROLE, USER_WORKFLOW_TRIGGER_TYPE };
