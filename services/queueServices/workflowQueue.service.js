const { MAIN_QUEUE_NAME } = require("../../constants/common");
const BaseQueue = require("../../entities/baseQueue");

class WorkflowQueue {
  constructor() {
    this.workflowQueue = new BaseQueue(MAIN_QUEUE_NAME);
    this.workflowQueue.queueName = MAIN_QUEUE_NAME;
  }

  enqueueWorkflowJob = (payload, options = {}) =>
    this.workflowQueue.addJob(
      `wf-${payload.workflowExecutionId}`,
      payload,
      options
    );

  getWorkflowJob = (jobId) => this.workflowQueue.getJob(jobId);

  getWorkflowJobs = () => this.workflowQueue.getJobs();

  getDelayedJobs = async () => this.workflowQueue.getDelayedJobs();

  _getQueueInstance = () => this.workflowQueue._getQueueInstance();
}

const workflowQueue = new WorkflowQueue();

module.exports = workflowQueue;
