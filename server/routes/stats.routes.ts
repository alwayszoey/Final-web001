import { Router } from "express";
import { StatsController } from "../controllers/stats.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";

const router = Router();

router.get("/", asyncHandler(StatsController.getStats));
router.post("/view", asyncHandler(StatsController.recordView));
router.post("/download", asyncHandler(StatsController.recordDownload));
router.post("/reset-downloads", requireAdmin, asyncHandler(StatsController.resetDownloads));

export default router;
