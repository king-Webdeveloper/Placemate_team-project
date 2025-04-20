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

  res.redirect("/"); // หรือ redirect ไปหน้า planner
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
    const plan = await prisma.plan.findUnique({
      where: { plan_id: parseInt(plan_id) },
    });

    if (!plan || plan.user_id !== parseInt(user_id)) {
      return res.status(403).json({ error: "You cannot access this plan" });
    }

    // Set Google Token
    oauth2Client.setCredentials(JSON.parse(googleToken));
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: plan.title,
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

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    res.status(200).json({
      message: "Event created in Google Calendar",
      eventLink: response.data.htmlLink,
    });
  } catch (err) {
    console.error("❌ Google Calendar Error:", err);
    res.status(500).json({ error: "Failed to create calendar event" });
  }
});

module.exports = router;
