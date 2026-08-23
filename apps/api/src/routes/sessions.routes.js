// apps/api/src/routes/sessions.routes.js
import { Router } from "express";
import * as sessionsController from "../controllers/sessions.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.use(requireRole("PROFESSOR"));

router.post("/", sessionsController.openSession);
router.post("/open", sessionsController.openSession);
router.post("/:sessionId/close", sessionsController.closeSession);
router.get("/:sessionId/attendance", sessionsController.getAttendance);
router.post("/:sessionId/attendance", sessionsController.overrideAttendance);
router.post("/:sessionId/override", sessionsController.overrideAttendance);

export default router;
