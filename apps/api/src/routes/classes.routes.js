import { Router } from "express";
import * as classesController from "../controllers/classes.controller.js";
import * as enrollmentsController from "../controllers/enrollments.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, requireRole("PROFESSOR"), classesController.createClass);
router.get("/", authenticate, requireRole("PROFESSOR"), classesController.listClasses);
router.get("/:classId/students", authenticate, requireRole("PROFESSOR"), enrollmentsController.getStudents);

export default router;
