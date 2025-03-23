const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/createPreference:
 *   post:
 *     summary: สร้าง Preference ใหม่
 *     description: API สำหรับบันทึก Preferences ของผู้ใช้ลงในฐานข้อมูล
 *     tags:
 *       - Preferences
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - preference
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               preference:
 *                 type: string
 *                 example: "coffee"
 *     responses:
 *       201:
 *         description: Preference ถูกสร้างสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preference_id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 preference:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ข้อมูลไม่ครบถ้วน
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
router.post("/createPreference", async (req, res) => {
    try {
        const { userId, preference } = req.body;

        if (!userId || !preference) {
            return res.status(400).json({ error: "Missing userId or preference" });
        }

        const newPreference = await prisma.preference.create({
            data: {
                user_id: userId,
                preference: preference,
            },
        });

        res.status(201).json(newPreference);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
