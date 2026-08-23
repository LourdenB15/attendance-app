// apps/api/src/controllers/classes.controller.js
import * as classesService from "../services/classes.service.js";

export async function createClass(req, res) {
  const { name, semester } = req.body;
  if (!name || !semester) {
    return res.status(400).json({ error: "Name and semester are required" });
  }

  try {
    const cls = await classesService.createClass(req.user.sub, name, semester);
    res.status(201).json(cls);
  } catch (error) {
    console.error("Create class error:", error);
    res.status(500).json({ error: "Failed to create class" });
  }
}

export async function listClasses(req, res) {
  try {
    const list = await classesService.listClasses(req.user.sub);
    res.status(200).json(list);
  } catch (error) {
    console.error("List classes error:", error);
    res.status(500).json({ error: "Failed to list classes" });
  }
}

export async function updateClass(req, res) {
  const { classId } = req.params;
  const { name, semester } = req.body;
  if (!name || !semester) {
    return res.status(400).json({ error: "Name and semester are required" });
  }

  try {
    const updated = await classesService.updateClass(req.user.sub, classId, name, semester);
    res.status(200).json(updated);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Update class error:", error);
    res.status(500).json({ error: "Failed to update class" });
  }
}

export async function archiveClass(req, res) {
  const { classId } = req.params;

  try {
    const archived = await classesService.archiveClass(req.user.sub, classId);
    res.status(200).json(archived);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("Archive class error:", error);
    res.status(500).json({ error: "Failed to archive class" });
  }
}
