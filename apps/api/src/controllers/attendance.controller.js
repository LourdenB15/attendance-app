// apps/api/src/controllers/attendance.controller.js
import * as sessionsService from "../services/sessions.service.js";

export async function getMyAttendance(req, res) {
  try {
    const attendance = await sessionsService.getMyAttendance(req.user.sub);
    res.status(200).json(attendance);
  } catch (error) {
    console.error("Get my attendance error:", error);
    res.status(500).json({ error: "Failed to get attendance records" });
  }
}
