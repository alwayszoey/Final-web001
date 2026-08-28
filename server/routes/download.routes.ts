import { Router } from "express";
import { DownloadController } from "../controllers/download.controller.js";
import { downloadLimiter } from "../middlewares/rateLimit.middleware.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";

const router = Router();

// Captcha verification endpoint
router.post("/verify-captcha", downloadLimiter, asyncHandler(DownloadController.verifyCaptcha));

// Direct download redirect endpoint
router.get("/download/:key", asyncHandler(DownloadController.handleDownloadRedirect));

// Purchase details endpoint
router.post("/buy", asyncHandler(DownloadController.handleBuy));

export default router;
