import rateLimit from "express-rate-limit";

// General API rate limiter (120 requests per minute per IP)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
  },
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after a minute.",
  },
});

// Stricter rate limiter for sensitive operations (Auth, Captcha verify, Buying)
export const abuseLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
  },
  message: {
    success: false,
    error: "Too many sensitive requests. Please slow down and try again later.",
  },
});

// Auth Limiter alias
export const authLimiter = abuseLimiter;

// Download limiter (50 downloads per 5 minutes per IP)
export const downloadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
  },
  message: {
    success: false,
    error: "Download rate limit exceeded. Please wait a few minutes.",
  },
});
