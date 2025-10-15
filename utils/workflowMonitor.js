const runtimeStateManager = require('../workers/mainWorker/states/runtimeStateManager');

class WorkflowMonitor {
  // Get comprehensive workflow progress
  static async getWorkflowProgress(workflowExecutionId) {
    return await runtimeStateManager.getWorkflowProgress(workflowExecutionId);
  }

  // Check if workflow is stuck
  static async isWorkflowStuck(workflowExecutionId, stuckThresholdMs = 5 * 60 * 1000) {
    return await runtimeStateManager.isProcessStuck(workflowExecutionId, stuckThresholdMs);
  }

  // Get all running workflows from database
  static async getRunningWorkflows() {
    const { WORKFLOW_EXECUTION_STATUS } = require('../constants/workflowExecution');
    
    return await WorkflowExecution.findAll({
      where: {
        status: [
          WORKFLOW_EXECUTION_STATUS.RUNNING,
          WORKFLOW_EXECUTION_STATUS.PENDING
        ]
      },
      attributes: ['id', 'status', 'startedAt', 'currentNodeId', 'userWorkflowId'],
      include: [
        {
          model: UserWorkflow,
          as: 'userWorkflow',
          attributes: ['workflowId'],
          include: [
            {
              model: Workflow,
              as: 'workflow',
              attributes: ['name', 'identifier']
            }
          ]
        }
      ]
    });
  }

  // Get detailed status for multiple workflows
  static async getMultipleWorkflowStatus(workflowExecutionIds) {
    const results = await Promise.all(
      workflowExecutionIds.map(async (id) => {
        try {
          const progress = await this.getWorkflowProgress(id);
          return { workflowExecutionId: id, ...progress };
        } catch (error) {
          return { 
            workflowExecutionId: id, 
            error: error.message,
            status: 'ERROR' 
          };
        }
      })
    );
    
    return results;
  }

  // Clean up stuck workflows (admin utility)
  static async cleanupStuckWorkflows(stuckThresholdMs = 10 * 60 * 1000) {
    const runningWorkflows = await this.getRunningWorkflows();
    const stuckWorkflows = [];
    
    for (const workflow of runningWorkflows) {
      const isStuck = await this.isWorkflowStuck(workflow.id, stuckThresholdMs);
      if (isStuck) {
        stuckWorkflows.push(workflow);
        
        // Mark as failed in database
        await runtimeStateManager.updateWorkflowStatus(
          workflow.id,
          'failed',
          `Marked as failed due to being stuck for more than ${stuckThresholdMs}ms`
        );
        
        // Clean up Redis state
        await runtimeStateManager.cleanupRuntimeState(workflow.id);
      }
    }
    
    return {
      totalRunning: runningWorkflows.length,
      stuckCount: stuckWorkflows.length,
      stuckWorkflows: stuckWorkflows.map(w => ({
        id: w.id,
        workflowName: w.userWorkflow?.workflow?.name,
        startedAt: w.startedAt,
        currentNodeId: w.currentNodeId
      }))
    };
  }

  // Get workflow statistics
  static async getWorkflowStats(workflowExecutionId) {
    const [dbData, redisStats, heartbeat, visitedNodes] = await Promise.all([
      runtimeStateManager.getWorkflowExecution(workflowExecutionId),
      runtimeStateManager.getStats(workflowExecutionId),
      runtimeStateManager.getHeartbeat(workflowExecutionId),
      runtimeStateManager.getVisitedNodes(workflowExecutionId)
    ]);

    if (!dbData) {
      throw new Error('Workflow execution not found');
    }

    const processingTime = dbData.endedAt 
      ? new Date(dbData.endedAt) - new Date(dbData.startedAt)
      : Date.now() - new Date(dbData.startedAt);

    return {
      // Database data
      status: dbData.status,
      startedAt: dbData.startedAt,
      endedAt: dbData.endedAt,
      currentNodeId: dbData.currentNodeId,
      reason: dbData.reason,
      
      // Redis runtime data
      stats: redisStats,
      heartbeat,
      visitedNodesCount: visitedNodes.length,
      
      // Calculated
      processingTimeMs: processingTime,
      isActive: ['running', 'pending'].includes(dbData.status),
      isStuck: await runtimeStateManager.isProcessStuck(workflowExecutionId)
    };
  }
}

module.exports = WorkflowMonitor;

