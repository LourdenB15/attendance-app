// apps/api/src/services/sessions.service.js
import * as sessionsRepository from "../repositories/sessions.repository.js";
import * as classesRepository from "../repositories/classes.repository.js";
import * as attendanceRepository from "../repositories/attendance.repository.js";
import { httpError } from "../utils/http-error.js";

export async function openSession(professorId, classId, durationMinutes = 60, label = null) {
  const cls = await classesRepository.findById(classId);
  if (!cls) throw httpError(404, "Class not found");
  if (cls.professor_id !== professorId) throw httpError(403, "Not authorized to start a session for this class");
  if (cls.is_archived) throw httpError(400, "Cannot start a session for an archived class");

  const existing = await sessionsRepository.findOpenByClass(classId);
  if (existing) {
    throw httpError(409, "An active session is already running for this class");
  }

  return sessionsRepository.createSession(classId, professorId, durationMinutes, label);
}

export async function closeSession(professorId, sessionId) {
  const session = await sessionsRepository.findById(sessionId);
  if (!session) throw httpError(404, "Session not found");
  if (session.opened_by !== professorId) throw httpError(403, "Not authorized to close this session");

  return sessionsRepository.closeSession(sessionId);
}

export async function getSessionAttendance(professorId, sessionId) {
  const session = await sessionsRepository.findById(sessionId);
  if (!session) throw httpError(404, "Session not found");
  if (session.opened_by !== professorId) throw httpError(403, "Not authorized to view attendance");

  return attendanceRepository.findBySession(sessionId);
}

export async function overrideAttendance(professorId, sessionId, studentId, status, reason = null) {
  const session = await sessionsRepository.findById(sessionId);
  if (!session) throw httpError(404, "Session not found");
  if (session.opened_by !== professorId) throw httpError(403, "Not authorized to override attendance");

  return attendanceRepository.upsertAttendance(
    sessionId,
    studentId,
    status,
    "MANUAL_OVERRIDE",
    professorId,
    reason,
  );
}

export async function getMyAttendance(studentId) {
  return attendanceRepository.findByStudent(studentId);
}
