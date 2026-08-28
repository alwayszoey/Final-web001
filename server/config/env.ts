import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  appUrl: (process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").trim(),
  
  // Database Configuration
  mongoUri: (process.env.MONGODB_URI || "").trim().replace(/^['"]|['"]$/g, ""),
  
  // Security & Authentication
  jwtSecret: (process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "zorix_ultra_secure_jwt_key_2026").trim() || "zorix_ultra_secure_jwt_key_2026",
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || "7d").trim(),
  turnstileSecretKey: (process.env.TURNSTILE_SECRET_KEY || "").trim().replace(/^['"]|['"]$/g, ""),
  adminToken: (process.env.ADMIN_TOKEN || "").trim().replace(/^['"]|['"]$/g, "") || "zorix-admin-secret-token",
  
  // OAuth Secrets
  google: {
    clientId: (process.env.GOOGLE_CLIENT_ID || "").trim().replace(/^['"]|['"]$/g, ""),
    clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "").trim().replace(/^['"]|['"]$/g, ""),
  },
  discord: {
    clientId: (process.env.DISCORD_CLIENT_ID || "").trim().replace(/^['"]|['"]$/g, ""),
    clientSecret: (process.env.DISCORD_CLIENT_SECRET || "").trim().replace(/^['"]|['"]$/g, ""),
  },

  // High-performance cache TTL
  cacheTtlMs: 30 * 1000,
};
