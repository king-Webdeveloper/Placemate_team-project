const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Example Routes
app.get("/business_hour", async (req, res) => {
  const business_hour = await prisma.business_hour.findMany();
  res.json(business_hour);
});

// app.post("/business_hour", async (req, res) => {
//   const { business_hour, day } = req.body;
//   const newUser = await prisma.user.create({
//     data: { business_hour, day },
//   });
//   res.json(newUser);
// });

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));