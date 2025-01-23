const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: Example endpoint
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/example', (req, res) => {
  res.send('Example endpoint');
});

module.exports = router;