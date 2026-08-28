import { Router } from "express";
import passport from "passport";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth, optionalAuth } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";

const router = Router();

// Credentials Authentication
router.post("/register", authLimiter, asyncHandler(AuthController.register));
router.post("/login", authLimiter, asyncHandler(AuthController.login));
router.post("/logout", asyncHandler(AuthController.logout));

// Profile & History
router.get("/me", optionalAuth, asyncHandler(AuthController.me));
router.put("/me", requireAuth, asyncHandler(AuthController.updateProfile));
router.post("/history", requireAuth, asyncHandler(AuthController.addHistory));

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/?oauth_error=google",
  }),
  AuthController.handleOAuthCallback
);

// Discord OAuth
router.get(
  "/discord",
  passport.authenticate("discord", {
    scope: ["identify", "email"],
    session: false,
  })
);

router.get(
  "/discord/callback",
  passport.authenticate("discord", {
    session: false,
    failureRedirect: "/?oauth_error=discord",
  }),
  AuthController.handleOAuthCallback
);

export default router;
