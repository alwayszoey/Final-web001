import { Request, Response } from "express";
import { StatsService } from "../services/stats.service.js";

export class StatsController {
  /**
   * Get all live statistics
   */
  static getStats = async (_req: Request, res: Response) => {
    const stats = await StatsService.getStats();
    return res.json(stats);
  };

  /**
   * Record a view
   */
  static recordView = async (_req: Request, res: Response) => {
    const views = await StatsService.recordView();
    return res.json({
      success: true,
      views,
    });
  };

  /**
   * Record a download
   */
  static recordDownload = async (req: Request, res: Response) => {
    const { itemId } = req.body || {};
    const result = await StatsService.recordDownload(itemId);
    return res.json({
      success: true,
      ...result,
    });
  };

  /**
   * Reset downloads counter (Admin)
   */
  static resetDownloads = async (_req: Request, res: Response) => {
    const downloads = await StatsService.resetDownloads();
    return res.json({
      success: true,
      downloads,
    });
  };
}
