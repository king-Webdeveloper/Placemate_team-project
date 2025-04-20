const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require('cookie-parser');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const prisma = new PrismaClient();
// const cookieParser = require('cookie-parser');

app.use(cookieParser());  // ใช้ middleware นี้ก่อนที่จะมีการจัดการ route อื่นๆ

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000']; // ใส่ URL ของ frontend ที่อนุญาต

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // อนุญาตให้ส่งคุกกี้ข้ามโดเมน
  optionsSuccessStatus: 200
}));

// // ✅ Middleware Order
// app.use(cookieParser()); // ต้องมาก่อน request อื่นๆ
// app.use(express.json()); // รองรับ JSON Body
// app.use(bodyParser.json());

// // ✅ Debugging Middleware
// app.use((req, res, next) => {
//   console.log("🌍 Incoming Request:", req.method, req.url);
//   console.log("🍪 Cookies Received:", req.cookies);
//   next();
// });



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
      url: 'http://localhost:5000',
      // url: process.env.REACT_APP_API_URL || 5000,
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

const getplacereviewRoutes = require('./routes/placereviewRoutes'); // Adjust the path as necessary
app.use('/api', getplacereviewRoutes);

const getplannerRoutes = require('./routes/plannerRoutes.js'); // Adjust the path as necessary
app.use('/api', getplannerRoutes);

const createPreferenceRoutes = require('./routes/createPreferenceRoute');
app.use('/api', createPreferenceRoutes);

const getsettingRoutes = require('./routes/settingRoutes'); // Adjust the path as necessary
app.use('/api', getsettingRoutes);


// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// app.listen(PORT, () => console.log(`Server running on ${process.env.REACT_APP_API_URL}:${PORT}`));