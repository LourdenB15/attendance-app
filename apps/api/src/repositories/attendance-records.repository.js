import pool from "../db/db.js";

export async function upsertPresent({ sessionId, studentId, checkInAttemptId, recordedBy }) {
  const result = await pool.query(
    `INSERT INTO attendance_records
       (session_id, student_id, status, source, check_in_attempt_id, recorded_by)
     VALUES ($1, $2, 'PRESENT', 'LIVENESS', $3, $4)
     ON CONFLICT (session_id, student_id) DO UPDATE
       SET status = 'PRESENT',
           source = 'LIVENESS',
           check_in_attempt_id = EXCLUDED.check_in_attempt_id,
           recorded_by = EXCLUDED.recorded_by,
           recorded_at = now()
       WHERE attendance_records.source <> 'MANUAL_OVERRIDE'
     RETURNING id, status, source, recorded_at`,
    [sessionId, studentId, checkInAttemptId, recordedBy],
  );
  return result.rows[0];
}
