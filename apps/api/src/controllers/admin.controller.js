// apps/api/src/controllers/admin.controller.js
import * as adminService from "../services/admin.service.js";

export async function createProfessor(req, res) {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    return res.status(400).json({ error: "fullName and email are required" });
  }

  try {
    const { user, temporaryPassword } = await adminService.createProfessor(fullName, email);
    res.status(201).json({ user, temporaryPassword });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error("Create professor error:", error);
    res.status(500).json({ error: "Failed to create professor" });
  }
}

export async function listUsers(req, res) {
  try {
    const role = req.query.role || null;
    const users = await adminService.listUsers(role);
    res.status(200).json(users);
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ error: "Failed to list users" });
  }
}

export async function deactivateUser(req, res) {
  const { userId } = req.params;
  try {
    const user = await adminService.deactivateUser(userId);
    res.status(200).json(user);
  } catch (error) {
    console.error("Deactivate user error:", error);
    res.status(500).json({ error: "Failed to deactivate user" });
  }
}
