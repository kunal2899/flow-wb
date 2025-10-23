const COMMON_EXECUTION_STATUS = {
  QUEUED: "queued",
  RUNNING: "running",
  PENDING: "pending",
  COMPLETED: "completed",
  PAUSED: "paused",
  FAILED: "failed",
};

const WORKFLOW_EXECUTION_STATUS = {
  ...COMMON_EXECUTION_STATUS,
  STOPPED: "stopped",
};

const WORKFLOW_NODE_EXECUTION_STATUS = {
  ...COMMON_EXECUTION_STATUS,
  CANCELLED: "cancelled",
};

module.exports = {
  WORKFLOW_EXECUTION_STATUS,
  WORKFLOW_NODE_EXECUTION_STATUS,
}