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
        const { place_id } = req.params;

        if (!place_id) {
            return res.status(400).json({ error: "place_id is required" });
        }

        const place = await prisma.place.findUnique({
            where: { place_id: place_id },
            select: {
                place_id: true,
                name: true,
                address: true,
            },
        });

        if (!place) {
            return res.status(404).json({ error: "Place not found" });
        }

        const reviews = await prisma.review.findMany({
            where: { place_id: place_id },
            select: {
                review_id: true,
                user_id: true,
                rating: true,
                comment: true,
                created_at: true,
            },
        });

        // เพิ่มการดึงข้อมูล username ของผู้รีวิว
        const reviewsWithUsernames = await Promise.all(
            reviews.map(async (review) => {
                const user = await prisma.user.findUnique({
                    where: { user_id: review.user_id },
                    select: {
                        username: true,
                    },
                });
                return { ...review, username: user?.username }; // เพิ่ม username ลงในข้อมูลรีวิว
            })
        );

        const averageRating = reviews.length
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        res.json({
            place_id,
            place_name: place.name,
            address: place.address,
            average_rating: averageRating,
            reviews: reviewsWithUsernames, // ส่งรีวิวที่มี username
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

/**
 * @swagger
 * /api/reviews/{review_id}:
 *   delete:
 *     summary: ลบรีวิว
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: review_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ของรีวิวที่ต้องการลบ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID ของผู้ใช้งานที่ต้องการลบรีวิว
 *     responses:
 *       200:
 *         description: ลบรีวิวสำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งไม่ถูกต้อง
 *       403:
 *         description: ผู้ใช้ไม่มีสิทธิ์ในการลบรีวิว
 *       404:
 *         description: ไม่พบรีวิวที่ต้องการลบ
 *       500:
 *         description: เกิดข้อผิดพลาดในการลบรีวิว
 */
router.delete("/reviews/:review_id", async (req, res) => {
    try {
        const { review_id } = req.params; // รับ review_id จาก URL parameters
        const { user_id } = req.body; // รับ user_id จาก body ของคำขอ (ต้องแน่ใจว่าผู้ใช้ล็อกอินและส่ง user_id มา)

        // ตรวจสอบว่ารีวิวมีอยู่ในฐานข้อมูลหรือไม่
        const review = await prisma.review.findUnique({
            where: { review_id: parseInt(review_id) }, // ใช้ review_id ในการค้นหา
        });

        // ถ้าไม่พบรีวิวให้ส่งสถานะ 404
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        // ตรวจสอบว่าผู้ใช้ที่ส่งคำขอลบเป็นเจ้าของรีวิวนั้นหรือไม่
        if (review.user_id !== user_id) {
            return res.status(403).json({ error: "You do not have permission to delete this review" });
        }

        // ลบรีวิวจากฐานข้อมูล
        await prisma.review.delete({
            where: { review_id: parseInt(review_id) },
        });

        // ส่งสถานะว่ารีวิวถูกลบสำเร็จ
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ error: "Failed to delete review" });
    }
});


module.exports = router;

