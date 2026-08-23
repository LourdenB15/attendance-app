// apps/api/src/routes/index.js
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import classesRoutes from "./classes.routes.js";
import enrollmentsRoutes from "./enrollments.routes.js";
import sessionsRoutes from "./sessions.routes.js";
import attendanceRoutes from "./attendance.routes.js";
import biometricRoutes from "./biometric-enrollment.routes.js";
import checkInRoutes from "./check-in.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/classes", classesRoutes);
router.use("/enrollments", enrollmentsRoutes);
router.use("/sessions", sessionsRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/biometric-enrollments", biometricRoutes);
router.use("/check-ins", checkInRoutes);

export default router;