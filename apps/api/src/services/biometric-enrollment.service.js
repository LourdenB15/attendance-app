import * as biometricEnrollmentsRepository from "../repositories/biometric-enrollments.repository.js";
import * as usersRepository from "../repositories/users.repository.js";
import { enroll, verify } from "../integrations/liveness/client.js";
import { httpError } from "../utils/http-error.js";

export async function enrollStudent(studentId, livenessResult) {
  const student = await usersRepository.findById(studentId);
  if (!student) {
    throw httpError(404, "Student not found");
  }

  // 1:N Duplicate Face Prevention Check (Threshold: 0.70)
  try {
    const duplicateCheck = await verify(livenessResult, 0.70);
    if (duplicateCheck.verified && duplicateCheck.match?.id) {
      const existingOwner =
        await biometricEnrollmentsRepository.findActiveByLivenessExternalId(
          duplicateCheck.match.id,
        );

      // If this face is actively registered to a DIFFERENT student, reject duplicate enrollment
      if (existingOwner && existingOwner.student_id !== studentId) {
        throw httpError(
          409,
          `This biometric face profile is already registered to another student (${existingOwner.full_name}). Each student must register their own unique face profile.`,
        );
      }
    }
  } catch (err) {
    if (err.status === 409) {
      throw err;
    }
    console.warn("Duplicate face pre-check note:", err.message);
  }

  const saasEnrollment = await enroll(livenessResult, student.full_name);
  const enrollment = await biometricEnrollmentsRepository.replaceActiveEnrollment(
    studentId,
    saasEnrollment.id,
  );

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

