const { MAIN_QUEUE_NAME } = require("../../constants/common");
const BaseQueue = require("../../entities/baseQueue");

class WorkflowQueue {
  constructor() {
    this.workflowQueue = new BaseQueue(MAIN_QUEUE_NAME);
    this.workflowQueue.queueName = MAIN_QUEUE_NAME;
  }

  enqueueWorkflowJob = (payload, options = {}) =>
    this.workflowQueue.addJob(
      'workflow',
      payload,
      options
    );

  getWorkflowJob = (jobId) => this.workflowQueue.getJob(jobId);

  getWorkflowJobs = () => this.workflowQueue.getJobs();

  getDelayedJobs = async () => this.workflowQueue.getDelayedJobs();

  removeWorkflowJob = (jobId) => this.workflowQueue.removeJob(jobId);

  _getQueueInstance = () => this.workflowQueue._getQueueInstance();
}

const workflowQueue = new WorkflowQueue();

module.exports = workflowQueue;
