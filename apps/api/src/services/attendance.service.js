import * as sessionsRepository from "../repositories/sessions.repository.js";
import * as attendanceRepository from "../repositories/attendance-records.repository.js";
import * as enrollmentsRepository from "../repositories/enrollments.repository.js";
import { httpError } from "../utils/http-error.js";

export async function getSessionAttendance(professorId, sessionId) {
  const session = await sessionsRepository.findByIdAndProfessor(sessionId, professorId);
  if (!session) {
    throw httpError(404, "Session not found");
  }
  return attendanceRepository.findForSession(session.class_id, sessionId);
}

export async function overrideAttendance(professorId, sessionId, studentId, status, reason) {
  const session = await sessionsRepository.findByIdAndProfessor(sessionId, professorId);
  if (!session) {
    throw httpError(404, "Session not found");
  }
  
  const enrollment = await enrollmentsRepository.findActiveEnrollment(session.class_id, studentId);
  if (!enrollment) {
    throw httpError(404, "Student is not enrolled in this class");
  }
  return attendanceRepository.upsertOverride(
    sessionId,
    studentId,
    status,
    professorId,
    reason ?? null,
  );
}
