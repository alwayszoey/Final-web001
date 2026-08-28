export interface DownloadLink {
  label: string;
  url: string;
}

export type StringOrObj = string;
export type ActionType = "link" | "purchase";

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isPopular?: boolean;
  isRecommended?: boolean;
}

export const categoriesData: CategoryItem[] = [
  {
    id: "cat-script",
    name: "Script",
    description: "สคริปต์ต่างๆ",
    imageUrl: "https://img1.pic.in.th/images/2000x600_20260602154514.png",
    isRecommended: true,
    isPopular: true
  },
  {
    id: "cat-bot",
    name: "Bot",
    description: "บอทระบบและ Discord Bot",
    imageUrl: "https://img1.pic.in.th/images/-5_20260426220753.png",
    isRecommended: true,
    isPopular: false
  },
  {
    id: "cat-web",
    name: "Web Template",
    description: "เทมเพลตเว็บไซต์และระบบจัดการ",
    imageUrl: "https://img1.pic.in.th/images/2000x600_20260603154931.png",
    isRecommended: false,
    isPopular: false
  }
];

export interface ResourceItem {
  id: string;
  itemId?: string;
  title: StringOrObj;
  shortDescription: StringOrObj;
  fullDescription: StringOrObj;
  imageUrl: string;
  videoUrl?: string;
  link?: string;
  downloadLinks?: DownloadLink[];
  actionType?: ActionType; // 'link' or 'purchase'
  purchaseDetails?: string; // Text shown and copyable after a purchase succeeds
  warning?: StringOrObj;
  tags: string[];
  category: string;
  dateAdded: string; // Format: YYYY-MM-DD
  fileSize?: string;
  price?: string;
  requiresLogin?: boolean;
  isOutOfStock?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
}

// สินค้าเริ่มต้นถูกเคลียร์ออกทั้งหมดตามคำสั่ง (Admin สามารถเพิ่มสินค้าใหม่ได้ผ่าน Dashboard หลังบ้าน)
export const resourcesData: ResourceItem[] = [];
