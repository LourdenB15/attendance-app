import pool from "../db/db.js";

export async function createUser(fullName, email, passwordHash, role, mustChangePassword) {
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role, must_change_password)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, role, must_change_password, is_active, created_at`,
    [fullName, email, passwordHash, role, mustChangePassword],
  );
  return result.rows[0];
}

export async function findByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
}

export async function findById(id) {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
}
