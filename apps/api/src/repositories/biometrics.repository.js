// apps/api/src/repositories/biometrics.repository.js
import pool from "../db/db.js";

export async function createBiometricEnrollment(studentId, livenessExternalId) {
  // Revoke any previous active enrollment for this student
  await pool.query(
    `UPDATE biometric_enrollments
     SET status = 'REVOKED', revoked_at = now()
     WHERE student_id = $1 AND revoked_at IS NULL`,
    [studentId],
  );

  const result = await pool.query(
    `INSERT INTO biometric_enrollments (student_id, liveness_external_id, status)
     VALUES ($1, $2, 'ACTIVE')
     RETURNING id, student_id, liveness_external_id, status, enrolled_at`,
    [studentId, livenessExternalId],
  );
  return result.rows[0];
}

export async function findActiveByStudent(studentId) {
  const result = await pool.query(
    `SELECT * FROM biometric_enrollments
     WHERE student_id = $1 AND status = 'ACTIVE' AND revoked_at IS NULL`,
    [studentId],
  );
  return result.rows[0];
}

export async function recordCheckInAttempt(sessionId, studentId, outcome, similarity, confidenceLevel, matchedName, identityMatch, saasRawResponse) {
  const result = await pool.query(
    `INSERT INTO check_in_attempts (session_id, student_id, outcome, similarity, confidence_level, matched_name, identity_match, saas_raw_response)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, session_id, student_id, outcome, similarity, confidence_level, identity_match, attempted_at`,
    [sessionId, studentId, outcome, similarity, confidenceLevel, matchedName, identityMatch, saasRawResponse],
  );
  return result.rows[0];
}
