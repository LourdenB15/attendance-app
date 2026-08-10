import { Router } from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import biometricEnrollmentRoutes from "./biometric-enrollment.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/biometric-enrollments", biometricEnrollmentRoutes);

export default router;