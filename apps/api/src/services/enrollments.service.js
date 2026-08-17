import * as enrollmentsRepository from "../repositories/enrollments.repository.js";
import * as classesRepository from "../repositories/classes.repository.js";
import { httpError } from "../utils/http-error.js";

const UNIQUE_VIOLATION = "23505";

export async function joinClass(studentId, joinCode) {
  const code = joinCode.trim().toUpperCase();

  const foundClass = await classesRepository.findByJoinCode(code);
  if (!foundClass) {
    throw httpError(404, "No class found for that join code");
  }

  try {
    return await enrollmentsRepository.createEnrollment(
      foundClass.id,
      studentId,
      "SELF_ENROLLED",
    );
  } catch (error) {
    if (error.code === UNIQUE_VIOLATION) {
      throw httpError(409, "You are already enrolled in this class");
    }
    throw error;
  }
}

export async function getStudents(professorId, classId) {
  const foundClass = await classesRepository.findByIdAndProfessor(classId, professorId);
  if (!foundClass) {
    throw httpError(404, "Class not found");
  }
  return enrollmentsRepository.findStudentsByClass(classId);
}

export async function getMyClasses(studentId) {
  return enrollmentsRepository.findClassesByStudent(studentId);
}
