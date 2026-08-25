import { Router } from "express";
import * as biometricController from "../controllers/biometric-enrollment.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { checkAccountStatus } from "../middleware/check-account-status.js";

const router = Router();

router.get("/status", authenticate, checkAccountStatus, requireRole("STUDENT"), biometricController.getEnrollmentStatus);
router.post("/", authenticate, checkAccountStatus, requireRole("STUDENT"), biometricController.enrollBiometric);

export default router;
