import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes.js";
import statsRoutes from "./stats.routes.js";
import downloadRoutes from "./download.routes.js";
import adminRoutes from "./admin.routes.js";
import publicRoutes from "./public.routes.js";
import { getDbStatus } from "../config/db.js";

const apiRouter = Router();

// Health Check
apiRouter.get("/health", (_req: Request, res: Response) => {
  const dbStatus = getDbStatus();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(1)}s`,
    database: dbStatus.state,
    version: "3.0.0-ultra",
  });
});

// Self-Documenting API Manifest
apiRouter.get("/docs", (_req: Request, res: Response) => {
  res.json({
    name: "Zorix Shop / NexSpec API Engine",
    version: "3.0.0-ultra",
    endpoints: {
      public: [
        "GET  /api/settings",
        "GET  /api/resources",
        "GET  /api/resources/:id",
      ],
      auth: [
        "POST /api/auth/register",
        "POST /api/auth/login",
        "POST /api/auth/logout",
        "GET  /api/auth/me",
        "PUT  /api/auth/me",
        "POST /api/auth/history",
        "GET  /api/auth/google",
        "GET  /api/auth/discord",
      ],
      stats: [
        "GET  /api/stats",
        "POST /api/stats/view",
        "POST /api/stats/download",
      ],
      downloads: [
        "POST /api/verify-captcha",
        "GET  /api/download/:key",
        "POST /api/buy",
      ],
      admin: [
        "GET    /api/admin/metrics",
        "POST   /api/admin/cache/flush",
        "GET    /api/admin/settings",
        "PUT    /api/admin/settings",
        "GET    /api/admin/users",
        "DELETE /api/admin/users/:id",
        "GET    /api/admin/resources",
        "POST   /api/admin/resources",
        "PUT    /api/admin/resources/:id",
        "DELETE /api/admin/resources/:id",
        "POST   /api/admin/resources/clear-all",
      ],
    },
  });
});

// Mount Sub-routers
apiRouter.use("/", publicRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/stats", statsRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/", downloadRoutes);

export default apiRouter;
