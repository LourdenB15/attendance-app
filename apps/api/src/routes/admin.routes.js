// apps/api/src/routes/admin.routes.js
import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.use(requireRole("ADMIN"));

router.post("/professors", adminController.createProfessor);
router.get("/users", adminController.listUsers);
router.patch("/users/:userId/deactivate", adminController.deactivateUser);
router.post("/users/:userId/deactivate", adminController.deactivateUser);

export default router;
