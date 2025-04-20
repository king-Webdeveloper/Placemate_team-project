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

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user || !user.imageData) {
      return res.status(404).json({ error: "Image not found" });
    }

    const ext = path.extname(user.imgname || "").toLowerCase(); 
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