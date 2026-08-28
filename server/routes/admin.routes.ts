import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";

const router = Router();

// Protect all admin routes with requireAdmin middleware
router.use(requireAdmin);

// System telemetry & cache
router.get("/metrics", asyncHandler(AdminController.getMetrics));
router.post("/cache/flush", asyncHandler(AdminController.flushCache));

// Site Settings
router.get("/settings", asyncHandler(AdminController.getSettings));
router.put("/settings", asyncHandler(AdminController.updateSettings));

// User Management
router.get("/users", asyncHandler(AdminController.getUsers));
router.delete("/users/:id", asyncHandler(AdminController.deleteUser));

// Resource & Product CRUD
router.get("/resources", asyncHandler(AdminController.getResources));
router.post("/resources", asyncHandler(AdminController.createResource));
router.put("/resources/:id", asyncHandler(AdminController.updateResource));
router.delete("/resources/:id", asyncHandler(AdminController.deleteResource));
router.post("/resources/clear-all", asyncHandler(AdminController.clearAllResources));

export default router;
