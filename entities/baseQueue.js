const { Queue } = require("bullmq");
const { getRedisConnection } = require("@configs/redisConfig");

class BaseQueue {
  constructor(queueName) {
    const connection = getRedisConnection();
    this.queue = new Queue(queueName, { connection });
  }

  addJob(jobName, jobData, options = {}) {
    const defaultOptions = {
      removeOnComplete: true,
      removeOnFail: false,
      // attempts: 3,
      // backoff: {
      //   type: "exponential",
      //   delay: 2000,
      //   jitter: 0.1,
      // },
    };
    return this.queue.add(jobName, jobData, {
      ...defaultOptions,
      ...options,
    });
  }

  getJob(jobId) {
    return this.queue.getJob(jobId);
  }

  getJobs() {
    return this.queue.getJobs();
  }

  getDelayedJobs() {
    return this.queue.getDelayed();
  }

  removeJob(jobId) {
    return this.queue.remove(jobId);
  }

  addJobScheduler(jobSchedulerId, jobData, options = {}) {
    return this.queue.upsertJobScheduler(
      jobSchedulerId,
      { tz: "Asia/Kolkata", ...options },
      jobData,
    );
  }

  removeJobScheduler(jobSchedulerId) {
    return this.queue.removeJobScheduler(jobSchedulerId);
  }

  _getQueueInstance() {
    return this.queue;
  }
};

module.exports = BaseQueue;