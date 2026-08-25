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

export async function findSessionsWithStatsByClass(classId, professorId) {
  const result = await pool.query(
    `SELECT s.id, s.class_id, s.label, s.status, s.opened_at, s.closed_at, s.expires_at,
            COUNT(DISTINCT e.student_id)::int AS total_enrolled,
            COUNT(DISTINCT CASE WHEN ar.status = 'PRESENT' THEN ar.student_id END)::int AS present_count,
            COUNT(DISTINCT CASE WHEN ar.status = 'ABSENT' THEN ar.student_id END)::int AS absent_count
     FROM attendance_sessions s
     JOIN classes c ON c.id = s.class_id AND c.professor_id = $2
     LEFT JOIN enrollments e ON e.class_id = s.class_id AND e.status = 'ACTIVE'
     LEFT JOIN attendance_records ar ON ar.session_id = s.id AND ar.student_id = e.student_id
     WHERE s.class_id = $1
     GROUP BY s.id, s.class_id, s.label, s.status, s.opened_at, s.closed_at, s.expires_at
     ORDER BY s.opened_at DESC`,
    [classId, professorId],
  );
  return result.rows;
}

export async function findSectionAttendanceSummary(classId, professorId) {
  const result = await pool.query(
    `SELECT u.id AS student_id, u.full_name, u.email,
            COUNT(DISTINCT s.id)::int AS total_sessions,
            COUNT(DISTINCT CASE WHEN ar.status = 'PRESENT' THEN ar.session_id END)::int AS present_sessions,
            COUNT(DISTINCT CASE WHEN ar.status = 'ABSENT' OR (s.id IS NOT NULL AND ar.status IS NULL) THEN s.id END)::int AS absent_sessions
     FROM enrollments e
     JOIN classes c ON c.id = e.class_id AND c.professor_id = $2
     JOIN users u ON u.id = e.student_id
     LEFT JOIN attendance_sessions s ON s.class_id = e.class_id
     LEFT JOIN attendance_records ar ON ar.session_id = s.id AND ar.student_id = e.student_id
     WHERE e.class_id = $1 AND e.status = 'ACTIVE'
     GROUP BY u.id, u.full_name, u.email
     ORDER BY u.full_name ASC`,
    [classId, professorId],
  );
  return result.rows;
}
