import * as enrollmentsService from "../services/enrollments.service.js";
import { joinClassSchema } from "../schemas/enrollments.schema.js";

export async function joinClass(req, res) {
  const validation = joinClassSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  try {
    const enrollment = await enrollmentsService.joinClass(
      req.user.sub,
      validation.data.joinCode,
    );
    res.status(201).json(enrollment);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Join class error:", error);
    res.status(500).json({ error: "Failed to join class" });
  }
}

export async function getStudents(req, res) {
  try {
    const students = await enrollmentsService.getStudents(
      req.user.sub,
      req.params.classId,
    );
    res.status(200).json(students);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Get students error:", error);
    res.status(500).json({ error: "Failed to load students" });
  }
}
