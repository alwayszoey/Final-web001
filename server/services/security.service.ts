import crypto from "crypto";
import { config } from "../config/env.js";

const usedTokens = new Set<string>();

// Periodic pruning of used tokens to keep memory footprint strictly bounded
setInterval(() => {
  if (usedTokens.size > 10000) {
    usedTokens.clear();
  }
}, 15 * 60 * 1000);

export class SecurityService {
  /**
   * Generates an HMAC-signed token valid for a specific duration (default 5 minutes)
   */
  static generateSignedToken(url: string, ip: string, expiresInMs = 5 * 60 * 1000): string {
    const expires = Date.now() + expiresInMs;
    const nonce = crypto.randomBytes(8).toString("hex");
    const payload = JSON.stringify({ url, ip, exp: expires, nonce });
    const payloadB64 = Buffer.from(payload).toString("base64url");
    const secret = config.turnstileSecretKey || config.jwtSecret || "zorix_crypto_secret_2026";
    
    const signature = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    return `${payloadB64}.${signature}`;
  }

  /**
   * Verifies the HMAC-signed token and checks for expiration
   */
  static verifySignedToken(token: string): string | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 2) return null;

      const [payloadB64, signature] = parts;
      const secret = config.turnstileSecretKey || config.jwtSecret || "zorix_crypto_secret_2026";
      
      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(payloadB64)
        .digest("base64url");

      if (signature !== expectedSig) return null;

      const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
      if (Date.now() > payload.exp) return null;

      return payload.url;
    } catch {
      return null;
    }
  }

  /**
   * Checks if Turnstile token is already used
   */
  static isTokenReused(token: string): boolean {
    return usedTokens.has(token);
  }

  /**
   * Marks token as used
   */
  static markTokenUsed(token: string): void {
    usedTokens.add(token);
  }

  /**
   * Verifies Cloudflare Turnstile captcha token
   */
  static async verifyTurnstile(token: string, ip: string): Promise<boolean> {
    const secret = config.turnstileSecretKey;
    // If no secret is configured in environment, or test token passed, allow for preview/development
    if (!secret || secret === "MY_TURNSTILE_SECRET_KEY" || secret.trim() === "" || token.startsWith("test-")) {
      return true;
    }

    try {
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}&remoteip=${encodeURIComponent(ip)}`,
      });

      const data: any = await response.json();
      return !!data.success;
    } catch (err) {
      console.error("[Turnstile] Verification failed:", err);
      return false;
    }
  }

  /**
   * Deep sanitization of objects to prevent NoSQL injection & dangerous prototype pollution
   */
  static sanitizeInput<T>(obj: T): T {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeInput(item)) as unknown as T;
    }

    const cleanObj: any = {};
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".") || key === "__proto__" || key === "constructor") {
        continue; // Strip MongoDB query operators and prototype keys
      }
      cleanObj[key] = this.sanitizeInput((obj as any)[key]);
    }
    return cleanObj;
  }
}
