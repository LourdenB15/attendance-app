// apps/api/src/routes/auth.routes.js
import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.me);
router.post("/logout", authController.logout);
router.post("/change-password", authenticate, authController.changePassword);
router.post("/google", authController.loginWithGoogle);

export default router;
