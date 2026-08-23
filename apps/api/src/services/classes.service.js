// apps/api/src/services/classes.service.js
import crypto from "crypto";
import * as classesRepository from "../repositories/classes.repository.js";
import { httpError } from "../utils/http-error.js";

function generateJoinCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

export async function createClass(professorId, name, semester) {
  const joinCode = generateJoinCode();
  return classesRepository.createClass(professorId, name, semester, joinCode);
}

export async function listClasses(professorId) {
  return classesRepository.findByProfessor(professorId);
}

export async function updateClass(professorId, classId, name, semester) {
  const cls = await classesRepository.findById(classId);
  if (!cls) throw httpError(404, "Class not found");
  if (cls.professor_id !== professorId) throw httpError(403, "Not authorized to edit this class");
  if (cls.is_archived) throw httpError(400, "Cannot edit an archived class");

  return classesRepository.updateClass(classId, name, semester);
}

export async function archiveClass(professorId, classId) {
  const cls = await classesRepository.findById(classId);
  if (!cls) throw httpError(404, "Class not found");
  if (cls.professor_id !== professorId) throw httpError(403, "Not authorized to archive this class");

  return classesRepository.archiveClass(classId);
}
