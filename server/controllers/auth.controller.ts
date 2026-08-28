import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export class AuthController {
  /**
   * Register a new account
   */
  static register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุชื่อผู้ใช้และอีเมลให้ครบถ้วน",
      });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
      });
    }

    const user = await AuthService.registerUser(username, email, password);
    const token = AuthService.generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ",
      token,
      user,
    });
  };

  /**
   * Login with email and password
   */
  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "กรุณาระบุอีเมลและรหัสผ่าน",
      });
    }

    const { token, user } = await AuthService.loginUser(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token,
      user,
    });
  };

  /**
   * Get current authenticated user details
   */
  static me = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "กรุณาเข้าสู่ระบบ",
      });
    }

    return res.json({
      success: true,
      user: req.user,
    });
  };

  /**
   * Update profile (username, avatar)
   */
  static updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const { username, avatarUrl } = req.body;
    const updatedUser = await AuthService.updateProfile(req.user.id, { username, avatarUrl });

    return res.json({
      success: true,
      user: updatedUser,
    });
  };

  /**
   * Add purchase / download item to user's history
   */
  static addHistory = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "กรุณาเข้าสู่ระบบเพื่อบันทึกประวัติ",
      });
    }

    const { id, type, title, details, price } = req.body;
    if (!id || !title) {
      return res.status(400).json({
        success: false,
        error: "ข้อมูลประวัติไม่ถูกต้อง",
      });
    }

    const history = await AuthService.addHistory(req.user.id, { id, type, title, details, price });

    return res.json({
      success: true,
      history,
    });
  };

  /**
   * Logout session
   */
  static logout = async (_req: Request, res: Response) => {
    res.clearCookie("token");
    return res.json({
      success: true,
      message: "ออกจากระบบเรียบร้อยแล้ว",
    });
  };

  /**
   * Helper to send OAuth popup response message
   */
  static handleOAuthCallback = (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) {
      return res.send(`
        <html><body><script>
          window.opener.postMessage({ type: 'OAUTH_ERROR', error: 'Authentication failed' }, '*');
          window.close();
        </script></body></html>
      `);
    }

    const token = AuthService.generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const payload = JSON.stringify({
      type: "OAUTH_SUCCESS",
      token,
      user: AuthService.sanitizeUser(user),
    });

    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Complete</title></head>
        <body>
          <script>
            window.opener.postMessage(${payload}, '*');
            window.close();
          </script>
          <p>เข้าสู่ระบบสำเร็จ กำลังปิดหน้าต่าง...</p>
        </body>
      </html>
    `);
  };
}
