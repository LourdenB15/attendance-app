import * as sessionsService from "../services/sessions.service.js";
import { openSessionSchema } from "../schemas/sessions.schema.js";

export async function openSession(req, res) {
  const validation = openSessionSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { classId, durationMinutes, label } = validation.data;
  const professorId = req.user.sub || req.user.id;

  try {
    const session = await sessionsService.openSession(
      professorId,
      classId,
      durationMinutes,
      label,
    );
    res.status(201).json(session);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Open session error:", error);
    res.status(500).json({ error: "Failed to open session" });
  }
}

export async function closeSession(req, res) {
  const professorId = req.user.sub || req.user.id;
  try {
    const session = await sessionsService.closeSession(professorId, req.params.id);
    res.status(200).json(session);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Close session error:", error);
    res.status(500).json({ error: "Failed to close session" });
  }
}

export async function getActiveSession(req, res) {
  const { classId } = req.query;
  if (!classId) {
    return res.status(400).json({ error: "classId query param is required" });
  }
  const professorId = req.user.sub || req.user.id;

  try {
    const session = await sessionsService.getActiveSession(professorId, classId);
    res.json(session);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Get active session error:", error);
    res.status(500).json({ error: "Failed to fetch active session" });
  }
}
