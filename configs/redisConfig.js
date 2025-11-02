const IORedis = require("ioredis");

const environment = process.env.NODE_ENV || "local";
const config = require("./config.json");
const redisConfig = config[environment]?.redis;

// Create a single IORedis connection configuration
const createRedisConnection = () => {
  const connectionOptions = {
    host: process.env[redisConfig?.host] || "localhost",
    port: parseInt(process.env[redisConfig?.port]) || 6379,
    connectTimeout: 10000,
    commandTimeout: 15000,
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    family: 4,
    keepAlive: true,
    enableOfflineQueue: true,
    reconnectOnError: (err) => {
      const targetError = "READONLY";
      return err.message.includes(targetError);
    },
  };
  // Add password if configured
  if (redisConfig?.password && process.env[redisConfig.password]) {
    connectionOptions.password = process.env[redisConfig.password];
  }
  return new IORedis(connectionOptions);
};

let sharedConnection = null;

const getRedisConnection = () => {
  if (!sharedConnection) {
    sharedConnection = createRedisConnection();
    sharedConnection.on("connect", () => {
      console.log("Redis connected successfully!");
    });
    sharedConnection.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
    sharedConnection.on("close", () => {
      console.log("Redis connection closed.");
    });
  }
  return sharedConnection;
};

const closeRedisConnection = async () => {
  if (sharedConnection) {
    await sharedConnection.quit();
    sharedConnection = null;
    console.log("Redis connection closed successfully!");
  }
};

module.exports = {
  getRedisConnection,
  closeRedisConnection,
  createRedisConnection,
};
