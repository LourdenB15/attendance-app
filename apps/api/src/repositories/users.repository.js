// apps/api/src/repositories/users.repository.js
import pool from "../db/db.js";

export async function createUser(fullName, email, passwordHash, role, mustChangePassword, isEmailVerified = false) {
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role, must_change_password, is_email_verified)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, full_name, email, role, avatar_url, must_change_password, is_active, is_email_verified, created_at`,
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

export async function setPasswordRequiringChange(id, passwordHash) {
  await pool.query(
    `UPDATE users
     SET password_hash = $1, must_change_password = true, updated_at = now()
     WHERE id = $2`,
    [passwordHash, id],
  );
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
     SET role = $1, token_version = token_version + 1, updated_at = now()
     WHERE id = $2
     RETURNING id, full_name, email, role, avatar_url, must_change_password, is_active, is_email_verified, created_at, token_version`,
    [role, id],
  );
  return result.rows[0];
}

export async function updateProfile(id, fullName) {
  const result = await pool.query(
    `UPDATE users
     SET full_name = $1, updated_at = now()
     WHERE id = $2
     RETURNING id, full_name, email, role, avatar_url, must_change_password, is_active, is_email_verified, created_at,
             password_hash IS NOT NULL AS has_password`,
    [fullName, id],
  );
  return result.rows[0];
}

export async function updateAvatar(id, avatarUrl) {
  const result = await pool.query(
    `UPDATE users
     SET avatar_url = $1, updated_at = now()
     WHERE id = $2
     RETURNING id, full_name, email, role, avatar_url, must_change_password, is_active, is_email_verified, created_at,
             password_hash IS NOT NULL AS has_password`,
    [avatarUrl, id],
  );
  return result.rows[0];
}

export async function setEmailVerified(id) {
  const result = await pool.query(
    `UPDATE users SET is_email_verified = true, updated_at = now()
     WHERE id = $1
     RETURNING id, full_name, email, role, avatar_url, must_change_password, is_active, is_email_verified, created_at,
             password_hash IS NOT NULL AS has_password`,
    [id],
  );
  return result.rows[0];
}

export async function findAll(role) {
  const query = role
    ? `SELECT id, full_name, email, role, avatar_url, is_active, must_change_password, is_email_verified, created_at
       FROM users WHERE role = $1 ORDER BY full_name ASC`
    : `SELECT id, full_name, email, role, avatar_url, is_active, must_change_password, is_email_verified, created_at
       FROM users ORDER BY full_name ASC`;
  const result = await pool.query(query, role ? [role] : []);
  return result.rows;
}

export async function setActive(userId, isActive) {
  const result = await pool.query(
    `UPDATE users SET is_active = $2, updated_at = now() WHERE id = $1
     RETURNING id, full_name, email, role, avatar_url, is_active, is_email_verified, must_change_password, created_at`,
    [userId, isActive],
  );
  return result.rows[0];
}

export async function findByGoogleId(googleId) {
  const result = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
  return result.rows[0];
}

export async function linkGoogleAccount(userId, googleId, avatarUrl = null) {
  const result = await pool.query(
    `UPDATE users
     SET google_id = $1,
         avatar_url = COALESCE($3, avatar_url),
         is_email_verified = true,
         updated_at = now()
     WHERE id = $2
     RETURNING id, full_name, email, role, avatar_url, must_change_password, is_active, is_email_verified, created_at,
             password_hash IS NOT NULL AS has_password`,
    [googleId, userId, avatarUrl],
  );
  return result.rows[0];
}

export async function createGoogleUser(fullName, email, googleId, role = "STUDENT", avatarUrl = null) {
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role, must_change_password, google_id, is_email_verified, avatar_url)
     VALUES ($1, $2, NULL, $4, false, $3, true, $5)
     RETURNING id, full_name, email, role, avatar_url, must_change_password, is_active, is_email_verified, created_at,
             password_hash IS NOT NULL AS has_password`,
    [fullName, email, googleId, role, avatarUrl],
  );
  return result.rows[0];
}

export async function createGoogleStudent(fullName, email, googleId, avatarUrl = null) {
  return createGoogleUser(fullName, email, googleId, "STUDENT", avatarUrl);
}

export async function updateAvatar(userId, avatarUrl) {
  const result = await pool.query(
    `UPDATE users
     SET avatar_url = $1, updated_at = now()
     WHERE id = $2
     RETURNING id, full_name, email, role, avatar_url, must_change_password, is_active, is_email_verified, created_at,
             password_hash IS NOT NULL AS has_password`,
    [avatarUrl, userId],
  );
  return result.rows[0];
}
