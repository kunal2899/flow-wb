const { MAIN_QUEUE_NAME } = require("@constants/common");
const BaseQueue = require("@entities/baseQueue");

class WorkflowQueue {
  constructor() {
    this.workflowQueue = new BaseQueue(MAIN_QUEUE_NAME);
    this.workflowQueue.queueName = MAIN_QUEUE_NAME;
  }

  enqueueWorkflowJob = ({ jobName = "workflow", payload, options = {} }) =>
    this.workflowQueue.addJob(jobName, payload, options);

  scheduleWorkflowJob = ({ jobName = "workflow-cron", jobId, payload, options = {} }) => 
    this.workflowQueue.addJobScheduler(jobId, { name: jobName, data: payload }, options);

  removeScheduledJob = (jobId) =>
    this.workflowQueue.removeJobScheduler(jobId);

  getWorkflowJob = (jobId) => this.workflowQueue.getJob(jobId);

  getWorkflowJobs = () => this.workflowQueue.getJobs();

  getDelayedJobs = async () => this.workflowQueue.getDelayedJobs();

  removeWorkflowJob = (jobId) => this.workflowQueue.removeJob(jobId);

  _getQueueInstance = () => this.workflowQueue._getQueueInstance();
}

const workflowQueue = new WorkflowQueue();

module.exports = workflowQueue;
