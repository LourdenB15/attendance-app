// apps/api/src/controllers/enrollments.controller.js
import * as enrollmentsService from "../services/enrollments.service.js";

export async function joinClass(req, res) {
  const { joinCode } = req.body;
  if (!joinCode) return res.status(400).json({ error: "joinCode is required" });

  try {
    const enrollment = await enrollmentsService.joinClass(req.user.sub, joinCode);
    res.status(201).json(enrollment);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Join class error:", error);
    res.status(500).json({ error: "Failed to join class" });
  }
}

export async function getMyClasses(req, res) {
  try {
    const classes = await enrollmentsService.getMyClasses(req.user.sub);
    res.status(200).json(classes);
  } catch (error) {
    console.error("Get my classes error:", error);
    res.status(500).json({ error: "Failed to get classes" });
  }
}

export async function getStudents(req, res) {
  const { classId } = req.params;
  try {
    const students = await enrollmentsService.getClassStudents(req.user.sub, classId);
    res.status(200).json(students);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Get class students error:", error);
    res.status(500).json({ error: "Failed to get students" });
  }
}

export async function dropStudent(req, res) {
  const { classId, studentId } = req.params;
  try {
    const dropped = await enrollmentsService.dropStudent(req.user.sub, classId, studentId);
    res.status(200).json(dropped);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Drop student error:", error);
    res.status(500).json({ error: "Failed to drop student" });
  }
}
