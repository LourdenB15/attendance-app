import { Router } from "express";
import * as classesController from "../controllers/classes.controller.js";
import * as enrollmentsController from "../controllers/enrollments.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { requirePasswordChange } from "../middleware/require-password-change.js";

const router = Router();

router.post("/", authenticate, requirePasswordChange, requireRole("PROFESSOR"), classesController.createClass);
router.get("/", authenticate, requirePasswordChange, requireRole("PROFESSOR"), classesController.listClasses);
router.get("/:classId/students", authenticate, requirePasswordChange, requireRole("PROFESSOR"), enrollmentsController.getStudents);

export default router;
