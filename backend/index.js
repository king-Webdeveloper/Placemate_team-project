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
    title: 'Placemate',
    version: '1.0.0',
    description: 'API',
  },
  servers: [
    {
      // url: 'http://localhost:5000',
      url: process.env.REACT_APP_API_URL || 5000,
      description: 'Development server',
    },
  ],
};

app.get("/business_hour", async (req, res) => {
  const business_hours = await prisma.business_hour.findMany();
  res.json(business_hours);
});

// app.get("/search_place", async (req, res) => {
//   const place = await prisma.place.findMany();
//   res.json(place);
// });

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

const getplaceinlisttogoRoutes = require('./routes/listtogoRoutes'); // Adjust the path as necessary
app.use('/api', getplaceinlisttogoRoutes);

const getseaechresultRoutes = require('./routes/searchresultRoutes'); // Adjust the path as necessary
app.use('/api', getseaechresultRoutes);

const getplannerRoutes = require('./routes/plannerRoutes.js'); // Adjust the path as necessary
app.use('/api', getplannerRoutes);

// Start Server
const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
app.listen(PORT, () => console.log(`Server running on ${process.env.REACT_APP_API_URL}:${PORT}`));