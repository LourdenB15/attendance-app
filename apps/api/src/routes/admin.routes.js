import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { checkAccountStatus } from "../middleware/check-account-status.js";

const router = Router();

router.post("/professors", authenticate, checkAccountStatus, requireRole("ADMIN"), adminController.createProfessor);
router.get("/users", authenticate, checkAccountStatus, requireRole("ADMIN"), adminController.listUsers);
router.post("/users/:id/deactivate", authenticate, checkAccountStatus, requireRole("ADMIN"), adminController.deactivateUser);

export default router;
