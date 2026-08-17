import { Router } from "express";
import * as checkInController from "../controllers/check-in.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { checkAccountStatus } from "../middleware/check-account-status.js";

const router = Router();

router.post("/", authenticate, checkAccountStatus, requireRole("STUDENT"), checkInController.checkIn);

export default router;
