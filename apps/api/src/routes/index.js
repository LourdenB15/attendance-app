import { Router } from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import biometricEnrollmentRoutes from "./biometric-enrollment.routes.js";
import checkInRoutes from "./check-in.routes.js";
import classesRoutes from "./classes.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/biometric-enrollments", biometricEnrollmentRoutes);
router.use("/check-ins", checkInRoutes);
router.use("/classes", classesRoutes);

export default router;