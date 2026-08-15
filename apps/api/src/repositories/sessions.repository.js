import pool from "../db/db.js";

export async function createSession(classId, openedBy, label, expiresAt) {
  const result = await pool.query(
    `INSERT INTO attendance_sessions (class_id, opened_by, label, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, class_id, label, status, opened_at, expires_at`,
    [classId, openedBy, label, expiresAt],
  );
  return result.rows[0];
}

export async function closeSession(sessionId, professorId) {
  const result = await pool.query(
    `UPDATE attendance_sessions
     SET status = 'CLOSED', closed_at = now()
     WHERE id = $1
       AND status = 'OPEN'
       AND class_id IN (SELECT id FROM classes WHERE professor_id = $2)
     RETURNING id, status, closed_at`,
    [sessionId, professorId],
  );
  return result.rows[0];
}

export async function findByIdAndProfessor(sessionId, professorId) {
  const result = await pool.query(
    `SELECT s.id, s.class_id, s.status, s.expires_at
     FROM attendance_sessions s
     WHERE s.id = $1
       AND s.class_id IN (SELECT id FROM classes WHERE professor_id = $2)`,
    [sessionId, professorId],
  );
  return result.rows[0];
}

export async function findById(sessionId) {
  const result = await pool.query(
    `SELECT id, class_id, status, expires_at FROM attendance_sessions WHERE id = $1`,
    [sessionId],
  );
  return result.rows[0];
}
