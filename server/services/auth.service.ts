import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { isDbConnected } from "../config/db.js";
import { User, IUser, IUserHistory } from "../models/User.model.js";

// In-Memory storage for fallback/preview
const memoryUsers = new Map<string, any>();

export const ADMIN_MASTER_EMAIL = "cpjustink@gmail.com";

export interface SanitizedUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  role?: string;
  history?: IUserHistory[];
  createdAt?: string | Date;
}

export class AuthService {
  /**
   * Checks if an email is an authorized administrator
   */
  static isMasterAdmin(email?: string): boolean {
    if (!email) return false;
    return email.trim().toLowerCase() === ADMIN_MASTER_EMAIL.toLowerCase();
  }

  /**
   * Sanitizes a user document or in-memory object before sending to client
   */
  static sanitizeUser(user: any): SanitizedUser {
    const email = user.email || "";
    const isMaster = this.isMasterAdmin(email);
    const role = isMaster ? "admin" : user.role || "user";

    return {
      id: user.id || user._id?.toString() || email,
      username: user.username || "",
      email: email,
      avatarUrl: user.avatarUrl || "",
      role: role,
      history: user.history || [],
      createdAt: user.createdAt,
    };
  }

  /**
   * Signs a secure JSON Web Token
   */
  static generateToken(user: SanitizedUser | IUser): string {
    const email = user.email || "";
    const isMaster = this.isMasterAdmin(email);
    const role = isMaster ? "admin" : (user as any).role || "user";

    const payload = {
      id: (user as any).id || (user as any)._id?.toString(),
      email: email,
      username: user.username,
      role: role,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });
  }

  /**
   * Verifies a JWT token and returns the decoded payload
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch {
      return null;
    }
  }

  /**
   * Registers a new user account with bcrypt salted hash
   */
  static async registerUser(username: string, email: string, password?: string): Promise<SanitizedUser> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const isMaster = this.isMasterAdmin(cleanEmail);
    const role = isMaster ? "admin" : "user";

    if (isDbConnected()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        throw new Error("อีเมลนี้ถูกใช้งานไปแล้ว");
      }

      let hashedPassword = "";
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const newUser = await User.create({
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        provider: "credentials",
        role: role,
        history: [],
      });

      return this.sanitizeUser(newUser);
    }

    // In-memory mode
    if (memoryUsers.has(cleanEmail)) {
      throw new Error("อีเมลนี้ถูกใช้งานไปแล้ว");
    }

    let hashedPassword = "";
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const memId = "mem_" + Math.random().toString(36).substring(2, 9);
    const inMemUser = {
      id: memId,
      _id: memId,
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      avatarUrl: "",
      role: role,
      history: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryUsers.set(cleanEmail, inMemUser);
    return this.sanitizeUser(inMemUser);
  }

  /**
   * Authenticates a user with email and password
   */
  static async loginUser(email: string, password?: string): Promise<{ token: string; user: SanitizedUser }> {
    const cleanEmail = email.trim().toLowerCase();

    if (isDbConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        throw new Error("ไม่พบบัญชีผู้ใช้นี้ในระบบ");
      }

      if (user.password && password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new Error("รหัสผ่านไม่ถูกต้อง");
        }
      }

      // Upgrade to admin role if master admin email
      if (this.isMasterAdmin(cleanEmail) && user.role !== "admin") {
        user.role = "admin";
        await user.save();
      }

      const sanitized = this.sanitizeUser(user);
      const token = this.generateToken(sanitized);
      return { token, user: sanitized };
    }

    // In-memory mode
    const user = memoryUsers.get(cleanEmail);
    if (!user) {
      throw new Error("ไม่พบบัญชีผู้ใช้นี้ในระบบ");
    }

    if (user.password && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("รหัสผ่านไม่ถูกต้อง");
      }
    }

    if (this.isMasterAdmin(cleanEmail)) {
      user.role = "admin";
    }

    const sanitized = this.sanitizeUser(user);
    const token = this.generateToken(sanitized);
    return { token, user: sanitized };
  }

  /**
   * Retrieves a user by their unique ID
   */
  static async getUserById(id: string): Promise<SanitizedUser | null> {
    if (isDbConnected()) {
      try {
        const user = await User.findById(id);
        if (user) {
          if (this.isMasterAdmin(user.email) && user.role !== "admin") {
            user.role = "admin";
            await user.save();
          }
          return this.sanitizeUser(user);
        }
      } catch {
        // Fall back to query by email or in-memory
      }
    }

    for (const memUser of memoryUsers.values()) {
      if (memUser.id === id || memUser._id === id || memUser.email === id) {
        return this.sanitizeUser(memUser);
      }
    }

    return null;
  }

  /**
   * Updates user profile (username, avatarUrl)
   */
  static async updateProfile(id: string, updates: { username?: string; avatarUrl?: string }): Promise<SanitizedUser> {
    const cleanUpdates: any = {};
    if (updates.username && updates.username.trim()) cleanUpdates.username = updates.username.trim();
    if (updates.avatarUrl !== undefined) cleanUpdates.avatarUrl = updates.avatarUrl.trim();

    if (isDbConnected()) {
      try {
        const updated = await User.findByIdAndUpdate(id, { $set: cleanUpdates }, { new: true });
        if (updated) return this.sanitizeUser(updated);
      } catch (err) {
        console.error("[AuthService] Error updating MongoDB profile:", err);
      }
    }

    for (const [email, memUser] of memoryUsers.entries()) {
      if (memUser.id === id || memUser._id === id) {
        const merged = { ...memUser, ...cleanUpdates, updatedAt: new Date() };
        memoryUsers.set(email, merged);
        return this.sanitizeUser(merged);
      }
    }

    throw new Error("ไม่พบผู้ใช้ที่ต้องการอัปเดต");
  }

  /**
   * Appends an action item to user's history
   */
  static async addHistory(
    userId: string,
    item: { id: string; type?: "link" | "purchase" | "download"; title: string; details?: string; price?: string }
  ): Promise<IUserHistory[]> {
    const historyItem: IUserHistory = {
      id: item.id,
      type: item.type || "download",
      title: item.title,
      details: item.details || "",
      price: item.price || "",
      date: new Date(),
    };

    if (isDbConnected()) {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { $push: { history: { $each: [historyItem], $position: 0 } } },
          { new: true }
        );
        if (user) return user.history;
      } catch (err) {
        console.error("[AuthService] Error adding history to MongoDB user:", err);
      }
    }

    for (const [email, memUser] of memoryUsers.entries()) {
      if (memUser.id === userId || memUser._id === userId) {
        memUser.history = [historyItem, ...(memUser.history || [])];
        memoryUsers.set(email, memUser);
        return memUser.history;
      }
    }

    return [historyItem];
  }

  /**
   * Finds or creates a user from OAuth Provider (Google / Discord)
   */
  static async findOrCreateOAuthUser(profile: {
    provider: "google" | "discord";
    providerId: string;
    email: string;
    username: string;
    avatarUrl?: string;
  }): Promise<{ token: string; user: SanitizedUser }> {
    const cleanEmail = profile.email.trim().toLowerCase();
    const cleanUsername = profile.username.trim() || "User";
    const isMaster = this.isMasterAdmin(cleanEmail);
    const role = isMaster ? "admin" : "user";

    if (isDbConnected()) {
      let user = await User.findOne({
        $or: [
          { provider: profile.provider, providerId: profile.providerId },
          { email: cleanEmail },
        ],
      });

      if (user) {
        user.username = cleanUsername || user.username;
        if (profile.avatarUrl) user.avatarUrl = profile.avatarUrl;
        if (isMaster) user.role = "admin";
        await user.save();
      } else {
        user = await User.create({
          provider: profile.provider,
          googleId: profile.provider === "google" ? profile.providerId : undefined,
          discordId: profile.provider === "discord" ? profile.providerId : undefined,
          email: cleanEmail,
          username: cleanUsername,
          avatarUrl: profile.avatarUrl || "",
          role: role,
          history: [],
        });
      }

      const sanitized = this.sanitizeUser(user);
      const token = this.generateToken(sanitized);
      return { token, user: sanitized };
    }

    // In-memory fallback
    let memUser = memoryUsers.get(cleanEmail);
    if (memUser) {
      memUser.username = cleanUsername || memUser.username;
      if (profile.avatarUrl) memUser.avatarUrl = profile.avatarUrl;
      if (isMaster) memUser.role = "admin";
    } else {
      const memId = "mem_" + Math.random().toString(36).substring(2, 9);
      memUser = {
        id: memId,
        _id: memId,
        provider: profile.provider,
        providerId: profile.providerId,
        email: cleanEmail,
        username: cleanUsername,
        avatarUrl: profile.avatarUrl || "",
        role: role,
        history: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryUsers.set(cleanEmail, memUser);
    }

    const sanitized = this.sanitizeUser(memUser);
    const token = this.generateToken(sanitized);
    return { token, user: sanitized };
  }

  /**
   * Retrieves all users for Admin Panel
   */
  static async getAllUsers(): Promise<SanitizedUser[]> {
    if (isDbConnected()) {
      try {
        const users = await User.find().sort({ createdAt: -1 }).lean();
        return users.map((u) => this.sanitizeUser(u));
      } catch (err) {
        console.error("Error fetching all users from DB:", err);
      }
    }

    const list: SanitizedUser[] = [];
    for (const memUser of memoryUsers.values()) {
      list.push(this.sanitizeUser(memUser));
    }
    return list;
  }

  /**
   * Deletes a user by ID
   */
  static async deleteUser(id: string): Promise<boolean> {
    if (isDbConnected()) {
      try {
        await User.findByIdAndDelete(id);
      } catch (err) {
        console.error("Error deleting user from DB:", err);
      }
    }

    for (const [email, memUser] of memoryUsers.entries()) {
      if (memUser.id === id || memUser._id === id) {
        memoryUsers.delete(email);
        return true;
      }
    }

    return true;
  }
}
