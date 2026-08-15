import { Router } from "express";
import * as sessionsController from "../controllers/sessions.controller.js";
import * as attendanceController from "../controllers/attendance.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { requirePasswordChange } from "../middleware/require-password-change.js";

const router = Router();

router.post("/", authenticate, requirePasswordChange, requireRole("PROFESSOR"), sessionsController.openSession);
router.post("/:id/close", authenticate, requirePasswordChange, requireRole("PROFESSOR"), sessionsController.closeSession);
router.get("/:id/attendance", authenticate, requirePasswordChange, requireRole("PROFESSOR"), attendanceController.getAttendance);
router.post("/:id/attendance", authenticate, requirePasswordChange, requireRole("PROFESSOR"), attendanceController.overrideAttendance);

export default router;
