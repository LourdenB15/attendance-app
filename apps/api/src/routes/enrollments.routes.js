import { Router } from "express";
import * as enrollmentsController from "../controllers/enrollments.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { requirePasswordChange } from "../middleware/require-password-change.js";

const router = Router();

router.post("/", authenticate, requirePasswordChange, requireRole("STUDENT"), enrollmentsController.joinClass);

export default router;
