const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/planner:
 *   get:
 *     summary: ดึงข้อมูลแผนการเดินทางทั้งหมด
 *     tags: [Planner]
 *     responses:
 *       200:
 *         description: รายการแผนการเดินทางทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   plan_id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 */
router.get("/planner", async (req, res) => {
    try {
        const plans = await prisma.plan.findMany({
            select: {
                plan_id: true,
                user_id: true,
                title: true,
                created_at: true,
            },
        });
        res.json(plans);
    } catch (error) {
        console.error("Error fetching plans:", error);
        res.status(500).json({ error: "Failed to fetch plans" });
    }
});

/**
 * @swagger
 * /api/planner/add:
 *   post:
 *     summary: เพิ่มแผนการเดินทางใหม่
 *     tags: [Planner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: เพิ่มแผนการเดินทางสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */
router.post("/planner/add", async (req, res) => {
    const { user_id, title, start_time } = req.body;

    if (!user_id || !title || !start_time) {
        return res.status(400).json({ error: "user_id, title, and start_time are required" });
    }

    try {
        // ตรวจสอบว่า user_id มีอยู่ในตาราง user หรือไม่
        const userExists = await prisma.user.findUnique({
            where: { user_id: user_id }
        });

        if (!userExists) {
            return res.status(404).json({ error: "User not found" });
        }

        // เพิ่มแผนการเดินทางใหม่
        const newPlan = await prisma.plan.create({
            data: {
                user_id: user_id,
                title: title,
                created_at: new Date(),
                updated_at: new Date(),
            }
        });

        res.status(201).json(newPlan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add new plan" });
    }
});

/**
 * @swagger
 * /api/planner/remove:
 *   delete:
 *     summary: ลบแผนการเดินทาง
 *     tags: [Planner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: ลบแผนการเดินทางสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบแผนการเดินทาง
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */
router.delete("/planner/remove", async (req, res) => {
    const { plan_id } = req.body;

    if (!plan_id) {
        return res.status(400).json({ error: "plan_id is required" });
    }

    try {
        // ค้นหาแผนการเดินทางในฐานข้อมูล
        const plan = await prisma.plan.findUnique({
            where: { plan_id: plan_id },
        });

        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        // ลบแผนการเดินทาง
        await prisma.plan.delete({
            where: { plan_id: plan_id },
        });

        res.json({ message: "Plan removed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to remove plan" });
    }
});

module.exports = router;
