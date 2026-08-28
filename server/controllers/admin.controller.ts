import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { ResourceService } from "../services/resource.service.js";
import { SettingService } from "../services/setting.service.js";
import { MemoryCacheService } from "../services/cache.service.js";
import { getDbStatus } from "../config/db.js";
import { StatsService } from "../services/stats.service.js";

export class AdminController {
  /**
   * System Telemetry & Health Metrics
   */
  static getMetrics = async (_req: Request, res: Response) => {
    const memoryUsage = process.memoryUsage();
    const cacheMetrics = MemoryCacheService.getMetrics();
    const dbStatus = getDbStatus();
    const stats = await StatsService.getStats();
    const publicResources = await ResourceService.getPublicResources();

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db: dbStatus,
      cache: cacheMetrics,
      counts: {
        users: stats.users,
        views: stats.views,
        downloads: stats.downloads,
        products: publicResources.length,
      },
      memory: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      },
    });
  };

  /**
   * Flush Cache
   */
  static flushCache = async (_req: Request, res: Response) => {
    MemoryCacheService.flush();
    return res.json({
      success: true,
      message: "ล้างแคชระบบสำเร็จเรียบร้อยแล้ว",
    });
  };

  /**
   * Get Site Settings
   */
  static getSettings = async (_req: Request, res: Response) => {
    const settings = await SettingService.getSettings();
    return res.json({
      success: true,
      settings,
    });
  };

  /**
   * Update Site Settings
   */
  static updateSettings = async (req: Request, res: Response) => {
    const updates = req.body || {};
    const settings = await SettingService.updateSettings(updates);
    return res.json({
      success: true,
      message: "บันทึกการตั้งค่าเว็บไซต์สำเร็จ",
      settings,
    });
  };

  /**
   * List all registered users
   */
  static getUsers = async (_req: Request, res: Response) => {
    const users = await AuthService.getAllUsers();
    return res.json({
      success: true,
      count: users.length,
      users,
    });
  };

  /**
   * Delete user
   */
  static deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    await AuthService.deleteUser(id);
    return res.json({
      success: true,
      message: "ลบผู้ใช้สำเร็จ",
    });
  };

  /**
   * List all resources (Admin Full View)
   */
  static getResources = async (_req: Request, res: Response) => {
    const resources = await ResourceService.getAdminResources();
    return res.json({
      success: true,
      count: resources.length,
      resources,
    });
  };

  /**
   * Create new resource
   */
  static createResource = async (req: Request, res: Response) => {
    const data = req.body || {};
    if (!data.title) {
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุชื่อสินค้า",
      });
    }

    const created = await ResourceService.createResource(data);
    return res.status(201).json({
      success: true,
      message: "เพิ่มสินค้าใหม่สำเร็จ",
      resource: created,
    });
  };

  /**
   * Update existing resource
   */
  static updateResource = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุรหัสสินค้า (Item ID)",
      });
    }

    try {
      const updated = await ResourceService.updateResource(id, data);
      return res.json({
        success: true,
        message: "อัปเดตสินค้าสำเร็จ",
        resource: updated,
      });
    } catch (err: any) {
      return res.status(404).json({
        success: false,
        error: err.message || "เกิดข้อผิดพลาดในการอัปเดตสินค้า",
      });
    }
  };

  /**
   * Delete single resource
   */
  static deleteResource = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุรหัสสินค้า",
      });
    }

    await ResourceService.deleteResource(id);
    return res.json({
      success: true,
      message: "ลบสินค้าสำเร็จ",
    });
  };

  /**
   * Clear all resources
   */
  static clearAllResources = async (_req: Request, res: Response) => {
    await ResourceService.clearAllResources();
    return res.json({
      success: true,
      message: "ลบสินค้าทั้งหมดในระบบเรียบร้อยแล้ว",
    });
  };
}
