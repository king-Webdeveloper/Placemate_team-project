const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(cors()); // อนุญาตให้ Frontend เชื่อมต่อได้
app.use(bodyParser.json());

// ใช้ Routes ของ Auth
const authRoutes = require('./routes/auth'); // นำเข้า authRoutes
app.use("/api", authRoutes);

// ใช้ Routes ของ Planner
const plannerRoutes = require('./routes/plannerRoutes'); // ให้แน่ใจว่า path ถูกต้อง
app.use("/api", plannerRoutes);


// เริ่มต้น Server
app.listen(PORT, () => {
  // console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Server is running on ${process.env.REACT_APP_API_URL}:${PORT}`);
});


const pool = new Pool({
  user: 'your_user',
  host: 'localhost',
  // host: process.env.REACT_APP_API_URL,
  database: 'user_auth',
  password: 'your_password',
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

// Register
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword]);
    res.status(201).send('User registered');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user.id, email: user.email }, 'your_secret_key', { expiresIn: '1h' });
      res.json({ message: "Login successful", token });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));

// List to go
// ดึงรายการสถานที่จาก place
app.get('/api/listtogo', async (req, res) => {
  try {
    const result = await pool.query
    ('SELECT id, place_id, name FROM place');
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch place data" });
  }
});

// เพิ่มสถานที่ไปยัง list_to_go
app.post('/api/list-to-go/add', async (req, res) => {
  const { place_id, name } = req.body;

  try {
    await pool.query('INSERT INTO list_to_go (place_id, name) VALUES ($1, $2)', [place_id, name]);
    res.status(201).send('Place added to List to Go');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ลบสถานที่ออกจาก list_to_go
app.delete('/api/list-to-go/remove', async (req, res) => {
  const { place_id } = req.body;

  try {
    await pool.query('DELETE FROM list_to_go WHERE place_id = $1', [place_id]);
    res.send('Place removed from List to Go');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ดึงข้อมูลแผนการเดินทางทั้งหมด
router.get("/planner", async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      select: {
        plan_id: true,
        user_id: true,
        title: true,
        created_at: true,
      },
    });
    res.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

// เพิ่มแผนการเดินทางใหม่
router.post("/planner/add", async (req, res) => {
  const { user_id, title, start_time } = req.body;

  if (!user_id || !title || !start_time) {
    return res.status(400).json({ error: "user_id, title, and start_time are required" });
  }

  try {
    // เพิ่มแผนการเดินทางใหม่
    const newPlan = await prisma.plan.create({
      data: {
        user_id: user_id,
        title: title,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    res.status(201).json(newPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add new plan" });
  }
});

// ลบแผนการเดินทาง
router.delete("/planner/remove", async (req, res) => {
  const { plan_id } = req.body;

  if (!plan_id) {
    return res.status(400).json({ error: "plan_id is required" });
  }

  try {
    const plan = await prisma.plan.findUnique({
      where: { plan_id: plan_id },
    });

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    await prisma.plan.delete({
      where: { plan_id: plan_id },
    });

    res.json({ message: "Plan removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove plan" });
  }
});
