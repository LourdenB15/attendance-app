import * as sessionsService from "../services/sessions.service.js";
import { openSessionSchema } from "../schemas/sessions.schema.js";

export async function openSession(req, res) {
  const validation = openSessionSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { classId, durationMinutes, label } = validation.data;

  try {
    const session = await sessionsService.openSession(
      req.user.sub,
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
  try {
    const session = await sessionsService.closeSession(req.user.sub, req.params.id);
    res.status(200).json(session);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Close session error:", error);
    res.status(500).json({ error: "Failed to close session" });
  }
}
