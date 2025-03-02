const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());

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
 *     summary: Login a user using cookies
 *     tags: [Authen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
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
 *         description: Successfully logged in
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

// authRoute.js [backend]
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
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

        const payload = {
            user_id: user.user_id,
            username: user.username,
            email: user.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // **ตั้งค่า Cookie**
        // secure: process.env.NODE_ENV === "production" //ใช้เมื่อจะ deploy เปลี่ยนการใช้ http -> https
        res.cookie("auth_token", token, {
            httpOnly: true,  // ป้องกันการเข้าถึงคุกกี้จาก JavaScript
            secure: false,  // ใช้ false ในการพัฒนา (ควรใช้ true ถ้าเป็น HTTPS)
            sameSite: 'Strict',  // หรือ 'Lax' ตามที่ต้องการ
            maxAge: 3600 * 1000  // อายุของคุกกี้ (1 ชั่วโมง)
        });
        // console.log('Token', token)
        res.json({ message: "Login successful", expiresIn: 3600 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// authRoute.js [backend]
/**
 * @swagger
 * /api/cookies-check:
 *   get:
 *     summary: Get user data from cookies
 *     tags: [Authen]
 *     responses:
 *       200:
 *         description: Return logged-in user info
 *       401:
 *         description: Unauthorized
 */

// authRoute.js [backend]
router.get("/cookies-check", (req, res) => {
    // ดึงค่า auth_token จากคุกกี้ที่ส่งมาจากฝั่ง frontend
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    try {
        // ตรวจสอบ token และดึงข้อมูลจาก payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // ส่งเฉพาะ user_id และ username ที่ได้จาก token
        res.json({
            user_id: decoded.user_id,
            username: decoded.username
        });
        
    } catch (error) {
        // กรณี token หมดอายุหรือไม่ถูกต้อง
        res.status(401).json({ error: "Invalid or expired token" });
    }
});


/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout user by clearing cookies
 *     tags: [Authen]
 *     responses:
 *       200:
 *         description: Successfully logged out
 */

// ✅ Route สำหรับ Logout ที่แก้ไขแล้ว
router.post("/logout", (req, res) => {
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: false, // ใช้ false ในการพัฒนา (ควรใช้ true ถ้าเป็น HTTPS)
        sameSite: "Strict"
    });
    res.status(200).json({ message: "Logged out successfully" });
});


module.exports = router;