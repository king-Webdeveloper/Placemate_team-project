//listtogoRoute.js [backend]
const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/list-to-go/places:
 *   get:
 *     summary: ดึงข้อมูลสถานที่ทั้งหมดหรือค้นหาสถานที่จากตาราง place
 *     tags: [ListToGo]
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
router.get("/list-to-go/places", async (req, res) => {
    try {
        const { query } = req.query; // รับค่าค้นหาจาก query parameter

        const places = await prisma.place.findMany({
            where: query
                ? { name: { contains: query, mode: "insensitive" } } // ค้นหาชื่อที่มีคำที่ต้องการ (ไม่สนตัวพิมพ์เล็ก-ใหญ่)
                : {},
            select: {
                id: true,
                place_id: true,
                name: true,
            },
        });

        res.json(places);
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
 *                 type: string
 *     responses:
 *       201:
 *         description: เพิ่มสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบสถานที่
 *       409:
 *         description: สถานที่นี้ถูกเพิ่มแล้ว
 *       500:
 *         description: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
 */
router.post("/list-to-go/add", async (req, res) => {
  const { user_id, name } = req.body;

  if (!user_id || !name) {
    return res.status(400).json({ error: "user_id and name are required" });
  }

  try {
    // ค้นหาสถานที่จากชื่อ
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

    // ✅ ตรวจสอบว่ามีอยู่ใน list_to_go แล้วหรือยัง
    const existing = await prisma.list_to_go.findFirst({
      where: {
        user_id: user_id,
        place_id: place.place_id
      }
    });

    if (existing) {
      return res.status(409).json({ error: "Place already in list" }); // ⛔ 409 Conflict
    }

    // ✅ เพิ่มสถานที่ลงใน list_to_go
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

  
/**
 * @swagger
 * /api/list-to-go/remove:
 *   delete:
 *     summary: ลบสถานที่ออกจาก list_to_go
 *     tags: [ListToGo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               list_to_go_id: 
 *                type: integer
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบข้อมูลใน list_to_go
 */

//listtogoRoute.js [backend]
router.delete("/list-to-go/remove", async (req, res) => {
  const { user_id, list_to_go_id } = req.body;

  if (!user_id || !list_to_go_id) {
    return res.status(400).json({ error: "user_id and list_to_go_id are required" });
  }

  try {
    // ค้นหา place_id จาก listToGo
    const listToGo = await prisma.list_to_go.findFirst({
      where: { list_to_go_id }
    });

    if (!listToGo) {
      console.log("Place not found with list_to_go_id:", list_to_go_id);
      return res.status(404).json({ error: "Place not found" });
    }

    // ตรวจสอบว่ามีรายการนี้อยู่ใน list_to_go หรือไม่
    const listEntry = await prisma.list_to_go.findFirst({
      where: { user_id, list_to_go_id }
    });

    if (!listEntry) {
      console.log("This place is not in the user's list:", user_id, list_to_go_id);
      return res.status(404).json({ error: "This place is not in the list" });
    }

    // ลบรายการออกจาก list_to_go
    await prisma.list_to_go.delete({
      where: { list_to_go_id: listEntry.list_to_go_id }
    });

    return res.json({ message: "Place removed from list" });

  } catch (error) {
    console.error("Error processing the request:", error);
    return res.status(500).json({ error: "Failed to remove place from list" });
  }
});
  
/**
 * @swagger
 * /api/list-to-go/user/{userId}:
 *   get:
 *     summary: ดึงข้อมูลรายการสถานที่ใน list_to_go ของผู้ใช้ตาม user_id
 *     tags: [ListToGo]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: user_id ของผู้ใช้
 *     responses:
 *       200:
 *         description: รายการสถานที่ใน List to Go ของผู้ใช้
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   place_id:
 *                     type: integer
 *                   place_name:
 *                     type: string
 *                   list_to_go_id:
 *                     type: integer
 */
router.get("/list-to-go/user/:userId", async (req, res) => {
    const { userId } = req.params; // รับ user_id จาก path parameters

    try {
        // ค้นหาสถานที่ใน list_to_go โดยใช้ user_id
        const list = await prisma.list_to_go.findMany({
            where: { user_id: parseInt(userId) }, // ใช้ user_id ที่รับมาจาก URL
            select: {
                place: { select: { place_id: true, name: true } }, // ดึงข้อมูลจากตาราง place
                list_to_go_id: true,
            },
        });

        if (!list || list.length === 0) {
            return res.status(404).json({ error: "No places found for this user" });
        }

        // ส่งข้อมูลรายการสถานที่ใน list_to_go ของผู้ใช้
        res.json(list.map(entry => ({
            list_to_go_id: entry.list_to_go_id,
            place_id: entry.place.place_id,
            place_name: entry.place.name
        })));
    } catch (error) {
        console.error("Error fetching user's list to go:", error);
        res.status(500).json({ error: "Failed to fetch user's list to go" });
    }
});

module.exports = router;
