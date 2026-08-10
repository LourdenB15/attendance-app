import pool from "../db/db.js";

export async function replaceActiveEnrollment(studentId, livenessExternalId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE biometric_enrollments
       SET status = 'REVOKED', revoked_at = now()
       WHERE student_id = $1 AND revoked_at IS NULL`,
      [studentId],
    );

    const result = await client.query(
      `INSERT INTO biometric_enrollments (student_id, liveness_external_id)
       VALUES ($1, $2)
       RETURNING id, student_id, liveness_external_id, status, enrolled_at`,
      [studentId, livenessExternalId],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
