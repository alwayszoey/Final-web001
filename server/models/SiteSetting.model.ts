import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISocials {
  discord: string;
  facebook: string;
  line: string;
  youtube: string;
  tiktok: string;
  instagram: string;
}

export interface ISiteSettings extends Document {
  name: string;
  logoUrl: string;
  slogan: string;
  primaryColor: string;
  bannerImageUrl: string;
  promoPopupImageUrl: string;
  announcementText: string;
  announcementEnabled: boolean;
  announcementLink: string;
  socials: ISocials;
  footerText: string;
  maintenanceMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingSchema = new Schema<ISiteSettings>(
  {
    name: { type: String, default: "Zorix Shop" },
    logoUrl: { type: String, default: "https://img2.pic.in.th/IMG_096921041a78ab4fa833.png" },
    slogan: { type: String, default: "ศูนย์รวมโค้ด สคริปต์ และโปรแกรมคุณภาพสูง ปลอดภัย 100%" },
    primaryColor: { type: String, default: "#3b82f6" },
    bannerImageUrl: { type: String, default: "https://img1.pic.in.th/images/2000x600_20260603154931.png" },
    promoPopupImageUrl: { type: String, default: "" },
    announcementText: { type: String, default: "ยินดีต้อนรับสู่ระบบใหม่ โค้ดคุณภาพสูง ดาวน์โหลดปลอดภัย รวดเร็วทันใจ!" },
    announcementEnabled: { type: Boolean, default: true },
    announcementLink: { type: String, default: "" },
    socials: {
      discord: { type: String, default: "https://discord.gg" },
      facebook: { type: String, default: "https://facebook.com" },
      line: { type: String, default: "" },
      youtube: { type: String, default: "https://youtube.com" },
      tiktok: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
    footerText: { type: String, default: "© 2026 Zorix Shop & NexSpec. All rights reserved." },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SiteSetting: Model<ISiteSettings> =
  mongoose.models.SiteSetting || mongoose.model<ISiteSettings>("SiteSetting", SiteSettingSchema);
