import { Router } from "express";
import * as classesController from "../controllers/classes.controller.js";
import * as enrollmentsController from "../controllers/enrollments.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { checkAccountStatus } from "../middleware/check-account-status.js";

const router = Router();

router.post("/", authenticate, checkAccountStatus, requireRole("PROFESSOR"), classesController.createClass);
router.get("/", authenticate, checkAccountStatus, requireRole("PROFESSOR"), classesController.listClasses);
router.get("/:classId/students", authenticate, checkAccountStatus, requireRole("PROFESSOR"), enrollmentsController.getStudents);
router.post("/:classId/students/:studentId/drop", authenticate, checkAccountStatus, requireRole("PROFESSOR"), enrollmentsController.dropStudent);
router.patch("/:id", authenticate, checkAccountStatus, requireRole("PROFESSOR"), classesController.updateClass);
router.post("/:id/archive", authenticate, checkAccountStatus, requireRole("PROFESSOR"), classesController.archiveClass);

export default router;
