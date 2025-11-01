const express = require('express');
require('module-alias/register');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./configs/swagger');
const { connectToServices } = require('./services/coreServices/dbConnectionService');
const routes = require('./routes');
const app = express();
const rateLimit = require('express-rate-limit');
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

// Create rate limiter middleware
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
});

// Routes
app.use(API_VERSION_PREFIX, rateLimiter, routes);

app.listen(PORT, (error) => {
  if (error) {
    console.error('Something went wrong while starting the server!', error);
    return;
  }
  console.log(`Server is listening on ${PORT}!`)
});