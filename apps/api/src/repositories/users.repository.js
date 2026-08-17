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

export async function updatePassword(id, passwordHash) {
  await pool.query(
    `UPDATE users
     SET password_hash = $1, must_change_password = false, updated_at = now()
     WHERE id = $2`,
    [passwordHash, id],
  );
}

export async function findAll(role) {
  const query = role
    ? `SELECT id, full_name, email, role, is_active, must_change_password, created_at
       FROM users WHERE role = $1 ORDER BY full_name ASC`
    : `SELECT id, full_name, email, role, is_active, must_change_password, created_at
       FROM users ORDER BY full_name ASC`;
  const result = await pool.query(query, role ? [role] : []);
  return result.rows;
}

export async function setActive(userId, isActive) {
  const result = await pool.query(
    `UPDATE users SET is_active = $2 WHERE id = $1 RETURNING id, full_name, email, role, is_active`,
    [userId, isActive],
  );
  return result.rows[0];
}
