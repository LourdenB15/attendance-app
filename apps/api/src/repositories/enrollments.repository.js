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
