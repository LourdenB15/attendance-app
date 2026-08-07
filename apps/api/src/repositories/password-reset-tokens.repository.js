import pool from "../db/db.js";

export async function addToken(userId, tokenHash, expiresAt) {
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );
}

export async function findByTokenHash(tokenHash) {
  const result = await pool.query(
    `SELECT id, user_id, expires_at, used_at
     FROM password_reset_tokens WHERE token_hash = $1`,
    [tokenHash],
  );
  return result.rows[0];
}

export async function markUsed(id) {
  await pool.query(
    "UPDATE password_reset_tokens SET used_at = now() WHERE id = $1",
    [id],
  );
}
