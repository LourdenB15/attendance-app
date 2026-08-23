// apps/api/src/controllers/sessions.controller.js
import * as sessionsService from "../services/sessions.service.js";

export async function openSession(req, res) {
  const { classId, durationMinutes, label } = req.body;
  if (!classId) return res.status(400).json({ error: "classId is required" });

  try {
    const session = await sessionsService.openSession(
      req.user.sub,
      classId,
      durationMinutes,
      label,
    );
    res.status(201).json(session);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Open session error:", error);
    res.status(500).json({ error: "Failed to open session" });
  }
}

export async function closeSession(req, res) {
  const { sessionId } = req.params;

  try {
    const session = await sessionsService.closeSession(req.user.sub, sessionId);
    res.status(200).json(session);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Close session error:", error);
    res.status(500).json({ error: "Failed to close session" });
  }
}

export async function getAttendance(req, res) {
  const { sessionId } = req.params;

  try {
    const attendance = await sessionsService.getSessionAttendance(req.user.sub, sessionId);
    res.status(200).json(attendance);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Get session attendance error:", error);
    res.status(500).json({ error: "Failed to get attendance" });
  }
}

export async function overrideAttendance(req, res) {
  const { sessionId } = req.params;
  const { studentId, status, reason } = req.body;
  if (!studentId || !status) {
    return res.status(400).json({ error: "studentId and status are required" });
  }

  try {
    const record = await sessionsService.overrideAttendance(
      req.user.sub,
      sessionId,
      studentId,
      status,
      reason,
    );
    res.status(200).json(record);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Override attendance error:", error);
    res.status(500).json({ error: "Failed to override attendance" });
  }
}
