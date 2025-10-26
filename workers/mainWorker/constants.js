// Redis related constants
// Static keys
const WORKFLOW_EXECUTION_KEY_PREFIX = "wf:exec";
const PENDING_EXECUTIONS_KEY = "wf:exec:pending";
// TTLs in seconds
const RUNTIME_STATE_TTL = 2 * 60 * 60; // 2 hours
const HEARTBEAT_STATE_TTL = 10 * 60; // 10 minutes

module.exports = {
  WORKFLOW_EXECUTION_KEY_PREFIX,
  PENDING_EXECUTIONS_KEY,
  RUNTIME_STATE_TTL,
  HEARTBEAT_STATE_TTL,
};
