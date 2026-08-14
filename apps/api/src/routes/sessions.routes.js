import { Router } from "express";
import * as sessionsController from "../controllers/sessions.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, requireRole("PROFESSOR"), sessionsController.openSession);
router.post("/:id/close", authenticate, requireRole("PROFESSOR"), sessionsController.closeSession);

export default router;
