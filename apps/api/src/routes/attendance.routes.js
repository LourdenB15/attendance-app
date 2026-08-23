// apps/api/src/routes/attendance.routes.js
import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.use(requireRole("STUDENT"));

router.get("/", attendanceController.getMyAttendance);
router.get("/my-records", attendanceController.getMyAttendance);

export default router;
