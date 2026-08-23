// apps/api/src/repositories/sessions.repository.js
import pool from "../db/db.js";

export async function createSession(classId, openedBy, durationMinutes, label) {
  const result = await pool.query(
    `INSERT INTO attendance_sessions (class_id, opened_by, label, status, opened_at, expires_at)
     VALUES ($1, $2, $3, 'OPEN', now(), now() + ($4 || ' minutes')::interval)
     RETURNING id, class_id, opened_by, label, status, opened_at, expires_at`,
    [classId, openedBy, label, durationMinutes],
  );
  return result.rows[0];
}

export async function findById(sessionId) {
  const result = await pool.query(`SELECT * FROM attendance_sessions WHERE id = $1`, [sessionId]);
  return result.rows[0];
}

export async function findOpenByClass(classId) {
  const result = await pool.query(
    `SELECT * FROM attendance_sessions WHERE class_id = $1 AND status = 'OPEN' AND expires_at > now()`,
    [classId],
  );
  return result.rows[0];
}

export async function closeSession(sessionId) {
  const result = await pool.query(
    `UPDATE attendance_sessions
     SET status = 'CLOSED', closed_at = now()
     WHERE id = $1
     RETURNING id, class_id, opened_by, label, status, opened_at, expires_at, closed_at`,
    [sessionId],
  );
  return result.rows[0];
}
