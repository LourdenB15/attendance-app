import * as classesService from "../services/classes.service.js";
import { createClassSchema } from "../schemas/classes.schema.js";

export async function createClass(req, res) {
  const validation = createClassSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { name, semester, section } = validation.data;

  try {
    const created = await classesService.createClass(
      req.user.sub,
      name,
      semester,
      section,
    );
    res.status(201).json(created);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Create class error:", error);
    res.status(500).json({ error: "Failed to create class" });
  }
}


export async function listClasses(req, res) {
  try {
    const classes = await classesService.listClasses(req.user.sub);
    res.status(200).json(classes);
  } catch (error) {
    console.error("List classes error:", error);
    res.status(500).json({ error: "Failed to load classes" });
  }
}
