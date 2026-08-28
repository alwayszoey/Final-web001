import { isDbConnected } from "../config/db.js";
import { SiteSetting, ISiteSettings } from "../models/SiteSetting.model.js";
import { MemoryCacheService } from "./cache.service.js";

const DEFAULT_SETTINGS = {
  name: "Zorix Shop",
  logoUrl: "https://img2.pic.in.th/IMG_096921041a78ab4fa833.png",
  slogan: "ศูนย์รวมโค้ด สคริปต์ และโปรแกรมคุณภาพสูง ปลอดภัย 100%",
  primaryColor: "#3b82f6",
  bannerImageUrl: "https://img1.pic.in.th/images/2000x600_20260603154931.png",
  promoPopupImageUrl: "",
  announcementText: "ยินดีต้อนรับสู่ระบบใหม่ โค้ดคุณภาพสูง ดาวน์โหลดปลอดภัย รวดเร็วทันใจ!",
  announcementEnabled: true,
  announcementLink: "",
  socials: {
    discord: "https://discord.gg",
    facebook: "https://facebook.com",
    line: "",
    youtube: "https://youtube.com",
    tiktok: "",
    instagram: "",
  },
  footerText: "© 2026 Zorix Shop & NexSpec. All rights reserved.",
  maintenanceMode: false,
};

let memorySettings = { ...DEFAULT_SETTINGS };

export class SettingService {
  private static CACHE_KEY = "site_settings_v3";

  /**
   * Retrieves active site settings
   */
  static async getSettings(): Promise<any> {
    const cached = MemoryCacheService.get(this.CACHE_KEY);
    if (cached) return cached;

    if (isDbConnected()) {
      try {
        let settingDoc = await SiteSetting.findOne().lean();
        if (!settingDoc) {
          const created = await SiteSetting.create(DEFAULT_SETTINGS);
          settingDoc = created.toObject();
        }
        MemoryCacheService.set(this.CACHE_KEY, settingDoc, 60 * 1000);
        return settingDoc;
      } catch (err) {
        console.error("Failed to load settings from DB, using in-memory:", err);
      }
    }

    MemoryCacheService.set(this.CACHE_KEY, memorySettings, 60 * 1000);
    return memorySettings;
  }

  /**
   * Updates site settings
   */
  static async updateSettings(updates: Partial<typeof DEFAULT_SETTINGS>): Promise<any> {
    const sanitizedUpdates = {
      name: (updates.name || memorySettings.name).trim(),
      logoUrl: (updates.logoUrl || memorySettings.logoUrl).trim(),
      slogan: (updates.slogan || memorySettings.slogan).trim(),
      primaryColor: (updates.primaryColor || memorySettings.primaryColor).trim(),
      bannerImageUrl: (updates.bannerImageUrl || memorySettings.bannerImageUrl).trim(),
      promoPopupImageUrl: (updates.promoPopupImageUrl ?? memorySettings.promoPopupImageUrl).trim(),
      announcementText: (updates.announcementText ?? memorySettings.announcementText).trim(),
      announcementEnabled: Boolean(updates.announcementEnabled),
      announcementLink: (updates.announcementLink ?? memorySettings.announcementLink).trim(),
      socials: {
        ...memorySettings.socials,
        ...(updates.socials || {}),
      },
      footerText: (updates.footerText || memorySettings.footerText).trim(),
      maintenanceMode: Boolean(updates.maintenanceMode),
    };

    memorySettings = { ...memorySettings, ...sanitizedUpdates };

    if (isDbConnected()) {
      try {
        let settingDoc = await SiteSetting.findOne();
        if (!settingDoc) {
          settingDoc = new SiteSetting(sanitizedUpdates);
        } else {
          Object.assign(settingDoc, sanitizedUpdates);
        }
        await settingDoc.save();
        MemoryCacheService.set(this.CACHE_KEY, settingDoc.toObject(), 60 * 1000);
        return settingDoc.toObject();
      } catch (err) {
        console.error("Failed to persist settings to DB:", err);
      }
    }

    MemoryCacheService.set(this.CACHE_KEY, memorySettings, 60 * 1000);
    return memorySettings;
  }
}
