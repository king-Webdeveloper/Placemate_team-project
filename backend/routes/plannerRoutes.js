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
        console.log("✅ GET /planner/user ถูกเรียกใช้งาน");
        console.log("Cookies ที่ได้รับ:", req.cookies);

        const token = req.cookies.auth_token;
        if (!token) {
            console.warn("⚠ ไม่มี auth_token ใน Cookie");
            return res.status(401).json({ error: "Unauthorized: No authentication token found" });
        }

        let user_id;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            user_id = decoded.user_id; 
            console.log("✅ Token Decode สำเร็จ:", decoded);
        } catch (err) {
            console.error("❌ Token ไม่ถูกต้อง:", err);
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
            console.warn("⚠ ไม่พบแผนการเดินทางของผู้ใช้:", user_id);
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
        console.log("✅ POST /planner/add ถูกเรียกใช้งาน");
        console.log("Cookies ที่ได้รับ:", req.cookies);

        const token = req.cookies.auth_token;
        if (!token) {
            console.warn("⚠ ไม่มี auth_token ใน Cookie");
            return res.status(401).json({ error: "Unauthorized: No authentication token found" });
        }

        let user_id;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            user_id = decoded.user_id;
            console.log("✅ Token Decode สำเร็จ:", decoded);
        } catch (err) {
            console.error("❌ Token ไม่ถูกต้อง:", err);
            return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
        }

        const { title, start_time, end_time } = req.body;
        console.log("📌 ข้อมูลที่ได้รับจาก Frontend:", req.body);

        if (!title || !start_time || !end_time) {
            console.warn("⚠ ข้อมูลที่ส่งมาไม่ครบ");
            return res.status(400).json({ error: "title, start_time, and end_time are required" });
        }

        // ตรวจสอบว่า start_time และ end_time เป็นวันที่ถูกต้องหรือไม่
        if (isNaN(Date.parse(start_time)) || isNaN(Date.parse(end_time))) {
            console.warn("⚠ start_time หรือ end_time ไม่ใช่วันที่ที่ถูกต้อง");
            return res.status(400).json({ error: "Invalid date format" });
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


        console.log("✅ แผนการเดินทางถูกสร้างสำเร็จ:", newPlan);
        res.status(201).json(newPlan);
    } catch (error) {
        console.error("❌ Error creating plan:", error);
        res.status(500).json({ error: "Failed to create plan" });
    }
});

/**
 * @swagger
 * /api/planner/remove:
 *   delete:
 *     summary: ลบแผนการเดินทาง (พร้อมเก็บบันทึกแผนไว้ใน deleted_plan)
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
 *         description: ลบแผนและบันทึกลง deleted_plan สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       403:
 *         description: ไม่มีสิทธิ์ลบแผนนี้
 *       404:
 *         description: ไม่พบแผนการเดินทาง
 *       500:
 *         description: Server error
 */
router.delete("/planner/remove", async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No authentication token found" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.user_id;

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

        await prisma.deleted_plan.create({
            data: {
                plan_id: existingPlan.plan_id,
                user_id: existingPlan.user_id,
                title: existingPlan.title,
                start_time: existingPlan.start_time,
                end_time: existingPlan.end_time,
                deleted_at: new Date()
            }
        });

        await prisma.plan.delete({
            where: { plan_id: parseInt(plan_id) }
        });

        res.json({ message: "Plan removed and backed up successfully" });
    } catch (error) {
        console.error("❌ Error removing plan:", error);
        res.status(500).json({ error: "Failed to remove plan" });
    }
});

/**
 * @swagger
 * /api/planner/{planId}/add-place:
 *   post:
 *     summary: เพิ่มสถานที่หลายๆ จุดในแผนการเดินทาง
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
 *               places:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     place_id:
 *                       type: string
 *                     start_time:
 *                       type: string
 *                       format: date-time
 *                     end_time:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       201:
 *         description: เพิ่มสถานที่หลายๆ จุดสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: แผนการเดินทางไม่พบ
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */
router.post("/planner/:planId/add-place", async (req, res) => {
    const { planId } = req.params;
    const places = req.body.places;  // รับข้อมูลหลายๆ สถานที่ใน array
    console.log("📌 ข้อมูลสถานที่ที่ได้รับจาก Frontend:", req.body);

    if (!Array.isArray(places) || places.length === 0) {
        return res.status(400).json({ error: "Places must be an array and cannot be empty" });
    }

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

    // ตรวจสอบสถานที่ในแผนก่อนว่าอยู่แล้วหรือไม่ และเพิ่มสถานที่หลายๆ จุด
    try {
        const newPlaces = await prisma.place_list.createMany({
            data: places.map(place => ({
                plan_id: parseInt(planId),
                place_id: place.place_id,
                start_time: new Date(place.start_time),
                end_time: new Date(place.end_time),
                created_at: new Date(),
                updated_at: new Date(),
            })),
        });
        console.log("✅ เพิ่มสถานที่หลายๆ จุดสำเร็จ:", newPlaces);
        res.status(201).json(newPlaces);
    } catch (error) {
        console.error("Error adding places:", error);
        res.status(500).json({ error: "Failed to add places" });
    }
});


