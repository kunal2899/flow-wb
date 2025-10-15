const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./configs/swagger');
const { connectToServices } = require('./services/coreServices/dbConnectionService');
const routes = require('./routes');
const app = express();
require('dotenv').config({ quiet: true });

const { PORT=3000 } = process.env;
const API_VERSION_PREFIX = '/v1';

// Connect to DB and Redis services
connectToServices();

// Middlewares
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Flow WB API Docs'
}));

// Routes
app.use(API_VERSION_PREFIX, routes);

app.listen(PORT, (error) => {
  if (error) {
    console.error('Something went wrong while starting the server!', error);
    return;
  }
  console.log(`Server is listening on ${PORT}!`)
});