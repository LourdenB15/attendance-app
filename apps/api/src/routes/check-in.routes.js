import { Router } from "express";
import * as checkInController from "../controllers/check-in.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { requirePasswordChange } from "../middleware/require-password-change.js";

const router = Router();

router.post("/", authenticate, requirePasswordChange, requireRole("STUDENT"), checkInController.checkIn);

export default router;
