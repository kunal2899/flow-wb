const redisCacheService = require('../../../services/coreServices/redisCache.service');
const { WORKFLOW_EXECUTION_STATUS } = require('../../../constants/workflowExecution');
const { WORKFLOW_EXECUTION_KEY_PREFIX, PENDING_EXECUTIONS_KEY, RUNTIME_STATE_TTL } = require('../constants');
const workflowQueue = require('../../../services/queueServices/workflowQueue.service');
const { Promise } = require('bluebird');
const { map } = require('lodash');

class RuntimeStateManager {
  constructor() {}

  // Redis keys
  getVisitedNodesKey = (workflowExecutionId) =>
    `${WORKFLOW_EXECUTION_KEY_PREFIX}:${workflowExecutionId}:visited`;

  getHeartbeatKey = (workflowExecutionId) =>
    `${WORKFLOW_EXECUTION_KEY_PREFIX}:${workflowExecutionId}:heartbeat`;

  getStatsKey = (workflowExecutionId) =>
    `${WORKFLOW_EXECUTION_KEY_PREFIX}:${workflowExecutionId}:stats`;

  getQueuedNodesKey = (workflowExecutionId) =>
    `${WORKFLOW_EXECUTION_KEY_PREFIX}:${workflowExecutionId}:queued`;

  getWaitingNodesKey = (workflowExecutionId) =>
    `${WORKFLOW_EXECUTION_KEY_PREFIX}:${workflowExecutionId}:waiting`;

  getContextKey = (workflowExecutionId) =>
    `${WORKFLOW_EXECUTION_KEY_PREFIX}:${workflowExecutionId}:context`;

  async deleteExecutionRelatedKeys(workflowExecutionId) {
    await redisCacheService.deleteKeysByPrefix(`wf:exec:${workflowExecutionId}:`);
  }

  async flushQueuedNodes(workflowExecutionId) {
    await redisCacheService.delete(this.getQueuedNodesKey(workflowExecutionId));
  }

  async getQueuedNodeIds(workflowExecutionId) {
    return (
      (await redisCacheService.getListItems(
        this.getQueuedNodesKey(workflowExecutionId)
      )) || []
    );
  }

  async addNodeToQueue(workflowExecutionId, nodeId) {
    await redisCacheService.pushToList(
      this.getQueuedNodesKey(workflowExecutionId),
      nodeId
    );
  }

  async removeNodeFromQueue(workflowExecutionId, nodeId) {
    await redisCacheService.removeListItem(
      this.getQueuedNodesKey(workflowExecutionId),
      nodeId
    );
  }

  async getExecutionContext(workflowExecutionId) {
    const context = await redisCacheService.get(
      this.getContextKey(workflowExecutionId)
    );
    return context;
  }

  async setExecutionContext(workflowExecutionId, context) {
    await redisCacheService.set(
      this.getContextKey(workflowExecutionId),
      context,
      RUNTIME_STATE_TTL
    );
  }

  async getPendingExecutions() {
    const pendingExecutions = await redisCacheService.getListItems(
      PENDING_EXECUTIONS_KEY
    );
    return map(pendingExecutions, String) || [];
  }

  async addToPendingExecutions(workflowExecutionId) {
    const pendingExecutions = await this.getPendingExecutions();
    if (!pendingExecutions.includes(workflowExecutionId)) {
      await redisCacheService.pushToList(
        PENDING_EXECUTIONS_KEY,
        workflowExecutionId
      );
    }
  }

  async removeFromPendingExecutions(workflowExecutionId) {
    await redisCacheService.removeListItem(
      PENDING_EXECUTIONS_KEY,
      workflowExecutionId
    );
  }

  async resumePendingExecutions() {
    const pendingExecutions = await this.getPendingExecutions();
    if (pendingExecutions < 1) return;
    console.info(
      `Found ${pendingExecutions.length} pending executions to resume: ${pendingExecutions}`
    );
    await Promise.map(pendingExecutions, async (pendingExecutionId) => {
      const [workflowExecutionId, startNodeId] = String(pendingExecutionId).split('::');
      await workflowQueue.enqueueWorkflowJob({
        payload: {
          workflowExecutionId: Number(workflowExecutionId),
          startNodeId: Number(startNodeId),
          isResume: true,
        },
        options: {
          jobId: `wf-${pendingExecutionId}-resume-${Date.now()}`,
          removeOnFail: true,
        },
      });
    });
  }

  async getVisitedNodes(workflowExecutionId) {
    return (
      (await redisCacheService.getSetMembers(
        this.getVisitedNodesKey(workflowExecutionId)
      )) || []
    );
  }

  async markNodeAsVisited(workflowExecutionId, nodeId) {
    const isNodeVisited = await this.isNodeVisited(workflowExecutionId, nodeId);
    if (!isNodeVisited) {
      await redisCacheService.addToSet(
        this.getVisitedNodesKey(workflowExecutionId),
        nodeId
      );
    }
  }

  async isNodeVisited(workflowExecutionId, nodeId) {
    return await redisCacheService.isMemberOfSet(
      this.getVisitedNodesKey(workflowExecutionId),
      nodeId
    );
  }

  /** These below helpers are intended to set and maintain safeguard
   *  limits but are currently not being used in this version **/
  async updateHeartbeat(workflowExecutionId, additionalData = {}) {
    const heartbeatData = {
      timestamp: Date.now(),
      pid: process.pid,
      ...additionalData,
    };

    await redisCacheService.set(
      this.getHeartbeatKey(workflowExecutionId),
      heartbeatData,
      this.HEARTBEAT_TTL
    );

    return heartbeatData;
  }

