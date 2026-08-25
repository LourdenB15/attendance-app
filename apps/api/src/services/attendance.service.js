import * as sessionsRepository from "../repositories/sessions.repository.js";
import * as attendanceRepository from "../repositories/attendance-records.repository.js";
import * as enrollmentsRepository from "../repositories/enrollments.repository.js";
import * as classesRepository from "../repositories/classes.repository.js";
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

export async function getMyAttendance(studentId) {
  return attendanceRepository.findForStudent(studentId);
}

export async function getClassAttendanceHistory(professorId, classId) {
  const foundClass = await classesRepository.findByIdAndProfessor(classId, professorId);
  if (!foundClass) {
    throw httpError(404, "Class not found");
  }
  return attendanceRepository.findSessionsWithStatsByClass(classId, professorId);
}

export async function getClassAttendanceSummary(professorId, classId) {
  const foundClass = await classesRepository.findByIdAndProfessor(classId, professorId);
  if (!foundClass) {
    throw httpError(404, "Class not found");
  }
  return attendanceRepository.findSectionAttendanceSummary(classId, professorId);
}
