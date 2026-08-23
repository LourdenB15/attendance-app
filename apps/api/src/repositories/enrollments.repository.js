// apps/api/src/repositories/enrollments.repository.js
import pool from "../db/db.js";

export async function createEnrollment(classId, studentId, enrolledVia = "SELF_ENROLLED") {
  const result = await pool.query(
    `INSERT INTO enrollments (class_id, student_id, enrolled_via, status)
     VALUES ($1, $2, $3, 'ACTIVE')
     ON CONFLICT (class_id, student_id) DO UPDATE SET status = 'ACTIVE'
     RETURNING id, class_id, student_id, status, enrolled_via, enrolled_at`,
    [classId, studentId, enrolledVia],
  );
  return result.rows[0];
}

export async function findByStudent(studentId) {
  const result = await pool.query(
    `SELECT e.id as enrollment_id, e.class_id, e.status, e.enrolled_at,
            c.name, c.semester, c.join_code, u.full_name as professor_name
     FROM enrollments e
     JOIN classes c ON e.class_id = c.id
     JOIN users u ON c.professor_id = u.id
     WHERE e.student_id = $1 AND e.status = 'ACTIVE' AND c.is_archived = false
     ORDER BY e.enrolled_at DESC`,
    [studentId],
  );
  return result.rows;
}

export async function findByClass(classId) {
  const result = await pool.query(
    `SELECT e.id as enrollment_id, e.student_id, e.status, e.enrolled_via, e.enrolled_at,
            u.full_name, u.email
     FROM enrollments e
     JOIN users u ON e.student_id = u.id
     WHERE e.class_id = $1
     ORDER BY u.full_name ASC`,
    [classId],
  );
  return result.rows;
}

export async function dropStudent(classId, studentId) {
  const result = await pool.query(
    `UPDATE enrollments SET status = 'DROPPED'
     WHERE class_id = $1 AND student_id = $2
     RETURNING id, class_id, student_id, status`,
    [classId, studentId],
  );
  return result.rows[0];
}
