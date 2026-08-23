import "dotenv/config";
import bcrypt from "bcrypt";
import pool from "./db.js";

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Please set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in your .env");
  process.exit(1);
}

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const query = `
    INSERT INTO users (full_name, email, password_hash, role, must_change_password, is_active)
    VALUES ($1, $2, $3, 'ADMIN', false, true)
    ON CONFLICT (email) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          password_hash = EXCLUDED.password_hash,
          role = 'ADMIN',
          is_active = true
    RETURNING id, full_name, email, role;
  `;

  try {
    const res = await pool.query(query, [ADMIN_NAME, ADMIN_EMAIL, passwordHash]);
    console.log("Admin account seeded successfully:", res.rows[0]);
  } catch (err) {
    console.error("Failed to seed admin:", err);
  } finally {
    await pool.end();
  }
}

seedAdmin();
