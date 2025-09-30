const { sequelize } = require('../../models'); // This will load all models and associations

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
    console.log('All models and associations loaded successfully!');
  } catch (error) {
    console.error('Error connecting to the database - ', error);
    process.exit(1);
  }
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

module.exports = {connectToDatabase, closeDatabaseConnection };