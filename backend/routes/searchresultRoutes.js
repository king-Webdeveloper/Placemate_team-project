const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/search/places:
 *   get:
 *     summary: ดึงข้อมูลสถานที่ทั้งหมดหรือค้นหาสถานที่จากตาราง place
 *     tags: [Searchresult]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: คำค้นหาสำหรับค้นหาสถานที่
 *     responses:
 *       200:
 *         description: รายการสถานที่ทั้งหมดหรือผลลัพธ์การค้นหา
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   place_id:
 *                     type: character varying(255)
 *                   name:
 *                     type: character varying(500)
 */
router.get("/search/places", async (req, res) => {
    try {
        const { query } = req.query; // รับค่าค้นหาจาก query parameter

        const places = await prisma.place.findMany({
            where: query
                ? { name: { contains: query, mode: "insensitive" } } // ค้นหาชื่อที่มีคำที่ต้องการ (ไม่สนตัวพิมพ์เล็ก-ใหญ่)
                : {},
            include: {
                tag: true, // Fetch tags related to each place
            },
        });

        // console.log(JSON.stringify(places, null, 2));

        res.json(places);
    } catch (error) {
        console.error("Error fetching places:", error);
        res.status(500).json({ error: "Failed to fetch places" });
    }
});

/**
 * @swagger
 * /api/getplaces:
 *   get:
 *     summary: ดึงข้อมูลสถานที่ทั้งหมดจากตาราง place (รองรับการแบ่งหน้า)
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: หมายเลขหน้าปัจจุบัน (เริ่มต้นที่ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: จำนวนสถานที่ต่อหน้า (ค่าเริ่มต้น 10)
 *     responses:
 *       200:
 *         description: รายการสถานที่ตามหน้าที่ร้องขอ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 places:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       place_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 */
router.get("/getplaces", async (req, res) => {
    try {
        let { page, limit } = req.query;

        // Convert query params to integers with defaults
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch total count of places
        const total = await prisma.place.count();

        // Fetch random places with associated tags using raw SQL
        const places = await prisma.$queryRaw`
            SELECT 
                p.*, 
                t.tag_name
            FROM 
                "place" p
            LEFT JOIN 
                "tag" t ON p.place_id = t.place_id
            ORDER BY 
                RANDOM() 
            LIMIT ${limit} OFFSET ${skip}
        `;

        // Group tags by place_id
        const placesWithTags = places.reduce((acc, place) => {
            const existingPlace = acc.find(p => p.place_id === place.place_id);
            if (existingPlace) {
                existingPlace.tags.push(place.tag_name);
            } else {
                acc.push({ 
                    ...place, 
                    tags: place.tag_name ? [place.tag_name] : [] 
                });
            }
            return acc;
        }, []);

        res.json({
            total,   // Total places count
            page,    // Current page
            limit,   // Limit per page
            places: placesWithTags,  // List of places with tags
        });
    } catch (error) {
        console.error("Error fetching places:", error);
        res.status(500).json({ error: "Failed to fetch places" });
    }
});



/**
 * @swagger
 * /api/list-to-go/add:
 *   post:
 *     summary: เพิ่มสถานที่ไปยัง list_to_go โดยใช้ name ของสถานที่และ user_id
 *     tags: [ListToGo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               name:
 *                 type: character varying(255)
 *     responses:
 *       201:
 *         description: เพิ่มสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบสถานที่
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */
router.post("/search/addtolisttogo", async (req, res) => {
    const { user_id, name } = req.body;

    if (!user_id || !name) {
        return res.status(400).json({ error: "user_id and name are required" });
    }

    try {
        // ค้นหา place_id จาก name
        const place = await prisma.place.findFirst({
            where: { name }
        });

        if (!place) {
            return res.status(404).json({ error: "Place not found" });
        }

        // ตรวจสอบว่า user_id มีอยู่ในตาราง user หรือไม่
        const userExists = await prisma.user.findUnique({
            where: { user_id: user_id }
        });

        if (!userExists) {
            return res.status(404).json({ error: "User not found" });
        }

        // เพิ่มข้อมูลลงตาราง list_to_go
        const addedPlace = await prisma.list_to_go.create({
            data: {
                user_id: user_id,
                place_id: place.place_id
            }
        });

        res.status(201).json(addedPlace);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add place to list" });
    }
});

module.exports = router;
