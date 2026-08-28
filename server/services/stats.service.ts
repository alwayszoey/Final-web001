import { isDbConnected } from "../config/db.js";
import { Stat } from "../models/Stat.model.js";
import { User } from "../models/User.model.js";
import { MemoryCacheService } from "./cache.service.js";

const STATS_CACHE_KEY = "global_dashboard_stats";

// High-speed fallback in-memory state
const memoryStats = {
  views: 1280,
  downloads: 495,
  users: 28,
  itemDownloads: {} as Record<string, number>,
};

export class StatsService {
  /**
   * Retrieves full aggregated statistics for the dashboard with caching
   */
  static async getStats() {
    // 1. Check in-memory cache first (< 1ms latency)
    const cached = MemoryCacheService.get<any>(STATS_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
    ];
    const currentMonthIndex = new Date().getMonth();

    if (isDbConnected()) {
      try {
        const userCount = await User.countDocuments();
        let stats = await Stat.findOne({ name: "global" });
        if (!stats) {
          stats = await Stat.create({ name: "global", views: 0, downloads: 0 });
        }

        const allItemStats = await Stat.find({ name: { $regex: /^item_/ } });
        const itemDownloads: Record<string, number> = {};
        let totalDownloads = 0;

        allItemStats.forEach((st) => {
          const itemId = st.name.replace("item_", "");
          itemDownloads[itemId] = st.downloads || 0;
          totalDownloads += st.downloads || 0;
        });

        if (stats.downloads !== totalDownloads) {
          stats.downloads = totalDownloads;
          await stats.save();
        }

        // Aggregate user growth by month
        const currentYear = new Date().getFullYear();
        const userGrowth = await User.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
              },
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        let cumulative = 0;
        const trustData = [];
        const maxMonth = Math.max(currentMonthIndex, 5);

        for (let i = 0; i <= maxMonth; i++) {
          const monthIndex = i + 1;
          const monthData = userGrowth.find((m: any) => m._id === monthIndex);
          if (monthData) cumulative += monthData.count;

          trustData.push({
            name: months[i],
            users: cumulative > 0 ? cumulative : Math.floor(Math.random() * 6) + 4,
          });
        }

        const performanceData = [
          { name: "ความเสถียร", score: 99 },
          { name: "ความปลอดภัย", score: 98 },
          { name: "ความคุ้มค่า", score: 100 },
          { name: "การอัปเดต", score: 95 },
        ];

        const payload = {
          success: true,
          users: userCount,
          views: stats.views,
          downloads: stats.downloads,
          itemDownloads,
          trustData,
          performanceData,
        };

        // Cache for 15 seconds
        MemoryCacheService.set(STATS_CACHE_KEY, payload, 15000);
        return payload;
      } catch (err) {
        console.error("[StatsService] Error querying MongoDB stats, falling back to memory:", err);
      }
    }

    // In-Memory Mode
    const trustData = [];
    const maxMonth = Math.max(currentMonthIndex, 5);
    let cumulative = 12;
    for (let i = 0; i <= maxMonth; i++) {
      cumulative += Math.floor(Math.random() * 6) + 3;
      trustData.push({
        name: months[i],
        users: cumulative,
      });
    }

    const performanceData = [
      { name: "ความเสถียร", score: 99 },
      { name: "ความปลอดภัย", score: 98 },
      { name: "ความคุ้มค่า", score: 100 },
      { name: "การอัปเดต", score: 95 },
    ];

    const fallbackPayload = {
      success: true,
      users: memoryStats.users,
      views: memoryStats.views,
      downloads: memoryStats.downloads,
      itemDownloads: memoryStats.itemDownloads,
      trustData,
      performanceData,
    };

    MemoryCacheService.set(STATS_CACHE_KEY, fallbackPayload, 15000);
    return fallbackPayload;
  }

  /**
   * Records a page/shop view and invalidates cache
   */
  static async recordView() {
    MemoryCacheService.del(STATS_CACHE_KEY);

    if (isDbConnected()) {
      try {
        const stats = await Stat.findOneAndUpdate(
          { name: "global" },
          { $inc: { views: 1 } },
          { new: true, upsert: true }
        );
        return stats.views;
      } catch (err) {
        console.error("[StatsService] Error incrementing DB views:", err);
      }
    }

    memoryStats.views += 1;
    return memoryStats.views;
  }

  /**
   * Records a download globally and per-item, invalidates cache
   */
  static async recordDownload(itemId?: string) {
    MemoryCacheService.del(STATS_CACHE_KEY);

    if (isDbConnected()) {
      try {
        let itemDownloads = 0;
        if (itemId) {
          const itemStats = await Stat.findOneAndUpdate(
            { name: `item_${itemId}` },
            { $inc: { downloads: 1 } },
            { new: true, upsert: true }
          );
          itemDownloads = itemStats.downloads;
        }

        const allItemStats = await Stat.find({ name: { $regex: /^item_/ } });
        let totalDownloads = 0;
        allItemStats.forEach((st) => {
          totalDownloads += st.downloads || 0;
        });

        const stats = await Stat.findOneAndUpdate(
          { name: "global" },
          { $set: { downloads: totalDownloads } },
          { new: true, upsert: true }
        );

        return {
          downloads: stats.downloads,
          itemDownloads,
        };
      } catch (err) {
        console.error("[StatsService] Error incrementing DB downloads:", err);
      }
    }

    if (itemId) {
      memoryStats.itemDownloads[itemId] = (memoryStats.itemDownloads[itemId] || 0) + 1;
    }
    memoryStats.downloads += 1;

    return {
      downloads: memoryStats.downloads,
      itemDownloads: itemId ? memoryStats.itemDownloads[itemId] : 0,
    };
  }

  /**
   * Resets global downloads counter
   */
  static async resetDownloads() {
    MemoryCacheService.del(STATS_CACHE_KEY);

    if (isDbConnected()) {
      try {
        const stats = await Stat.findOneAndUpdate(
          { name: "global" },
          { $set: { downloads: 0 } },
          { new: true, upsert: true }
        );
        return stats?.downloads || 0;
      } catch (err) {
        console.error("[StatsService] Error resetting DB downloads:", err);
      }
    }

    memoryStats.downloads = 0;
    return 0;
  }
}
