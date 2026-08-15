import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { requirePasswordChange } from "../middleware/require-password-change.js";

const router = Router();

router.post("/professors", authenticate, requirePasswordChange, requireRole("ADMIN"), adminController.createProfessor);

export default router;