/**
 * @swagger
 * /api/planner/deleted:
 *   get:
 *     summary: ดึงรายการแผนการเดินทางที่ถูกลบล่าสุด (สูงสุด 10 รายการ)
 *     tags: [Planner]
 *     responses:
 *       200:
 *         description: รายการแผนการเดินทางที่ถูกลบสำเร็จ
 *       401:
 *         description: Unauthorized - No valid authentication
 *       500:
 *         description: Server error
 */
router.get("/planner/deleted", async (req, res) => {
    try {
        console.log("✅ เรียกใช้งาน GET /planner/deleted");
        console.log("🍪 Cookies ที่ได้รับ:", req.cookies);

        const token = req.cookies.auth_token;
        if (!token) {
            console.warn("⚠️ ไม่พบ auth_token ใน Cookie");
            return res.status(401).json({ error: "Unauthorized: No authentication token found" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("🔐 Token decode แล้ว:", decoded);
        } catch (err) {
            console.error("❌ Token ผิดพลาด:", err);
            return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
        }

        const user_id = decoded.user_id;

        console.log(`📌 ดึง deleted_plan ของ user_id: ${user_id}`);

        const deletedPlans = await prisma.deleted_plan.findMany({
            where: { user_id: parseInt(user_id) },
            orderBy: { deleted_at: "desc" },
            take: 10
        });

        console.log("✅ แผนการเดินทางที่ถูกลบที่เจอ:", deletedPlans.length);
        res.json(deletedPlans);
    } catch (error) {
        console.error("❌ Error fetching deleted plans:", error);
        res.status(500).json({ error: "Failed to fetch deleted plans" });
    }
});


/**
 * @swagger
 * /api/planner/{planId}:
 *   get:
 *     summary: ดึงข้อมูลแผนการเดินทางตาม planId
 *     tags: [Planner]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: รายละเอียดแผนการเดินทาง
 *       400:
 *         description: Invalid planId
 *       404:
 *         description: ไม่พบแผนการเดินทาง
 *       500:
 *         description: Server error
 */
router.get("/planner/:planId", async (req, res) => {
    const { planId } = req.params;

    // ตรวจสอบว่า planId เป็นตัวเลขที่ถูกต้องหรือไม่
    const parsedPlanId = parseInt(planId);
    if (isNaN(parsedPlanId)) {
        return res.status(400).json({ error: "Invalid planId" });
    }

    try {
        // ค้นหาแผนการเดินทางจากฐานข้อมูล
        const plan = await prisma.plan.findUnique({
            where: { plan_id: parseInt(planId) },
            include: {
              place_list: {
                include: {
                  place: {
                    include: {
                      tag: true, // ✅ ใช้ tag ไม่ใช่ place_tag
                      business_hour: true,
                    },
                  },
                },
              },
            },
          });
                

        // ถ้าไม่พบแผนการเดินทาง
        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        // ส่งข้อมูลแผนการเดินทางที่รวมข้อมูลสถานที่กลับไป
        res.json(plan);
    } catch (error) {
        console.error("Error fetching plan details:", error);
        res.status(500).json({ error: "Failed to fetch plan details" });
    }
});


// ลบสถานที่จากแผนการเดินทาง
/**
 * @swagger
 * /api/planner/{planId}/remove-place:
 *   delete:
 *     summary: ลบสถานที่ออกจากแผนการเดินทาง
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
 *     responses:
 *       200:
 *         description: ลบสถานที่ออกจากแผนสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบแผนการเดินทาง
 *       500:
 *         description: Server error
 */
router.delete("/planner/:planId/remove-place", async (req, res) => {
    const { planId } = req.params;
    const { place_id } = req.body;

    if (!place_id || isNaN(parseInt(planId))) {
        return res.status(400).json({ error: "Invalid planId or place_id" });
    }

    try {
        const plan = await prisma.plan.findUnique({
            where: { plan_id: parseInt(planId) },
        });

        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        // ลบสถานที่ทั้งหมดใน planId ที่มี place_id ตรงกัน
        const deleted = await prisma.place_list.deleteMany({
            where: {
                plan_id: parseInt(planId),
                place_id: place_id,
            },
        });

        res.status(200).json({ message: "Place removed successfully", deletedCount: deleted.count });
    } catch (error) {
        console.error("Error removing place from plan:", error);
        res.status(500).json({ error: "Failed to remove place" });
    }
});


/**
 * @swagger
 * /api/places/search:
 *   get:
 *     summary: ค้นหาสถานที่ตามชื่อ
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: รายการสถานที่ที่ค้นพบ
 *       400:
 *         description: ไม่มีพารามิเตอร์ query
 *       500:
 *         description: Server error
 */
router.get("/places/search", async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Missing query parameter" });
        }

        const places = await prisma.place.findMany({
            where: {
                name: {  // เปลี่ยนจาก place_name → name
                    contains: query,
                    mode: "insensitive",
                },
            },
            select: {
                place_id: true,
                name: true,  // เปลี่ยนจาก place_name → name
                category: true,
                rating: true,
                lat: true,
                lng: true,
                photo: true,  
            },
        });

        res.json(places);
    } catch (error) {
        console.error("Error searching places:", error);
        res.status(500).json({ error: "Failed to fetch search results" });
    }
});


module.exports = router;
