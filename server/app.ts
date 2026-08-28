import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import passport from "passport";
import "./config/passport.js";
import apiRouter from "./routes/index.js";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import { globalErrorHandler } from "./middlewares/errorHandler.middleware.js";
import { requestTelemetry, inputSanitizer, botMitigation } from "./middlewares/security.middleware.js";
import { connectDB } from "./config/db.js";

export function createExpressApp() {
  const app = express();

  // Trust reverse proxy (Nginx / Cloud Run)
  app.set("trust proxy", 1);

  // Initialize DB asynchronously in the background
  connectDB().catch((err) => {
    console.warn("[MongoDB] Deferred initial connection:", err.message || err);
  });

  // Enterprise Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows dynamic SPA client scripts & turnstile
      crossOriginEmbedderPolicy: false,
    })
  );

  // HTTP Parameter Pollution Protection
  app.use(hpp());

  // CORS Policy Configuration
  app.use(
    cors({
      origin: true,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "x-admin-token", "x-request-id"],
      exposedHeaders: ["X-Request-Id", "X-Response-Time"],
    })
  );

  // Body and Cookie Parsers
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());

  // Passport Initialization
  app.use(passport.initialize());

  // Security Telemetry, Sanitization & Bot Mitigation
  app.use(requestTelemetry);
  app.use(inputSanitizer);
  app.use(botMitigation);

  // Rate Limiter on API Endpoints
  app.use("/api", apiLimiter);

  // Mount API Endpoints
  app.use("/api", apiRouter);

  // Global Error Handler
  app.use(globalErrorHandler);

  return app;
}

export default createExpressApp;
