import { Request, Response } from "express";
import { SecurityService } from "../services/security.service.js";
import { ResourceService } from "../services/resource.service.js";

export class DownloadController {
  /**
   * Verifies Turnstile Captcha and returns a signed 5-minute download token
   */
  static verifyCaptcha = async (req: Request, res: Response) => {
    const { token, itemId, linkIndex } = req.body || {};

    if (!token || !itemId) {
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุข้อมูล Token และ Item ID ให้ครบถ้วน",
      });
    }

    // Check for replay attacks
    if (SecurityService.isTokenReused(token)) {
      return res.status(400).json({
        success: false,
        error: "Captcha token ถูกใช้งานไปแล้ว กรุณากดยืนยันใหม่อีกครั้ง",
      });
    }

    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || "127.0.0.1";
    const isValid = await SecurityService.verifyTurnstile(token, clientIp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: "การยืนยันตัวตน Captcha ล้มเหลว กรุณาลองใหม่อีกครั้ง",
      });
    }

    SecurityService.markTokenUsed(token);

    const targetUrl = await ResourceService.resolveDownloadUrl(itemId, linkIndex);
    if (!targetUrl) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบไฟล์ดาวน์โหลดของสินค้านี้ในระบบ",
      });
    }

    // Issue 5-minute HMAC signed download key
    const signedKey = SecurityService.generateSignedToken(targetUrl, clientIp, 5 * 60 * 1000);

    return res.json({
      success: true,
      key: signedKey,
      expiresIn: 300,
    });
  };

  /**
   * Verifies signed token and redirects user directly to download file
   */
  static handleDownloadRedirect = async (req: Request, res: Response) => {
    const { key } = req.params;

    if (!key) {
      return res.status(400).send("<h3>ลิงก์ดาวน์โหลดไม่ถูกต้อง</h3>");
    }

    const targetUrl = SecurityService.verifySignedToken(key);

    if (!targetUrl) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="th">
          <head>
            <meta charset="utf-8" />
            <title>ลิงก์หมดอายุ - NexSpec</title>
            <style>
              body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: #f8fafc; margin: 0; }
              .box { text-align: center; padding: 2.5rem; background: #1e293b; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 450px; }
              h2 { color: #f87171; margin-bottom: 0.5rem; }
              p { color: #94a3b8; line-height: 1.6; }
              a { display: inline-block; margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 0.5rem; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="box">
              <h2>ลิงก์ดาวน์โหลดหมดอายุ</h2>
              <p>ลิงก์ดาวน์โหลดมีความปลอดภัยและมีอายุ 5 นาที กรุณากลับไปที่เว็บไซต์เพื่อรับลิงก์ใหม่อีกครั้ง</p>
              <a href="/">กลับสู่หน้าหลัก</a>
            </div>
          </body>
        </html>
      `);
    }

    return res.redirect(targetUrl);
  };

  /**
   * Retrieves purchase / unlock details for a paid item
   */
  static handleBuy = async (req: Request, res: Response) => {
    const { itemId } = req.body || {};

    if (!itemId) {
      return res.status(400).json({
        success: false,
        error: "Item ID is required.",
      });
    }

    const resource = await ResourceService.getResource(itemId);

    if (!resource || !resource.purchaseDetails) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบข้อมูลสำหรับสินค้านี้",
      });
    }

    return res.json({
      success: true,
      details: resource.purchaseDetails,
    });
  };
}
