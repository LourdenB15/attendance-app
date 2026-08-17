import { Router } from "express";
import * as sessionsController from "../controllers/sessions.controller.js";
import * as attendanceController from "../controllers/attendance.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { checkAccountStatus } from "../middleware/check-account-status.js";

const router = Router();

router.post("/", authenticate, checkAccountStatus, requireRole("PROFESSOR"), sessionsController.openSession);
router.post("/:id/close", authenticate, checkAccountStatus, requireRole("PROFESSOR"), sessionsController.closeSession);
router.get("/:id/attendance", authenticate, checkAccountStatus, requireRole("PROFESSOR"), attendanceController.getAttendance);
router.post("/:id/attendance", authenticate, checkAccountStatus, requireRole("PROFESSOR"), attendanceController.overrideAttendance);

export default router;
