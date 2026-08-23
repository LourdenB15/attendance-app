// apps/api/src/routes/biometric-enrollment.routes.js
import { Router } from "express";
import * as biometricsController from "../controllers/biometrics.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.use(requireRole("STUDENT"));

router.post("/", biometricsController.enrollBiometric);

export default router;
