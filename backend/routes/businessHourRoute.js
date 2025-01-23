const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/business_hour:
 *   get:
 *     summary: Retrieve a list of business hours
 *     responses:
 *       200:
 *         description: A list of business hours
 */

router.get("/business_hour", async (req, res) => {
    const business_hour = await prisma.business_hour.findMany();
    res.json(business_hour);
});

module.exports = router;