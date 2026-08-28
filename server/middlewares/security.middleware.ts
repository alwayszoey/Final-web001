import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { SecurityService } from "../services/security.service.js";

/**
 * Attaches request correlation ID and measures response time
 */
export const requestTelemetry = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers["x-request-id"] as string) || crypto.randomUUID();
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-Id", requestId);

  const start = process.hrtime();
  const originalWriteHead = res.writeHead;

  res.writeHead = function (statusCode: number, ...args: any[]): Response {
    const diff = process.hrtime(start);
    const timeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    if (!res.headersSent) {
      res.setHeader("X-Response-Time", `${timeMs}ms`);
    }
    return originalWriteHead.call(this, statusCode, ...args) as unknown as Response;
  };

  next();
};

/**
 * Sanitizes incoming request bodies & query parameters against NoSQL Injection / Prototype Pollution
 */
export const inputSanitizer = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === "object") {
    req.body = SecurityService.sanitizeInput(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = SecurityService.sanitizeInput(req.query);
  }
  if (req.params && typeof req.params === "object") {
    req.params = SecurityService.sanitizeInput(req.params);
  }
  next();
};

/**
 * Blocks known aggressive scrapers and malicious bots
 */
export const botMitigation = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers["user-agent"] || "";
  const blockedAgents = ["sqlmap", "nikto", "wpscan", "zgrab", "masscan"];

  const isBlocked = blockedAgents.some((bad) => userAgent.toLowerCase().includes(bad));
  if (isBlocked) {
    return res.status(403).json({
      success: false,
      error: "Access Forbidden: Automated security scanner blocked.",
    });
  }

  next();
};
