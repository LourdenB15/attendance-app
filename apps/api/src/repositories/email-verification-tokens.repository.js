// apps/api/src/repositories/email-verification-tokens.repository.js
import pool from "../db/db.js";

export async function addToken(userId, tokenHash, expiresAt) {
  const result = await pool.query(
    `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, token_hash, expires_at, created_at`,
    [userId, tokenHash, expiresAt],
  );
  return result.rows[0];
}

export async function findByTokenHash(tokenHash) {
  const result = await pool.query(
    `SELECT * FROM email_verification_tokens WHERE token_hash = $1`,
    [tokenHash],
  );
  return result.rows[0];
}

export async function findLatestUnusedByUser(userId) {
  const result = await pool.query(
    `SELECT * FROM email_verification_tokens
     WHERE user_id = $1 AND used_at IS NULL AND expires_at > now()
     ORDER BY created_at DESC LIMIT 1`,
    [userId],
  );
  return result.rows[0];
}

export async function markUsed(id) {
  await pool.query(
    `UPDATE email_verification_tokens SET used_at = now() WHERE id = $1`,
    [id],
  );
}
