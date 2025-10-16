const { Worker } = require("bullmq");
const { MAIN_QUEUE_NAME } = require("../../constants/common");
const { has } = require("lodash");
const processWorkflow = require("./processors/processWorkflow");
const { getRedisConnection } = require("../../configs/redisConfig");

const connection = getRedisConnection();

const worker = new Worker(
  MAIN_QUEUE_NAME,
  async (job) => {
    const timeLabel = `job-${job.id}`;
    console.time(timeLabel);
    console.timeLog(timeLabel, "Processing workflow: ", job.name);
    await processWorkflow(job);
    console.timeEnd(timeLabel);
  },
  {
    autorun: false,
    name: "main-worker",
    removeOnFail: {
      age: 1000 * 60 * 60 * 24,
      count: 1000,
    },
    concurrency: 5,
    connection,
    settings: {
      stalledInterval: 30 * 1000, 
      maxStalledCount: 1,
    },
    lockDuration: 60 * 1000,
    lockRenewTime: 15 * 1000,  
  }
);

worker.on("paused", () => console.log("Main worker paused!"));
worker.on("resumed", () => console.log("Main worker resumed!"));

worker.on("completed", (job, result) => {
  if (has(result, "message")) {
    const logger = result.type === "warning" ? console.warn : console.log;
    logger(result.message);
  }
  console.log(`Job [id: ${job.name}] completed`);
});
worker.on("failed", async (job, error) => {
  console.log(`Job [id: ${job.name}] failed - ${error}`);
});

worker.on("error", (error) => {
  console.error("Error in workers.main - ", error);
});

const init = async () => {
  try {
    const checkRunStatus = setInterval(() => {
      if (worker.isRunning()) {
        clearInterval(checkRunStatus);
        console.log("Main Worker initialised, listening for jobs");
      }
    }, 100);
    await worker.run();
  } catch (error) {
    console.error("Error in initializing main worker - ", error);
  }
};

worker.init = init;

module.exports = mainWorker = worker;
