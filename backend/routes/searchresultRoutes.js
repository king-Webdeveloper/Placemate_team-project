const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET ALL PLACE
/**
 * @swagger
 * /api/allplace:
 *   get:
 *     summary: ดึงข้อมูลสถานที่ทั้งหมดจากตาราง place
 *     tags: [Places]
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
 *                   business_hours:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         day:
 *                           type: string
 *                         business_hour:
 *                           type: string
 */
router.get("/allplace", async (req, res) => {
  try {
      const places = await prisma.place.findMany({
          include: {
              tag: true, // Fetch tags related to each place
              business_hour: true, // Fetch all business hours
          },
      });

      res.json(places);
  } catch (error) {
      console.error("Error fetching all places:", error);
      res.status(500).json({ error: "Failed to fetch all places" });
  }
});

// SEARCH BY TEXT
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
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *           enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday] # เพิ่มค่า enum สำหรับวัน
 *         description: วันที่ต้องการกรองข้อมูล (เช่น Monday)
 *     responses:
 *       200:
 *         description: รายการสถานที่ทั้งหมดหรือผลลัพธ์การค้นหาที่กรองตามวัน
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
 *                   business_hours:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         day:
 *                           type: string
 *                         business_hour:
 *                           type: string
 */
router.get("/search/places", async (req, res) => {
    try {
        const { query, dayName } = req.query; // รับค่าค้นหาจาก query parameter

        // สร้าง filter สำหรับ business_hour ถ้ามี day ที่ต้องการ
        const whereClause = {
            ...(query && { name: { contains: query, mode: "insensitive" } }), // กรองตาม query
            ...(dayName && { business_hour: { some: { day: dayName } } }), // กรอง places ที่มี business_hour ตรงกับ dayName
        };

        const places = await prisma.place.findMany({
            where: whereClause,
            include: {
                tag: true, // Fetch tags related to each place
                business_hour: {
                    where: { day: dayName }, // กรอง business_hour ตาม dayName ที่ต้องการ
                }, // Fetch only business hours matching the dayName
            },
        });

        res.json(places);
    } catch (error) {
        console.error("Error fetching places:", error);
        res.status(500).json({ error: "Failed to fetch places" });
    }
});

// GET POPULAR PLACE
router.get("/popular-places", async (req, res) => {
  try {
    // ดึง 10 preferences ที่มี frequency สูงสุด
    const topPreferences = await prisma.preference.groupBy({
      by: ["preference"],
      _count: {
        preference: true,
      },
      orderBy: {
        _count: {
          preference: "desc",
        },
      },
      take: 10, // ดึงแค่ 10 อันดับแรก
    });

    // console.log('Top Preferences:', topPreferences);  // ตรวจสอบผลลัพธ์จาก topPreferences

    if (topPreferences.length === 0) {
      return res.status(404).json({ error: "No preferences found" });
    }

    // ดึงเฉพาะ place_id จาก topPreferences
    const placeIds = topPreferences.map((p) => p.preference);
    // console.log('Place IDs:', placeIds);  // ตรวจสอบค่า placeIds

    if (placeIds.length === 0) {
      return res.status(404).json({ error: "No place IDs found" });
    }

    // ตรวจสอบว่า place_id มีอยู่ในตาราง place หรือไม่ และเรียงลำดับตาม frequency ของ preference
    const places = await prisma.place.findMany({
      where: {
        place_id: { in: placeIds },
      },
      include: {
        tag: true,
        business_hour: true,
      },
    });

    // console.log('Places:', places);  // ตรวจสอบผลลัพธ์จาก query ที่ดึงข้อมูลจาก place

    if (places.length === 0) {
      return res.status(404).json({ error: "No places found for the given preferences" });
    }

    // สร้างการเรียงลำดับโดยใช้ frequency จาก topPreferences
    const sortedPlaces = places.sort((a, b) => {
      const aFrequency = topPreferences.find(p => p.preference === a.place_id)?._count.preference || 0;
      const bFrequency = topPreferences.find(p => p.preference === b.place_id)?._count.preference || 0;
      return bFrequency - aFrequency; // เรียงจากมากไปหาน้อย
    });

    res.json(sortedPlaces);
  } catch (error) {
    console.error("Error fetching popular places:", error);
    res.status(500).json({ error: "Failed to fetch popular places" });
  }
});

