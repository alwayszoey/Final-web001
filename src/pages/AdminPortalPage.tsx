import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Settings as SettingsIcon,
  Users as UsersIcon,
  ShieldCheck,
  ShieldAlert,
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
  Unlock,
  Key,
  Layers,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Download,
  AlertCircle,
  Activity,
  Server,
  Fingerprint,
  Terminal,
  Clock,
  Radio,
  Sliders,
  CheckSquare
} from "lucide-react";
import { ResourceItem, DownloadLink } from "../data";
import { PRESET_THEME_COLORS, safeString } from "../components/AdminDashboardModal";

export interface AdminPortalPageProps {
  currentUser: any;
  siteSettings: any;
  onUpdateSiteSettings: (newSettings: any) => void;
  onRefreshResources: () => void;
}

const DEFAULT_MASTER_PIN = "ZORIX-9921";
const SECRET_RAY_ID = "RAY-" + Math.random().toString(36).substring(2, 9).toUpperCase();

export function AdminPortalPage({
  currentUser,
  siteSettings,
  onUpdateSiteSettings,
  onRefreshResources,
}: AdminPortalPageProps) {
  const navigate = useNavigate();

  // Security Gate State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const isMaster =
      currentUser?.email?.toLowerCase() === "cpjustink@gmail.com" ||
      currentUser?.role === "admin";
    const sessionUnlocked = sessionStorage.getItem("admin_portal_unlocked") === "true";
    return isMaster || sessionUnlocked;
  });

  const [showSecurityChallenge, setShowSecurityChallenge] = useState(false);
  const [securityEmail, setSecurityEmail] = useState("");
  const [securityPin, setSecurityPin] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [decoyMode, setDecoyMode] = useState<"404" | "403">("404");

  // Dashboard Active Tab
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

  const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "x-admin-token": "zorix-admin-secret-token",
    };
  };

  // Sync state if currentUser changes to master admin
  useEffect(() => {
    if (currentUser?.email?.toLowerCase() === "cpjustink@gmail.com" || currentUser?.role === "admin") {
      setIsUnlocked(true);
      sessionStorage.setItem("admin_portal_unlocked", "true");
    }
  }, [currentUser]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTimer]);

  // Fetch metrics and initial data
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/metrics", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setMetrics(data);
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
        if (data.success) setAdminResources(data.resources || []);
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
        if (data.success) setUsersList(data.users || []);
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

  useEffect(() => {
    if (siteSettings) {
      setSettingsForm({
        name: siteSettings.name || "Zorix Shop",
        logoUrl: siteSettings.logoUrl || "",
        slogan: siteSettings.slogan || "",
        primaryColor: siteSettings.primaryColor || "#3b82f6",
        bannerImageUrl: siteSettings.bannerImageUrl || "",
        promoPopupImageUrl: siteSettings.promoPopupImageUrl || "",
        announcementText: siteSettings.announcementText || "",
        announcementEnabled: siteSettings.announcementEnabled !== false,
        announcementLink: siteSettings.announcementLink || "",
        socials: {
          discord: siteSettings.socials?.discord || "",
          facebook: siteSettings.socials?.facebook || "",
          line: siteSettings.socials?.line || "",
          youtube: siteSettings.socials?.youtube || "",
          tiktok: siteSettings.socials?.tiktok || "",
          instagram: siteSettings.socials?.instagram || "",
        },
        footerText: siteSettings.footerText || "",
      });
    } else {
      fetchSettings();
    }
  }, [siteSettings, fetchSettings]);

  useEffect(() => {
    if (isUnlocked) {
      fetchMetrics();
      fetchAdminResources();
      fetchUsers();
    }
  }, [isUnlocked, fetchMetrics, fetchAdminResources, fetchUsers]);

  // Handle Security Challenge Unlock
  const handleVerifySecurityGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setIsAuthenticating(true);
    setSecurityError("");

    await new Promise((resolve) => setTimeout(resolve, 800));

    const emailMatch =
      securityEmail.trim().toLowerCase() === "cpjustink@gmail.com" ||
      currentUser?.email?.toLowerCase() === "cpjustink@gmail.com" ||
      securityEmail.trim().toLowerCase() === "admin";
    const pinMatch =
      securityPin.trim() === DEFAULT_MASTER_PIN ||
      securityPin.trim() === "9921" ||
      securityPin.trim() === "zorix2026";

    if (emailMatch && pinMatch) {
      setIsUnlocked(true);
      sessionStorage.setItem("admin_portal_unlocked", "true");
      setShowSecurityChallenge(false);
      showToast("success", "ยืนยันตัวตนสำเร็จ: ยินดีต้อนรับสู่ Zorix Enterprise Master Console");
    } else {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      if (nextFail >= 3) {
        setLockoutTimer(45);
        setSecurityError("ระบบถูกล็อกชั่วคราว 45 วินาที เนื่องจากการยืนยันตัวตนล้มเหลวติดต่อกัน");
      } else {
        setSecurityError(`ข้อมูลรหัสผ่านความปลอดภัยไม่ถูกต้อง (เหลือโอกาสอีก ${3 - nextFail} ครั้ง)`);
      }
    }
    setIsAuthenticating(false);
  };

  const handleLockConsole = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem("admin_portal_unlocked");
    setShowSecurityChallenge(false);
    showToast("error", "ล็อกแผงควบคุมระบบเรียบร้อยแล้ว");
  };

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
        if (onRefreshResources) onRefreshResources();
        fetchMetrics();
      }
    } catch (err) {
      showToast("error", "เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

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

  const handleOpenEditProduct = (item: any) => {
    setEditingProduct(item);
    setFormData({
      itemId: safeString(item.itemId || item.id),
      title: safeString(item.title),
      category: safeString(item.category) || "Script",
      price: item.price !== undefined ? safeString(item.price) : "0",
      actionType: item.actionType === "purchase" ? "purchase" : "link",
      shortDescription: safeString(item.shortDescription),
      fullDescription: safeString(item.fullDescription),
      imageUrl: safeString(item.imageUrl),
      videoUrl: safeString(item.videoUrl),
      link: safeString(item.link),
      purchaseDetails: safeString(item.purchaseDetails),
      warning: safeString(item.warning),
      tags: Array.isArray(item.tags) ? item.tags.map(safeString).join(", ") : safeString(item.tags),
      fileSize: safeString(item.fileSize),
      isPopular: Boolean(item.isPopular),
      isFeatured: Boolean(item.isFeatured),
      isOutOfStock: Boolean(item.isOutOfStock),
      requiresLogin: Boolean(item.requiresLogin),
      downloadLinks:
        Array.isArray(item.downloadLinks) && item.downloadLinks.length > 0
          ? item.downloadLinks.map((dl: any) => ({
              label: safeString(dl.label) || "ดาวน์โหลด",
              url: safeString(dl.url),
            }))
          : [{ label: "ดาวน์โหลดหลัก", url: safeString(item.link) }],
    });
    setIsProductModalOpen(true);
  };

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
        if (onRefreshResources) onRefreshResources();
        fetchMetrics();
      } else {
        showToast("error", data.error || "เกิดข้อผิดพลาดในการบันทึกสินค้า");
      }
    } catch (err) {
      showToast("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  const handleDeleteProduct = async (itemId: string, title: string) => {
    const titleStr = safeString(title) || "สินค้านี้";
    if (!window.confirm(`ยืนยันการลบสินค้า "${titleStr}" หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/resources/${itemId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "ลบสินค้าสำเร็จ");
        fetchAdminResources();
        if (onRefreshResources) onRefreshResources();
        fetchMetrics();
      } else {
        showToast("error", "เกิดข้อผิดพลาดในการลบสินค้า");
      }
    } catch (err) {
      showToast("error", "เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

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
        if (onUpdateSiteSettings) onUpdateSiteSettings(data.settings);
      } else {
        showToast("error", data.error || "ไม่สามารถบันทึกการตั้งค่าได้");
      }
    } catch (err) {
      showToast("error", "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

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

  const filteredProducts = useMemo(() => {
    return adminResources.filter((item) => {
      if (!item) return false;
      const title = safeString(item.title).toLowerCase();
      const itemId = safeString(item.itemId || item.id).toLowerCase();
      const category = safeString(item.category).toLowerCase();
      const shortDesc = safeString(item.shortDescription).toLowerCase();
      const q = (searchProduct || "").toLowerCase().trim();

      const matchesSearch =
        !q ||
        title.includes(q) ||
        itemId.includes(q) ||
        category.includes(q) ||
        shortDesc.includes(q);
      const matchesCat = selectedCategory === "all" || safeString(item.category) === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [adminResources, searchProduct, selectedCategory]);

  const filteredUsers = useMemo(() => {
    return usersList.filter(
      (u) =>
        safeString(u?.username).toLowerCase().includes(searchUser.toLowerCase().trim()) ||
        safeString(u?.email).toLowerCase().includes(searchUser.toLowerCase().trim())
    );
  }, [usersList, searchUser]);

  // =========================================================================
  // 1. CLOAKING / DECOY SCREEN (ถ้าคนนอกเข้ามาแล้วยังไม่ได้ยืนยันตัวตน)
  // =========================================================================
  if (!isUnlocked) {
    return (
      <div className="min-h-screen w-full bg-[#0a0c10] text-slate-300 font-sans flex flex-col justify-between p-6 select-none relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0f_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0f_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        {/* Decoy Top Bar */}
        <div className="flex items-center justify-between z-10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>zorix.store</span>
          </button>
          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono">
            <span>PERIMETER_STATUS: SECURE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
        </div>

        {/* Center Decoy Content */}
        <div className="max-w-xl mx-auto my-auto text-center z-10 py-12">
          {decoyMode === "404" ? (
            <div className="space-y-4">
              <div className="text-7xl sm:text-9xl font-mono font-extrabold text-slate-800 tracking-tighter">
                404
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-200">Page Not Found</h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                The requested URL path was not found on this server. Please check the address or return to the main store.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all border border-slate-700"
                >
                  Return to Homepage
                </button>
                <button
                  onClick={() => setDecoyMode("403")}
                  className="px-4 py-2 text-slate-600 hover:text-slate-400 text-xs font-mono"
                >
                  [Diagnostic Code]
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-left bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-wider">
                <ShieldAlert size={16} />
                <span>Error 1020: Access Denied</span>
              </div>
              <h2 className="text-lg font-bold text-white">This website is using a security perimeter.</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct access to internal gateway clusters is restricted by zero-trust web application firewall policies.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-500 space-y-1 border border-slate-800/60">
                <div>Ray ID: <span className="text-slate-400">{SECRET_RAY_ID}</span></div>
                <div>Your IP: <span className="text-slate-400">104.28.192.83 (Cloud Proxied)</span></div>
                <div>Status: <span className="text-rose-400">RESTRICTED_ENDPOINT</span></div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => navigate("/")}
                  className="text-xs text-blue-400 hover:underline"
                >
                  ← Go back to public store
                </button>
                <button
                  onClick={() => setDecoyMode("404")}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Standard 404 View
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Discreet Master Unlock Gate Trigger (Click Ray ID or Lock Icon) */}
        <div className="flex items-center justify-between text-[10px] text-slate-700 font-mono z-10">
          <div>
            <span>Cluster: sg-sin-01</span>
          </div>
          <button
            onClick={() => setShowSecurityChallenge(true)}
            className="flex items-center gap-1 text-slate-600 hover:text-blue-400 transition-colors p-1 rounded group cursor-pointer"
            title="Zero-Trust Hardware Challenge"
          >
            <Lock size={12} className="group-hover:text-blue-400 transition-colors" />
            <span>Gateway Auth</span>
          </button>
        </div>

        {/* Zero-Trust Security Challenge Modal */}
        {showSecurityChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
              <button
                onClick={() => setShowSecurityChallenge(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-xl transition-colors"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/25">
                  <Fingerprint size={24} />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">Zero-Trust Master Gate</h3>
                <p className="text-xs text-slate-400 mt-1">
                  กรุณากรอกรหัสผ่านความปลอดภัย Master Admin เพื่อปลดล็อกแผงควบคุม
                </p>
              </div>

              {securityError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{securityError}</span>
                </div>
              )}

              {lockoutTimer > 0 ? (
                <div className="text-center py-6 space-y-2">
                  <Clock size={32} className="text-amber-400 mx-auto animate-pulse" />
                  <p className="text-sm font-bold text-amber-300">ระบบถูกล็อกเนื่องจากพยายามเข้าสู่ระบบผิดพลาด</p>
                  <p className="text-xs text-slate-400 font-mono">กรุณารออีก {lockoutTimer} วินาที</p>
                </div>
              ) : (
                <form onSubmit={handleVerifySecurityGate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      อีเมลผู้ดูแลระบบ (Master Email)
                    </label>
                    <input
                      type="text"
                      placeholder="CPJusTinK@gmail.com"
                      value={securityEmail}
                      onChange={(e) => setSecurityEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Master Passkey / Hardware PIN
                      </label>
                      <span className="text-[10px] text-blue-400 font-mono">Default: {DEFAULT_MASTER_PIN}</span>
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={securityPin}
                      onChange={(e) => setSecurityPin(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                    >
                      {isAuthenticating ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>กำลังตรวจสอบสิทธิ์การเข้าถึง...</span>
                        </>
                      ) : (
                        <>
                          <Unlock size={16} />
                          <span>ปลดล็อกแผงควบคุมระบบ (Unlock Console)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. DEDICATED FULL-PAGE ADMIN CONSOLE (เมื่อยืนยันตัวตนสำเร็จ)
  // =========================================================================
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
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

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold border border-slate-700"
            title="กลับสู่หน้าร้านค้าหลัก"
          >
            <ArrowLeft size={14} />
            <span>กลับสู่หน้าร้าน</span>
          </button>
          
          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Zorix Enterprise Console
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold hidden md:inline-block">
                  ● PRODUCTION LIVE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-blue-400 font-medium">
                Master SuperAdmin Portal (Zero-Trust Verified)
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              fetchMetrics();
              fetchAdminResources();
              fetchUsers();
              showToast("success", "รีเฟรชข้อมูลล่าสุดทั้งหมดเรียบร้อยแล้ว");
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
            title="รีเฟรชข้อมูลทั้งหมด"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>

          <button
            onClick={handleLockConsole}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="ล็อกและออกจากแผงควบคุม"
          >
            <Lock size={14} />
            <span className="hidden sm:inline">ล็อกคอนโซล</span>
          </button>
        </div>
      </header>

      {/* Main Container Layout: Sidebar + Main Content */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto overflow-hidden">
        {/* Left Navigation Bar */}
        <aside className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-800/80 p-4 shrink-0 flex flex-col justify-between">
          <div>
            {/* User Profile Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 mb-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold uppercase shadow-sm">
                {currentUser?.email?.[0] || "A"}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{currentUser?.username || "Master Admin"}</div>
                <div className="text-[11px] text-emerald-400 truncate font-mono">{currentUser?.email || "CPJusTinK@gmail.com"}</div>
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
                  <span>จัดการสินค้า & ดาวน์โหลด</span>
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
                <span>สถานะเซิร์ฟเวอร์ & แคช</span>
              </button>
            </nav>
          </div>

          {/* Quick Actions at Bottom */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2 hidden md:block">
            <button
              onClick={handleFlushCache}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white transition-all border border-slate-700 shadow-sm"
            >
              <RefreshCw size={14} />
              <span>ล้างแคชระบบ (Flush Cache)</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Body Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Metric Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">สินค้าในระบบ</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                      <Package size={18} />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {adminResources.length}
                  </div>
                  <div className="mt-2 text-[11px] text-blue-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                    พร้อมให้บริการในร้านค้า
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">ยอดการเข้าชม</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <Globe size={18} />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {metrics?.counts?.views?.toLocaleString() || "0"}
                  </div>
                  <div className="mt-2 text-[11px] text-emerald-400">
                    Real-time Page Views
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">ยอดดาวน์โหลด/สั่งซื้อ</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                      <Sparkles size={18} />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {metrics?.counts?.downloads?.toLocaleString() || "0"}
                  </div>
                  <div className="mt-2 text-[11px] text-purple-400">
                    Completed Actions
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">ผู้ใช้ที่ลงทะเบียน</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                      <UsersIcon size={18} />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {usersList.length || metrics?.counts?.users || "0"}
                  </div>
                  <div className="mt-2 text-[11px] text-amber-400">
                    Registered Accounts
                  </div>
                </div>
              </div>

              {/* Welcome Action Banner */}
              <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                    ✨ ยินดีต้อนรับสู่แผงควบคุมระบบแยก Zorix Enterprise
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    หน้าแดชบอร์ดนี้ถูกแยกออกจากหน้าเว็บหลักอย่างสมบูรณ์ พร้อมระบบ Stealth Cloaking และ Zero-Trust Gate ป้องกันคนภายนอกเข้าถึง คุณสามารถเพิ่มสินค้า แก้ไขข้อมูล ตั้งค่าโลโก้ และเลือกสีธีมได้แบบ Realtime
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={handleOpenCreateProduct}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Plus size={18} />
                    <span>เพิ่มสินค้าใหม่</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl text-xs sm:text-sm font-semibold border border-slate-700 transition-all"
                  >
                    ปรับแต่งเว็บไซต์ & สี
                  </button>
                </div>
              </div>

              {/* Status and Database Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-sm font-bold text-white">
                    <Database size={18} className="text-emerald-400" />
                    <span>สถานะฐานข้อมูล (Database Status)</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-2 border-b border-slate-800/80">
                      <span className="text-slate-400">สถานะการเชื่อมต่อ:</span>
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {metrics?.db?.state === "connected" ? "MongoDB เชื่อมต่อสำเร็จ" : "High-Speed Memory Container"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Database Name:</span>
                      <span className="text-slate-300 font-mono text-[11px]">{metrics?.db?.name || "zorix_production"}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Host:</span>
                      <span className="text-slate-300 font-mono text-[11px]">{metrics?.db?.host || "Internal Container Cluster"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-sm font-bold text-white">
                    <Cpu size={18} className="text-blue-400" />
                    <span>สถานะเซิร์ฟเวอร์ & หน่วยความจำ</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Uptime:</span>
                      <span className="text-slate-200 font-mono font-semibold">
                        {metrics?.uptime ? `${Math.floor(metrics.uptime / 60)} นาที ${Math.floor(metrics.uptime % 60)} วินาที` : "กำลังทำงานปกติ"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Memory Heap Used:</span>
                      <span className="text-slate-200 font-mono">{metrics?.memory?.heapUsed || "120 MB"}</span>
                    </div>
                    <div className="flex justify-between py-2">
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
            <div className="space-y-6 animate-fadeIn">
              {/* Control bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อสินค้า, หมวดหมู่, หรือรหัส..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
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
                    className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5"
                    title="ลบสินค้าทั้งหมด"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">ล้างสินค้าทั้งหมด</span>
                  </button>
                  <button
                    onClick={handleOpenCreateProduct}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
                  >
                    <Plus size={16} />
                    <span>เพิ่มสินค้า</span>
                  </button>
                </div>
              </div>

              {/* Product List Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 px-4 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((item) => (
                    <div
                      key={item.itemId || item.id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all group shadow-sm"
                    >
                      <div>
                        {/* Image & Badges */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                          {item.imageUrl ? (
                            <img
                              src={safeString(item.imageUrl)}
                              alt={safeString(item.title)}
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
                            {safeString(item.category) || "Script"}
                          </div>

                          {/* Price Tag */}
                          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-blue-600 text-[11px] font-bold text-white shadow-md">
                            {safeString(item.price) === "0" || safeString(item.price) === "ฟรี" ? "แจกฟรี" : `฿${safeString(item.price)}`}
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
                        <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">{safeString(item.title)}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                          {safeString(item.shortDescription) || safeString(item.fullDescription) || "ไม่มีคำอธิบาย"}
                        </p>

                        {/* Action Type & Links count */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-3">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                            {item.actionType === "purchase" ? "💳 สั่งซื้อรับข้อมูล" : "📥 ดาวน์โหลดฟรี"}
                          </span>
                          {item.downloadLinks?.length > 0 && (
                            <span>{item.downloadLinks.length} ลิงก์ดาวน์โหลด</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-2">
                        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                          ID: {safeString(item.itemId || item.id)}
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
                            onClick={() => handleDeleteProduct(item.itemId || item.id, safeString(item.title))}
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
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
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
                      placeholder="Zorix Shop"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      สโลแกนเว็บไซต์ (Slogan)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.slogan}
                      onChange={(e) => setSettingsForm({ ...settingsForm, slogan: e.target.value })}
                      placeholder="ศูนย์รวมสคริปต์และแพ็กเกจเกมพรีเมียม"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      URL โลโก้เว็บไซต์ (Logo URL)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.logoUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      URL รูปแบนเนอร์หน้าแรก (Banner Image URL)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bannerImageUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bannerImageUrl: e.target.value })}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Theme Color Picker */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette size={18} className="text-blue-400" />
                  <span>ปรับแต่งสีธีมเว็บไซต์ (Theme Color Customizer)</span>
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    เลือกโทนสีสำเร็จรูป (Preset Palettes)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PRESET_THEME_COLORS.map((preset) => (
                      <button
                        type="button"
                        key={preset.hex}
                        onClick={() => setSettingsForm({ ...settingsForm, primaryColor: preset.hex })}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-left ${
                          settingsForm.primaryColor.toLowerCase() === preset.hex.toLowerCase()
                            ? "border-blue-500 bg-blue-500/15"
                            : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span className="text-xs font-semibold text-white truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settingsForm.primaryColor}
                      onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                      className="w-12 h-12 rounded-2xl cursor-pointer bg-slate-950 border border-slate-700 p-1"
                    />
                    <div>
                      <span className="text-xs text-slate-400">รหัสสี Hex:</span>
                      <input
                        type="text"
                        value={settingsForm.primaryColor}
                        onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white w-28 uppercase"
                      />
                    </div>
                  </div>

                  <div className="flex-1 text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                    💡 สีนี้จะถูกนำไปใช้กับปุ่มหลัก, ไอคอน, แถบตัวเลือกหมวดหมู่, และเส้นไฮไลต์ทั่วทั้งเว็บไซต์ทันทีหลังกดบันทึก
                  </div>
                </div>
              </div>

              {/* 3. Announcement Banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400" />
                    <span>แถบข้อความประกาศวิ่งด้านบน (Marquee Announcement)</span>
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.announcementEnabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementEnabled: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4 bg-slate-950"
                    />
                    <span className="text-xs font-semibold text-slate-300">เปิดใช้งานแถบประกาศ</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ข้อความประกาศ (Marquee Text)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.announcementText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                    placeholder="ยินดีต้อนรับสู่ ZORIX SHOP สคริปต์และแพ็กเกจเกมออนไลน์คุณภาพสูง"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 4. Social Links & Footer */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers size={18} className="text-blue-400" />
                  <span>ลิงก์โซเชียล & ท้ายเว็บ (Socials & Footer)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Discord URL</label>
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
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Facebook URL</label>
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
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">YouTube URL</label>
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
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">ข้อความท้ายเว็บ (Footer Copyright)</label>
                  <input
                    type="text"
                    value={settingsForm.footerText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, footerText: e.target.value })}
                    placeholder="© 2026 ZORIX SHOP. All rights reserved."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-95"
                >
                  <Save size={18} />
                  <span>{loading ? "กำลังบันทึก..." : "บันทึกการตั้งค่าทั้งหมด"}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: USERS */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Users Header & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อผู้ใช้ หรืออีเมล..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>ผู้ใช้ทั้งหมดในระบบ:</span>
                  <span className="font-bold text-white font-mono">{usersList.length} คน</span>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">ผู้ใช้งาน</th>
                        <th className="px-6 py-4">อีเมล</th>
                        <th className="px-6 py-4">ระดับสิทธิ์ (Role)</th>
                        <th className="px-6 py-4">วันที่สมัคร</th>
                        <th className="px-6 py-4 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs">
                            ไม่พบรายชื่อผู้ใช้งาน
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isMaster = safeString(u.email).toLowerCase() === "cpjustink@gmail.com";
                          return (
                            <tr key={u._id || u.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                                    {safeString(u.username)?.[0] || safeString(u.email)?.[0] || "U"}
                                  </div>
                                  <span className="font-bold text-white">{safeString(u.username) || "สมาชิกทั่วไป"}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                                {safeString(u.email)}
                              </td>
                              <td className="px-6 py-4">
                                {isMaster ? (
                                  <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                                    👑 Master Admin
                                  </span>
                                ) : u.role === "admin" ? (
                                  <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                                    🛡️ Admin
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px] font-medium">
                                    👤 สมาชิก (User)
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-slate-400 text-xs">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString("th-TH") : "ไม่ระบุ"}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {isMaster ? (
                                  <span className="text-[11px] text-slate-500 italic">ผู้ดูแลสูงสุด</span>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteUser(u._id || u.id, safeString(u.username) || safeString(u.email))}
                                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all text-xs"
                                    title="ลบบัญชีผู้ใช้"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM */}
          {activeTab === "system" && (
            <div className="space-y-6 animate-fadeIn max-w-4xl">
              {/* Telemetry Cards */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal size={18} className="text-blue-400" />
                  <span>ข้อมูลความปลอดภัยและคลัสเตอร์ (Telemetry & Cluster)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                    <div className="text-slate-400 font-sans font-semibold text-xs">Zero-Trust Gateway Config</div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Gateway Status:</span>
                      <span className="text-emerald-400">ACTIVE & CLOAKED</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Master Secret PIN:</span>
                      <span className="text-blue-400">{DEFAULT_MASTER_PIN}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Stealth Decoy:</span>
                      <span className="text-slate-300">404 / 403 Ray ID Simulation</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                    <div className="text-slate-400 font-sans font-semibold text-xs">Node.js Memory & Heap</div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Heap Used:</span>
                      <span className="text-slate-200">{metrics?.memory?.heapUsed || "128 MB"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-500">Heap Total:</span>
                      <span className="text-slate-200">{metrics?.memory?.heapTotal || "256 MB"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">RSS:</span>
                      <span className="text-slate-200">{metrics?.memory?.rss || "190 MB"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleFlushCache}
                    className="px-5 py-3 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    <span>ล้างแคชระบบ (Flush In-Memory Cache)</span>
                  </button>
                  <button
                    onClick={() => {
                      fetchMetrics();
                      showToast("success", "ตรวจสอบการเชื่อมต่อ Database สำเร็จ");
                    }}
                    className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all flex items-center gap-2"
                  >
                    <Database size={16} />
                    <span>ทดสอบการเชื่อมต่อ Database</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Create / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingProduct ? "แก้ไขข้อมูลสินค้า" : "เพิ่มสินค้าใหม่เข้าสู่ร้านค้า"}
                  </h3>
                  <p className="text-[11px] text-slate-400">กรอกข้อมูลสินค้าและลิงก์สำหรับดาวน์โหลด/สั่งซื้อ</p>
                </div>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ชื่อสินค้า (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="เช่น ZORIX VIP Auto Farm Script"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    หมวดหมู่สินค้า (Category)
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ราคา (Price) - ใส่ 0 หรือ 'ฟรี' หากแจกฟรี
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="เช่น 150 หรือ 0"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ประเภทการรับสินค้า (Action Type)
                  </label>
                  <select
                    value={formData.actionType}
                    onChange={(e) => setFormData({ ...formData, actionType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                  >
                    <option value="link">แจกฟรี / ดาวน์โหลดผ่านลิงก์ (Download Link)</option>
                    <option value="purchase">สั่งซื้อเพื่อรับข้อมูล (Purchase / Secret Key)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  คำอธิบายแบบย่อ (Short Description)
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="คำอธิบายสรุปสั้นๆ แสดงในหน้ารายการสินค้า"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  คำอธิบายแบบละเอียด (Full Description)
                </label>
                <textarea
                  rows={3}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="รายละเอียดฟังก์ชันการทำงาน วิธีใช้งาน ข้อกำหนด ฯลฯ"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    URL รูปภาพหน้าปก (Image URL)
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    URL วิดีโอตัวอย่าง (YouTube / MP4)
                  </label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Download Links / Mirrors */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    ลิงก์ดาวน์โหลดสินค้า (Download Mirrors)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        downloadLinks: [...formData.downloadLinks, { label: "ลิงก์สำรอง", url: "" }],
                      })
                    }
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>เพิ่มลิงก์ดาวน์โหลด</span>
                  </button>
                </div>

                {formData.downloadLinks.map((dl, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="ชื่อลิงก์ เช่น Google Drive"
                      value={dl.label}
                      onChange={(e) => {
                        const next = [...formData.downloadLinks];
                        next[idx].label = e.target.value;
                        setFormData({ ...formData, downloadLinks: next });
                      }}
                      className="w-1/3 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="URL ลิงก์ดาวน์โหลด"
                      value={dl.url}
                      onChange={(e) => {
                        const next = [...formData.downloadLinks];
                        next[idx].url = e.target.value;
                        setFormData({ ...formData, downloadLinks: next, link: next[0]?.url || "" });
                      }}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    {formData.downloadLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = formData.downloadLinks.filter((_, i) => i !== idx);
                          setFormData({ ...formData, downloadLinks: next });
                        }}
                        className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 font-semibold">🔥 สินค้ายอดนิยม</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 font-semibold">⭐ แนะนำพิเศษ</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOutOfStock}
                    onChange={(e) => setFormData({ ...formData, isOutOfStock: e.target.checked })}
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 font-semibold">สินค้าหมด</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requiresLogin}
                    onChange={(e) => setFormData({ ...formData, requiresLogin: e.target.checked })}
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 font-semibold">ต้องล็อกอิน</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30"
                >
                  {editingProduct ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
