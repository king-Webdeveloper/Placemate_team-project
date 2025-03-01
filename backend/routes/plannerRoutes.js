const express = require("express");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/planner/user:
 *   get:
 *     summary: ดึงแผนการเดินทางของผู้ใช้จาก Cookie
 *     tags: [Planner]
 *     responses:
 *       200:
 *         description: รายการแผนการเดินทางของผู้ใช้
 *       401:
 *         description: Unauthorized - No valid authentication
 *       500:
 *         description: Server error
 */
router.get("/planner/user", async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No authentication token found" });
        }

        let user_id;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            user_id = decoded.user_id; 
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
        }

        const plans = await prisma.plan.findMany({
            where: { user_id: parseInt(user_id) },
            include: {
                user: {   
                    select: {
                        user_id: true,
                        username: true,
                        email: true
                    }
                }
            }
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
 *     summary: เพิ่มแผนการเดินทางใหม่ (ใช้ Cookie Authentication)
 *     tags: [Planner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *       401:
 *         description: Unauthorized - User not logged in
 *       500:
 *         description: Server error
 */
router.post("/planner/add", async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No authentication token found" });
        }

        let user_id;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            user_id = decoded.user_id;
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
        }

        const { title, start_time, end_time } = req.body;

        if (!title || !start_time || !end_time) {
            return res.status(400).json({ error: "title, start_time, and end_time are required" });
        }

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
 *       403:
 *         description: ไม่มีสิทธิ์ลบแผนนี้
 *       500:
 *         description: Server error
 */
router.delete("/planner/remove", async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No authentication token found" });
        }

        let user_id;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            user_id = decoded.user_id;
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
        }

        const { plan_id } = req.body;

        if (!plan_id) {
            return res.status(400).json({ error: "plan_id is required" });
        }

        const existingPlan = await prisma.plan.findUnique({
            where: { plan_id: parseInt(plan_id) }
        });

        if (!existingPlan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        if (existingPlan.user_id !== parseInt(user_id)) {
            return res.status(403).json({ error: "You do not have permission to delete this plan" });
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

/**
 * @swagger
 * /api/planner/{planId}/add-place:
 *   post:
 *     summary: เพิ่มสถานที่ในแผนการเดินทาง
 *     tags: [Planner]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               place_id:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: เพิ่มสถานที่สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบแผนการเดินทาง
 *       500:
 *         description: Server error
 */
router.post("/planner/:planId/add-place", async (req, res) => {
    const { planId } = req.params;
    const { place_id, start_time, end_time } = req.body;

    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No authentication token found" });
    }

    let user_id;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user_id = decoded.user_id;
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }

    const plan = await prisma.plan.findUnique({ where: { plan_id: parseInt(planId) } });

    if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
    }

    if (plan.user_id !== parseInt(user_id)) {
        return res.status(403).json({ error: "You do not have permission to add places to this plan" });
    }

    try {
        const newPlaceList = await prisma.place_list.create({
            data: {
                plan_id: parseInt(planId),
                place_id: place_id,
                start_time: new Date(start_time),
                end_time: new Date(end_time),
                created_at: new Date(),
                updated_at: new Date(),
            }
        });

        res.status(201).json(newPlaceList);
    } catch (error) {
        console.error("Error adding place:", error);
        res.status(500).json({ error: "Failed to add place" });
    }
});

module.exports = router;
