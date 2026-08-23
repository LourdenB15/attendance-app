import * as enrollmentsRepository from "../repositories/enrollments.repository.js";
import * as classesRepository from "../repositories/classes.repository.js";
import { httpError } from "../utils/http-error.js";

export async function joinClass(studentId, joinCode) {
  const code = joinCode.trim().toUpperCase();

  const foundClass = await classesRepository.findByJoinCode(code);
  if (!foundClass) {
    throw httpError(404, "No class found for that join code");
  }

  const existing = await enrollmentsRepository.findEnrollment(foundClass.id, studentId);
  if (existing) {
    if (existing.status === "DROPPED") {
      throw httpError(403, "You were removed from this class and cannot rejoin");
    }
    throw httpError(409, "You are already enrolled in this class");
  }

  return enrollmentsRepository.createEnrollment(foundClass.id, studentId, "SELF_ENROLLED");
}

export async function getMyClasses(studentId) {
  return enrollmentsRepository.findClassesByStudent(studentId);
}

export async function getStudents(professorId, classId) {
  const foundClass = await classesRepository.findByIdAndProfessor(classId, professorId);
  if (!foundClass) {
    throw httpError(404, "Class not found");
  }
  return enrollmentsRepository.findStudentsByClass(classId);
}

export async function dropStudent(professorId, classId, studentId) {
  const dropped = await enrollmentsRepository.dropEnrollment(classId, studentId, professorId);
  if (!dropped) {
    throw httpError(404, "Enrollment not found");
  }
  return dropped;
}
