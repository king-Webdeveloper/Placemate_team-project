// placereviewRoutes.js [backend]
const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/reviews/add-comment:
 *   post:
 *     summary: เพิ่มรีวิว, คะแนน และคอมเมนต์ของผู้ใช้สำหรับสถานที่
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID ของผู้ใช้งาน
 *               place_id:
 *                 type: character varying(255)
 *                 description: ID ของสถานที่
 *               rating:
 *                 type: integer
 *                 description: คะแนนที่ให้ (1-5)
 *               comment:
 *                 type: character varying(1000)
 *                 description: คอมเมนต์ของผู้ใช้
 *     responses:
 *       201:
 *         description: รีวิวถูกเพิ่มสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งไม่ถูกต้อง
 *       500:
 *         description: เกิดข้อผิดพลาดในการเพิ่มรีวิว
 */
// แก้ไขเส้นทางของการเพิ่มรีวิว
router.post("/reviews/add-comment", async (req, res) => {
    try {
        const { user_id, place_id, rating, comment } = req.body; // รับข้อมูลจาก body

        // ตรวจสอบว่า user_id และ place_id มีอยู่ในฐานข้อมูลหรือไม่
        const userExists = await prisma.user.findUnique({
            where: { user_id: user_id },
        });

        const placeExists = await prisma.place.findUnique({
            where: { place_id: place_id },
        });

        // หากไม่พบข้อมูลของ user หรือ place ให้ส่งข้อความผิดพลาด
        if (!userExists || !placeExists) {
            return res.status(400).json({ error: "Invalid user_id or place_id" });
        }

        // เพิ่มรีวิวลงในฐานข้อมูล
        const newReview = await prisma.review.create({
            data: {
                user_id,
                place_id,
                rating,
                comment,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });

        res.status(201).json(newReview); // ส่งข้อมูลรีวิวใหม่ที่เพิ่ม
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ error: "Failed to add review" });
    }
});


/**
 * @swagger
 * /api/reviews/place_id:
 *   get:
 *     summary: ดึงข้อมูลรีวิวทั้งหมดของสถานที่
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: place_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของสถานที่ที่ต้องการดึงรีวิว
 *     responses:
 *       200:
 *         description: รายการรีวิวของสถานที่
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 place_id:
 *                   type: character varying(255)
 *                   description: ID ของสถานที่
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                         description: ID ของผู้ใช้งาน
 *                       rating:
 *                         type: integer
 *                         description: คะแนนที่ให้
 *                       comment:
 *                         type: character varying(1000)
 *                         description: คอมเมนต์ของผู้ใช้
 *                       created_at:
 *                         type: timestamp without time zone
 *                         description: เวลาในการสร้างรีวิว
 */
router.get("/reviews/:place_id", async (req, res) => {
    try {
        const { place_id } = req.params; // รับค่า place_id จาก URL parameters
        // console.log("place_id is", place_id);

        // ตรวจสอบว่า place_id มีค่าไหม
        if (!place_id) {
            return res.status(400).json({ error: "place_id is required" });
        }

        // ดึงข้อมูลสถานที่ (ชื่อและที่อยู่) จากตาราง place
        const place = await prisma.place.findUnique({
            where: { place_id: place_id }, // ใช้ place_id ในการค้นหาสถานที่
            select: {
                place_id: true,
                name: true,
                address: true,
            },
        });

        // ถ้าไม่พบสถานที่ให้ส่งสถานะ 404
        if (!place) {
            return res.status(404).json({ error: "Place not found" });
        }

        // ดึงรีวิวทั้งหมดจากฐานข้อมูลโดยใช้ place_id
        const reviews = await prisma.review.findMany({
            where: { place_id: place_id }, // ค้นหาตาม place_id
            select: {
                rating: true,
                comment: true,
                created_at: true,
            },
        });

        // ถ้าไม่พบรีวิวให้ส่งข้อมูลสถานที่พร้อมค่า average_rating เป็น 0
        const averageRating = reviews.length
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        // ส่งข้อมูลสถานที่, รีวิว, และคะแนนเฉลี่ยกลับไป
        res.json({
            place_id,
            place_name: place.name,
            address: place.address,
            average_rating: averageRating,
            reviews: reviews.length > 0 ? reviews : [], // ถ้าไม่มีรีวิว ก็ส่งเป็น array ว่าง
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

module.exports = router;

