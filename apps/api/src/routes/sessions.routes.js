import { Router } from "express";
import * as sessionsController from "../controllers/sessions.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { requirePasswordChange } from "../middleware/require-password-change.js";

const router = Router();

router.post("/", authenticate, requirePasswordChange, requireRole("PROFESSOR"), sessionsController.openSession);
router.post("/:id/close", authenticate, requirePasswordChange, requireRole("PROFESSOR"), sessionsController.closeSession);

export default router;
