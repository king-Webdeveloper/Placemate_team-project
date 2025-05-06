// settingRoutes.js [backend]
const express = require("express");
const router = express.Router();
const path = require("path");

const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ ใช้ memoryStorage แทน diskStorage
const storage = multer.memoryStorage();
const upload = multer({ storage });
 
/**
 * @swagger
 * /api/upload-profile:
 *   post:
 *     summary: Upload a profile image and save it to the database
 *     description: Uploads a user's profile image (stored as binary in the database) along with their user ID.
 *     tags: [Setting]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profileImage
 *               - userId
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: The profile image file to upload
 *               userId:
 *                 type: integer
 *                 description: The ID of the user to update
 *     responses:
 *       200:
 *         description: Image uploaded and saved to the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   description: The updated user object
 *       400:
 *         description: Missing file or userId
 *       500:
 *         description: Internal server error during upload
 */
router.post("/upload-profile", upload.single("profileImage"), async (req, res) => {
  const file = req.file;
  const userId = req.body.userId;

  if (!file || !userId) {
    return res.status(400).json({ error: "File and userId are required" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { user_id: Number(userId) },
      data: {
        imgname: file.originalname,
        imageData: file.buffer, // ✅ บันทึก binary image เข้า bytea
      },
    });

    res.status(200).json({
      message: "Image uploaded and saved to database",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload and save image" });
  }
});

/**
 * @swagger
 * /api/user-image/{userId}:
 *   get:
 *     summary: Get a user's profile image
 *     description: Returns the binary image data (JPEG/PNG) of the user profile stored in the database.
 *     tags: [Setting]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user whose image is requested
 *     responses:
 *       200:
 *         description: Binary image successfully retrieved
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found for this user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Image not found
 *       500:
 *         description: Internal server error while fetching image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch image
 */
router.get("/user-image/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  console.log("userId:", userId); // Debugging log
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });
    console.log("User data:", user); // Debugging log

    if (!user || !user.imageData) {
      return res.status(404).json({ error: "Image not found" });
    }

    const ext = path.extname(user.imgname || "").toLowerCase();
    console.log("Image extension:", ext); // Debugging log 
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": user.imageData.length,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });

    res.end(user.imageData); 

  } catch (error) {
    console.error("Fetch image error:", error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

/**
 * @swagger
 * /api/user-reviews/{userId}:
 *   get:
 *     summary: Get a user's reviews history with place details
 *     description: Returns a list of reviews made by the user, including place name, place ID, rating, comment, and review date.
 *     tags: [Setting]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user whose reviews are requested
 *     responses:
 *       200:
 *         description: List of reviews with place details successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       review_id:
 *                         type: integer
 *                       place_id:
 *                         type: integer
 *                       place_name:
 *                         type: string
 *                       rating:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: User or reviews not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch reviews
 */
router.get("/user-reviews/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  try {
      // ดึงข้อมูลรีวิวจากตาราง review ที่ user_id ตรงกับ userId ที่ส่งมา
      const reviews = await prisma.review.findMany({
          where: { user_id: userId },
          select: {
              review_id: true,
              place_id: true,
              rating: true,
              comment: true,
              created_at: true,
          },
      });

      if (!reviews.length) {
          return res.status(404).json({ error: "No reviews found for this user" });
      }

      // ดึงข้อมูลชื่อสถานที่และ place_id จาก place
      const reviewsWithPlaceDetails = await Promise.all(
          reviews.map(async (review) => {
              const place = await prisma.place.findUnique({
                  where: { place_id: review.place_id },
                  select: {
                      name: true,
                      place_id: true,
                  },
              });

              return {
                  ...review,
                  place_name: place?.name || "Unknown Place", // ถ้าไม่พบชื่อสถานที่จะเป็น "Unknown Place"
                  place_id: place?.place_id || review.place_id, // หากไม่พบ place_id จะใช้ place_id จาก review
              };
          })
      );

      res.status(200).json({
          reviews: reviewsWithPlaceDetails,
      });
  } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
  }
});


/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Authen]
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

router.post("/logout", (req, res) => {
    // Invalidate the token or clear the session
    res.json({ message: "Successfully logged out" });
});

module.exports = router;