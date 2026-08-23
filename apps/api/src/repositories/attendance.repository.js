// apps/api/src/repositories/attendance.repository.js
import pool from "../db/db.js";

export async function upsertAttendance(sessionId, studentId, status, source, recordedBy, overrideReason = null, checkInAttemptId = null) {
  const result = await pool.query(
    `INSERT INTO attendance_records (session_id, student_id, status, source, recorded_by, override_reason, check_in_attempt_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (session_id, student_id) DO UPDATE
       SET status = EXCLUDED.status,
           source = EXCLUDED.source,
           recorded_by = EXCLUDED.recorded_by,
           override_reason = EXCLUDED.override_reason,
           check_in_attempt_id = COALESCE(EXCLUDED.check_in_attempt_id, attendance_records.check_in_attempt_id),
           recorded_at = now()
     RETURNING id, session_id, student_id, status, source, override_reason, recorded_at`,
    [sessionId, studentId, status, source, recordedBy, overrideReason, checkInAttemptId],
  );
  return result.rows[0];
}

export async function findBySession(sessionId) {
  const result = await pool.query(
    `SELECT e.student_id, u.full_name, u.email,
            COALESCE(ar.status, 'ABSENT') as status,
            ar.source, ar.override_reason, ar.recorded_at
     FROM attendance_sessions s
     JOIN enrollments e ON s.class_id = e.class_id AND e.status = 'ACTIVE'
     JOIN users u ON e.student_id = u.id
     LEFT JOIN attendance_records ar ON s.id = ar.session_id AND e.student_id = ar.student_id
     WHERE s.id = $1
     ORDER BY u.full_name ASC`,
    [sessionId],
  );
  return result.rows;
}

export async function findByStudent(studentId) {
  const result = await pool.query(
    `SELECT ar.id, ar.session_id, ar.status, ar.source, ar.override_reason, ar.recorded_at,
            s.label as session_label, s.opened_at,
            c.name as class_name, c.section, c.semester
     FROM attendance_records ar
     JOIN attendance_sessions s ON ar.session_id = s.id
     JOIN classes c ON s.class_id = c.id
     WHERE ar.student_id = $1
     ORDER BY s.opened_at DESC`,
    [studentId],
  );
  return result.rows;
}
