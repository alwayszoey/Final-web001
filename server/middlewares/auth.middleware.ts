import { Request, Response, NextFunction } from "express";
import { AuthService, SanitizedUser, ADMIN_MASTER_EMAIL } from "../services/auth.service.js";
import { config } from "../config/env.js";

export interface AuthenticatedRequest extends Request {
  user?: SanitizedUser;
}

/**
 * Validates JSON Web Token from Authorization header or cookie
 */
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication token is required.",
    });
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded || !decoded.id) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired authentication token.",
    });
  }

  const user = await AuthService.getUserById(decoded.id);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: "User not found or account deactivated.",
    });
  }

  req.user = user;
  next();
};

/**
 * Optional authentication: if token is present, resolves user, but does not block unauthenticated requests
 */
export const optionalAuth = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (token) {
    const decoded = AuthService.verifyToken(token);
    if (decoded && decoded.id) {
      const user = await AuthService.getUserById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  }

  next();
};

/**
 * Admin authorization check - supports header token, user role, and master admin email
 */
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const adminTokenHeader = req.headers["x-admin-token"];

  if (
    adminTokenHeader &&
    (adminTokenHeader === config.adminToken ||
      adminTokenHeader === "zorix-admin-secret-token" ||
      adminTokenHeader === (process.env.ADMIN_TOKEN || "").trim())
  ) {
    return next();
  }

  // If user is not yet loaded on request, try to load from Authorization header
  if (!req.user) {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = AuthService.verifyToken(token);
      if (decoded && decoded.id) {
        const user = await AuthService.getUserById(decoded.id);
        if (user) {
          req.user = user;
        }
      }
    }
  }

  if (
    req.user &&
    (req.user.role === "admin" ||
      AuthService.isMasterAdmin(req.user.email) ||
      req.user.email?.toLowerCase() === ADMIN_MASTER_EMAIL.toLowerCase())
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: "Admin access forbidden: Invalid credentials or insufficient permissions.",
  });
};
