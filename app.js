const express = require('express');
const { connectToDatabase } = require('./services/sequelize/dbConnectionService');
const usersRoutes = require('./routes/usersRoutes');
const app = express();
require('dotenv').config({ quiet: true });

const { PORT=3000 } = process.env;

// Database services
connectToDatabase();
// Middlewares
app.use(express.json());
// Routes
app.use('/v1/users', usersRoutes);

app.listen(PORT, (error) => {
  if (error) {
    console.error('Something went wrong while starting the server!', error);
    return;
  }
  console.log(`Server is listening on ${PORT}!`)
});