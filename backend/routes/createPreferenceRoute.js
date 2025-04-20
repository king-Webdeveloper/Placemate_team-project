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

        // ตรวจสอบว่ามี preference นี้อยู่แล้วไหม (ป้องกันการซ้ำ)
        const existing = await prisma.preference.findFirst({
            where: {
                user_id: userId,
                preference: preference,
            },
        });

        if (existing) {
            return res.status(409).json({ error: "Preference already exists" });
        }

        // ดึง preference ทั้งหมดของ user คนนี้
        const userPreferences = await prisma.preference.findMany({
            where: { user_id: userId },
            orderBy: { created_at: "asc" }, // ต้องใช้ field นี้ใน model
        });

        // ถ้ามีครบ 3 แล้ว ให้ลบตัวเก่าสุดออกก่อน
        if (userPreferences.length >= 3) {
            await prisma.preference.delete({
                where: { id: userPreferences[0].id },
            });
        }

        // เพิ่ม preference ใหม่
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


