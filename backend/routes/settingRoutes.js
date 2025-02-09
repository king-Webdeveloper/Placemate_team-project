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