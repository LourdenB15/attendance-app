import * as biometricEnrollmentsRepository from "../repositories/biometric-enrollments.repository.js";
import * as enrollmentsRepository from "../repositories/enrollments.repository.js";
import * as attemptsRepository from "../repositories/check-in-attempts.repository.js";
import * as attendanceRepository from "../repositories/attendance-records.repository.js";
import * as sessionsRepository from "../repositories/sessions.repository.js";
import { verifyOne } from "../integrations/liveness/client.js";
import { httpError } from "../utils/http-error.js";

export async function checkIn(studentId, sessionId, livenessResult) {
  const session = await sessionsRepository.findById(sessionId);
  if (!session) {
    throw httpError(404, "Session not found");
  }
  if (session.status !== "OPEN") {
    throw httpError(409, "This session is closed");
  }
  if (new Date(session.expires_at) < new Date()) {
    throw httpError(409, "This session has expired");
  }
  
  const classEnrollment = await enrollmentsRepository.findActiveEnrollment(
    session.class_id,
    studentId,
  );
  if (!classEnrollment) {
    throw httpError(409, "You are not enrolled in this class");
  }
  
  const enrollment = await biometricEnrollmentsRepository.findActiveByStudent(studentId);
  if (!enrollment) {
    throw httpError(409, "No active biometric enrollment — enroll your face first");
  }

  let verifyResponse;
  try {
    verifyResponse = await verifyOne(livenessResult, enrollment.liveness_external_id);
  } catch (error) {
    await logErrorAttempt(sessionId, studentId, error);
    throw error;
  }

  const passed = verifyResponse.verified === true;

  const attempt = await attemptsRepository.insertAttempt({
    sessionId,
    studentId,
    outcome: passed ? "SUCCESS" : "FAILURE",
    similarity: verifyResponse.match?.similarity ?? null,
    confidenceLevel: verifyResponse.confidence ?? null,
    identityMatch: passed,
    saasRawResponse: verifyResponse,
  });

  if (!passed) {
    return { present: false, attempt };
  }

  const record = await attendanceRepository.upsertPresent({
    sessionId,
    studentId,
    checkInAttemptId: attempt.id,
    recordedBy: studentId,
  });

  return { present: true, overrideProtected: !record, attempt, record };
}

async function logErrorAttempt(sessionId, studentId, err) {
  try {
    await attemptsRepository.insertAttempt({
      sessionId,
      studentId,
      outcome: "ERROR",
      similarity: null,
      confidenceLevel: null,
      identityMatch: false,
      saasRawResponse: { err: err.message, status: err.status ?? null },
    });
  } catch (error) {
    console.error("Failed to log ERROR check-in attempt:", error);
  }
}
