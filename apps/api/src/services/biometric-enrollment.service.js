import * as biometricEnrollmentsRepository from "../repositories/biometric-enrollments.repository.js";
import * as usersRepository from "../repositories/users.repository.js";
import { enroll } from "../integrations/liveness/client.js";
import { httpError } from "../utils/http-error.js";

export async function enrollStudent(studentId, livenessResult) {
  const student = await usersRepository.findById(studentId);
  if (!student) {
    throw httpError(404, "Student not found");
  }

  const saasEnrollment = await enroll(livenessResult, student.full_name);
  const enrollment = await biometricEnrollmentsRepository.replaceActiveEnrollment(studentId, saasEnrollment.id);

  return enrollment;
}

export async function getStudentEnrollmentStatus(studentId) {
  const enrollment = await biometricEnrollmentsRepository.findActiveByStudent(studentId);
  return {
    isEnrolled: Boolean(enrollment),
    enrolledAt: enrollment?.enrolled_at || null,
    status: enrollment?.status || "NOT_ENROLLED",
  };
}

