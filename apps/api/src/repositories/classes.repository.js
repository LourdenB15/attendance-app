// apps/api/src/repositories/classes.repository.js
import pool from "../db/db.js";

export async function createClass(professorId, name, semester, joinCode) {
  const result = await pool.query(
    `INSERT INTO classes (professor_id, name, semester, join_code)
     VALUES ($1, $2, $3, $4)
     RETURNING id, professor_id, name, semester, join_code, is_archived, created_at`,
    [professorId, name, semester, joinCode],
  );
  return result.rows[0];
}

export async function findByProfessor(professorId) {
  const result = await pool.query(
    `SELECT * FROM classes WHERE professor_id = $1 ORDER BY created_at DESC`,
    [professorId],
  );
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query(`SELECT * FROM classes WHERE id = $1`, [id]);
  return result.rows[0];
}

export async function findByJoinCode(joinCode) {
  const result = await pool.query(`SELECT * FROM classes WHERE UPPER(join_code) = UPPER($1)`, [joinCode]);
  return result.rows[0];
}

export async function updateClass(id, name, semester) {
  const result = await pool.query(
    `UPDATE classes SET name = $1, semester = $2 WHERE id = $3
     RETURNING id, professor_id, name, semester, join_code, is_archived, created_at`,
    [name, semester, id],
  );
  return result.rows[0];
}

export async function archiveClass(id) {
  const result = await pool.query(
    `UPDATE classes SET is_archived = true WHERE id = $1
     RETURNING id, professor_id, name, semester, join_code, is_archived, created_at`,
    [id],
  );
  return result.rows[0];
}
