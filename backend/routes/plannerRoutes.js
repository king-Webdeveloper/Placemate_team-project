const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/planner/user/{userId}:
 *   get:
 *     summary: ดึงแผนการเดินทางของผู้ใช้
 *     tags: [Planner]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: user_id ของผู้ใช้
 *     responses:
 *       200:
 *         description: รายการแผนการเดินทาง
 *       404:
 *         description: ไม่พบแผนการเดินทาง
 *       500:
 *         description: Server error
 */
router.get("/planner/user/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const plans = await prisma.plan.findMany({
            where: { user_id: parseInt(userId) }, 
            select: {
                plan_id: true,
                title: true,
                start_time: true,
                end_time: true,
                created_at: true,
                updated_at: true,
            },
        });

        if (!plans || plans.length === 0) {
            return res.status(404).json({ error: "No plans found for this user" });
        }

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
 *               end_time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: เพิ่มแผนสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       500:
 *         description: Server error
 */
router.post("/planner/add", async (req, res) => {
    const { user_id, title, start_time, end_time } = req.body;

    if (!user_id || !title || !start_time || !end_time) {
        return res.status(400).json({ error: "user_id, title, start_time, and end_time are required" });
    }

    try {
        const newPlan = await prisma.plan.create({
            data: {
                user_id: parseInt(user_id),
                title: title,
                start_time: new Date(start_time),
                end_time: new Date(end_time),
                created_at: new Date(),
                updated_at: new Date(),
            }
        });

        res.status(201).json(newPlan);
    } catch (error) {
        console.error("Error creating plan:", error);
        res.status(500).json({ error: "Failed to create plan" });
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
 *         description: ลบสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบแผนการเดินทาง
 *       500:
 *         description: Server error
 */
router.delete("/planner/remove", async (req, res) => {
    const { plan_id } = req.body;

    if (!plan_id) {
        return res.status(400).json({ error: "plan_id is required" });
    }

    try {
        const existingPlan = await prisma.plan.findUnique({
            where: { plan_id: parseInt(plan_id) }
        });

        if (!existingPlan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        await prisma.plan.delete({
            where: { plan_id: parseInt(plan_id) }
        });

        res.json({ message: "Plan removed successfully" });
    } catch (error) {
        console.error("Error removing plan:", error);
        res.status(500).json({ error: "Failed to remove plan" });
    }
});

module.exports = router;
