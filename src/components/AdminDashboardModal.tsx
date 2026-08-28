import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Package,
  Settings as SettingsIcon,
  Users as UsersIcon,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Save,
  RefreshCw,
  Search,
  AlertTriangle,
  Sparkles,
  Palette,
  Globe,
  Database,
  Cpu,
  X,
  ExternalLink,
  Check,
  CheckCircle2,
  Tag,
  DollarSign,
  Video,
  Image as ImageIcon,
  FileText,
  Lock,
  Layers,
  ArrowRight,
  ChevronRight,
  Eye,
  Download,
  AlertCircle
} from "lucide-react";
import { ResourceItem, DownloadLink } from "../data";

export interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  siteSettings?: any;
  onUpdateSiteSettings?: (newSettings: any) => void;
  onSettingsUpdate?: (newSettings: any) => void;
  onRefreshResources?: () => void;
  onResourcesUpdate?: () => void;
}

export const PRESET_THEME_COLORS = [
  { name: "น้ำเงินคลาสสิก (Blue)", hex: "#3b82f6" },
  { name: "ฟ้าไซเบอร์ (Cyan)", hex: "#06b6d4" },
  { name: "ม่วงนีออน (Purple)", hex: "#8b5cf6" },
  { name: "เขียวมรกต (Emerald)", hex: "#10b981" },
  { name: "ส้มอำพัน (Amber)", hex: "#f59e0b" },
  { name: "ชมพูกุหลาบ (Rose)", hex: "#f43f5e" },
  { name: "อินดิโก้เข้ม (Indigo)", hex: "#6366f1" },
  { name: "แดงเพลิง (Red)", hex: "#ef4444" },
];

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  siteSettings: initialSiteSettings,
  onUpdateSiteSettings,
  onSettingsUpdate,
  onRefreshResources,
  onResourcesUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "settings" | "users" | "system">("overview");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Overview / Metrics state
  const [metrics, setMetrics] = useState<any>(null);

  // Products state
  const [adminResources, setAdminResources] = useState<any[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Product Form state
  const [formData, setFormData] = useState({
    itemId: "",
    title: "",
    category: "Script",
    price: "0",
    actionType: "link" as "link" | "purchase",
    shortDescription: "",
    fullDescription: "",
    imageUrl: "",
    videoUrl: "",
    link: "",
    purchaseDetails: "",
    warning: "",
    tags: "",
    fileSize: "",
    isPopular: false,
    isFeatured: false,
    isOutOfStock: false,
    requiresLogin: false,
    downloadLinks: [{ label: "ดาวน์โหลดหลัก", url: "" }] as DownloadLink[],
  });

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    name: "Zorix Shop",
    logoUrl: "",
    slogan: "",
    primaryColor: "#3b82f6",
    bannerImageUrl: "",
    promoPopupImageUrl: "",
    announcementText: "",
    announcementEnabled: true,
    announcementLink: "",
    socials: {
      discord: "",
      facebook: "",
      line: "",
      youtube: "",
      tiktok: "",
      instagram: "",
    },
    footerText: "",
  });

  // Users state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const triggerSettingsUpdate = (newSettings: any) => {
    if (typeof onUpdateSiteSettings === "function") onUpdateSiteSettings(newSettings);
    if (typeof onSettingsUpdate === "function") onSettingsUpdate(newSettings);
  };

  const triggerResourcesUpdate = () => {
    if (typeof onRefreshResources === "function") onRefreshResources();
    if (typeof onResourcesUpdate === "function") onResourcesUpdate();
  };

  // Helper for Admin API requests with token headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "x-admin-token": "zorix-admin-secret-token",
    };
  };

  // Fetch metrics and initial data
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/metrics", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMetrics(data);
        }
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
    }
  }, []);

  const fetchAdminResources = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/resources", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAdminResources(data.resources || []);
        }
      }
    } catch (err) {
      console.error("Error fetching admin resources:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsersList(data.users || []);
        }
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          setSettingsForm({
            name: s.name || "Zorix Shop",
            logoUrl: s.logoUrl || "",
            slogan: s.slogan || "",
            primaryColor: s.primaryColor || "#3b82f6",
            bannerImageUrl: s.bannerImageUrl || "",
            promoPopupImageUrl: s.promoPopupImageUrl || "",
            announcementText: s.announcementText || "",
            announcementEnabled: s.announcementEnabled !== false,
            announcementLink: s.announcementLink || "",
            socials: {
              discord: s.socials?.discord || "",
              facebook: s.socials?.facebook || "",
              line: s.socials?.line || "",
              youtube: s.socials?.youtube || "",
              tiktok: s.socials?.tiktok || "",
              instagram: s.socials?.instagram || "",
            },
            footerText: s.footerText || "",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  }, []);

  // Sync settings when modal opens or initialSiteSettings changes
  useEffect(() => {
    if (initialSiteSettings) {
      setSettingsForm({
        name: initialSiteSettings.name || "Zorix Shop",
        logoUrl: initialSiteSettings.logoUrl || "",
        slogan: initialSiteSettings.slogan || "",
        primaryColor: initialSiteSettings.primaryColor || "#3b82f6",
        bannerImageUrl: initialSiteSettings.bannerImageUrl || "",
        promoPopupImageUrl: initialSiteSettings.promoPopupImageUrl || "",
        announcementText: initialSiteSettings.announcementText || "",
        announcementEnabled: initialSiteSettings.announcementEnabled !== false,
        announcementLink: initialSiteSettings.announcementLink || "",
        socials: {
          discord: initialSiteSettings.socials?.discord || "",
          facebook: initialSiteSettings.socials?.facebook || "",
          line: initialSiteSettings.socials?.line || "",
          youtube: initialSiteSettings.socials?.youtube || "",
          tiktok: initialSiteSettings.socials?.tiktok || "",
          instagram: initialSiteSettings.socials?.instagram || "",
        },
        footerText: initialSiteSettings.footerText || "",
      });
    } else if (isOpen) {
      fetchSettings();
    }
  }, [initialSiteSettings, isOpen, fetchSettings]);

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
      fetchAdminResources();
      fetchUsers();
    }
  }, [isOpen, fetchMetrics, fetchAdminResources, fetchUsers]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (isProductModalOpen) {
          setIsProductModalOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProductModalOpen, onClose]);

  // Handle Flush Cache
  const handleFlushCache = async () => {
    try {
      const res = await fetch("/api/admin/cache/flush", {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "ล้างแคชระบบเรียบร้อยแล้ว (Cache Flushed)");
        fetchMetrics();
      }
    } catch (err) {
      showToast("error", "ไม่สามารถล้างแคชได้");
    }
  };

  // Handle Clear All Products
  const handleClearAllProducts = async () => {
    if (!window.confirm("คำเตือน: คุณต้องการลบสินค้าทั้งหมดในระบบใช่หรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้")) {
      return;
    }
    try {
      const res = await fetch("/api/admin/resources/clear-all", {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "ลบสินค้าทั้งหมดออกจากระบบแล้ว");
        fetchAdminResources();
        triggerResourcesUpdate();
        fetchMetrics();
      }
    } catch (err) {
      showToast("error", "เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

  // Open Create Product Modal
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setFormData({
      itemId: `item_${Date.now()}`,
      title: "",
      category: "Script",
      price: "0",
      actionType: "link",
      shortDescription: "",
      fullDescription: "",
      imageUrl: "",
      videoUrl: "",
      link: "",
      purchaseDetails: "",
      warning: "",
      tags: "",
      fileSize: "",
      isPopular: false,
      isFeatured: false,
      isOutOfStock: false,
      requiresLogin: false,
      downloadLinks: [{ label: "ดาวน์โหลดหลัก", url: "" }],
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (item: any) => {
    setEditingProduct(item);
    setFormData({
      itemId: item.itemId || item.id,
      title: item.title || "",
      category: item.category || "Script",
      price: item.price !== undefined ? String(item.price) : "0",
      actionType: item.actionType === "purchase" ? "purchase" : "link",
      shortDescription: item.shortDescription || "",
      fullDescription: item.fullDescription || "",
      imageUrl: item.imageUrl || "",
      videoUrl: item.videoUrl || "",
      link: item.link || "",
      purchaseDetails: item.purchaseDetails || "",
      warning: item.warning || "",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "",
      fileSize: item.fileSize || "",
      isPopular: Boolean(item.isPopular),
      isFeatured: Boolean(item.isFeatured),
      isOutOfStock: Boolean(item.isOutOfStock),
      requiresLogin: Boolean(item.requiresLogin),
      downloadLinks:
        item.downloadLinks && item.downloadLinks.length > 0
          ? item.downloadLinks
          : [{ label: "ดาวน์โหลดหลัก", url: item.link || "" }],
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("error", "กรุณากรอกชื่อสินค้า");
      return;
    }

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        downloadLinks: formData.downloadLinks.filter((dl) => dl.url && dl.url.trim()),
      };

      const isEdit = !!editingProduct;
      const url = isEdit
        ? `/api/admin/resources/${editingProduct.itemId || editingProduct.id}`
        : "/api/admin/resources";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", isEdit ? "อัปเดตสินค้าเรียบร้อยแล้ว" : "เพิ่มสินค้าใหม่เรียบร้อยแล้ว");
        setIsProductModalOpen(false);
        fetchAdminResources();
        triggerResourcesUpdate();
        fetchMetrics();
      } else {
        showToast("error", data.error || "เกิดข้อผิดพลาดในการบันทึกสินค้า");
      }
    } catch (err) {
      showToast("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (itemId: string, title: string) => {
    if (!window.confirm(`ยืนยันการลบสินค้า "${title}" หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/resources/${itemId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "ลบสินค้าสำเร็จ");
        fetchAdminResources();
        triggerResourcesUpdate();
        fetchMetrics();
      } else {
        showToast("error", "เกิดข้อผิดพลาดในการลบสินค้า");
      }
    } catch (err) {
      showToast("error", "เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "บันทึกการตั้งค่าเว็บไซต์และสีสำเร็จ!");
        triggerSettingsUpdate(data.settings);
      } else {
        showToast("error", data.error || "ไม่สามารถบันทึกการตั้งค่าได้");
      }
    } catch (err) {
      showToast("error", "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`ยืนยันการลบผู้ใช้ "${username}" หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "ลบผู้ใช้สำเร็จ");
        fetchUsers();
        fetchMetrics();
      } else {
        showToast("error", "ไม่สามารถลบผู้ใช้ได้");
      }
    } catch (err) {
      showToast("error", "ไม่สามารถลบผู้ใช้ได้");
    }
  };

  if (!isOpen) return null;

  // Filter products
  const filteredProducts = adminResources.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchProduct.toLowerCase()) ||
      item.itemId?.toLowerCase().includes(searchProduct.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Filter users
  const filteredUsers = usersList.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-[250] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold transition-all transform animate-slideDown ${
            toastMessage.type === "success"
              ? "bg-emerald-600 text-white border-emerald-400"
              : "bg-rose-600 text-white border-rose-400"
          }`}
        >
          {toastMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Dashboard Main Window */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-7xl h-[92vh] max-h-[920px] bg-slate-900 border border-slate-700/70 rounded-[28px] shadow-[0_25px_70px_rgba(0,0,0,0.45)] flex flex-col md:flex-row overflow-hidden text-slate-100"
      >
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
          <div>
            {/* Admin Header */}
            <div className="flex items-center justify-between gap-3 px-2 py-2.5 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white tracking-tight">Admin Console</h2>
                  <p className="text-[11px] text-blue-400 font-medium">สิทธิ์ผู้ดูแลระบบสูงสุด</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Admin Profile Chip */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 mb-4 flex items-center gap-3 shadow-inner">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                {currentUser?.email?.[0] || "A"}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{currentUser?.username || "Admin"}</div>
                <div className="text-[11px] text-emerald-400 truncate">{currentUser?.email || "cpjustink@gmail.com"}</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "overview"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <LayoutDashboard size={18} />
                <span>ภาพรวม & สถิติ</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("products");
                  fetchAdminResources();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "products"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package size={18} />
                  <span>จัดการสินค้า</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {adminResources.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "settings"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <Palette size={18} />
                <span>ตั้งค่าเว็บ & ธีมสี</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("users");
                  fetchUsers();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "users"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UsersIcon size={18} />
                  <span>จัดการผู้ใช้งาน</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {usersList.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("system");
                  fetchMetrics();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "system"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <Cpu size={18} />
                <span>สถานะเซิร์ฟเวอร์</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer Controls */}
          <div className="pt-4 border-t border-slate-800 space-y-2 hidden md:block">
            <button
              onClick={handleFlushCache}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
            >
              <RefreshCw size={14} />
              <span>ล้างแคชระบบ (Flush)</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>ปิดแผงควบคุม</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/90">
          {/* Top Bar */}
          <header className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {activeTab === "overview" && "📊 ภาพรวมระบบ & สถิติร้านค้า"}
                {activeTab === "products" && "📦 จัดการรายการสินค้าและดาวน์โหลด"}
                {activeTab === "settings" && "🎨 ปรับแต่งเว็บไซต์ โลโก้ และธีมสี"}
                {activeTab === "users" && "👥 บัญชีผู้ใช้งานทั้งหมดในระบบ"}
                {activeTab === "system" && "🛡️ การทำงานของระบบ Backend & Telemetry"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchMetrics();
                  fetchAdminResources();
                  fetchUsers();
                  showToast("success", "รีเฟรชข้อมูลล่าสุดเรียบร้อยแล้ว");
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">รีเฟรช</span>
              </button>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-all border border-slate-700"
                title="ปิดหน้าต่าง (ESC)"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          {/* Dynamic Tab Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400">สินค้าในระบบ</span>
                      <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                        <Package size={18} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      {adminResources.length}
                    </div>
                    <div className="mt-2 text-[11px] text-blue-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                      พร้อมให้บริการในร้านค้า
                    </div>
                  </div>

                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400">ยอดการเข้าชม</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                        <Globe size={18} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      {metrics?.counts?.views?.toLocaleString() || "0"}
                    </div>
                    <div className="mt-2 text-[11px] text-emerald-400">
                      Real-time Page Views
                    </div>
                  </div>

                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400">ยอดดาวน์โหลด/สั่งซื้อ</span>
                      <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                        <Sparkles size={18} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      {metrics?.counts?.downloads?.toLocaleString() || "0"}
                    </div>
                    <div className="mt-2 text-[11px] text-purple-400">
                      Completed Actions
                    </div>
                  </div>

                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400">ผู้ใช้ที่ลงทะเบียน</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                        <UsersIcon size={18} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      {usersList.length || metrics?.counts?.users || "0"}
                    </div>
                    <div className="mt-2 text-[11px] text-amber-400">
                      Registered Accounts
                    </div>
                  </div>
                </div>

                {/* Quick Action Banner */}
                <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                      ✨ ยินดีต้อนรับสู่แผงควบคุม Zorix Shop Admin
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                      คุณสามารถเพิ่มสินค้า แก้ไขข้อมูล ตั้งค่าโลโก้ สโลแกน และเลือกสีธีมของเว็บไซต์ได้ตามต้องการ ทุกการเปลี่ยนแปลงจะแสดงผลบนหน้าเว็บทันที
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={handleOpenCreateProduct}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <Plus size={16} />
                      <span>เพิ่มสินค้าใหม่</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 transition-all"
                    >
                      ปรับแต่งเว็บไซต์
                    </button>
                  </div>
                </div>

                {/* Status and Database Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-sm font-bold text-white">
                      <Database size={16} className="text-emerald-400" />
                      <span>สถานะฐานข้อมูล (Database Status)</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-700/50">
                        <span className="text-slate-400">สถานะการเชื่อมต่อ:</span>
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          {metrics?.db?.state === "connected" ? "MongoDB เชื่อมต่อสำเร็จ" : "In-Memory High-Speed Mode"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-700/50">
                        <span className="text-slate-400">Database Name:</span>
                        <span className="text-slate-300 font-mono text-[11px]">{metrics?.db?.name || "zorix_production"}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">Host:</span>
                        <span className="text-slate-300 font-mono text-[11px]">{metrics?.db?.host || "Local Container"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-sm font-bold text-white">
                      <Cpu size={16} className="text-blue-400" />
                      <span>สถานะเซิร์ฟเวอร์ & หน่วยความจำ</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-700/50">
                        <span className="text-slate-400">Uptime:</span>
                        <span className="text-slate-200 font-mono font-semibold">
                          {metrics?.uptime ? `${Math.floor(metrics.uptime / 60)} นาที ${Math.floor(metrics.uptime % 60)} วินาที` : "กำลังทำงานปกติ"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-700/50">
                        <span className="text-slate-400">Memory Heap Used:</span>
                        <span className="text-slate-200 font-mono">{metrics?.memory?.heapUsed || "120 MB"}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">In-Memory Cache Entries:</span>
                        <span className="text-slate-200 font-mono">{metrics?.cache?.entries || "0"} รายการ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTS */}
            {activeTab === "products" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Control bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/80 shadow-sm">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="ค้นหาชื่อสินค้า, หมวดหมู่, หรือรหัส..."
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="all">ทุกหมวดหมู่</option>
                      <option value="Script">Script</option>
                      <option value="Bot">Bot</option>
                      <option value="Web Template">Web Template</option>
                      <option value="Discord">Discord</option>
                      <option value="Resource">Resource</option>
                      <option value="FiveM">FiveM</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearAllProducts}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5"
                      title="ลบสินค้าทั้งหมด"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">ล้างสินค้าทั้งหมด</span>
                    </button>
                    <button
                      onClick={handleOpenCreateProduct}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
                    >
                      <Plus size={16} />
                      <span>เพิ่มสินค้า</span>
                    </button>
                  </div>
                </div>

                {/* Product List Table / Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-slate-800/40 border border-dashed border-slate-700 rounded-3xl">
                    <div className="w-16 h-16 rounded-3xl bg-blue-500/15 text-blue-400 flex items-center justify-center mx-auto mb-4">
                      <Package size={32} />
                    </div>
                    <h4 className="text-base font-bold text-white mb-1">ยังไม่มีสินค้าในระบบ</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                      {searchProduct
                        ? "ไม่พบสินค้าที่ตรงกับการค้นหา"
                        : "สินค้าชุดเก่าถูกล้างออกทั้งหมดแล้ว คุณสามารถเริ่มเพิ่มสินค้าชุดใหม่ได้ทันที"}
                    </p>
                    <button
                      onClick={handleOpenCreateProduct}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-blue-600/30"
                    >
                      <Plus size={16} />
                      <span>เพิ่มสินค้าชิ้นแรกของคุณ</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((item) => (
                      <div
                        key={item.itemId || item.id}
                        className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-600 transition-all group shadow-sm"
                      >
                        <div>
                          {/* Image & Badges */}
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-700/50">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as any).src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <ImageIcon size={32} />
                              </div>
                            )}

                            {/* Category Badge */}
                            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                              {item.category || "Script"}
                            </div>

                            {/* Price Tag */}
                            <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-blue-600 text-[11px] font-bold text-white shadow-md">
                              {item.price === "0" || item.price === "ฟรี" ? "แจกฟรี" : `฿${item.price}`}
                            </div>

                            {/* Flags */}
                            <div className="absolute bottom-2 left-2 flex gap-1">
                              {item.isPopular && (
                                <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[9px] font-bold">
                                  🔥 ยอดนิยม
                                </span>
                              )}
                              {item.isFeatured && (
                                <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold">
                                  ⭐ แนะนำ
                                </span>
                              )}
                              {item.isOutOfStock && (
                                <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[9px] font-bold">
                                  สินค้าหมด
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">{item.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                            {item.shortDescription || item.fullDescription || "ไม่มีคำอธิบาย"}
                          </p>

                          {/* Action Type & Links count */}
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-3">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                              {item.actionType === "purchase" ? "💳 สั่งซื้อรับข้อมูล" : "📥 ดาวน์โหลดฟรี"}
                            </span>
                            {item.downloadLinks?.length > 0 && (
                              <span>{item.downloadLinks.length} ลิงก์ดาวน์โหลด</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-700/60 mt-2">
                          <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                            ID: {item.itemId || item.id}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(item)}
                              className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/20 transition-all text-xs font-semibold flex items-center gap-1"
                            >
                              <Edit3 size={13} />
                              <span>แก้ไข</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(item.itemId || item.id, item.title)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all"
                              title="ลบสินค้า"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SITE SETTINGS & THEME COLOR */}
            {activeTab === "settings" && (
              <form onSubmit={handleSaveSettings} className="space-y-6 animate-fadeIn max-w-4xl">
                {/* 1. Branding & Name */}
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe size={18} className="text-blue-400" />
                    <span>ข้อมูลหลักของเว็บไซต์ (Site Identity)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        ชื่อเว็บไซต์ (Site Name)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                        placeholder="เช่น Zorix Shop, NexSpec"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        ลิงก์รูปโลโก้ (Logo URL)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.logoUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      สโลแกนเว็บไซต์ (Slogan / Subtitle)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.slogan}
                      onChange={(e) => setSettingsForm({ ...settingsForm, slogan: e.target.value })}
                      placeholder="เช่น ศูนย์รวมโค้ด สคริปต์ และโปรแกรมคุณภาพสูง..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Logo Preview */}
                  {settingsForm.logoUrl && (
                    <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3">
                      <img
                        src={settingsForm.logoUrl}
                        alt="Logo Preview"
                        className="w-12 h-12 object-contain rounded-xl bg-slate-950 p-1 border border-slate-700"
                        onError={(e) => {
                          (e.target as any).style.display = "none";
                        }}
                      />
                      <div>
                        <div className="text-xs font-bold text-white">ตัวอย่างโลโก้</div>
                        <div className="text-[11px] text-slate-400">รูปภาพถูกโหลดเรียบร้อยแล้ว</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Theme Colors & Styling */}
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Palette size={18} className="text-purple-400" />
                    <span>ธีมและสีหลักของเว็บไซต์ (Accent Color)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    เลือกสีหลักของปุ่ม, ไอคอน, แสงเรืองแสง, และลูกเล่นต่างๆ ในเว็บไซต์ การเปลี่ยนสีนี้จะมีผลกับทั้งเว็บไซต์ทันที
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    {PRESET_THEME_COLORS.map((preset) => (
                      <button
                        type="button"
                        key={preset.hex}
                        onClick={() => setSettingsForm({ ...settingsForm, primaryColor: preset.hex })}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                          settingsForm.primaryColor === preset.hex
                            ? "bg-slate-700 border-white/50 ring-2 ring-blue-400 shadow-md"
                            : "bg-slate-900/80 border-slate-700/80 hover:bg-slate-800"
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full shadow-inner shrink-0"
                          style={{ backgroundColor: preset.hex }}
                        ></div>
                        <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">{preset.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Hex input */}
                  <div className="pt-2 flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-300">ระบุสีแบบกำหนดเอง (Hex Code):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settingsForm.primaryColor.startsWith("#") ? settingsForm.primaryColor : "#3b82f6"}
                        onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={settingsForm.primaryColor}
                        onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                        placeholder="#3b82f6"
                        className="w-28 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Announcement Banner */}
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-400" />
                      <span>แถบประกาศด้านบนสุด (Announcement Banner)</span>
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.announcementEnabled}
                        onChange={(e) => setSettingsForm({ ...settingsForm, announcementEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      ข้อความประกาศ
                    </label>
                    <input
                      type="text"
                      value={settingsForm.announcementText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                      placeholder="เช่น อัปเดตระบบใหม่ แจกโค้ดฟรีทุกวันศุกร์..."
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 4. Social Links */}
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tag size={18} className="text-blue-400" />
                    <span>ลิงก์ช่องทางติดต่อ & โซเชียลมีเดีย (Social Links)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Discord Invite URL</label>
                      <input
                        type="text"
                        value={settingsForm.socials.discord}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            socials: { ...settingsForm.socials, discord: e.target.value },
                          })
                        }
                        placeholder="https://discord.gg/..."
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Facebook Page URL</label>
                      <input
                        type="text"
                        value={settingsForm.socials.facebook}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            socials: { ...settingsForm.socials, facebook: e.target.value },
                          })
                        }
                        placeholder="https://facebook.com/..."
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Line URL</label>
                      <input
                        type="text"
                        value={settingsForm.socials.line}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            socials: { ...settingsForm.socials, line: e.target.value },
                          })
                        }
                        placeholder="https://line.me/ti/p/..."
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">YouTube Channel URL</label>
                      <input
                        type="text"
                        value={settingsForm.socials.youtube}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            socials: { ...settingsForm.socials, youtube: e.target.value },
                          })
                        }
                        placeholder="https://youtube.com/@..."
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Settings Button */}
                <div className="flex justify-end pt-2 pb-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Save size={16} />
                    <span>{loading ? "กำลังบันทึก..." : "บันทึกการตั้งค่าทั้งหมด"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: USERS */}
            {activeTab === "users" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/80 shadow-sm">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อผู้ใช้ หรืออีเมล..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="text-xs text-slate-400">
                    พบผู้ใช้ทั้งหมด <span className="font-bold text-white font-mono">{filteredUsers.length}</span> บัญชี
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-slate-800/40 border border-dashed border-slate-700 rounded-3xl">
                    <UsersIcon size={32} className="mx-auto text-slate-500 mb-3" />
                    <h4 className="text-sm font-bold text-white">ไม่พบบัญชีผู้ใช้</h4>
                    <p className="text-xs text-slate-400">ยังไม่มีผู้ใช้งานลงทะเบียนในระบบ</p>
                  </div>
                ) : (
                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-700">
                          <tr>
                            <th className="p-3.5 font-semibold">ผู้ใช้งาน</th>
                            <th className="p-3.5 font-semibold">อีเมล</th>
                            <th className="p-3.5 font-semibold">สิทธิ์ (Role)</th>
                            <th className="p-3.5 font-semibold">วันที่สร้าง</th>
                            <th className="p-3.5 font-semibold text-right">การจัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {filteredUsers.map((u) => {
                            const isMaster = u.email?.toLowerCase() === "cpjustink@gmail.com";
                            return (
                              <tr key={u.id || u._id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="p-3.5 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                                    {u.username?.[0]?.toUpperCase() || "U"}
                                  </div>
                                  <span className="font-bold text-white">{u.username || "ไม่มีชื่อ"}</span>
                                </td>
                                <td className="p-3.5 text-slate-300 font-mono text-[11px]">{u.email}</td>
                                <td className="p-3.5">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                      isMaster || u.role === "admin"
                                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                        : "bg-slate-700 text-slate-300"
                                    }`}
                                  >
                                    {isMaster ? "Master Admin" : u.role || "member"}
                                  </span>
                                </td>
                                <td className="p-3.5 text-slate-400 text-[11px]">
                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("th-TH") : "-"}
                                </td>
                                <td className="p-3.5 text-right">
                                  {!isMaster && (
                                    <button
                                      onClick={() => handleDeleteUser(u.id || u._id, u.username)}
                                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                                      title="ลบผู้ใช้"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: SYSTEM & TELEMETRY */}
            {activeTab === "system" && (
              <div className="space-y-6 animate-fadeIn max-w-4xl">
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu size={18} className="text-blue-400" />
                    <span>ระบบ Telemetry และการจัดการแคช (Cache Management)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    ระบบใช้สถาปัตยกรรม High-Speed Memory Caching เพื่อเพิ่มความเร็วในการตอบสนองคำขอถึงระดับมิลลิวินาที
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400 mb-1">Cache Entries</div>
                      <div className="text-xl font-bold text-white font-mono">{metrics?.cache?.entries || 0} รายการ</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400 mb-1">Cache Hit Rate</div>
                      <div className="text-xl font-bold text-emerald-400 font-mono">
                        {metrics?.cache?.hitRate || "100%"}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400 mb-1">Database State</div>
                      <div className="text-xl font-bold text-purple-400 font-mono">
                        {metrics?.db?.state === "connected" ? "MongoDB Ready" : "In-Memory Ready"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleFlushCache}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
                    >
                      <RefreshCw size={14} />
                      <span>ล้างแคชหน่วยความจำ (Flush In-Memory Cache)</span>
                    </button>
                    <button
                      type="button"
                      onClick={fetchMetrics}
                      className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
                    >
                      <ActivityIcon size={14} />
                      <span>ตรวจสอบสุขภาพเซิร์ฟเวอร์แบบ Real-time</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* PRODUCT CREATE / EDIT SUB-MODAL */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package size={18} className="text-blue-400" />
                <span>{editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Row 1: Title & Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ชื่อสินค้า <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="เช่น สคริปต์เว็บสุ่ม, บอทดิสคอร์ด..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">หมวดหมู่</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Script">Script</option>
                    <option value="Bot">Bot</option>
                    <option value="Web Template">Web Template</option>
                    <option value="Discord">Discord</option>
                    <option value="Resource">Resource</option>
                    <option value="FiveM">FiveM</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Price & Action Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ราคา (Price)
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="ใส่ 0 หรือ ฟรี สำหรับแจกฟรี หรือใส่ราคา เช่น 150"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ประเภทการรับสินค้า (Action Type)
                  </label>
                  <select
                    value={formData.actionType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        actionType: e.target.value as "link" | "purchase",
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="link">แจกดาวน์โหลดฟรี (Captcha Verification)</option>
                    <option value="purchase">สั่งซื้อรับข้อมูล/คีย์ (Instant Unlock)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Short & Full Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  คำอธิบายสั้น (แสดงบนการ์ดสินค้า)
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="คำอธิบายสรุปสั้นๆ 1-2 ประโยค"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  รายละเอียดเต็ม (Full Description)
                </label>
                <textarea
                  rows={4}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder={`รายละเอียดคุณสมบัติ:\n[+] ฟังก์ชันที่ 1\n[+] ฟังก์ชันที่ 2`}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Row 4: Images & Video */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ลิงก์รูปภาพปก (Image URL)
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.png"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ลิงก์วิดีโอตัวอย่าง YouTube (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 5: Download Links / Delivery info */}
              <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock size={14} className="text-emerald-400" />
                    <span>ลิงก์ดาวน์โหลดไฟล์ (Secure Download Links)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        downloadLinks: [...formData.downloadLinks, { label: "ลิงก์สำรอง", url: "" }],
                      })
                    }
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                  >
                    + เพิ่มลิงก์ดาวน์โหลด
                  </button>
                </div>

                {formData.downloadLinks.map((dl, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={dl.label}
                      onChange={(e) => {
                        const next = [...formData.downloadLinks];
                        next[idx].label = e.target.value;
                        setFormData({ ...formData, downloadLinks: next });
                      }}
                      placeholder="เช่น Mediafire, Google Drive"
                      className="w-1/3 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      value={dl.url}
                      onChange={(e) => {
                        const next = [...formData.downloadLinks];
                        next[idx].url = e.target.value;
                        setFormData({ ...formData, downloadLinks: next });
                      }}
                      placeholder="https://www.mediafire.com/file/..."
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    {formData.downloadLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = formData.downloadLinks.filter((_, i) => i !== idx);
                          setFormData({ ...formData, downloadLinks: next });
                        }}
                        className="p-2 text-rose-400 hover:text-rose-300"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Purchase Details info */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ข้อมูลที่ลูกค้าได้รับหลังสั่งซื้อ (Purchase Details / Unlock Info)
                </label>
                <textarea
                  rows={2}
                  value={formData.purchaseDetails}
                  onChange={(e) => setFormData({ ...formData, purchaseDetails: e.target.value })}
                  placeholder="ข้อความ ลิงก์ หรือคีย์ที่ลูกค้าสามารถก็อปปี้ได้หลังจากกดยืนยันสั่งซื้อ"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Tags, Warning, Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">แท็ก (คั่นด้วยจุลภาค)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="เช่น Script, Bot, PHP"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ขนาดไฟล์</label>
                  <input
                    type="text"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    placeholder="เช่น 15 MB"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">คำเตือนพิเศษ</label>
                  <input
                    type="text"
                    value={formData.warning}
                    onChange={(e) => setFormData({ ...formData, warning: e.target.value })}
                    placeholder="เช่น ต้องใช้ PHP 8.1 เท่านั้น"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Checkbox Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs font-medium text-slate-200">🔥 ยอดนิยม</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs font-medium text-slate-200">⭐ แนะนำ</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isOutOfStock}
                    onChange={(e) => setFormData({ ...formData, isOutOfStock: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs font-medium text-slate-200">⚠️ สินค้าหมด</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.requiresLogin}
                    onChange={(e) => setFormData({ ...formData, requiresLogin: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs font-medium text-slate-200">🔒 บังคับล็อกอิน</span>
                </label>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Check size={16} />
                  <span>{editingProduct ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal icon helper
const ActivityIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
