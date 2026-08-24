import pool from "../db/db.js";

export async function createEnrollment(classId, studentId, enrolledVia) {
  const result = await pool.query(
    `INSERT INTO enrollments (class_id, student_id, enrolled_via)
     VALUES ($1, $2, $3)
     RETURNING id, class_id, student_id, status, enrolled_via, enrolled_at`,
    [classId, studentId, enrolledVia],
  );
  return result.rows[0];
}

export async function findStudentsByClass(classId) {
  const result = await pool.query(
    `SELECT u.id AS student_id, u.full_name, u.email,
            e.status, e.enrolled_via, e.enrolled_at
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     WHERE e.class_id = $1
     ORDER BY u.full_name ASC`,
    [classId],
  );
  return result.rows;
}

export async function findActiveEnrollment(classId, studentId) {
  const result = await pool.query(
    `SELECT id FROM enrollments WHERE class_id = $1 AND student_id = $2 AND status = 'ACTIVE'`,
    [classId, studentId],
  );
  return result.rows[0];
}

export async function findClassesByStudent(studentId) {
  const result = await pool.query(
    `SELECT c.id AS class_id, c.name, c.semester, c.section, c.join_code, e.enrolled_at,
            u.full_name AS professor_name,
            s.id AS active_session_id, s.label AS active_session_label, s.expires_at AS active_session_expires_at,
            att.status AS my_attendance_status, att.recorded_at AS my_checked_in_at
     FROM enrollments e
     JOIN classes c ON c.id = e.class_id
     LEFT JOIN users u ON u.id = c.professor_id
     LEFT JOIN attendance_sessions s ON s.class_id = c.id AND s.status = 'OPEN' AND s.expires_at > now()
     LEFT JOIN attendance_records att ON att.session_id = s.id AND att.student_id = e.student_id
     WHERE e.student_id = $1 AND e.status = 'ACTIVE'
     ORDER BY c.name ASC`,
    [studentId],
  );
  return result.rows;
}

export async function dropEnrollment(classId, studentId, professorId) {
  const result = await pool.query(
    `UPDATE enrollments
     SET status = 'DROPPED'
     WHERE class_id = $1 AND student_id = $2 AND status = 'ACTIVE'
       AND class_id IN (SELECT id FROM classes WHERE professor_id = $3)
     RETURNING id, class_id, student_id, status`,
    [classId, studentId, professorId],
  );
  return result.rows[0];
}

export async function findEnrollment(classId, studentId) {
  const result = await pool.query(
    `SELECT id, status FROM enrollments WHERE class_id = $1 AND student_id = $2`,
    [classId, studentId],
  );
  return result.rows[0];
}
