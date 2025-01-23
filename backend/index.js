const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const cors = require("cors");

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const prisma = new PrismaClient();

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Kapook The Project',
    version: '1.0.0',
    description: 'API Kakๆ',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Use swagger-ui-express for your app documentation endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(cors());
app.use(bodyParser.json());

const businessHourRoutes = require('./routes/businessHourRoute'); // Adjust the path as necessary
app.use('/api', businessHourRoutes);

const getUserRoutes = require('./routes/getUserRoute'); // Adjust the path as necessary
app.use('/api', getUserRoutes);

const exampleRoutes = require('./routes/example');
app.use('/api', exampleRoutes);

const registerUserRoutes = require('./routes/authRoute'); // Adjust the path as necessary
app.use('/api', registerUserRoutes);

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));