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

export async function findForSession(classId, sessionId) {
  const result = await pool.query(
    `SELECT u.id AS student_id, u.full_name, u.email,
            COALESCE(ar.status, 'ABSENT') AS status,
            ar.source, ar.recorded_at, ar.override_reason
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     LEFT JOIN attendance_records ar
       ON ar.student_id = e.student_id AND ar.session_id = $2
     WHERE e.class_id = $1 AND e.status = 'ACTIVE'
     ORDER BY u.full_name ASC`,
    [classId, sessionId],
  );
  return result.rows;
}

export async function upsertOverride(sessionId, studentId, status, recordedBy, reason) {
  const result = await pool.query(
    `INSERT INTO attendance_records
       (session_id, student_id, status, source, recorded_by, override_reason)
     VALUES ($1, $2, $3, 'MANUAL_OVERRIDE', $4, $5)
     ON CONFLICT (session_id, student_id) DO UPDATE
       SET status = EXCLUDED.status,
           source = 'MANUAL_OVERRIDE',
           check_in_attempt_id = NULL,
           recorded_by = EXCLUDED.recorded_by,
           override_reason = EXCLUDED.override_reason,
           recorded_at = now()
     RETURNING id, status, source, recorded_at, override_reason`,
    [sessionId, studentId, status, recordedBy, reason],
  );
  return result.rows[0];
}

export async function findForStudent(studentId) {
  const result = await pool.query(
    `SELECT s.id AS session_id, s.label AS session_label, s.opened_at, s.status AS session_status,
            c.name AS class_name, c.section,
            COALESCE(ar.status, 'ABSENT') AS status, ar.source, ar.recorded_at, ar.override_reason
     FROM enrollments e
     JOIN classes c ON c.id = e.class_id
     JOIN attendance_sessions s ON s.class_id = e.class_id
     LEFT JOIN attendance_records ar
       ON ar.session_id = s.id AND ar.student_id = e.student_id
     WHERE e.student_id = $1 AND e.status = 'ACTIVE'
     ORDER BY s.opened_at DESC`,
    [studentId],
  );
  return result.rows;
}
