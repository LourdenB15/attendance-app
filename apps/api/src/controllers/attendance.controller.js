import * as attendanceService from "../services/attendance.service.js";
import { overrideAttendanceSchema } from "../schemas/attendance.schema.js";

export async function getAttendance(req, res) {
  try {
    const attendance = await attendanceService.getSessionAttendance(
      req.user.sub,
      req.params.id,
    );
    res.status(200).json(attendance);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Get attendance error:", error);
    res.status(500).json({ error: "Failed to load attendance" });
  }
}

export async function overrideAttendance(req, res) {
  const validation = overrideAttendanceSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { studentId, status, reason } = validation.data;

  try {
    const record = await attendanceService.overrideAttendance(
      req.user.sub,
      req.params.id,
      studentId,
      status,
      reason,
    );
    res.status(200).json(record);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Override attendance error:", error);
    res.status(500).json({ error: "Failed to override attendance" });
  }
}
