const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               email:
 *                 type: string
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: The created user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The user ID
 *                 username:
 *                   type: string
 *                   description: The user's username
 *                 email:
 *                   type: string
 *                   description: The user's email
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // console.log(req.body);
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, Email, and password are required" });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashedPassword,
            },
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: The logged-in user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The user ID
 *                 username:
 *                   type: string
 *                   description: The user's username
 *                 email:
 *                   type: string
 *                   description: The user's email
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username) {
            return res.status(400).json({ error: "Username are required" });
        }

        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        const user = await prisma.user.findFirst({
            where: { username: username }
        });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isValid = bcrypt.compareSync(password, user.password);

        if (!isValid) {
            return res.status(400).json({ error: "Invalid password" });
        }

        payload = {
            user_id: user.user_id,
            username: user.username,
            email: user.email
        }

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ user: payload, jwt_token: token, expiresIn: 3600 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;