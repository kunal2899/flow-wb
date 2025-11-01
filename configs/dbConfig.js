const { Sequelize } = require('sequelize');
const dotenv = require("dotenv");
const envConfigs = require("./config.json");
const initModelDefaultConfig = require('../services/coreServices/initModelDefaultConfig');

dotenv.config({ path: ".env", quiet: true});
const currEnvironment = process.env.NODE_ENV || "development";

if (currEnvironment === "test") {
  dotenv.config({ path: ".env.test", quiet: true });
}

let { [currEnvironment]: config } = envConfigs;

config = Object.entries(config).reduce((configValues, [key, envKey]) => {
  if (envKey in process.env) {
    configValues[key] = process.env[envKey];
  }
  return configValues;
}, {});

const { dbUrl, host, database, port, user, password } = config;

// Provide default values if environment variables are missing
const dbHost = host || 'localhost';
const dbUser = user || 'postgres';
const dbPassword = password || '';
const dbName = database || 'flow_wb';
const dbPort = port || '5432';

let connectionString =
  dbUrl || `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

// Validate the connection string
if (!dbUrl && (!dbUser || !dbHost || !dbName)) {
  throw new Error('Database configuration is incomplete. Please check your environment variables.');
}

const sequelizeConfig = {
  dialect: 'postgres'
};

if (currEnvironment !== "production") {
  sequelizeConfig.ssl = false;
  sequelizeConfig.logging = false;
} else {
  sequelizeConfig.ssl = true;
  sequelizeConfig.logging = false;
}

const sequelize = new Sequelize(connectionString, sequelizeConfig);

initModelDefaultConfig();

module.exports = sequelize;
