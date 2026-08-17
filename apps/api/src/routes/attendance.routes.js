import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { requirePasswordChange } from "../middleware/require-password-change.js";

const router = Router();

router.get("/", authenticate, requirePasswordChange, requireRole("STUDENT"), attendanceController.getMyAttendance);

export default router;
