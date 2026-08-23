import { Router } from "express";
import * as enrollmentsController from "../controllers/enrollments.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { checkAccountStatus } from "../middleware/check-account-status.js";

const router = Router();

router.post("/", authenticate, checkAccountStatus, requireRole("STUDENT"), enrollmentsController.joinClass);
router.get("/", authenticate, checkAccountStatus, requireRole("STUDENT"), enrollmentsController.getMyClasses);

export default router;
