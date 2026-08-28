import { Router, Request, Response } from "express";
import { SettingService } from "../services/setting.service.js";
import { ResourceService } from "../services/resource.service.js";
import { asyncHandler } from "../middlewares/errorHandler.middleware.js";

const router = Router();

// Public Site Settings
router.get(
  "/settings",
  asyncHandler(async (_req: Request, res: Response) => {
    const settings = await SettingService.getSettings();
    return res.json({
      success: true,
      settings,
    });
  })
);

// Public Resource Catalog
router.get(
  "/resources",
  asyncHandler(async (_req: Request, res: Response) => {
    const resources = await ResourceService.getPublicResources();
    return res.json({
      success: true,
      count: resources.length,
      resources,
    });
  })
);

// Public Single Resource Details
router.get(
  "/resources/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const resource = await ResourceService.getResource(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบสินค้าที่ต้องการ",
      });
    }

    // Sanitize before returning to public
    const sanitized = {
      id: resource.itemId,
      itemId: resource.itemId,
      title: resource.title,
      category: resource.category,
      shortDescription: resource.shortDescription,
      fullDescription: resource.fullDescription,
      price: resource.price,
      actionType: resource.actionType || "link",
      imageUrl: resource.imageUrl,
      videoUrl: resource.videoUrl,
      warning: resource.warning,
      tags: resource.tags || [],
      fileSize: resource.fileSize,
      isOutOfStock: resource.isOutOfStock,
      isPopular: resource.isPopular,
      isFeatured: resource.isFeatured,
      requiresLogin: resource.requiresLogin,
      dateAdded: resource.dateAdded,
      downloadLinks: (resource.downloadLinks || []).map((dl: any) => ({
        label: dl.label,
        url: dl.url ? "protected" : "",
      })),
    };

    return res.json({
      success: true,
      resource: sanitized,
    });
  })
);

export default router;
