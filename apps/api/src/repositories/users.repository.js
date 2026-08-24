// apps/api/src/repositories/users.repository.js
import pool from "../db/db.js";

export async function createUser(fullName, email, passwordHash, role, mustChangePassword, isEmailVerified = false) {
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role, must_change_password, is_email_verified)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, full_name, email, role, must_change_password, is_active, is_email_verified, created_at`,
    [fullName, email, passwordHash, role, mustChangePassword, isEmailVerified],
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

export async function updateRole(id, role) {
  const result = await pool.query(
    `UPDATE users
     SET role = $1, updated_at = now()
     WHERE id = $2
     RETURNING id, full_name, email, role, must_change_password, is_active, is_email_verified, created_at`,
    [role, id],
  );
  return result.rows[0];
}

export async function setEmailVerified(id) {
  const result = await pool.query(
    `UPDATE users SET is_email_verified = true, updated_at = now()
     WHERE id = $1
     RETURNING id, full_name, email, role, must_change_password, is_active, is_email_verified, created_at`,
    [id],
  );
  return result.rows[0];
}

export async function findAll(role) {
  const query = role
    ? `SELECT id, full_name, email, role, is_active, must_change_password, is_email_verified, created_at
       FROM users WHERE role = $1 ORDER BY full_name ASC`
    : `SELECT id, full_name, email, role, is_active, must_change_password, is_email_verified, created_at
       FROM users ORDER BY full_name ASC`;
  const result = await pool.query(query, role ? [role] : []);
  return result.rows;
}

export async function setActive(userId, isActive) {
  const result = await pool.query(
    `UPDATE users SET is_active = $2, updated_at = now() WHERE id = $1
     RETURNING id, full_name, email, role, is_active, is_email_verified, must_change_password, created_at`,
    [userId, isActive],
  );
  return result.rows[0];
}

export async function findByGoogleId(googleId) {
  const result = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
  return result.rows[0];
}

export async function linkGoogleAccount(userId, googleId) {
  const result = await pool.query(
    `UPDATE users SET google_id = $1, is_email_verified = true, updated_at = now() WHERE id = $2
     RETURNING id, full_name, email, role, must_change_password, is_active, is_email_verified, created_at`,
    [googleId, userId],
  );
  return result.rows[0];
}

export async function createGoogleUser(fullName, email, googleId, role = "STUDENT") {
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role, must_change_password, google_id, is_email_verified)
     VALUES ($1, $2, NULL, $4, false, $3, true)
     RETURNING id, full_name, email, role, must_change_password, is_active, is_email_verified, created_at`,
    [fullName, email, googleId, role],
  );
  return result.rows[0];
}

export async function createGoogleStudent(fullName, email, googleId) {
  return createGoogleUser(fullName, email, googleId, "STUDENT");
}
