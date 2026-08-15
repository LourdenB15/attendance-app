import { Router } from "express";
import * as biometricController from "../controllers/biometric-enrollment.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { requirePasswordChange } from "../middleware/require-password-change.js";

const router = Router();

router.post("/", authenticate, requirePasswordChange, requireRole("STUDENT"), biometricController.enrollBiometric);

export default router;
