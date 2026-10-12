import * as enrollmentsRepository from "../repositories/enrollments.repository.js";
import * as classesRepository from "../repositories/classes.repository.js";
import * as biometricEnrollmentsRepository from "../repositories/biometric-enrollments.repository.js";
import { httpError } from "../utils/http-error.js";

export async function joinClass(studentId, joinCode) {
  const faceProfile = await biometricEnrollmentsRepository.findActiveByStudent(studentId);
  if (!faceProfile) {
    throw httpError(403, "Set up your face profile before joining a class.", "FACE_SETUP_REQUIRED");
  }

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

export async function getStudents(userId, role, classId) {
  if (role === "PROFESSOR") {
    const foundClass = await classesRepository.findByIdAndProfessor(classId, userId);
    if (!foundClass) {
      throw httpError(404, "Class not found");
    }
  } else if (role === "STUDENT") {
    const enrollment = await enrollmentsRepository.findActiveEnrollment(classId, userId);
    if (!enrollment) {
      throw httpError(403, "You are not enrolled in this class");
    }
  } else if (role !== "ADMIN") {
    throw httpError(403, "Access denied");
  }

  const students = await enrollmentsRepository.findStudentsByClass(classId);
  if (role === "STUDENT") {
    return students.filter((s) => s.status === "ACTIVE");
  }
  return students;
}

export async function restoreStudent(professorId, classId, studentId) {
  const restored = await enrollmentsRepository.restoreEnrollment(classId, studentId, professorId);
  if (!restored) {
    throw httpError(404, "Dropped enrollment not found");
  }
  return restored;
}

export async function dropStudent(professorId, classId, studentId) {
  const dropped = await enrollmentsRepository.dropEnrollment(classId, studentId, professorId);
  if (!dropped) {
    throw httpError(404, "Enrollment not found");
  }
  return dropped;
}
