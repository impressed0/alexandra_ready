require("dotenv").config();

const path = require("path");
const express = require("express");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me";
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is missing.");
  console.error("Create a Neon database and add DATABASE_URL to your environment variables.");
  process.exit(1);
}

const needsSSL =
  process.env.PGSSLMODE === "require" ||
  DATABASE_URL.includes("sslmode=require") ||
  process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: needsSSL ? { rejectUnauthorized: false } : false
});

app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function cleanText(value, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function requireAdmin(req, res, next) {
  const passwordFromHeader = req.get("x-admin-password");
  const passwordFromQuery = req.query.password;
  const givenPassword = passwordFromHeader || passwordFromQuery;

  if (!givenPassword || givenPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Неверный пароль администратора." });
  }

  next();
}

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS invitations (
      id SERIAL PRIMARY KEY,
      mood TEXT,
      day_note TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      food TEXT NOT NULL,
      wishes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");

    res.json({
      ok: true,
      app: "cute-date-koyeb-neon",
      version: "2.0.0",
      database: "postgresql",
      databaseTime: result.rows[0].now
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: "Database connection failed."
    });
  }
});

app.post("/api/invitations", async (req, res) => {
  try {
    const mood = cleanText(req.body.mood, 100);
    const dayNote = cleanText(req.body.dayNote, 800);
    const date = cleanText(req.body.date, 40);
    const time = cleanText(req.body.time, 40);
    const food = cleanText(req.body.food, 100);
    const wishes = cleanText(req.body.wishes, 700);

    if (!date || !time || !food) {
      return res.status(400).json({
        error: "Дата, время и еда обязательны."
      });
    }

    const result = await pool.query(
      `
        INSERT INTO invitations (mood, day_note, date, time, food, wishes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [mood, dayNote, date, time, food, wishes]
    );

    res.status(201).json({
      ok: true,
      id: result.rows[0].id,
      message: "Ответ сохранён 💗"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Не получилось сохранить ответ."
    });
  }
});

app.get("/api/invitations", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, mood, day_note, date, time, food, wishes, created_at
      FROM invitations
      ORDER BY id DESC
    `);

    res.json({
      ok: true,
      count: result.rows.length,
      items: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Не получилось загрузить ответы."
    });
  }
});

app.delete("/api/invitations/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Некорректный ID." });
    }

    const result = await pool.query(
      "DELETE FROM invitations WHERE id = $1",
      [id]
    );

    res.json({
      ok: true,
      deleted: result.rowCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Не получилось удалить ответ."
    });
  }
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "index.html"));
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Cute Date app is running on http://localhost:${PORT}`);
      console.log(`Admin page: http://localhost:${PORT}/admin.html`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
