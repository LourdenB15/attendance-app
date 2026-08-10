import { Router } from "express";
import * as biometricController from "../controllers/biometric-enrollment.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, requireRole("STUDENT"), biometricController.enrollBiometric);

export default router;
