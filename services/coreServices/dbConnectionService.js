const sequelize = require('@configs/dbConfig');
const redisCacheService = require('./redisCache.service');
const { closeRedisConnection } = require('@configs/redisConfig');

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Error connecting to the database - ', error);
    process.exit(1);
  }
}

const connectToRedis = async () => {
  try {
    await redisCacheService.getClient();
  } catch (error) {
    console.error('Error connecting to Redis - ', error);
  }
}

const connectToServices = async () => {
  await connectToDatabase();
  await connectToRedis();
}

const closeDatabaseConnection = async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed successfully!');
  } catch (error) {
    console.error('Error closing database connection - ', error);
    process.exit(1);
  }
}

const closeAllConnections = async () => {
  try {
    await closeDatabaseConnection();
    await closeRedisConnection();
  } catch (error) {
    console.error('Error closing connections - ', error);
    process.exit(1);
  }
}

module.exports = {
  connectToServices,
  closeAllConnections
};