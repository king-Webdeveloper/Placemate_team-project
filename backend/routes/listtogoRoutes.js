const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/list-to-go/places:
 *   get:
 *     summary: ดึงข้อมูลสถานที่ทั้งหมดจากตาราง place
 *     tags: [ListToGo]
 *     responses:
 *       200:
 *         description: รายการสถานที่ทั้งหมด
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
        const places = await prisma.place.findMany({
            select: {
                id: true,
                place_id: true,
                name: true,
            }
        });
        res.json(places);
    } catch (error) {
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
router.post("/list-to-go/add", async (req, res) => {
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
 *               user_id:
 *                 type: integer
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบข้อมูลใน list_to_go
 */

router.delete("/list-to-go/remove", async (req, res) => {
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

        // ตรวจสอบว่ามีรายการนี้อยู่ใน list_to_go หรือไม่
        const listEntry = await prisma.list_to_go.findFirst({
            where: { user_id, place_id: place.place_id }
        });

        if (!listEntry) {
            return res.status(404).json({ error: "This place is not in the list" });
        }

        // ลบรายการออกจาก list_to_go
        await prisma.list_to_go.delete({
            where: { list_to_go_id: listEntry.list_to_go_id }
        });

        res.json({ message: "Place removed from list" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to remove place from list" });
    }
});

module.exports = router;
