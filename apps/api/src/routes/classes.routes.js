// apps/api/src/routes/classes.routes.js
import { Router } from "express";
import * as classesController from "../controllers/classes.controller.js";
import * as enrollmentsController from "../controllers/enrollments.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.use(requireRole("PROFESSOR"));

router.post("/", classesController.createClass);
router.get("/", classesController.listClasses);
router.put("/:classId", classesController.updateClass);
router.patch("/:classId", classesController.updateClass);
router.patch("/:classId/archive", classesController.archiveClass);
router.post("/:classId/archive", classesController.archiveClass);
router.get("/:classId/students", enrollmentsController.getStudents);
router.post("/:classId/students/:studentId/drop", enrollmentsController.dropStudent);
router.delete("/:classId/students/:studentId", enrollmentsController.dropStudent);

export default router;
