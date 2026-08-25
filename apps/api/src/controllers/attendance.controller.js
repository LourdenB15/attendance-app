import * as attendanceService from "../services/attendance.service.js";
import { overrideAttendanceSchema } from "../schemas/attendance.schema.js";

export async function getAttendance(req, res) {
  const professorId = req.user.sub || req.user.id;
  try {
    const attendance = await attendanceService.getSessionAttendance(
      professorId,
      req.params.id,
    );
    res.status(200).json(attendance);
  } catch (error) {
    const status = error.status || error.statusCode || 500;
    console.error("Get attendance error:", error);
    res.status(status).json({ error: error.message || "Failed to load attendance" });
  }
}

export async function overrideAttendance(req, res) {
  const validation = overrideAttendanceSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { studentId, status, reason } = validation.data;
  const professorId = req.user.sub || req.user.id;

  try {
    const record = await attendanceService.overrideAttendance(
      professorId,
      req.params.id,
      studentId,
      status,
      reason,
    );
    res.status(200).json(record);
  } catch (error) {
    const status = error.status || error.statusCode || 500;
    console.error("Override attendance error:", error);
    res.status(status).json({ error: error.message || "Failed to override attendance" });
  }
}

export async function getMyAttendance(req, res) {
  const studentId = req.user.sub || req.user.id;
  try {
    const attendance = await attendanceService.getMyAttendance(studentId);
    res.status(200).json(attendance);
  } catch (error) {
    const status = error.status || error.statusCode || 500;
    console.error("Get my attendance error:", error);
    res.status(status).json({ error: error.message || "Failed to load attendance" });
  }
}

export async function getClassAttendanceHistory(req, res) {
  const professorId = req.user.sub || req.user.id;
  try {
    const history = await attendanceService.getClassAttendanceHistory(
      professorId,
      req.params.classId,
    );
    res.status(200).json(history);
  } catch (error) {
    const status = error.status || error.statusCode || 500;
    console.error("Get class attendance history error:", error);
    res.status(status).json({ error: error.message || "Failed to load class attendance history" });
  }
}

export async function getClassAttendanceSummary(req, res) {
  const professorId = req.user.sub || req.user.id;
  try {
    const summary = await attendanceService.getClassAttendanceSummary(
      professorId,
      req.params.classId,
    );
    res.status(200).json(summary);
  } catch (error) {
    const status = error.status || error.statusCode || 500;
    console.error("Get class attendance summary error:", error);
    res.status(status).json({ error: error.message || "Failed to load class attendance summary" });
  }
}
