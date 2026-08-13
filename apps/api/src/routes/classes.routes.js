import { Router } from "express";
import * as classesController from "../controllers/classes.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, requireRole("PROFESSOR"), classesController.createClass);
router.get("/", authenticate, requireRole("PROFESSOR"), classesController.listClasses);

export default router;
