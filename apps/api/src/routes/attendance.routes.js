import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { checkAccountStatus } from "../middleware/check-account-status.js";

const router = Router();

router.get("/", authenticate, checkAccountStatus, requireRole("STUDENT"), attendanceController.getMyAttendance);

export default router;
