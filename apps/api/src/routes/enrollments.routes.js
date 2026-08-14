import { Router } from "express";
import * as enrollmentsController from "../controllers/enrollments.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, requireRole("STUDENT"), enrollmentsController.joinClass);

export default router;
