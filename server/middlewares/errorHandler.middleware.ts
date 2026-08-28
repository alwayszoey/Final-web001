import { Request, Response, NextFunction } from "express";
import { config } from "../config/env.js";

/**
 * Wraps async route handlers to automatically catch and forward errors to Express global handler
 */
export const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Standardized Global Error Handler
 */
export const globalErrorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (!config.isProduction) {
    console.error(`[API Error] [${req.method} ${req.originalUrl}]`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
};
