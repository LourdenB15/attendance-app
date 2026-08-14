import * as sessionsRepository from "../repositories/sessions.repository.js";
import * as classesRepository from "../repositories/classes.repository.js";
import { httpError } from "../utils/http-error.js";

const DEFAULT_DURATION_MINUTES = 60;
const UNIQUE_VIOLATION = "23505";

export async function openSession(professorId, classId, durationMinutes, label) {
  const foundClass = await classesRepository.findByIdAndProfessor(classId, professorId);
  if (!foundClass) {
    throw httpError(404, "Class not found");
  }

  const minutes = durationMinutes ?? DEFAULT_DURATION_MINUTES;
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

  try {
    return await sessionsRepository.createSession(
      classId,
      professorId,
      label ?? null,
      expiresAt,
    );
  } catch (error) {
    if (error.code === UNIQUE_VIOLATION) {
      throw httpError(409, "This class already has an open session — close it first");
    }
    throw error;
  }
}

export async function closeSession(professorId, sessionId) {
  const closed = await sessionsRepository.closeSession(sessionId, professorId);
  if (!closed) {
    throw httpError(404, "No open session found for you to close");
  }
  return closed;
}
