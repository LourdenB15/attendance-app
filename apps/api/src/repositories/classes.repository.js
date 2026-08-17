import pool from "../db/db.js";

export async function createClass(professorId, name, semester, section, joinCode) {
  const result = await pool.query(
    `INSERT INTO classes (professor_id, name, semester, section, join_code)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, semester, section, join_code, is_archived, created_at`,
    [professorId, name, semester, section, joinCode],
  );
  return result.rows[0];
}

export async function findByProfessor(professorId) {
  const result = await pool.query(
    `SELECT id, name, semester, section, join_code, is_archived, created_at
     FROM classes
     WHERE professor_id = $1
     ORDER BY created_at DESC`,
    [professorId],
  );
  return result.rows;
}

export async function findByIdAndProfessor(classId, professorId) {
  const result = await pool.query(
    `SELECT id, name, semester, section
     FROM classes
     WHERE id = $1 AND professor_id = $2`,
    [classId, professorId],
  );
  return result.rows[0];
}

export async function findByJoinCode(joinCode) {
  const result = await pool.query(
    `SELECT id, name, semester, section
     FROM classes
     WHERE join_code = $1 AND is_archived = false`,
    [joinCode],
  );
  return result.rows[0];
}

export async function updateClass(classId, professorId, { name, semester, section }) {
  const result = await pool.query(
    `UPDATE classes
     SET name = COALESCE($3, name),
         semester = COALESCE($4, semester),
         section = COALESCE($5, section)
     WHERE id = $1 AND professor_id = $2
     RETURNING id, name, semester, section, join_code, is_archived, created_at`,
    [classId, professorId, name ?? null, semester ?? null, section ?? null],
  );
  return result.rows[0];
}

export async function archiveClass(classId, professorId) {
  const result = await pool.query(
    `UPDATE classes
     SET is_archived = true
     WHERE id = $1 AND professor_id = $2
     RETURNING id, name, is_archived`,
    [classId, professorId],
  );
  return result.rows[0];
}