// GET RANDOM PLACE
/**
 * @swagger
 * /api/getrandomplaces:
 *   get:
 *     summary: ดึงข้อมูลสถานที่ทั้งหมดจากตาราง place (รองรับการแบ่งหน้า) พร้อมเวลาเปิดทำการตามวัน
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
 *       - in: query
 *         name: day
 *         schema:
 *           type: string
 *         description: วันที่ที่ต้องการดึงข้อมูลเวลาเปิดทำการ (เช่น "Monday")
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
 *                       business_hour:
 *                         type: string
 *                       business_day:
 *                         type: string
 */
router.get("/getrandomplaces", async (req, res) => {
  try {
      let { page, limit, day } = req.query;

      // Convert query params to integers with defaults
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;

      // Validate day if it's provided
      const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (day && !validDays.includes(day)) {
          return res.status(400).json({ error: "Invalid day parameter. Day should be one of: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday." });
      }

      const skip = (page - 1) * limit;

      // Fetch total count of places
      const total = await prisma.place.count();

      // Fetch random places with associated tags and business hours using Prisma's `include`
      const places = await prisma.place.findMany({
        where: {
          // Filter places by business hour day if provided
          business_hour: {
            some: {
              day: day ? day : undefined, // Filter by day if provided
            },
          },
        },
        include: {
          tag: true,  // Include related tags
          business_hour: true,  // Include related business hours
        },
        orderBy: {
          // Randomize the order of places
          place_id: 'asc',
        },
        skip: skip,
        take: limit,
      });

      res.json({
          total,
          page,
          limit,
          places,
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

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: ดึงรายการสถานที่แนะนำโดยใช้ Cosine Similarity และ Haversine Distance
 *     tags: [Recommendations]
 *     responses:
 *       200:
 *         description: รายการสถานที่เรียงตามคะแนนความเหมาะสม
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   place_id:
 *                     type: integer
 *                   weighted_cosine_similarity:
 *                     type: number
 *                   transformed_value:
 *                     type: number
 *                   random_b:
 *                     type: number
 *                   score:
 *                     type: number
 */
router.get("/recommendations", async (req, res) => {
  
  try {
    const page = parseInt(req.query.page) || 1; // หน้าปัจจุบัน (default: 1)
    const limit = parseInt(req.query.limit) || 6; // จำนวนข้อมูลต่อหน้า (default: 10)
    const skip = (page - 1) * limit; // ข้ามข้อมูลไปตามหน้าปัจจุบัน
    const user_id = parseInt(req.query.user_id)
    const lat = parseFloat(req.query.lat)
    const lng = parseFloat(req.query.lng)

    // console.log(page, limit, skip, user_id);
    // console.log(lat, lng);

    // ดึงข้อมูลแท็กของสถานที่
    const tagVectors = await prisma.$queryRaw`
        SELECT 
            p.place_id,
            MAX(CASE WHEN t.tag_name = 'กินและดื่ม' THEN 1 ELSE 0 END) AS food_drink,
            MAX(CASE WHEN t.tag_name = 'เที่ยวบันเทิง' THEN 1 ELSE 0 END) AS entertainment,
            MAX(CASE WHEN t.tag_name = 'ร้านและห้าง' THEN 1 ELSE 0 END) AS shopping
        FROM place p
        LEFT JOIN tag pt ON p.place_id = pt.place_id
        LEFT JOIN tag t ON pt.tag_id = t.tag_id
        GROUP BY p.place_id;
    `;

    // ดึงค่าเฉลี่ยแท็กของ user
    const userTagAvg = await prisma.$queryRaw`
        WITH tag_counts AS (
            SELECT 
                p.user_id,
                CASE WHEN 'กินและดื่ม' = ANY(tv.tags) THEN 1 ELSE 0 END AS food_drink,
                CASE WHEN 'เที่ยวบันเทิง' = ANY(tv.tags) THEN 1 ELSE 0 END AS entertainment,
                CASE WHEN 'ร้านและห้าง' = ANY(tv.tags) THEN 1 ELSE 0 END AS shopping
            FROM public.preference p
            LEFT JOIN (
                SELECT 
                    t.place_id,
                    ARRAY_AGG(t.tag_name) AS tags
                FROM public.tag t
                GROUP BY t.place_id
            ) tv ON p.preference = tv.place_id
            WHERE p.user_id = ${user_id}
        )
        SELECT 
            user_id,
            SUM(food_drink)::float / NULLIF(COUNT(*), 0)::float AS avg_food_drink,
            SUM(entertainment)::float / NULLIF(COUNT(*), 0)::float AS avg_entertainment,
            SUM(shopping)::float / NULLIF(COUNT(*), 0)::float AS avg_shopping
        FROM tag_counts
        GROUP BY user_id;
    `;

    if (userTagAvg.length === 0) {
      return res.json({ data: [], total: 0 });
    }

    const { avg_food_drink, avg_entertainment, avg_shopping } = userTagAvg[0];

    // คำนวณระยะทางด้วย Haversine Distance
    const haversineDistances = await prisma.$queryRaw`
        SELECT 
            p.place_id,
            p.lat AS place_lat,
            p.lng AS place_lng,
            6371 * 2 * ASIN(
                SQRT(
                    POWER(SIN((RADIANS(${lat}::FLOAT) - RADIANS(CAST(p.lat AS FLOAT))) / 2), 2) +
                    COS(RADIANS(${lat}::FLOAT)) * COS(RADIANS(CAST(p.lat AS FLOAT))) *
                    POWER(SIN((RADIANS(${lng}::FLOAT) - RADIANS(CAST(p.lng AS FLOAT))) / 2), 2)
                )
            ) AS distance_km
        FROM place p;
    `;

    // คำนวณ transformed values สำหรับระยะทาง
    const transformedValues = haversineDistances.map((h) => ({
      place_id: h.place_id,
      transformed_value: 1 / (Math.exp(h.distance_km * 10) / 1e5 + 1) * 0.35,
    }));

    // คำนวณ cosine similarity
    const cosineSimilarities = tagVectors.map((tv) => {
      const weightedCosineSimilarity =
        0.45 *
        ((avg_food_drink * tv.food_drink +
          avg_entertainment * tv.entertainment +
          avg_shopping * tv.shopping) /
          (Math.sqrt(avg_food_drink ** 2 + avg_entertainment ** 2 + avg_shopping ** 2) *
            Math.sqrt(tv.food_drink ** 2 + tv.entertainment ** 2 + tv.shopping ** 2) || 1));

      return { place_id: tv.place_id, weighted_cosine_similarity: weightedCosineSimilarity || 0 };
    });

    // รวมค่าทั้งหมดและคำนวณคะแนน
    const finalScores = cosineSimilarities.map((c) => {
      const transformedValue = transformedValues.find((t) => t.place_id === c.place_id)?.transformed_value || 0;
      const randomB = Math.random() * 0.2;
      const score = c.weighted_cosine_similarity + transformedValue + randomB;

      return {
        place_id: c.place_id,
        weighted_cosine_similarity: c.weighted_cosine_similarity,
        transformed_value: transformedValue,
        random_b: randomB,
        score,
      };
    });

    // เรียงตามคะแนนจากมากไปน้อย
    finalScores.sort((a, b) => b.score - a.score);

    // จำนวนรายการทั้งหมด
    const total = finalScores.length;

    // ใช้ pagination เลือกเฉพาะรายการที่อยู่ในหน้าที่เลือก
    const paginatedScores = finalScores.slice(skip, skip + limit);

    // ดึง place_id ที่ได้จาก paginatedScores
    const placeIds = paginatedScores.map((item) => item.place_id);

    // ใช้ place_id ที่ได้มาเพื่อดึงข้อมูลสถานที่
    const places = await prisma.place.findMany({
      where: {
        place_id: { in: placeIds },
      },
      include: {
        tag: true,
        business_hour: true,
      },
    });

    res.json({ data: places, total });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});


module.exports = router;
