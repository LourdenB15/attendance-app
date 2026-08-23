// apps/api/src/services/enrollments.service.js
import * as enrollmentsRepository from "../repositories/enrollments.repository.js";
import * as classesRepository from "../repositories/classes.repository.js";
import { httpError } from "../utils/http-error.js";

export async function joinClass(studentId, joinCode) {
  const cls = await classesRepository.findByJoinCode(joinCode);
  if (!cls) throw httpError(404, "Invalid class join code");
  if (cls.is_archived) throw httpError(400, "Cannot join an archived class");

  return enrollmentsRepository.createEnrollment(cls.id, studentId, "SELF_ENROLLED");
}

export async function getMyClasses(studentId) {
  return enrollmentsRepository.findByStudent(studentId);
}

export async function getClassStudents(professorId, classId) {
  const cls = await classesRepository.findById(classId);
  if (!cls) throw httpError(404, "Class not found");
  if (cls.professor_id !== professorId) throw httpError(403, "Not authorized to view this class roster");

  return enrollmentsRepository.findByClass(classId);
}

export async function dropStudent(professorId, classId, studentId) {
  const cls = await classesRepository.findById(classId);
  if (!cls) throw httpError(404, "Class not found");
  if (cls.professor_id !== professorId) throw httpError(403, "Not authorized to manage this class");

  return enrollmentsRepository.dropStudent(classId, studentId);
}