  async getHeartbeat(workflowExecutionId) {
    return await redisCacheService.get(
      this.getHeartbeatKey(workflowExecutionId)
    );
  }

  async isProcessStuck(workflowExecutionId, stuckThresholdMs = 5 * 60 * 1000) {
    const heartbeat = await this.getHeartbeat(workflowExecutionId);
    if (!heartbeat) return false;

    const timeSinceHeartbeat = Date.now() - heartbeat.timestamp;
    return timeSinceHeartbeat > stuckThresholdMs;
  }

  async updateStats(workflowExecutionId, stats) {
    const currentStats =
      (await redisCacheService.get(this.getStatsKey(workflowExecutionId))) ||
      {};
    const newStats = { ...currentStats, ...stats, lastUpdated: Date.now() };

    await redisCacheService.set(
      this.getStatsKey(workflowExecutionId),
      newStats,
      this.RUNTIME_TTL
    );
    return newStats;
  }

  async getStats(workflowExecutionId) {
    return (
      (await redisCacheService.get(this.getStatsKey(workflowExecutionId))) || {}
    );
  }

  async incrementStat(workflowExecutionId, statName, increment = 1) {
    const stats = await this.getStats(workflowExecutionId);
    stats[statName] = (stats[statName] || 0) + increment;
    return await this.updateStats(workflowExecutionId, stats);
  }

  async checkSafeguardLimits(workflowExecutionId, limits = {}) {
    const {
      MAX_ITERATIONS = 1000,
      MAX_PROCESSING_TIME = 5 * 60 * 1000,
      MAX_NODES_PROCESSED = 500,
      MAX_EMPTY_ITERATIONS = 10,
    } = limits;

    const stats = await this.getStats(workflowExecutionId);

    const workflowExecution = await WorkflowExecution.findByPk(
      workflowExecutionId
    );
    if (!workflowExecution) {
      throw new Error("Workflow execution not found");
    }

    const processingTime =
      Date.now() - new Date(workflowExecution.startedAt).getTime();

    const violations = [];

    if ((stats.iterationCount || 0) > MAX_ITERATIONS) {
      violations.push(
        `Maximum iterations exceeded: ${stats.iterationCount}/${MAX_ITERATIONS}`
      );
    }

    if (processingTime > MAX_PROCESSING_TIME) {
      violations.push(
        `Maximum processing time exceeded: ${processingTime}ms/${MAX_PROCESSING_TIME}ms`
      );
    }

    if ((stats.totalNodesProcessed || 0) > MAX_NODES_PROCESSED) {
      violations.push(
        `Maximum nodes processed exceeded: ${stats.totalNodesProcessed}/${MAX_NODES_PROCESSED}`
      );
    }

    if ((stats.consecutiveEmptyIterations || 0) > MAX_EMPTY_ITERATIONS) {
      violations.push(
        `Too many empty iterations: ${stats.consecutiveEmptyIterations}/${MAX_EMPTY_ITERATIONS}`
      );
    }

    return {
      isValid: violations.length === 0,
      violations,
      stats: {
        iterationCount: stats.iterationCount || 0,
        processingTime,
        totalNodesProcessed: stats.totalNodesProcessed || 0,
        consecutiveEmptyIterations: stats.consecutiveEmptyIterations || 0,
      },
    };
  }

  async shouldResumeWorkflow(workflowExecutionId) {
    const workflowExecution = await this.getWorkflowExecution(
      workflowExecutionId
    );

    if (!workflowExecution) {
      return { shouldResume: false, reason: "Workflow execution not found" };
    }

    const { status } = workflowExecution;

    // Only resume if status is RUNNING or PENDING
    if (
      ![
        WORKFLOW_EXECUTION_STATUS.RUNNING,
        WORKFLOW_EXECUTION_STATUS.PENDING,
      ].includes(status)
    ) {
      return { shouldResume: false, reason: `Status is ${status}` };
    }

    // Check if process might be stuck using Redis heartbeat
    const isStuck = await this.isProcessStuck(workflowExecutionId);

    return {
      shouldResume: true,
      reason: isStuck ? "Resuming stuck workflow" : "Normal resume",
      workflowExecution,
      isStuckResume: isStuck,
    };
  }

  async cleanupRuntimeState(workflowExecutionId) {
    const keys = [
      this.getVisitedNodesKey(workflowExecutionId),
      this.getHeartbeatKey(workflowExecutionId),
      this.getStatsKey(workflowExecutionId),
    ];

    await Promise.all(keys.map((key) => redisCacheService.delete(key)));
    console.log(`Cleaned up runtime state for workflow ${workflowExecutionId}`);
  }

  async getWorkflowProgress(workflowExecutionId) {
    const [workflowExecution, stats, heartbeat, visitedNodes] =
      await Promise.all([
        WorkflowExecution.scope("plain").findByPk(workflowExecutionId),
        this.getStats(workflowExecutionId),
        this.getHeartbeat(workflowExecutionId),
        this.getVisitedNodes(workflowExecutionId),
      ]);

    return {
      status: workflowExecution?.status,
      startedAt: workflowExecution?.startedAt,
      currentNodeId: workflowExecution?.currentNodeId,
      stats,
      heartbeat,
      visitedNodesCount: visitedNodes.length,
      isStuck: await this.isProcessStuck(workflowExecutionId),
    };
  }
}

module.exports = new RuntimeStateManager();
