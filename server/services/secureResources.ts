export interface SecureResourceItem {
  link?: string;
  downloadLinks?: Array<{ label: string; url: string }>;
  purchaseDetails?: string;
}

export const secureResourceDetails: Record<string, SecureResourceItem> = {
  "1": {
    link: "https://www.mediafire.com/file/k8d1yvgzcp3w56s/Freestyle_0.1.json/file?dkey=9o6wvtoyc1c&r=77",
    purchaseDetails: "ขอบคุณที่สั่งซื้อ!\n\nลิงก์สำหรับโหลด: https://www.mediafire.com/file/k8d1yvgzcp3w56s/Freestyle_0.1.json/file?dkey=9o6wvtoyc1c&r=77",
  },
  "2": {
    link: "https://www.mediafire.com/file/example_script/file",
    purchaseDetails: "ขอบคุณที่สั่งซื้อสคริปต์เว็บสุ่ม!\n\nลิงก์สำหรับโหลด: https://example.com/download/example_script.zip\nรหัสแตกไฟล์: zorixshop2026",
  },
};
