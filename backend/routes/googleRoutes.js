console.log("✅ googleRoutes.js ถูกโหลดเรียบร้อยแล้ว");

// routes/googleRoutes.js
const express = require("express");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// 🔐 Step 1: Login Google
router.get("/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    prompt: "consent",
  });
  res.redirect(url);
});

// ใน googleRoutes.js
router.get("/check-token", (req, res) => {
  const token = req.cookies.google_token;
  if (token) {
    res.json({ googleConnected: true });
  } else {
    res.json({ googleConnected: false });
  }
});


// 🔄 Step 2: Google Redirect → save token
router.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);

  res.cookie("google_token", JSON.stringify(tokens), {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 3600 * 1000,
  });

  res.redirect("http://localhost:3000/planner"); // หรือหน้าไหนก็ได้ใน frontend
  // res.redirect(""); // หรือ redirect ไปหน้า planner
});

/**
 * @swagger
 * /api/google/sync-plan:
 *   post:
 *     summary: Sync แผนการเดินทางไปยัง Google Calendar
 *     tags: [Google Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Event created in Google Calendar
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

// 🎯 Step 3: Sync แผนลง Google Calendar
router.post("/sync-plan", async (req, res) => {
  const token = req.cookies.auth_token;
  const googleToken = req.cookies.google_token;
  const { plan_id } = req.body;

  if (!token) return res.status(401).json({ error: "No auth_token" });
  if (!googleToken) return res.status(401).json({ error: "No google_token" });

  // Decode user
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user_id = decoded.user_id;

  try {
    // const plan = await prisma.plan.findUnique({
    //   where: { plan_id: parseInt(plan_id) },
    // });
    const plan = await prisma.plan.findUnique({
      where: { plan_id: parseInt(plan_id) },
      include: {
        place_list: {
          include: {
            place: true,
          },
        },
      },
    });

    if (!plan || plan.user_id !== parseInt(user_id)) {
      return res.status(403).json({ error: "You cannot access this plan" });
    }

        // Set Google Token
    oauth2Client.setCredentials(JSON.parse(googleToken));
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // สร้างอีเวนต์แยกตามแต่ละสถานที่
    const createdEvents = [];

    for (const item of plan.place_list) {
      const placeName = item.place?.name || "ไม่ระบุชื่อสถานที่";
      const start = new Date(item.start_time);
      const end = new Date(item.end_time);

      const event = {
        summary: `${plan.title} (${placeName})`, // ✅ title(name)
        start: {
          dateTime: start.toISOString(),
          timeZone: "Asia/Bangkok",
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: "Asia/Bangkok",
        },
        description: `กำหนดการ: ${placeName}\nช่วงเวลา: ${start.toLocaleDateString("th-TH")} ${start.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })}`,
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: 15 }],
        },
      };

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      createdEvents.push({
        eventId: response.data.id,
        summary: response.data.summary,
        htmlLink: response.data.htmlLink,
      });
    }

    //  สร้าง description โดยใช้ข้อมูลจาก place_list:
    const sortedPlaces = plan.place_list
      .slice()
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    // สร้างข้อความรายละเอียด
    const placeDescriptions = sortedPlaces.map((p, i) => {
      const start = new Date(p.start_time);
      const end = new Date(p.end_time);

      const dateString = start.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const startTime = start.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });
      const endTime = end.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });

      return `${i + 1}. ${p.place.name} - ${dateString} (${startTime} - ${endTime})`;
    }).join("\n");

    const event = {
      summary: plan.title,
      description: placeDescriptions, // ✅ เพิ่มรายละเอียดสถานที่
      start: {
        dateTime: new Date(plan.start_time).toISOString(),
        timeZone: "Asia/Bangkok",
      },
      end: {
        dateTime: new Date(plan.end_time).toISOString(),
        timeZone: "Asia/Bangkok",
      },
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 15 }],
      },
    };

    // const event = {
    //   summary: plan.title,
    //   start: {
    //     dateTime: new Date(plan.start_time).toISOString(),
    //     timeZone: "Asia/Bangkok",
    //   },
    //   end: {
    //     dateTime: new Date(plan.end_time).toISOString(),
    //     timeZone: "Asia/Bangkok",
    //   },
    //   reminders: {
    //     useDefault: false,
    //     overrides: [{ method: "popup", minutes: 15 }],
    //   },
    // };

    let response;
    let isUpdate = false;

    // const response = await calendar.events.insert({
    //   calendarId: "primary",
    //   requestBody: event,
    // });

    // 👉 ถ้ามี event_id อยู่แล้ว ให้ update
    if (plan.google_event_id) {
      response = await calendar.events.update({
        calendarId: "primary",
        eventId: plan.google_event_id,
        requestBody: event,
      });
      isUpdate = true;
    } else {
      // 🆕 ถ้ายังไม่มี ให้ insert ใหม่
      response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });
    }

    const updatedPlan = await prisma.plan.update({
      where: { plan_id: parseInt(plan_id) },
      data: {
        google_event_link: response.data.htmlLink,
        google_event_id: response.data.id,
      },
    });

    // บันทึกลิงก์ Google Calendar ลงในฐานข้อมูล (ใน `google_event_link`)
    // const updatedPlan = await prisma.plan.update({
    //   where: { plan_id: parseInt(plan_id) },
    //   data: {
    //     google_event_link: response.data.htmlLink, // ลิงก์ที่ได้จาก Google Calendar
    //   },
    // });

    res.status(200).json({
      message: "Event created in Google Calendar",
      eventLink: response.data.htmlLink,
      updatedPlan: updatedPlan, // ส่งกลับข้อมูลแผนที่อัปเดต
    });

  } catch (err) {
    console.error("❌ Google Calendar Error:", err);
    res.status(500).json({ error: "Failed to create calendar event" });
  }
});

router.post("/disconnect", (req, res) => {
  res.clearCookie("google_token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
  });
  res.json({ message: "Disconnected from Google Calendar" });
});


module.exports = router;
