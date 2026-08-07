import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/professors", authenticate, requireRole("ADMIN"), adminController.createProfessor);

export default router;
