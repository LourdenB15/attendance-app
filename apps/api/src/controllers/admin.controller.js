import * as adminService from "../services/admin.service.js";
import { createProfessorSchema } from "../schemas/admin.schema.js";

export async function createProfessor(req, res) {
  const validation = createProfessorSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { fullName, email } = validation.data;

  try {
    const user = await adminService.createProfessor(fullName, email);
    res.status(201).json({ ...user });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error("Create professor error:", error);
    res.status(500).json({ error: "Failed to create professor" });
  }
}
