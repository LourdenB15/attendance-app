import pool from "../db/db.js";

export async function insertAttempt({sessionId, studentId, outcome, similarity, confidenceLevel, identityMatch, saasRawResponse}) {
  const result = await pool.query(
    `INSERT INTO check_in_attempts
       (session_id, student_id, outcome, similarity, confidence_level, identity_match, saas_raw_response)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, outcome, attempted_at`,
    [sessionId, studentId, outcome, similarity, confidenceLevel, identityMatch, saasRawResponse],
  );
  return result.rows[0];
}
