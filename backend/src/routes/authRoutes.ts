import { Router } from "express";
import {
  deleteAccount,
  enable2FA,
  generate2FA,
  getSessions,
  login,
  logoutSession,
  refreshToken,
  register,
  verifyEmail,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkUserStatus } from "../middleware/statusMiddleware";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshToken);
router.get("/verify-email", verifyEmail);
router.get("/sessions", authMiddleware, checkUserStatus, getSessions);
router.delete(
  "/sessions/:sessionId",
  authMiddleware,
  checkUserStatus,
  logoutSession,
);
router.post("/2fa/generate", authMiddleware, checkUserStatus, generate2FA);
router.post("/2fa/enable", authMiddleware, checkUserStatus, enable2FA);
router.delete("/account", authMiddleware, checkUserStatus, deleteAccount);

export default router;
