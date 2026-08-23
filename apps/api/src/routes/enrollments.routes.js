// apps/api/src/routes/enrollments.routes.js
import { Router } from "express";
import * as enrollmentsController from "../controllers/enrollments.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// Student endpoints
router.get("/", requireRole("STUDENT"), enrollmentsController.getMyClasses);
router.get("/my-classes", requireRole("STUDENT"), enrollmentsController.getMyClasses);
router.post("/", requireRole("STUDENT"), enrollmentsController.joinClass);
router.post("/join", requireRole("STUDENT"), enrollmentsController.joinClass);

// Professor endpoints
router.get("/classes/:classId/students", requireRole("PROFESSOR"), enrollmentsController.getStudents);
router.delete("/classes/:classId/students/:studentId", requireRole("PROFESSOR"), enrollmentsController.dropStudent);
router.post("/classes/:classId/students/:studentId/drop", requireRole("PROFESSOR"), enrollmentsController.dropStudent);

export default router;
