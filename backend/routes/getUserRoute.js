const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get a User by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User information
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.get("/user/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
        where: { user_id: parseInt(id) },
        });
        if (user) {
        res.json(user);
        } else {
        res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;