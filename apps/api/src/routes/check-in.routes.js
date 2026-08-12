import { Router } from "express";
import * as checkInController from "../controllers/check-in.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, requireRole("STUDENT"), checkInController.checkIn);

export default router;
