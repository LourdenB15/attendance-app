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
