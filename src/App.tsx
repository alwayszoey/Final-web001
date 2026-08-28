import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { 
  Search, ShieldAlert, ShieldCheck, Download, X, RefreshCcw, LayoutGrid, Layers, 
  Archive, Settings, FileText, Check, Zap, Menu, ArrowLeft, 
  Home, HelpCircle, Share2, Facebook, Instagram, MessageCircle,
  Play, ChevronRight, Loader2, Youtube, Send, MessageSquare, Sun, Moon, Lock, UserPlus, LogOut, Users, Eye, Star, Flame, ShoppingCart, Sparkles, ShoppingBag, History, HardDriveDownload, ExternalLink, Link2,
  CircleX, Plus
} from 'lucide-react';
import { resourcesData, ResourceItem, categoriesData } from './data';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Turnstile } from '@marsidev/react-turnstile';

import { translations } from './translations';
import { siteConfig } from './config';
import { AuthModal } from './AuthModal';
import { ProfileModal } from './ProfileModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';

const EMOTICONS = ['🇹🇭', '🇻🇳', '🎮', '🚀', '✨', '🎁', '🔥', '💖', '👋'];

type ViewState = 'home' | 'details' | 'help' | 'category' | 'history';
type AppLang = 'vi' | 'th';

const StatsCard = ({ icon: Icon, title, value, unit }: { icon: any, title: string, value: string | number, unit: string }) => (
  <div className="relative overflow-hidden rounded-[16px] sm:rounded-[20px] flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 bg-card-bg/60 backdrop-blur-md border border-border-subtle shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-shadow">
    <div className="absolute -right-2 -bottom-2 pointer-events-none opacity-[0.03] text-brand">
      <Icon className="w-16 h-16 sm:w-20 sm:h-20" />
    </div>
    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-[12px] bg-brand/10 text-brand">
      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-xs font-medium leading-tight mb-0.5 text-text-muted">{title}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg sm:text-xl font-bold tabular-nums leading-none text-text-main">
          {value}
        </span>
        <span className="text-[10px] sm:text-xs font-medium text-text-muted/70 whitespace-nowrap">{unit}</span>
      </div>
    </div>
  </div>
);

// ============================================================================
// 📌 COMPONENT: PromoPopup (แก้ไข Popup แจ้งเตือน/โฆษณา ตอนเข้าเว็บได้ที่นี่)
// ============================================================================
function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShow1Hour, setDontShow1Hour] = useState(false);

  useEffect(() => {
    // Only show if they've visited before (so welcome screen doesn't overlap) or just wait until welcome state is done
    const hiddenUntil = localStorage.getItem('hidePromoUntil');
    if (hiddenUntil && Date.now() < parseInt(hiddenUntil, 10)) {
      return;
    }
    
    // Slight delay so it poops up nicely after page load
    const t = setTimeout(() => {
      setIsOpen(true);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    if (dontShow1Hour) {
      localStorage.setItem('hidePromoUntil', (Date.now() + 60 * 60 * 1000).toString());
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-5 overflow-auto"
        >
          <motion.div 
            initial={{ scale: 0.8, y: 50, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0, transition: { type: "spring", bounce: 0.5, duration: 0.6 } }}
            exit={{ scale: 0.8, y: -50, opacity: 0, rotate: 5, transition: { duration: 0.3, type: "tween", ease: "easeInOut" } }}
            className="relative shadow-2xl rounded-2xl max-w-full"
          >
            <a href="https://discord.gg/hSuBbnwWZY" target="_blank" rel="noopener noreferrer" className="block outline-none ring-offset-2 ring-offset-black focus-visible:ring-2 focus-visible:ring-brand rounded-2xl">
              <img src={siteConfig.promoPopupImageUrl} alt="Join Discord" className="block w-[800px] max-w-[90vw] h-auto aspect-square object-contain rounded-2xl" />
            </a>
            
            <button 
              aria-label="ปิด" 
              onClick={handleClose} 
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#ffffff] text-[#000000] border-none text-base font-bold cursor-pointer flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-transform z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100000] bg-[#000000]/20 backdrop-blur-[24px] px-5 py-3 rounded-2xl border border-[#ffffff]/20 flex items-center gap-4 text-[#ffffff] text-[13px] flex-wrap w-max max-w-[calc(100%-40px)] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
          >
            <label className="inline-flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
              <input type="checkbox" checked={dontShow1Hour} onChange={(e) => setDontShow1Hour(e.target.checked)} className="accent-brand w-4 h-4 cursor-pointer" />
              <span className="font-medium text-[#ffffff]/90">ไม่แสดงอีก 1 ชั่วโมง</span>
            </label>
            <div className="w-[1px] h-4 bg-[#ffffff]/20 mx-1"></div>
            <button onClick={handleClose} className="px-4 py-1.5 bg-[#ffffff]/20 hover:bg-[#ffffff]/30 text-[#ffffff] border border-[#ffffff]/20 rounded-xl text-[13px] font-semibold cursor-pointer active:scale-95 transition-all whitespace-nowrap shadow-sm">
              ปิดทั้งหมด
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// 📌 COMPONENT: App (ส่วนหลักของเว็บไซต์ รวบรวมหน้าต่างๆ ไว้ที่นี่)
// ============================================================================
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [lang, setLang] = useState<AppLang | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);

  const [welcomeState, setWelcomeState] = useState<'welcome' | 'checking' | 'done'>('done');
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // ==========================================
  // 📌 ตัวแปร State ต่างๆ ในระบบ
  // ==========================================
  // ====== AUTH STATES ======
  const [authModalType, setAuthModalType] = useState<'login' | 'register' | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string, username: string, email: string, avatarUrl?: string, history?: any[] } | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // ====== STATS STATES ======
  const [appStats, setAppStats] = useState<{ 
      users: number, views: number, downloads: number, 
      itemDownloads?: Record<string, number>,
      trustData?: {name: string, users: number}[], 
      performanceData?: {name: string, score: number}[] 
  }>(() => {
    try {
      const cached = localStorage.getItem('cachedStats');
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
    return { users: 0, views: 0, downloads: 0, trustData: [], performanceData: [] };
  });

// ── OAuth: รับ token จาก popup (postMessage) ──────────────────────────────
useEffect(() => {
  // --- Security Cleanup: Remove old insecure keys from previous versions ---
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('purchaseDetails'); 
  // ----------------------------------------------------------------------

  const handleOAuthMessage = (event: MessageEvent) => {
    if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
      const { user } = event.data;
      if (!user) return;
      setCurrentUser({ id: user.id || user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, history: user.history });
    }
  };
  window.addEventListener('message', handleOAuthMessage);
  return () => window.removeEventListener('message', handleOAuthMessage);
}, []);

// ── Session Check: Cookies are automatically sent back, so no token fallback needed ──
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  if (urlToken) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);

  
  useEffect(() => {
    // Theme Initializer (Default to system preference on first visit)
    const savedTheme = localStorage.getItem('appTheme') as 'light' | 'dark';
    if (savedTheme === 'dark') {
      setTheme('dark');
    } else if (savedTheme === 'light') {
      setTheme('light');
    } else {
      // No saved theme, check system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setTheme('dark');
        localStorage.setItem('appTheme', 'dark');
      } else {
        setTheme('light');
        localStorage.setItem('appTheme', 'light');
      }
    }

    setWelcomeState('done'); // Temporarily bypass the welcome screen

    // Check Auth Session
    fetch('/api/auth/me')
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        setCurrentUser({ 
          id: data.user.id || data.user._id, 
          username: data.user.username, 
          email: data.user.email, 
          role: data.user.role, 
          avatarUrl: data.user.avatarUrl, 
          history: data.user.history 
        });
      }
    })
    .catch(err => {
      console.error("Session check failed:", err);
    });

    // Fetch dynamic catalog and site settings from backend
    fetchPublicCatalogAndSettings();

    // Fetch initial app stats and setup polling for real-time updates
    const fetchStats = () => {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const newStats = { 
                users: data.users, 
                views: data.views, 
                downloads: data.downloads,
                itemDownloads: data.itemDownloads || {},
                trustData: data.trustData || [],
                performanceData: data.performanceData || []
            };
            setAppStats(newStats);
            localStorage.setItem('cachedStats', JSON.stringify(newStats));
          }
        })
        .catch(err => { /* quiet fail */ });
    };

    fetchStats();
    const statsInterval = setInterval(fetchStats, 3000);

    // Increment view counter if not viewed this session
    if (!sessionStorage.getItem('hasViewed')) {
      fetch('/api/stats/view', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAppStats(prev => {
              const newStats = { ...prev, views: data.views };
              localStorage.setItem('cachedStats', JSON.stringify(newStats));
              return newStats;
            });
            sessionStorage.setItem('hasViewed', 'true');
          }
        })
        .catch(err => console.error("Failed to increment view:", err));
    }

    // Simulate loading to ensure everything is ready
    setTimeout(() => {
      setIsAppLoading(false);
    }, 1500);

    return () => clearInterval(statsInterval);
  }, []);

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).then(() => {
      setCurrentUser(null);
      setIsMobileMenuOpen(false);
    });
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('appTheme', nextTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#000000';
      body.style.backgroundColor = '#000000';
      metaThemeColor.setAttribute('content', '#000000');
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#ffffff';
      body.style.backgroundColor = '#ffffff';
      metaThemeColor.setAttribute('content', '#ffffff');
    }
  }, [theme]);

  const t = (key: keyof typeof translations) => {
    return translations[key] || key;
  };

  const getLocalized = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val['th'] || val['vi'] || '';
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [_currentView, _setCurrentView] = useState<ViewState | 'about' | 'contact'>('home');
  const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);

  // Dynamic Catalog and Settings from Backend
  const [dynamicResources, setDynamicResources] = useState<ResourceItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Check Master Admin (Authorized for cpjustink@gmail.com and admin role)
  const isMasterAdmin = (user: any) => {
    if (!user) return false;
    return user.email?.toLowerCase() === 'cpjustink@gmail.com' || user.role === 'admin';
  };

  // Fetch Public Catalog and Site Settings
  const fetchPublicCatalogAndSettings = async () => {
    try {
      const [settingsRes, resourcesRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/resources')
      ]);

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData.success && sData.settings) {
          setSiteSettings(sData.settings);
        }
      }

      if (resourcesRes.ok) {
        const rData = await resourcesRes.json();
        if (rData.success && Array.isArray(rData.resources)) {
          setDynamicResources(rData.resources);
        }
      }
    } catch (err) {
      console.error("Failed to load catalog or site settings:", err);
    }
  };

  // Dynamically apply site settings color to CSS Variables
  useEffect(() => {
    if (siteSettings?.primaryColor) {
      const color = siteSettings.primaryColor;
      document.documentElement.style.setProperty('--theme-brand', color);
      document.documentElement.style.setProperty('--theme-brand-hover', color);
      document.documentElement.style.setProperty('--theme-brand-light', `${color}22`);
    }
  }, [siteSettings?.primaryColor]);

  // Merge dynamic settings with static defaults
  const activeConfig = {
    ...siteConfig,
    name: siteSettings?.name || siteConfig.name || "Zorix Shop",
    logoUrl: siteSettings?.logoUrl || siteConfig.logoUrl,
    slogan: siteSettings?.slogan || "ศูนย์รวมสคริปต์ ม็อด และแพ็กเกจเกมพรีเมียมคุณภาพสูง",
    bannerImageUrl: siteSettings?.bannerImageUrl || siteConfig.bannerImageUrl,
    promoPopupImageUrl: siteSettings?.promoPopupImageUrl || siteConfig.promoPopupImageUrl,
    announcementText: siteSettings?.announcementText !== undefined ? siteSettings.announcementText : "ยินดีต้อนรับสู่ ZORIX SHOP เว็บไซต์จำหน่ายสคริปต์และทรัพยากรเกมออนไลน์คุณภาพสูง ปลอดภัย 100%",
    announcementEnabled: siteSettings?.announcementEnabled !== undefined ? siteSettings.announcementEnabled : true,
    announcementLink: siteSettings?.announcementLink || "",
    socials: {
      ...siteConfig.socials,
      ...(siteSettings?.socials || {})
    },
    footerText: siteSettings?.footerText || "© 2026 ZORIX SHOP. All rights reserved.",
  };

  // Sync route with view
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') _setCurrentView('home');
    else if (path === '/category') _setCurrentView('category');
    else if (path.startsWith('/shop/product/')) {
        const id = path.split('/').pop();
        const item = dynamicResources.find(r => String(r.id || (r as any).itemId) === id);
        if (item) {
            setSelectedItem(item);
            _setCurrentView('details');
        } else {
            _setCurrentView('home');
        }
    }
    else if (path === '/history') _setCurrentView('history');
    else if (path === '/help') _setCurrentView('help');
    else if (path === '/about') _setCurrentView('about');
    else if (path === '/contact') _setCurrentView('contact');
  }, [location.pathname, dynamicResources]);

  const currentView = _currentView;
  const setCurrentView = (view: ViewState | 'about' | 'contact', params?: { id?: string | number }) => {
    if (view === 'home') navigate('/');
    else if (view === 'category') navigate('/category');
    else if (view === 'details') navigate('/shop/product/' + (params?.id || selectedItem?.id || (selectedItem as any)?.itemId || ''));
    else if (view === 'history') navigate('/history');
    else if (view === 'help') navigate('/help');
    else if (view === 'about') navigate('/about');
    else if (view === 'contact') navigate('/contact');
  };

  const [activeLinkId, setActiveLinkId] = useState<number | null>(null);
  const [purchasedDetails, setPurchasedDetails] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSocialsModal, setShowSocialsModal] = useState(false);
  
  // Use categories strictly from categoriesData
  const categories = ['ALL', ...categoriesData.map(c => c.name)];

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showOrderConfirmModal, setShowOrderConfirmModal] = useState(false);
  const [showPurchaseSuccessModal, setShowPurchaseSuccessModal] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  
  // History view states
  const [historyFilter, setHistoryFilter] = useState<'all' | 'purchase' | 'link'>('all');
  const [selectedHistories, setSelectedHistories] = useState<Set<number>>(new Set());
  
  // Feedback States
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  type StepStatus = 'idle' | 'checking' | 'completed' | 'error';
  const [step1Status, setStep1Status] = useState<StepStatus>('idle');
  const [step2Status, setStep2Status] = useState<StepStatus>('idle');
  const step1OpenedAt = useRef<number>(0);
  const step2OpenedAt = useRef<number>(0);
  const [isChecked, setIsChecked] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [isCounting, setIsCounting] = useState(false);
  const [isNetworkChecking, setIsNetworkChecking] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [downloadKey, setDownloadKey] = useState<string | null>(null);

  // Auto-redirect to home grid if user types in search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() !== '') {
      if (currentView !== 'category') {
        setCurrentView('category');
      }
      setActiveCategory('ALL');
    } else if (currentView === 'category' && activeCategory === 'ALL' && e.target.value === '') {
      setCurrentView('home');
    }
    if (selectedItem) setSelectedItem(null);
  };

  const filteredResources = dynamicResources.filter(item => {
    const isAll = activeCategory === 'ALL';
    const matchesCategory = isAll || item.category === activeCategory;
    
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    // Getting localized strings for accurate searching
    const titleText = getLocalized(item.title).toLowerCase();
    const descText = getLocalized(item.shortDescription).toLowerCase();
    
    const hasTagMatch = (item.tags || []).some(tag => tag.toLowerCase().includes(query));
    
    const isMatch = titleText.includes(query) || descText.includes(query) || hasTagMatch;
    
    return matchesCategory && isMatch;
  });

  const handleOpenDetails = (item: ResourceItem) => {
    setSelectedItem(item);
    setCurrentView('details', { id: String(item.id) });
  };

  const handleGetLink = (e?: React.MouseEvent, item?: ResourceItem, linkIndex?: number) => {
    if (e) e.stopPropagation();
    
    // Determine which item we are acting on
    const targetItem = item || selectedItem;
    if (targetItem) setSelectedItem(targetItem);
    
    // Check if user is not logged in and either item requires login or it's a purchase
    if (!currentUser && (targetItem?.requiresLogin || targetItem?.actionType === 'purchase')) {
      setAuthModalType('login');
      return;
    }

    if (targetItem?.actionType === 'purchase') {
      setShowOrderConfirmModal(true);
      return;
    }
    
    setActiveLinkId(linkIndex !== undefined ? linkIndex : null);
    
    setStep1Status('idle');
    setStep2Status('idle');
    setIsChecked(false);
    setCountdown(15);
    setIsCounting(false);
    setNetworkError(null);
    setIsNetworkChecking(false);
    setDownloadKey(null);
    setShowVerifyModal(true);
  };

  const handlePurchaseConfirm = async () => {
      if (!selectedItem) return;
      setIsProcessingOrder(true);

      try {
        const res = await fetch('/api/buy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: selectedItem.id })
        });
        const data = await res.json();
        
        if (data.success) {
           const finalDetails = data.details || 'ไม่พบรายละเอียด';
           setPurchasedDetails(finalDetails);
           
           await addHistoryRecord('purchase', selectedItem, finalDetails);
           
           // Increment download/sales stat
           fetch('/api/stats/download', { 
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ itemId: selectedItem.id })
           })
             .then(res => res.json())
             .then(statData => {
               if (statData.success) {
                  setAppStats(prev => {
                    const newStats = { 
                      ...prev, 
                      downloads: statData.downloads,
                      itemDownloads: {
                         ...prev.itemDownloads,
                         [selectedItem.id]: statData.itemDownloads
                      }
                    };
                    localStorage.setItem('cachedStats', JSON.stringify(newStats));
                    return newStats;
                  });
               }
             }).catch(err => console.error("Failed to update stat", err));

           setIsProcessingOrder(false);
           setShowOrderConfirmModal(false);
           setShowPurchaseSuccessModal(true);
        } else {
           alert("Purchase failed: " + data.error);
           setIsProcessingOrder(false);
        }
      } catch (err) {
        alert("An error occurred processing your purchase.");
        setIsProcessingOrder(false);
      }
  };

  const handleVerifyRecaptcha = async (token: string | null) => {
    if (!token) return;
    if (step1Status !== 'completed' || step2Status !== 'completed') {
      alert(t('alertSteps'));
      return;
    }
    if (isChecked || isNetworkChecking) return;

    setIsNetworkChecking(true);
    setNetworkError(null);

    // --- REINSTATE CLIENT-SIDE VPN / PROXY CHECK ---
    let isVpn = false;
    let errorMessage = "";

    try {
      // 1. IP Check via GeoJS (Great for detecting Cloudflare WARP/1.1.1.1 and Cloud hosts)
      const geoRes = await fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store' });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const org = (geoData.organization || "").toLowerCase();
        
        if (org.includes('cloudflare') || org.includes('warp') || org.includes('digitalocean') || org.includes('amazon') || org.includes('google cloud') || org.includes('microsoft')) {
           isVpn = true;
           errorMessage = "❌ Phát hiện kết nối VPN hoặc 1.1.1.1 (WARP). Vui lòng tắt và thao tác lại! / พบการเชื่อมต่อ VPN หรือ 1.1.1.1 (WARP) โปรดปิดและลองอีกครั้ง!";
        }
      }
    } catch (err) {
      console.warn("GeoJS API Network Warning (Adblock/Brave):", err);
    }

    if (!isVpn) {
      try {
        // 2. IP Check via ipwho.is (Backup - Fully supports HTTPS)
        const proxyRes = await fetch('https://ipwho.is/', { cache: 'no-store' });
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          const org = (proxyData.connection?.org || "").toLowerCase();
          
          if (proxyData.security && (proxyData.security.vpn || proxyData.security.proxy || proxyData.security.tor)) {
             isVpn = true;
             errorMessage = "❌ Phát hiện sử dụng VPN hoặc Proxy. Vui lòng tắt trước khi tiếp tục! / ตรวจพบการใช้ VPN หรือ Proxy โปรดปิดก่อนดำเนินการต่อ!";
          } else if (org.includes('cloudflare') || org.includes('warp')) {
             isVpn = true;
             errorMessage = "❌ Phát hiện kết nối VPN hoặc 1.1.1.1 (WARP). Vui lòng tắt và thao tác lại! / พบการเชื่อมต่อ VPN หรือ 1.1.1.1 (WARP) โปรดปิดและลองอีกครั้ง!";
          }
        }
      } catch (err) {
        console.warn("IPWhoIs API Network Warning:", err);
      }
    }

    if (isVpn) {
      setNetworkError(errorMessage);
      setIsNetworkChecking(false);
      // Reset ReCAPTCHA (optional, but they'd have to reload or close/open modal to try again anyway)
      return; 
    }
    // --- END VPN CHECK ---

    try {
      const response = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          itemId: selectedItem?.id,
          linkIndex: activeLinkId
        })
      });

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseErr) {
        throw new Error(`Server returned invalid response: ${textResponse.substring(0, 50)}...`);
      }
      
      if (!response.ok || !data.success) {
        setNetworkError(data.error || "Captcha verification failed");
        setIsNetworkChecking(false);
        return;
      }

      // Success
      setDownloadKey(data.key);
      setIsChecked(true);
      setIsCounting(true);
      setIsNetworkChecking(false);
    } catch (err: any) {
      console.error(err);
      setNetworkError(`Error: ${err.message || 'Network connection failed'}`);
      setIsNetworkChecking(false);
    }
  };

  const addHistoryRecord = async (type: 'link' | 'purchase', item: ResourceItem, detailsText: string) => {
    if (!currentUser) return;
    try {
       const res = await fetch('/api/auth/history', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            id: item.id,
            type,
            title: getLocalized(item.title),
            details: detailsText,
            price: item.price
         })
       });
       if (res.ok) {
           const data = await res.json();
           if (data.history) {
               setCurrentUser({ ...currentUser, history: data.history });
           }
       }
    } catch (err) {
       console.error("Failed to add history", err);
    }
  };

  const appHistories = currentUser?.history || [];
  const filteredHistories = historyFilter === 'all' 
    ? appHistories 
    : appHistories.filter((h: any) => h.type === historyFilter);

  const handleToggleHistorySelect = (index: number) => {
      const newSet = new Set(selectedHistories);
      if (newSet.has(index)) {
          newSet.delete(index);
      } else {
          newSet.add(index);
      }
      setSelectedHistories(newSet);
  };

  const handleSelectAllHistories = (isAllSelected: boolean) => {
      if (isAllSelected) {
          setSelectedHistories(new Set<number>());
      } else {
          const newSet = new Set<number>();
          filteredHistories.forEach((_: any, i: number) => newSet.add(i));
          setSelectedHistories(newSet);
      }
  };

  const downloadSelectedHistoryAsTxt = () => {
    if (selectedHistories.size === 0) return;
    const itemsToDownload = Array.from<number>(selectedHistories).sort((a: number, b: number) => a - b).map(i => {
        const h = filteredHistories.slice().reverse()[i];
        return h;
    });

    const content = itemsToDownload.map(h => {
        return `[${h.type === 'purchase' ? 'สั่งซื้อ' : 'Get Link'}] ${h.title}
วันที่: ${new Date(h.date).toLocaleString('th-TH')}
${h.price ? 'ราคา: ' + h.price + '\n' : ''}รายละเอียด:
${h.details || '-'}
----------------------------------------`;
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ประวัติการสั่งซื้อ_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setSelectedHistories(new Set());
  };

  const handleFinalRedirect = () => {
    if (selectedItem && downloadKey) {
      if (countdown > 0 || !isChecked) {
        alert(t('alertTimer'));
        return;
      }
      
      // Increment download stat
      fetch('/api/stats/download', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: selectedItem.id })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
             setAppStats(prev => {
               const newStats = { 
                 ...prev, 
                 downloads: data.downloads,
                 itemDownloads: {
                    ...prev.itemDownloads,
                    [selectedItem.id]: data.itemDownloads
                 }
               };
               localStorage.setItem('cachedStats', JSON.stringify(newStats));
               return newStats;
             });
          }
        })
        .catch(err => console.error("Failed to increment download:", err));

      if (currentUser) {
         addHistoryRecord('link', selectedItem, 'Link Accessed');
      }

      window.open(`/api/download/${downloadKey}`, '_blank');
      setShowVerifyModal(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isCounting && countdown === 0) {
      setIsCounting(false);
    }
    return () => clearTimeout(timer);
  }, [isCounting, countdown]);

  useEffect(() => {
    const handleDocumentFocus = () => {
      // Add a small delay to simulate processing and let the page render properly
      setTimeout(() => {
        const now = Date.now();
        
        setStep1Status(prev => {
          if (prev === 'checking') {
            const timeDiff = now - step1OpenedAt.current;
            if (timeDiff >= 12000) { // 12 seconds cooldown
              return 'completed';
            } else {
              alert(t('alertErrYT'));
              return 'error';
            }
          }
          return prev;
        });

        setStep2Status(prev => {
          if (prev === 'checking') {
            const timeDiff = now - step2OpenedAt.current;
            if (timeDiff >= 5000) { // 5 seconds cooldown
              return 'completed';
            } else {
              alert(t('alertErrTG'));
              return 'error';
            }
          }
          return prev;
        });
      }, 800);
    };

    window.addEventListener('focus', handleDocumentFocus);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleDocumentFocus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleDocumentFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleEnterStore = () => {
    sessionStorage.setItem('hasVerifiedEntry', 'true');
    setWelcomeState('checking');
    setTimeout(() => {
      setWelcomeState('done');
    }, 1500); // Wait 1.5s reading the welcome message
  };

  const handleRecaptchaChange = (token: string | null) => {
    // Kept to prevent breaking just in case, but no longer used for language select
  };

  // ============================================================================
  // 📌 1. หน้าต่างต้อนรับก่อนเข้าเว็บ (Welcome Screen)
  // ============================================================================
  if (welcomeState !== 'done') {
    return (
      <div className="fixed inset-0 overflow-hidden bg-bg-app z-[999] flex flex-col justify-center items-center p-4">
        {/* Floating Emojis Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-20 text-3xl sm:text-4xl"
              initial={{ 
                top: '-10%', 
                left: `${Math.random() * 100}%`, 
                rotate: 0 
              }}
              animate={{ 
                top: '110%', 
                left: `${Math.random() * 100}%`, 
                rotate: Math.random() * 360 
              }}
              transition={{ 
                duration: 6 + Math.random() * 6, 
                repeat: Infinity, 
                ease: 'linear', 
                delay: Math.random() * 5 
              }}
            >
              {EMOTICONS[Math.floor(Math.random() * EMOTICONS.length)]}
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
          className="bg-card-bg/95 backdrop-blur-xl max-w-md w-full p-8 rounded-[32px] text-center shadow-2xl relative z-10 border border-border-subtle"
        >
          <img src={siteConfig.logoUrl} alt="Logo" className="h-16 mx-auto mb-6 object-contain drop-shadow-md" />
          
          <AnimatePresence mode="wait">
            {welcomeState === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
                <h2 className="flex flex-col gap-1 font-bold tracking-tight mb-2">
                  <span className="text-[20px] sm:text-[22px] text-text-main">ยินดีต้อนรับสู่</span>
                  <span className="text-[32px] sm:text-[40px] font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 pb-1 drop-shadow-md">ZORIX SHOP</span>
                </h2>
                <h2 className="text-[15px] sm:text-[16px] font-normal text-text-muted mb-8 leading-relaxed">
                  ศูนย์รวมซอร์สโค้ดและสคริปต์คุณภาพสูง พร้อมใช้สำหรับโปรเจกต์ของคุณ
                </h2>
                
                <div className="flex justify-center mb-6">
                  <Turnstile
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAADFFAhm_1PRQij4M"}
                    onSuccess={(token) => setIsTurnstileVerified(true)}
                    options={{ theme: theme as any }}
                  />
                </div>

                <button 
                  onClick={handleEnterStore}
                  disabled={!isTurnstileVerified}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-[16px] bg-brand hover:brightness-110 border-2 border-transparent text-white transition-all text-[16px] font-bold cursor-pointer shadow-lg shadow-brand/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  เข้าสู่ ZORIX SHOP <ChevronRight className="w-5 h-5 opacity-80" />
                </button>
              </motion.div>
            )}

            {welcomeState === 'checking' && (
              <motion.div key="checking" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8">
                <Loader2 className="w-12 h-12 text-brand animate-spin mx-auto mb-6" />
                <h2 className="text-[22px] font-bold text-text-main mb-2">กำลังเตรียมข้อมูลร้านค้า...</h2>
                <p className="text-[15px] font-medium text-text-muted">โปรดรอสักครู่</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  if (isAppLoading) {
    return (
      <div className="fixed inset-0 bg-bg-app z-[9999] flex flex-col justify-center items-center">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, ease: "easeOut" }}
           className="flex flex-col items-center gap-6 cursor-default"
        >
          <div className="relative">
            {/* Glow effect matching the brand */}
            <div className="absolute inset-0 bg-brand/30 blur-3xl rounded-full scale-150 animate-pulse" style={{ animationDuration: '3s' }}></div>
            {/* Logo scaling up and glowing slightly */}
            <motion.img 
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              src={siteConfig.logoUrl} 
              alt="Logo" 
              className="w-20 sm:w-24 h-auto object-contain drop-shadow-xl relative z-10" 
            />
          </div>
          
          <div className="flex flex-col items-center gap-3 mt-4">
            <h2 className="text-text-main font-bold tracking-tight text-xl sm:text-2xl flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
              {t('loadingData')}
            </h2>
            <p className="text-text-muted text-sm px-6 text-center max-w-[300px]">
              กำลังเตรียมระบบและการเชื่อมต่อข้อมูลสำหรับคุณ โปรดรอสักครู่
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================================================
  // 📌 RENDER - โครงสร้าง HTML ทั้งหมดของเว็บ
  // ============================================================================
  return (
    <div className="relative flex flex-col min-h-[100dvh] bg-bg-app text-text-main font-sans selection:bg-brand selection:text-white overscroll-none">
      
      {/* Background with Full Image and Gradient Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Full Image */}
        <div 
          className="absolute inset-0 opacity-60 dark:opacity-80"
          style={{
            backgroundImage: `url('https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cTJ3d2k5aTJxdW5kOWJnYWo1OWpiN2N0YmowcDRxMWtpMzlvY25taiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8gSh4No47eIGA/giphy.gif')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-app/50 via-bg-app/80 to-bg-app" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-brand/10" />
      </div>

      <PromoPopup />

      {/* ========================================================================= */}
      {/* TOP NAVBAR */}
      {/* ========================================================================= */}
      {/* 📌 NAVBAR (แถบเมนูด้านบนสุด) */}
      {/* ========================================================================= */}
      <nav className="sticky top-0 z-40 bg-card-bg/95 backdrop-blur-xl border-b border-border-subtle px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        
        {/* Logo Section */}
        <div 
          onClick={() => { setCurrentView('home'); setSelectedItem(null); }} 
          className="flex items-center gap-3 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src={activeConfig.logoUrl} alt={activeConfig.name || "Logo"} className="h-9 sm:h-10 object-contain drop-shadow-sm max-w-[140px] sm:max-w-[180px]" />
        </div>
        
        {/* Center Search Bar */}
        <div className="flex-1 max-w-2xl relative mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted" />
          </div>
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full py-2.5 pl-11 pr-4 bg-bg-app border border-border-subtle focus:bg-card-bg rounded-[16px] text-[14px] sm:text-[15px] shadow-inner focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-muted font-normal text-text-main"
          />
        </div>

        {/* Right Actions & Burger Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative">
          
          {/* Master Admin Panel Quick Button */}
          {isMasterAdmin(currentUser) && (
            <button 
              onClick={() => setShowAdminDashboard(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[14px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all border border-blue-400/30 active:scale-95"
              title="เปิดแผงควบคุมระบบแอดมิน (Authorized: cpjustink@gmail.com)"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>แดชบอร์ดแอดมิน</span>
            </button>
          )}

          <button 
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 text-text-muted bg-card-bg border border-border-subtle hover:bg-bg-app rounded-[12px] transition-colors shadow-sm"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 sm:p-2.5 text-text-muted bg-card-bg border border-border-subtle hover:bg-bg-app rounded-[12px] transition-colors shadow-sm"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* ANNOUNCEMENT BANNER */}
      {activeConfig.announcementEnabled !== false && (
        <div className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 overflow-hidden h-8 relative flex items-center shrink-0 w-full">
          <div className="animate-marquee flex items-center h-full absolute whitespace-nowrap px-4">
            <div className="shrink-0 flex items-center whitespace-nowrap">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 mx-3 text-white" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="text-xs font-medium text-white">
                {activeConfig.announcementText || t('marquee')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* BURGER MENU DROPDOWN */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 top-[68px] bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-[68px] right-0 sm:right-6 w-full sm:w-[280px] bg-card-bg border-b sm:border border-border-subtle sm:rounded-[24px] shadow-2xl z-50 p-4 flex flex-col gap-1.5"
            >
              {/* Master Admin Button inside Mobile Menu */}
              {isMasterAdmin(currentUser) && (
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); setShowAdminDashboard(true); }}
                  className="flex items-center gap-3 p-3.5 rounded-[16px] bg-gradient-to-r from-blue-600/15 to-indigo-600/15 border border-blue-500/30 text-left font-bold text-blue-500 hover:text-blue-400 hover:bg-blue-500/25 transition-all w-full group mb-1 shadow-sm"
                >
                  <ShieldCheck className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span>แดชบอร์ดแอดมิน (Admin Panel)</span>
                </button>
              )}

              <button 
                onClick={() => { setIsMobileMenuOpen(false); setCurrentView('home'); setSelectedItem(null); }} 
                className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-bg-app text-left font-medium text-text-main hover:text-brand transition-colors w-full group"
              >
                <Home className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('home')}
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setCurrentView('about'); setSelectedItem(null); }} 
                className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-bg-app text-left font-medium text-text-main hover:text-brand transition-colors w-full group"
              >
                <Users className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> เกี่ยวกับเรา
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setCurrentView('contact'); setSelectedItem(null); }} 
                className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-bg-app text-left font-medium text-text-main hover:text-brand transition-colors w-full group"
              >
                <MessageSquare className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> ติดต่อเรา
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setCurrentView('help'); setSelectedItem(null); }} 
                className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-bg-app text-left font-medium text-text-main hover:text-brand transition-colors w-full group"
              >
                <HelpCircle className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('help')}
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setShowSocialsModal(true); }} 
                className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-bg-app text-left font-medium text-text-main hover:text-brand transition-colors w-full group"
              >
                <Share2 className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('socials')}
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setShowFeedbackModal(true); }} 
                className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-bg-app text-left font-medium text-text-main hover:text-brand transition-colors w-full group mb-2"
              >
                <MessageSquare className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('feedbackMenu')}
              </button>
              
              <div className="h-px bg-border-subtle w-full mb-1"></div>

              {/* AUTH MENU */}
              {currentUser ? (
                <div className="flex flex-col gap-1.5">
                  <div className="px-3.5 py-2 flex items-center gap-3">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-border-subtle" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex px-0 items-center justify-center text-brand font-bold text-lg">
                        {currentUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-muted">{t('loginAs')}</p>
                      <p className="font-semibold text-sm truncate text-text-main">{currentUser.username}</p>
                      <p className="text-xs truncate text-text-muted">{currentUser.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); setShowProfileModal(true); }}
                    className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-brand-light text-left font-medium text-text-main transition-colors w-full group"
                  >
                    <Settings className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('profileSettings') || 'Profile Settings'}
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); setCurrentView('history'); }}
                    className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-brand-light text-left font-medium text-text-main transition-colors w-full group"
                  >
                    <History className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" />ประวัติการทำรายการ
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-red-50 dark:hover:bg-red-500/10 text-left font-medium text-red-600 transition-colors w-full group mb-2"
                  >
                    <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" /> {t('logout')}
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); setAuthModalType('login'); }} 
                    className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-brand-light text-left font-medium text-text-main hover:text-brand transition-colors w-full group"
                  >
                    <Lock className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('login')}
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); setAuthModalType('register'); }} 
                    className="flex items-center gap-3 p-3.5 rounded-[16px] hover:bg-brand-light text-left font-medium text-text-main hover:text-brand transition-colors w-full group mb-2"
                  >
                    <UserPlus className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" /> {t('register')}
                  </button>
                </>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full relative z-10">
        <AnimatePresence mode="wait">
          
          {/* ---------------------------------------------------- */}
          {/* PAGE: ABOUT/CONTACT PAGES */}
          {/* ---------------------------------------------------- */}
          {currentView === 'about' && <About />}
          {currentView === 'contact' && <Contact />}

          {/* ---------------------------------------------------- */}
          {/* PAGE 1: RESOURCES GRID */}
          {/* ---------------------------------------------------- */}
          {/* ============================================================================ */}
        {/* 📌 2. หน้าแรก (Home View) */}
        {/* ============================================================================ */}
        {currentView === 'home' && (
            <motion.div 
              key="grid-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 w-full"
            >
              <div className="mb-6 sm:mb-12">
                
                {/* 🌟 PREMIUM WELCOME BANNER 🌟 */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="relative pb-8 sm:pb-12 pt-4 mb-4 sm:mb-8 flex flex-col items-start text-left"
                >
                  <div className="flex flex-col gap-2 sm:gap-3 relative z-10 max-w-4xl">
                    <h1 className="flex flex-col gap-1 font-black tracking-tight leading-[1.1] m-0 drop-shadow-sm">
                      <span className="text-[28px] sm:text-[36px] lg:text-[44px] text-text-main">ยินดีต้อนรับสู่</span>
                      <span className="text-[44px] sm:text-[60px] lg:text-[84px] uppercase font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 pb-2 drop-shadow-lg drop-shadow-[0_4px_10px_rgba(59,130,246,0.2)]">ZORIX SHOP</span>
                    </h1>
                    <h2 className="text-[18px] sm:text-[24px] lg:text-[30px] font-bold text-text-main leading-[1.3] m-0 mt-2">
                      ศูนย์รวมซอร์สโค้ดเว็บไซต์, สคริปต์เกม, และคอนฟิกระบบคุณภาพเยี่ยม
                    </h2>
                    <p className="text-[15px] sm:text-[18px] lg:text-[20px] font-medium text-text-muted leading-[1.6] m-0 mt-1 sm:mt-2">
                      พร้อมทีมงานซัพพอร์ตตลอดการใช้งาน เลือกชมสินค้าหน้าเว็บได้เลย!
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="mt-10 flex gap-4"
                  >
                     <button onClick={() => { setActiveCategory('ALL'); setCurrentView('category'); window.scrollTo({ top: 500, behavior: 'smooth' }); }} className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-bold py-3.5 px-10 rounded-full shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all text-lg">
                       <ShoppingBag className="w-5 h-5" /> ช้อปเลย
                     </button>
                  </motion.div>
                </motion.div>
                
                {/* Promotional Banner */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="w-full mb-6 rounded-[16px] sm:rounded-[20px] overflow-hidden shadow-sm border border-border-subtle bg-card-bg relative shiny-effect"
                >
                  <img 
                    alt="Carousel" 
                    fetchPriority="high" 
                    loading="eager" 
                    width="2000" 
                    height="600" 
                    decoding="async" 
                    className="w-full h-auto aspect-[10/3] object-cover object-center" 
                    src={siteConfig.bannerImageUrl} 
                  />
                </motion.div>

                {/* Dashboard Stats */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6"
                >
                  <StatsCard 
                    icon={Users} 
                    title={t('statsUsers') || 'Đăng ký'}
                    value={appStats.users.toLocaleString()}
                    unit={t('unitPeople') || 'người'}
                  />
                  <StatsCard 
                    icon={Layers} 
                    title={t('statsItems') || 'Tài nguyên'}
                    value={dynamicResources.length.toLocaleString()}
                    unit={t('unitItems') || 'mục'}
                  />
                  <StatsCard 
                    icon={Eye} 
                    title={t('statsViews') || 'Lượt truy cập'}
                    value={appStats.views.toLocaleString()}
                    unit={t('unitTimes') || 'lần'}
                  />
                  <StatsCard 
                    icon={Download} 
                    title={t('statsDownloads') || 'Lượt tải'}
                    value={(appStats.downloads).toLocaleString()}
                    unit={t('unitTimes') || 'lần'}
                  />
                </motion.div>

                <section className="relative -mt-px flex flex-col items-center overflow-hidden bg-card-bg/30 backdrop-blur-[8px] px-3 pt-4 pb-8 w-[100vw] ml-[calc(-50vw+50%)] border-t border-border-subtle transition-colors duration-300">
                  <div className="w-full max-w-[1600px] relative mx-auto">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="mt-2 flex items-center justify-between space-x-2"
                    >
                      <div>
                        <h3 className="font-semibold text-xl sm:text-2xl text-text-main">หมวดหมู่ที่คุณอาจสนใจ</h3>
                        <p className="text-sm text-text-muted mt-1 inline-flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-brand fill-brand" /> แนะนำหมวดหมู่ยอดฮิต
                        </p>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <button 
                          onClick={() => { setActiveCategory('ALL'); setCurrentView('category'); }}
                          className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-medium outline-none select-none transition-all duration-150 ease-out hover:-translate-y-px active:scale-[0.98] bg-brand/15 text-brand border border-brand/40 hover:opacity-90 h-9 px-4 py-2 rounded-xl cursor-pointer"
                        >
                          <LayoutGrid className="w-4 h-4" /> ดูทั้งหมด
                        </button>
                      </motion.div>
                    </motion.div>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 mb-2">
                      {categories.filter(tab => tab !== 'ALL').map((tab) => {
                        const isActive = activeCategory === tab;
                        const count = dynamicResources.filter(i => i.category === tab).length;
                        
                        const catData = categoriesData.find(c => c.name === tab);
                        let imgPath = catData?.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1640&auto=format&fit=crop";
                        if (!catData) {
                          const match = dynamicResources.find(i => i.category === tab);
                          if (match) imgPath = match.imageUrl;
                        }

                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-20px" }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            key={tab} 
                            tabIndex={0} 
                            onClick={() => { setActiveCategory(tab); setCurrentView('category'); }}
                            className="cursor-pointer focus:outline-none relative group/cat block transition-transform active:scale-[0.98] rounded-[20px] overflow-hidden p-[2px]"
                          >
                            <div className={`absolute inset-0 z-0 transition-colors ${isActive ? 'bg-brand' : 'bg-border-subtle group-hover/cat:bg-bg-app'}`} />
                            <div className="absolute inset-[-100%] z-0 animate-[spin_3s_linear_infinite] opacity-0 group-hover/cat:opacity-100 group-active/cat:opacity-100 bg-[conic-gradient(from_0deg,transparent_0_240deg,#3b82f6_280deg_360deg)] transition-opacity duration-300 pointer-events-none" />
                            <div className="relative z-10 w-full h-full rounded-[calc(20px-2px)] p-2 bg-card-bg/60 backdrop-blur-[4px]">
                              <div className={`absolute inset-0 -z-10 rounded-[calc(20px-2px)] pointer-events-none transition-colors ${isActive ? 'bg-brand/10 shadow-[0_0_15px_rgba(36,168,235,0.12)]' : ''}`} />
                              <div className="relative overflow-hidden rounded-[14px] bg-zinc-950 aspect-[1640/500]">
                                  <img 
                                    className="w-full h-full object-cover rounded-md transition-[opacity,transform] duration-500 ease-out opacity-0 !opacity-100 group-hover:scale-[1.02]" 
                                    alt={tab} 
                                    draggable="false" 
                                    loading="eager" 
                                    fetchPriority="high"
                                    decoding="async"
                                    src={imgPath} 
                                  />
                                </div>
                                <div className="mt-3 flex items-start justify-between gap-3 px-1">
                                  <div className="min-w-0">
                                    <h4 className="text-lg sm:text-xl font-medium leading-tight line-clamp-1 text-text-main group-hover:text-brand transition-colors">
                                      {tab}
                                    </h4>
                                    <p className="mt-1 text-xs sm:text-sm font-medium text-text-muted line-clamp-1">
                                      {catData?.description || 'สินค้าหมวดหมู่ ' + tab}
                                    </p>
                                  </div>
                                  <div className="shrink-0 pt-0.5 text-right">
                                    <p className="text-sm font-medium text-text-muted">{count} สินค้า</p>
                                    <div className="mt-1 flex flex-wrap items-center justify-end gap-1">
                                      {(catData?.isRecommended) && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/15 px-2 py-0.5 text-[11px] font-semibold text-brand">
                                          <Star className="w-3 h-3 fill-brand text-brand" /> แนะนำ
                                        </span>
                                      )}
                                      {(catData?.isPopular) && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/15 px-2 py-0.5 text-[11px] font-semibold text-brand">
                                          <Flame className="w-3 h-3 fill-brand text-brand" /> ยอดฮิต
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                {/* ---------------------------------------------------- */}
                {/* RECOMMENDED PRODUCTS SECTION */}
                {/* ---------------------------------------------------- */}
                <div className="w-full relative mt-8 pt-6 border-t border-border-subtle">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center space-x-2 justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-xl sm:text-2xl text-text-main line-clamp-1">สินค้าที่คุณอาจสนใจ</h3>
                      <p className="text-xs sm:text-sm text-text-muted mt-1 inline-flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand" /> แนะนำสินค้ายอดฮิต
                      </p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <button 
                        onClick={() => { setActiveCategory('ALL'); setCurrentView('category'); }}
                        className="inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 py-1.5 px-3 text-xs sm:text-sm rounded-xl bg-card-bg text-text-main border border-border-subtle hover:bg-bg-app shadow-sm gap-1.5"
                      >
                        <ShoppingCart className="w-4 h-4" /> ดูทั้งหมด
                      </button>
                    </motion.div>
                  </motion.div>

                  {dynamicResources.length === 0 ? (
                    <div className="my-8 py-12 px-4 rounded-3xl border border-dashed border-border-subtle bg-card-bg/50 backdrop-blur-md text-center max-w-xl mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-3">
                        <Archive size={28} />
                      </div>
                      <h4 className="text-base font-bold text-text-main mb-1">กำลังเตรียมสินค้าชุดใหม่</h4>
                      <p className="text-xs text-text-muted mb-4 max-w-sm">
                        ร้านค้าได้ทำการล้างแคตตาล็อกเดิมเรียบร้อยแล้ว แอดมินสามารถเพิ่มสินค้าใหม่ได้ตลอดเวลาผ่านแดชบอร์ด
                      </p>
                      {isMasterAdmin(currentUser) && (
                        <button
                          onClick={() => setShowAdminDashboard(true)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2"
                        >
                          <Plus size={16} />
                          <span>เปิดแผงควบคุมเพื่อเพิ่มสินค้า</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 pb-12">
                      {dynamicResources.slice(0, 5).map((item, index) => {
                       return (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.5, ease: "easeOut", delay: (index % 5) * 0.05 }}
                          key={"rec-" + item.id}
                          onClick={() => { if (!item.isOutOfStock) handleOpenDetails(item) }}
                          className={`relative rounded-md sm:rounded-lg group/prod flex flex-col shadow-sm ${item.isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {!item.isOutOfStock && (
                            <div className="absolute inset-[0px] rounded-md sm:rounded-lg overflow-hidden opacity-0 group-hover/prod:opacity-100 group-active/prod:opacity-100 transition-opacity duration-300 pointer-events-none z-0">
                               <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_240deg,#3b82f6_280deg_360deg)]" />
                            </div>
                          )}
                          <div className={`relative flex-1 z-10 bg-card-bg/60 backdrop-blur-md border transition-colors duration-200 rounded-md sm:rounded-lg p-1.5 sm:p-2 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)] ${item.isOutOfStock ? 'grayscale opacity-70 border-transparent' : 'border-border-subtle group-hover/prod:border-transparent group-hover/prod:shadow-[0_8px_30px_rgba(106,154,251,0.12)] bg-clip-padding m-[1px] group-hover/prod:m-[1px]'}`}>
                            
                            {((appStats.itemDownloads && appStats.itemDownloads[item.id]) || 0) >= 10 && (
                              <div className="absolute top-1 right-1 z-30 pointer-events-none">
                                <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2 py-1 border border-orange-300/40 opacity-90">
                                  <Flame className="w-3 h-3 text-white fill-white" />
                                  <span className="text-[10px] sm:text-[11px] font-semibold text-white">ยอดฮิต</span>
                                </div>
                              </div>
                            )}

                            <div className="relative z-20 rounded-md overflow-hidden bg-bg-app aspect-square">
                              <motion.img 
                                whileHover={!item.isOutOfStock ? { scale: 1.05 } : {}}
                                transition={{ duration: 0.4 }}
                                src={item.imageUrl} 
                                alt={getLocalized(item.title)} 
                                className={`w-full h-full object-cover sm:object-contain object-center transition-opacity duration-500 ease-out`} 
                                referrerPolicy="no-referrer" 
                              />
                              {item.isOutOfStock && (
                                <div className="absolute top-0 left-0 w-full h-full bg-black/75 backdrop-blur-[1px] rounded-md flex items-center justify-center z-10">
                                  <p className="text-white text-sm flex items-center gap-2 font-medium">
                                    <CircleX className="w-4 h-4" /> สินค้าหมด
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className={`relative z-20 mt-2 flex-1 flex flex-col`}>
                              <h3 className={`text-sm sm:text-base font-bold text-text-main line-clamp-1 transition-colors ${!item.isOutOfStock && 'group-hover/prod:text-brand'}`}>{getLocalized(item.title)}</h3>
                              <p className={`text-[11px] sm:text-xs line-clamp-1 mt-1 font-medium w-fit px-1.5 py-0.5 rounded-md border ${item.isOutOfStock ? 'bg-zinc-500/10 text-text-muted border-zinc-500/20' : 'bg-brand/10 text-brand border-brand/20'}`}>
                                ✦ {getLocalized(item.shortDescription) || 'คุณสมบัติพิเศษ'}
                              </p>
                              
                              <div className="flex items-center mt-3 justify-between space-x-2 pt-2 border-t border-border-subtle mt-auto">
                                <p className={`text-xs sm:text-sm font-medium inline-flex items-center text-text-main`}>
                                  <span className="text-lg sm:text-xl font-bold leading-none">฿</span>
                                  <span className={`text-lg sm:text-xl font-bold leading-none ml-[1px] ${!item.isOutOfStock && 'text-brand'}`}>{item.price && item.price !== 'Free' ? item.price : '0'}</span>
                                </p>
                                <p className="text-[10px] sm:text-[11px] rounded px-1.5 py-0.5 border inline-flex items-center gap-1 border-border-subtle text-text-muted bg-bg-app">
                                  <Archive className="w-3 h-3 shrink-0" /> {item.isOutOfStock ? 'คงเหลือ 0' : 'คงเหลือ ∞'}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-2">
                                {item.isOutOfStock ? (
                                  <div className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-bold outline-none select-none py-1.5 px-3 w-full rounded-xl bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                                    <CircleX className="w-4 h-4 mr-1.5" /> สินค้าหมด
                                  </div>
                                ) : (
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      handleOpenDetails(item); 
                                    }}
                                    className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-medium outline-none select-none transition-[transform,background-color,color,border-color,box-shadow,opacity] duration-150 py-1.5 px-3 w-full rounded-xl text-white group/btn bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]"
                                  >
                                    {item.actionType === 'purchase' ? (
                                       <><ShoppingCart className="w-4 h-4 mr-1.5 shrink-0 [transform:perspective(700px)_rotateY(0deg)] [transform-style:preserve-3d] transition-transform duration-700 group-hover/btn:[transform:perspective(700px)_rotateY(360deg)]" /> เลือกซื้อ</>
                                    ) : (
                                       <><ExternalLink className="w-4 h-4 mr-1.5 shrink-0" /> รับลิงก์ฟรี</>
                                    )}
                                  </button>
                                )}
                              </div>

                              <div className="mt-2.5 flex items-center justify-center">
                                <p className="text-[10px] sm:text-[11px] inline-flex items-center gap-1 text-text-muted">
                                  <Flame className="w-3 h-3 shrink-0 text-orange-500 fill-orange-500" /> ขายแล้ว {((appStats.itemDownloads && appStats.itemDownloads[item.id]) || 0).toLocaleString()} ชิ้น
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                       )
                    })}
                  </div>
                  )}
                </div>

                {/* ---------------------------------------------------- */}
                {/* WHY CHOOSE US SECTION */}
                {/* ---------------------------------------------------- */}
                <div className="w-full relative mt-2 pt-10 border-t border-border-subtle pb-12">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                  >
                    <h3 className="font-bold text-2xl sm:text-3xl text-text-main mb-3">ทำไมคุณต้องเลือกเรา?</h3>
                    <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto">
                      สถิติเสียงตอบรับจากผู้ใช้งานจริง ยืนยันถึงคุณภาพและความปลอดภัยที่คุณจะได้รับจาก ZORIX SHOP
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Graph 1: Area Chart */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1, duration: 0.8, type: 'spring', bounce: 0.4 }}
                      className="bg-card-bg/60 backdrop-blur-md border border-border-subtle rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col hover:shadow-lg transition-shadow"
                    >
                      <div className="mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-brand/10 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-brand" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-text-main text-base sm:text-lg">ผู้ใช้งานระบบ (Real-time)</h4>
                          <p className="text-xs text-text-muted line-clamp-1">จำนวนบัญชีผู้ใช้งานที่ลงทะเบียนในระบบทั้งหมด</p>
                        </div>
                      </div>
                      <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={appStats.trustData?.length ? appStats.trustData : [{name: 'Loading', users: 0}]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border-subtle opacity-30" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-text-muted" />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-text-muted" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-border-subtle)', borderRadius: '12px', fontSize: '13px' }}
                              itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                            />
                            <Area type="monotone" dataKey="users" name="จำนวนผู้ใช้" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    {/* Graph 2: Bar Chart */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, duration: 0.8, type: 'spring', bounce: 0.4 }}
                      className="bg-card-bg/60 backdrop-blur-md border border-border-subtle rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col hover:shadow-lg transition-shadow"
                    >
                      <div className="mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-brand/10 flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-5 h-5 text-brand" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-text-main text-base sm:text-lg">มาตรฐานและความปลอดภัย</h4>
                          <p className="text-xs text-text-muted line-clamp-1">สถิติประสิทธิภาพและความคุ้มครองข้อมูล</p>
                        </div>
                      </div>
                      <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={appStats.performanceData?.length ? appStats.performanceData : [{name: 'Loading', score: 0}]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border-subtle opacity-30" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-text-muted" />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-text-muted" domain={[0, 100]} />
                            <Tooltip 
                              cursor={{ fill: 'var(--color-text-muted)', opacity: 0.05 }}
                              contentStyle={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-border-subtle)', borderRadius: '12px', fontSize: '13px' }}
                              itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                            />
                            <Bar dataKey="score" name="คะแนน (%)" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* CUSTOMER SUPPORT SECTION */}
                {/* ---------------------------------------------------- */}
                <div className="w-full relative mt-6 pt-10 border-t border-border-subtle pb-8">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
                    className="bg-card-bg/60 backdrop-blur-md border border-border-subtle rounded-[24px] p-6 lg:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
                  >
                    {/* Background glow for Discord */}
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#5865F2]/20 rounded-full blur-[80px] pointer-events-none"></div>
                    
                    <div className="flex-1 text-center md:text-left z-10">
                      <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-[#5865F2]/10 text-[#5865F2] font-semibold text-sm">
                        <MessageCircle className="w-4 h-4" />
                        Customer Support
                      </div>
                      <h3 className="font-bold text-2xl sm:text-3xl text-text-main mb-3">ต้องการความช่วยเหลือ?</h3>
                      <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto md:mx-0">
                        มีทีมงานคอยช่วยเหลือและตอบคำถามผ่านระบบ Ticket ใน Discord ตลอดเวลาทำการ พร้อมอัปเดตข่าวสารและแจ้งเตือนสถานะต่างๆ 
                      </p>
                    </div>
                    
                    <div className="shrink-0 z-10 w-full md:w-auto">
                      <a href="https://discord.gg/hSuBbnwWZY" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-4 rounded-[16px] font-bold text-lg transition-all shadow-[0_8px_20px_rgba(88,101,242,0.3)] hover:shadow-[0_10px_25px_rgba(88,101,242,0.4)] hover:-translate-y-1 w-full md:w-auto">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                        เข้าร่วม Discord ทีมงาน
                      </a>
                    </div>
                  </motion.div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PAGE 1.5: CATEGORY PAGE WITH BACK BUTTON */}
          {/* ---------------------------------------------------- */}
          {/* ============================================================================ */}
        {/* 📌 3. หน้าร้านค้า / หมวดหมู่สินค้า (Category View) */}
        {/* ============================================================================ */}
        {currentView === 'category' && (
            <motion.div 
              key="category-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 sm:py-8 w-full"
            >
              <button 
                onClick={() => { setCurrentView('home'); }}
                className="flex items-center gap-2 text-text-muted hover:text-brand font-medium mb-6 transition-colors group px-2 text-[14px] sm:text-[15px] bg-card-bg border border-border-subtle py-2 rounded-xl hover:bg-bg-app shadow-sm w-fit"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                กลับสู่หน้าหลัก
              </button>

              <div className="w-full relative mx-auto border-t border-border-subtle pt-6 transition-colors duration-300">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center space-x-2 justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-xl sm:text-2xl text-text-main line-clamp-1">
                      {activeCategory === 'ALL' ? 'สินค้าทั้งหมด' : `หมวดหมู่ : ${activeCategory}`}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted mt-1 inline-flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-brand fill-brand" /> {filteredResources.length} สินค้าในหมวดหมู่
                    </p>
                  </div>
                </motion.div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 pb-12">
                  <AnimatePresence mode="popLayout">
                    {filteredResources.map((item, index) => {
                       const pseudoSold = (item.title as any)?.th?.length * 15 + index * 7 + 10;
                       return (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: 40 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.5, ease: "easeOut", delay: (index % 5) * 0.05 }}
                          key={item.id}
                          onClick={() => { if (!item.isOutOfStock) handleOpenDetails(item) }}
                          className={`relative rounded-md sm:rounded-lg group/prod flex flex-col shadow-sm ${item.isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {!item.isOutOfStock && (
                            <div className="absolute inset-[0px] rounded-md sm:rounded-lg overflow-hidden opacity-0 group-hover/prod:opacity-100 group-active/prod:opacity-100 transition-opacity duration-300 pointer-events-none z-0">
                               <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_240deg,#3b82f6_280deg_360deg)]" />
                            </div>
                          )}
                          <div className={`relative flex-1 z-10 bg-card-bg/60 backdrop-blur-md border transition-colors duration-200 rounded-md sm:rounded-lg p-1.5 sm:p-2 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)] ${item.isOutOfStock ? 'grayscale opacity-70 border-transparent' : 'border-border-subtle group-hover/prod:border-transparent group-hover/prod:shadow-[0_8px_30px_rgba(106,154,251,0.12)] bg-clip-padding m-[1px] group-hover/prod:m-[1px]'}`}>
                            
                            {((appStats.itemDownloads && appStats.itemDownloads[item.id]) || 0) >= 10 && (
                              <div className="absolute top-1 right-1 z-30 pointer-events-none">
                                <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2 py-1 border border-orange-300/40 opacity-90">
                                  <Flame className="w-3 h-3 text-white fill-white" />
                                  <span className="text-[10px] sm:text-[11px] font-semibold text-white">ยอดฮิต</span>
                                </div>
                              </div>
                            )}

                            <div className="relative z-20 rounded-md overflow-hidden bg-bg-app aspect-square">
                              <motion.img 
                                whileHover={!item.isOutOfStock ? { scale: 1.05 } : {}}
                                transition={{ duration: 0.4 }}
                                src={item.imageUrl} 
                                alt={getLocalized(item.title)} 
                                className={`w-full h-full object-cover sm:object-contain object-center transition-opacity duration-500 ease-out`} 
                                referrerPolicy="no-referrer" 
                              />
                              {item.isOutOfStock && (
                                <div className="absolute top-0 left-0 w-full h-full bg-black/75 backdrop-blur-[1px] rounded-md flex items-center justify-center z-10">
                                  <p className="text-white text-sm flex items-center gap-2 font-medium">
                                    <CircleX className="w-4 h-4" /> สินค้าหมด
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className={`relative z-20 mt-2 flex-1 flex flex-col`}>
                              <h3 className={`text-sm sm:text-base font-bold text-text-main line-clamp-1 transition-colors ${!item.isOutOfStock && 'group-hover/prod:text-brand'}`}>{getLocalized(item.title)}</h3>
                              <p className={`text-[11px] sm:text-xs line-clamp-1 mt-1 font-medium w-fit px-1.5 py-0.5 rounded-md border ${item.isOutOfStock ? 'bg-zinc-500/10 text-text-muted border-zinc-500/20' : 'bg-brand/10 text-brand border-brand/20'}`}>
                                ✦ {getLocalized(item.shortDescription) || 'คุณสมบัติพิเศษ'}
                              </p>
                              
                              <div className="flex items-center mt-3 justify-between space-x-2 pt-2 border-t border-border-subtle mt-auto">
                                <p className={`text-xs sm:text-sm font-medium inline-flex items-center text-text-main`}>
                                  <span className="text-lg sm:text-xl font-bold leading-none">฿</span>
                                  <span className={`text-lg sm:text-xl font-bold leading-none ml-[1px] ${!item.isOutOfStock && 'text-brand'}`}>{item.price && item.price !== 'Free' ? item.price : '0'}</span>
                                </p>
                                <p className="text-[10px] sm:text-[11px] rounded px-1.5 py-0.5 border inline-flex items-center gap-1 border-border-subtle text-text-muted bg-bg-app">
                                  <Archive className="w-3 h-3 shrink-0" /> {item.isOutOfStock ? 'คงเหลือ 0' : 'คงเหลือ ∞'}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-2">
                                {item.isOutOfStock ? (
                                  <div className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-bold outline-none select-none py-1.5 px-3 w-full rounded-xl bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                                    <CircleX className="w-4 h-4 mr-1.5" /> สินค้าหมด
                                  </div>
                                ) : (
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      handleOpenDetails(item); 
                                    }}
                                    className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-medium outline-none select-none transition-[transform,background-color,color,border-color,box-shadow,opacity] duration-150 py-1.5 px-3 w-full rounded-xl text-white group/btn bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]"
                                  >
                                    {item.actionType === 'purchase' ? (
                                       <><ShoppingCart className="w-4 h-4 mr-1.5 shrink-0 [transform:perspective(700px)_rotateY(0deg)] [transform-style:preserve-3d] transition-transform duration-700 group-hover/btn:[transform:perspective(700px)_rotateY(360deg)]" /> สั่งซื้อสินค้า</>
                                    ) : (
                                       <><ExternalLink className="w-4 h-4 mr-1.5 shrink-0" /> รับลิงก์ฟรี</>
                                    )}
                                  </button>
                                )}
                              </div>

                              <div className="mt-2.5 flex items-center justify-center">
                                <p className="text-[10px] sm:text-[11px] inline-flex items-center gap-1 text-text-muted">
                                  <Flame className="w-3 h-3 shrink-0 text-orange-500 fill-orange-500" /> ขายแล้ว {((appStats.itemDownloads && appStats.itemDownloads[item.id]) || 0).toLocaleString()} ชิ้น
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                       )
                    })}
                  </AnimatePresence>
                  
                  {filteredResources.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="col-span-full py-20 flex flex-col items-center justify-center text-text-muted border border-dashed border-border-subtle rounded-2xl bg-card-bg shadow-sm"
                    >
                      <div className="w-16 h-16 bg-bg-app rounded-[20px] flex items-center justify-center mb-4 border border-border-subtle">
                        <Archive className="w-8 h-8 text-text-muted" />
                      </div>
                      <h3 className="text-[18px] font-semibold text-text-main">{t('emptyTitle')}</h3>
                      <p className="text-[14px] mt-2 font-normal text-text-muted max-w-sm text-center">{t('emptyDesc')}</p>
                    </motion.div>
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PAGE 2: ITEM DETAILS PAGE */}
          {/* ---------------------------------------------------- */}
          {/* ============================================================================ */}
        {/* 📌 4. หน้ารายละเอียดสินค้า (Product Details View) */}
        {/* ============================================================================ */}
        {currentView === 'details' && selectedItem && (
            <motion.div 
              key="details-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-[1000px] mx-auto px-5 sm:px-8 py-6 sm:py-8 pb-32 sm:pb-12 w-full"
            >
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-text-muted font-medium mb-6 px-2 text-[13px] sm:text-[14px]">
                <button 
                  onClick={() => { setCurrentView('home'); setSelectedItem(null); }}
                  className="flex items-center gap-1.5 sm:gap-2 hover:text-brand transition-colors whitespace-nowrap"
                >
                  <Home className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  {t('home') || 'หน้าแรก'}
                </button>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                <button 
                  onClick={() => { setCurrentView('category'); setSelectedItem(null); setActiveCategory(selectedItem.category); }}
                  className="flex items-center gap-1.5 sm:gap-2 hover:text-brand transition-colors whitespace-nowrap"
                >
                  <Layers className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  {selectedItem.category}
                </button>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                <span className="flex items-center gap-1.5 sm:gap-2 text-text-main whitespace-nowrap overflow-hidden text-ellipsis">
                  <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  {getLocalized(selectedItem.title)}
                </span>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
                <div className="w-full lg:w-1/2">
                  <div className="w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/3] bg-bg-app rounded-[24px] sm:rounded-[32px] overflow-hidden relative shadow-lg shadow-black/5 border border-border-subtle">
                    <img src={selectedItem.imageUrl} alt={getLocalized(selectedItem.title)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 left-4 bg-card-bg/80 backdrop-blur-md px-3 py-1.5 text-[11px] sm:text-[12px] font-medium text-text-main rounded-full shadow-sm border border-border-subtle">
                      {selectedItem.category}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedItem.tags.map((tag, idx) => (
                      <span key={idx} className="bg-brand/10 text-brand border border-brand/20 px-3 py-1 rounded-full text-[11px] sm:text-[12px] font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Unified Product Card */}
                  <div className="rounded-[16px] overflow-hidden border border-border-subtle bg-card-bg shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-5">
                    
                    {/* Header: Title, Price & Stock */}
                    <div className="p-4 sm:p-5 flex flex-col gap-3 border-b border-border-subtle">
                      {/* Product Title */}
                      <h1 className="text-2xl sm:text-3xl font-semibold text-text-main tracking-tight leading-[1.3]">
                        {getLocalized(selectedItem.title)}
                      </h1>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        {/* Product Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-xl sm:text-2xl font-bold text-brand">
                            {selectedItem.price ? selectedItem.price : "ฟรี"}
                          </span>
                          {!selectedItem.price && (
                            <span className="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-500/20">
                              Free Download
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-text-muted">
                           จำนวนคงเหลือ : ∞ ไม่จำกัด
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex flex-col gap-5">
                      
                      {/* Video Clip Button */}
                      {selectedItem.videoUrl && (
                        <button onClick={() => window.open(selectedItem.videoUrl, '_blank')} className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all hover:opacity-80 border border-border-subtle bg-card-bg text-text-main shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer">
                          <Play className="w-4 h-4 opacity-50" fill="currentColor" />
                          <div className="flex-1 text-left line-clamp-1">
                            <p className="text-xs font-semibold">{t('videoPreviewTitle')}</p>
                            <p className="text-[10px] text-text-muted">{t('videoPreviewDesc')}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-30" />
                        </button>
                      )}

                      {/* Details Block */}
                      <div>
                        <h5 className="text-[14px] font-bold flex items-center mb-2.5 text-text-main gap-2">
                          <FileText className="w-4 h-4 text-brand" /> รายละเอียดสินค้า
                        </h5>
                        <div className="rounded-[12px] p-4 bg-bg-app border border-border-subtle shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-brand/60"></div>
                          <p className="text-[13px] leading-relaxed break-words whitespace-pre-line text-text-main font-normal markdown-body">
                            {getLocalized(selectedItem.fullDescription)}
                          </p>
                        </div>
                      </div>

                      {/* Product Info Block */}
                      <div>
                        <h5 className="text-[14px] font-bold flex items-center mb-2.5 text-text-main gap-2">
                          <Archive className="w-4 h-4 text-brand" /> ข้อมูลของสินค้า
                        </h5>
                        <div className="px-4 py-3 rounded-[12px] border border-border-subtle bg-bg-app flex flex-col gap-2 shadow-sm">
                            <div className="flex justify-between items-center text-[13px] border-b border-border-subtle pb-2">
                              <span className="text-text-muted">ชื่อสินค้า :</span>
                              <span className="text-text-main font-medium line-clamp-1 text-right ml-4">{getLocalized(selectedItem.title)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] border-b border-border-subtle pb-2">
                              <span className="text-text-muted">ยอดขาย :</span>
                              <span className="text-text-main font-medium">{((appStats.itemDownloads && appStats.itemDownloads[selectedItem.id]) || 0).toLocaleString()} ชิ้น</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] pt-1">
                              <span className="text-text-muted">สถานะ :</span>
                              <span className="text-brand bg-brand/10 px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1 border border-brand/20">
                                <Check className="w-3 h-3" /> พร้อมใช้งาน
                              </span>
                            </div>
                        </div>
                      </div>

                      {/* Warnings / Notes */}
                      {selectedItem.warning && (
                        <div>
                          <h5 className="text-[14px] font-bold flex items-center mb-2.5 text-red-500 gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500" /> Warning
                          </h5>
                          <div className="text-red-500 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 p-3.5 rounded-[12px] text-[13px] leading-relaxed">
                            <span className="font-semibold">{t('friendlyNote')}</span> {getLocalized(selectedItem.warning)}
                          </div>
                        </div>
                      )}

                      {/* Link & Buy Button */}
                      {selectedItem.downloadLinks && selectedItem.downloadLinks.length > 0 ? (
                        <div className="flex flex-col gap-2 mt-2">
                          <h3 className="text-[13px] font-semibold text-text-main px-1">{t('downloadVersion')}</h3>
                          {selectedItem.downloadLinks.map((dl, idx) => (
                            <button 
                              key={idx}
                              onClick={() => handleGetLink(undefined, selectedItem, dl.url)}
                              className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-medium outline-none select-none transition-[transform,background-color,color,border-color,box-shadow,opacity] duration-150 py-2.5 px-4 w-full rounded-xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] group cursor-pointer"
                            >
                              {(!currentUser && (selectedItem.requiresLogin || selectedItem.actionType === 'purchase')) ? (
                                <>
                                  <Lock className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                                  {t('loginToDownload') || 'เข้าสู่ระบบก่อนทำรายการ'}
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4 shrink-0 [transform:perspective(700px)_rotateY(0deg)] [transform-style:preserve-3d] transition-transform duration-700 group-hover:[transform:perspective(700px)_rotateY(360deg)]" />
                                  {dl.label}
                                </>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 text-center">
                          <button 
                            onClick={() => handleGetLink(undefined, selectedItem)}
                            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-medium outline-none select-none transition-[transform,background-color,color,border-color,box-shadow,opacity] duration-150 py-2.5 px-6 sm:w-auto w-full mx-auto rounded-xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] group cursor-pointer"
                          >
                            {(!currentUser && (selectedItem.requiresLogin || selectedItem.actionType === 'purchase')) ? (
                              <>
                                <Lock className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                                {t('loginToDownload') || 'เข้าสู่ระบบก่อนทำรายการ'}
                              </>
                            ) : (
                              <>
                                {selectedItem.actionType === 'purchase' ? (
                                    <>
                                        <ShoppingCart className="w-4 h-4 shrink-0 [transform:perspective(700px)_rotateY(0deg)] [transform-style:preserve-3d] transition-transform duration-700 group-hover:[transform:perspective(700px)_rotateY(360deg)]" />
                                        สั่งซื้อสินค้า
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink className="w-4 h-4 shrink-0 [transform:perspective(700px)_rotateY(0deg)] [transform-style:preserve-3d] transition-transform duration-700 group-hover:[transform:perspective(700px)_rotateY(360deg)]" />
                                        รับลิงก์ฟรี
                                    </>
                                )}
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PAGE: HISTORY PAGE */}
          {/* ---------------------------------------------------- */}
        {currentView === 'history' && (
            <motion.div 
              key="history-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-[1000px] mx-auto px-5 sm:px-8 py-6 sm:py-8 pb-32 sm:pb-12 w-full"
            >
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-text-muted font-medium mb-6 px-2 text-[13px] sm:text-[14px]">
                <button 
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-1.5 sm:gap-2 hover:text-brand transition-colors whitespace-nowrap"
                >
                  <Home className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  {t('home')}
                </button>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                <span className="text-text-main flex items-center gap-1.5 truncate">
                  <History className="w-4 h-4" /> ประวัติการทำรายการ
                </span>
              </div>

              {!currentUser ? (
                <div className="text-center py-20">
                  <Lock className="w-12 h-12 mx-auto text-text-muted mb-4 opacity-50" />
                  <p className="text-text-muted mb-4">กรุณาเข้าสู่ระบบเพื่อดูประวัติ</p>
                  <button onClick={() => setAuthModalType('login')} className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-medium outline-none select-none transition-[transform,background-color,color,border-color,box-shadow,opacity] duration-150 py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]">เข้าสู่ระบบ</button>
                </div>
              ) : (
                <div className="bg-card-bg shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-border-subtle rounded-[24px] overflow-hidden">
                  <div className="p-6 sm:p-8 border-b border-border-subtle bg-bg-app">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-2 text-text-main">
                       <History className="w-6 h-6 text-brand" /> 
                       ประวัติการสั่งซื้อและทำรายการ
                    </h2>
                    <p className="text-text-muted text-sm">รายการประวัติทั้งหมดที่คุณดาวน์โหลดและสั่งซื้อ</p>
                  </div>
                  <div className="p-6 sm:p-8">
                     <div className="flex flex-col gap-4 mb-6">
                       <div className="flex flex-wrap items-center gap-2">
                         <button onClick={() => setHistoryFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${historyFilter === 'all' ? 'bg-brand text-white shadow-md' : 'bg-bg-app border border-border-subtle text-text-muted hover:text-text-main'}`}>ทั้งหมด</button>
                         <button onClick={() => setHistoryFilter('purchase')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${historyFilter === 'purchase' ? 'bg-brand text-white shadow-md' : 'bg-bg-app border border-border-subtle text-text-muted hover:text-text-main'}`}>สั่งซื้อสินค้า</button>
                         <button onClick={() => setHistoryFilter('link')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${historyFilter === 'link' ? 'bg-brand text-white shadow-md' : 'bg-bg-app border border-border-subtle text-text-muted hover:text-text-main'}`}>Get Link</button>
                       </div>
                       
                       {filteredHistories.length > 0 && (
                         <div className="flex flex-wrap items-center justify-between bg-bg-app px-4 py-3 rounded-xl border border-border-subtle gap-4">
                           <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer hover:text-text-main font-medium">
                             <input 
                               type="checkbox" 
                               checked={filteredHistories.length > 0 && selectedHistories.size === filteredHistories.length}
                               onChange={(e) => handleSelectAllHistories(e.target.checked ? false : true)}
                               className="w-4 h-4 rounded text-brand focus:ring-brand border-border-subtle bg-card-bg cursor-pointer"
                             />
                             เลือกทั้งหมด
                           </label>
                           
                           <button 
                              onClick={downloadSelectedHistoryAsTxt}
                              disabled={selectedHistories.size === 0}
                              className="flex items-center gap-2 text-sm font-semibold bg-brand text-white px-4 py-2 rounded-xl shadow-[0_2px_10px_rgba(106,154,251,0.2)] hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              <Download className="w-4 h-4" /> โหลดที่เลือก (.txt)
                           </button>
                         </div>
                       )}
                     </div>

                     <div className="flex flex-col gap-4">
                       {filteredHistories.length === 0 ? (
                         <div className="text-center py-12 bg-bg-app rounded-2xl border border-border-subtle border-dashed">
                           <History className="w-10 h-10 mx-auto text-text-muted mb-3 opacity-40" />
                           <p className="text-text-muted text-sm relative z-10">ยังไม่มีประวัติในหมวดหมู่นี้</p>
                         </div>
                       ) : (
                         filteredHistories.slice().reverse().map((h: any, i: number) => (
                           <div key={i} className={`p-5 lg:p-6 rounded-2xl border transition-all flex flex-col gap-3 ${selectedHistories.has(i) ? 'border-brand bg-brand/5 shadow-sm' : 'border-border-subtle bg-bg-app hover:shadow-[0_2px_10px_rgba(0,0,0,0.02)]'}`}>
                              <div className="flex items-start justify-between gap-4">
                                 <div className="flex items-start gap-4 w-full">
                                     <input 
                                        type="checkbox" 
                                        checked={selectedHistories.has(i)}
                                        onChange={() => handleToggleHistorySelect(i)}
                                        className="w-5 h-5 mt-0.5 rounded text-brand focus:ring-brand border-border-subtle bg-card-bg cursor-pointer shrink-0"
                                     />
                                     <div className="flex-1 min-w-0">
                                         <h4 className="text-base sm:text-lg font-bold text-text-main line-clamp-1">{h.title}</h4>
                                         <p className="text-xs sm:text-sm text-text-muted mt-1">{new Date(h.date).toLocaleString('th-TH')}</p>
                                     </div>
                                 </div>
                                 {h.type === 'purchase' ? (
                                     <span className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 whitespace-nowrap"><ShoppingBag className="w-4 h-4" /> {h.price || 'Free'}</span>
                                 ) : (
                                     <span className="bg-brand/10 text-brand text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 whitespace-nowrap"><Link2 className="w-4 h-4" /> Get Link</span>
                                 )}
                              </div>

                              {h.type === 'purchase' && h.details && (
                                <div className="mt-2 bg-card-bg border border-border-subtle p-4 rounded-xl text-sm relative group w-full overflow-hidden">
                                  <pre className="whitespace-pre-wrap font-sans text-text-muted font-medium break-words overflow-hidden max-w-full">{h.details}</pre>
                                  <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(h.details);
                                        setFeedbackText("คัดลอกรายละเอียดแล้ว");
                                        setShowFeedbackModal(true);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-bg-app hover:bg-brand hover:text-white text-text-muted transition-colors rounded-lg border border-border-subtle shadow-sm opacity-0 group-hover:opacity-100"
                                    title="คัดลอกรายละเอียด"
                                   >
                                     <HardDriveDownload className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              {h.type === 'link' && h.details && (
                                <div className="mt-3 flex justify-end">
                                  <a href={h.details} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white font-semibold bg-brand px-4 py-2 rounded-xl shadow-sm hover:brightness-110 hover:-translate-y-0.5 transition-all">
                                    เปิดลิงก์อีกครั้ง <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              )}
                           </div>
                         ))
                       )}
                     </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* PAGE 3: HELP & FAQ PAGE */}
          {/* ---------------------------------------------------- */}
          {/* ============================================================================ */}
        {/* 📌 5. หน้าช่วยเหลือ / วิธีรับสินค้า (Help View) */}
        {/* ============================================================================ */}
        {currentView === 'help' && (
             <motion.div 
               key="help-view"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="max-w-[1000px] mx-auto px-4 sm:px-8 py-8 w-full"
             >
               <button 
                 onClick={() => setCurrentView('home')}
                 className="flex items-center gap-2 text-slate-500 hover:text-brand font-medium mb-8 transition-colors group px-2"
               >
                 <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                 {t('backHelp')}
               </button>

               <div className="bg-card-bg rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 shadow-sm border border-border-subtle mb-8">
                 <h1 className="text-xl sm:text-2xl font-semibold text-text-main mb-2">{t('helpHeader')}</h1>
                 <p className="text-text-muted font-normal mb-8 sm:mb-10 text-[14px] sm:text-[15px]">{t('helpSubHeader')}</p>
                 
                 {/* How to use */}
                 <div className="mb-10 sm:mb-12">
                   <h2 className="text-[16px] sm:text-[18px] font-semibold text-brand mb-5 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5"/> {t('howToUse')}
                   </h2>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                     <div className="bg-bg-app border border-border-subtle p-5 sm:p-6 rounded-[20px] sm:rounded-[24px]">
                       <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand/10 border border-brand/20 text-brand rounded-full flex items-center justify-center font-medium mb-3 sm:mb-4 text-[14px] sm:text-[16px]">1</div>
                       <h3 className="font-medium text-[14px] sm:text-[15px] text-text-main mb-2">{t('step1Title')}</h3>
                       <p className="text-[13px] sm:text-[14px] font-normal text-text-muted leading-relaxed">{t('step1Desc')}</p>
                     </div>
                     <div className="bg-bg-app border border-border-subtle p-5 sm:p-6 rounded-[20px] sm:rounded-[24px]">
                       <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand/10 border border-brand/20 text-brand rounded-full flex items-center justify-center font-medium mb-3 sm:mb-4 text-[14px] sm:text-[16px]">2</div>
                       <h3 className="font-medium text-[14px] sm:text-[15px] text-text-main mb-2">{t('step2Title')}</h3>
                       <p className="text-[13px] sm:text-[14px] font-normal text-text-muted leading-relaxed">{t('step2Desc')}</p>
                     </div>
                     <div className="bg-bg-app border border-border-subtle p-5 sm:p-6 rounded-[20px] sm:rounded-[24px]">
                       <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand/10 border border-brand/20 text-brand rounded-full flex items-center justify-center font-medium mb-3 sm:mb-4 text-[14px] sm:text-[16px]">3</div>
                       <h3 className="font-medium text-[14px] sm:text-[15px] text-text-main mb-2">{t('step3Title')}</h3>
                       <p className="text-[13px] sm:text-[14px] font-normal text-text-muted leading-relaxed">{t('step3Desc')}</p>
                     </div>
                   </div>
                 </div>

                 {/* FAQ */}
                 <div>
                    <h2 className="text-[16px] sm:text-[18px] font-semibold text-brand mb-5 flex items-center gap-2">
                       <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5"/> {t('faqHeader')}
                    </h2>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="border border-border-subtle rounded-[16px] sm:rounded-[20px] p-5 sm:p-6 hover:shadow-md transition-shadow bg-card-bg">
                        <h3 className="font-medium text-text-main mb-2 text-[14px] sm:text-[15px]">{t('q1')}</h3>
                        <p className="text-[13px] sm:text-[14px] font-normal text-text-muted leading-relaxed">{t('a1')}</p>
                      </div>
                      <div className="border border-border-subtle rounded-[16px] sm:rounded-[20px] p-5 sm:p-6 hover:shadow-md transition-shadow bg-card-bg">
                        <h3 className="font-medium text-text-main mb-2 text-[14px] sm:text-[15px]">{t('q2')}</h3>
                        <p className="text-[13px] sm:text-[14px] font-normal text-text-muted leading-relaxed">{t('a2')}</p>
                      </div>
                      <div className="border border-border-subtle rounded-[16px] sm:rounded-[20px] p-5 sm:p-6 hover:shadow-md transition-shadow bg-card-bg">
                        <h3 className="font-medium text-text-main mb-2 text-[14px] sm:text-[15px]">{t('q3')}</h3>
                        <p className="text-[13px] sm:text-[14px] font-normal text-text-muted leading-relaxed">{t('a3')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Feedback CTA */}
                  <div className="mt-12 bg-brand/5 border border-brand/20 p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="w-6 h-6 text-brand" />
                    </div>
                    <h3 className="text-[16px] sm:text-[18px] font-semibold text-brand mb-2">{t('feedbackMenu')}</h3>
                    <p className="text-[14px] text-text-muted mb-6 max-w-sm">{t('feedbackDesc')}</p>
                    <button 
                      onClick={() => setShowFeedbackModal(true)} 
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-medium rounded-full shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] hover:-translate-y-0.5 hover:brightness-110 active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      {t('feedbackTitle')} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
               </div>
             </motion.div>
          )}

        </AnimatePresence>

        {/* ========================================================================= */}
        {/* GLOBAL FOOTER */}
        {/* ========================================================================= */}
        <footer className="w-full border-t border-border-subtle bg-card-bg/50 backdrop-blur-sm mt-8">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <img src={siteConfig.logoUrl} alt="Logo" className="h-6 sm:h-7 object-contain drop-shadow-sm mb-1 opacity-80 mix-blend-multiply" />
              <p className="text-[13px] text-text-muted mt-1">{t('footerDesc')}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-[13px] font-medium text-text-muted">
              <button onClick={() => setCurrentView('about')} className="hover:text-brand transition-colors">เกี่ยวกับเรา</button>
              <button onClick={() => setCurrentView('contact')} className="hover:text-brand transition-colors">ติดต่อเรา</button>
              <button onClick={() => setCurrentView('help')} className="hover:text-brand transition-colors">{t('help')}</button>
              <button onClick={() => setShowSocialsModal(true)} className="hover:text-brand transition-colors">{t('socialsFollow')}</button>
            </div>
            <div className="text-[12px] text-text-muted/70">
              &copy; {new Date().getFullYear()} ZORIX SHOP. All rights reserved.
            </div>
          </div>
        </footer>

      </main>

      {/* ========================================================================= */}
      {/* SOCIALS MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {/* ============================================================================ */}
      {/* 📌 หน้าต่าง Pop-up แสดงช่องทางติดต่อ Social Media */}
      {/* ============================================================================ */}
      {showSocialsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 backdrop-blur-md"
               onClick={() => setShowSocialsModal(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-card-bg w-full max-w-[360px] p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative border border-border-subtle z-10 max-h-[90dvh] overflow-y-auto hide-scrollbar"
             >
               <button 
                 onClick={() => setShowSocialsModal(false)}
                 className="absolute top-5 right-5 bg-bg-app text-text-muted hover:text-text-main hover:bg-border-subtle p-2.5 rounded-full transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>

               <div className="text-center mb-6 mt-2">
                 <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                    <Share2 className="w-8 h-8 text-brand" />
                 </div>
                 <h2 className="m-0 mb-2 text-xl font-semibold text-text-main">{t('socialsFollow')}</h2>
                 <p className="text-[14px] text-text-muted font-normal">{t('socialsFamily')}</p>
               </div>

               <div className="space-y-3">
                 <a href="#" onClick={(e) => { e.preventDefault(); alert(t('fbLink')); }} className="flex items-center gap-4 bg-bg-app hover:bg-brand hover:text-white group p-4 rounded-[16px] transition-all cursor-pointer border border-transparent hover:border-brand">
                   <Facebook className="w-5 h-5 text-[#1877F2] group-hover:text-white transition-colors" />
                   <span className="font-medium text-text-main group-hover:text-white transition-colors">ZORIX SHOP Fanpage</span>
                 </a>
                 <a href="#" onClick={(e) => { e.preventDefault(); alert(t('igLink')); }} className="flex items-center gap-4 bg-bg-app hover:bg-brand hover:text-white group p-4 rounded-[16px] transition-all cursor-pointer border border-transparent hover:border-brand">
                   <Instagram className="w-5 h-5 text-[#E4405F] group-hover:text-white transition-colors" />
                   <span className="font-medium text-text-main group-hover:text-white transition-colors">@zorix.shop</span>
                 </a>
                 <a href="#" onClick={(e) => { e.preventDefault(); alert(t('dcLink')); }} className="flex items-center gap-4 bg-bg-app hover:bg-brand hover:text-white group p-4 rounded-[16px] transition-all cursor-pointer border border-transparent hover:border-brand">
                   <MessageCircle className="w-5 h-5 text-[#00B2FF] group-hover:text-white transition-colors" />
                   <span className="font-medium text-text-main group-hover:text-white transition-colors">Zorix Community</span>
                 </a>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* FEEDBACK MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {/* ============================================================================ */}
      {/* 📌 หน้าต่าง Pop-up Feedback แจ้งปัญหา / แนะนำ */}
      {/* ============================================================================ */}
      {showFeedbackModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 backdrop-blur-md"
               onClick={() => setShowFeedbackModal(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-card-bg w-full max-w-[400px] p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative border border-border-subtle z-10"
             >
               <button 
                 onClick={() => setShowFeedbackModal(false)}
                 className="absolute top-5 right-5 bg-bg-app text-text-muted hover:text-text-main hover:bg-border-subtle p-2.5 rounded-full transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>

               <div className="text-center mb-6 mt-2">
                 <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-brand" />
                 </div>
                 <h2 className="m-0 mb-2 text-xl font-semibold text-text-main">{t('feedbackTitle')}</h2>
                 <p className="text-[14px] text-text-muted font-normal">{t('feedbackDesc')}</p>
               </div>

               {feedbackStatus === 'success' ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="text-center py-6 bg-emerald-500/10 rounded-[20px] border border-emerald-500/20"
                 >
                   <span className="text-4xl mb-3 block">🎉</span>
                   <span className="text-emerald-500 font-medium">
                     {t('feedbackSuccess')}
                   </span>
                 </motion.div>
               ) : (
                 <div className="flex flex-col gap-4">
                   <textarea 
                     value={feedbackText}
                     onChange={(e) => setFeedbackText(e.target.value)}
                     placeholder={t('feedbackPlaceholder')}
                     className="w-full bg-bg-app border border-border-subtle rounded-[20px] p-4 text-[14px] sm:text-[15px] focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 h-[120px] resize-none transition-all placeholder:text-text-muted/50 text-text-main"
                   />
                   <button 
                     disabled={!feedbackText.trim() || feedbackStatus === 'submitting'}
                     onClick={() => {
                        setFeedbackStatus('submitting');
                        setTimeout(() => {
                          setFeedbackStatus('success');
                          setTimeout(() => {
                             setShowFeedbackModal(false);
                             setFeedbackText('');
                             setFeedbackStatus('idle');
                          }, 2000);
                        }, 1000);
                     }}
                     className={`w-full py-4 rounded-[20px] font-medium text-[15px] transition-all flex items-center justify-center gap-2 ${
                       feedbackText.trim() && feedbackStatus !== 'submitting' 
                         ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-110 active:scale-95 cursor-pointer' 
                         : 'bg-bg-app text-text-muted cursor-not-allowed border border-border-subtle'
                     }`}
                   >
                     {feedbackStatus === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : t('feedbackSubmit')}
                   </button>
                 </div>
               )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ORDER CONFIRM MODAL */}
      {/* ========================================================================= */}
      {showOrderConfirmModal && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessingOrder && setShowOrderConfirmModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card-bg w-full max-w-[400px] p-6 sm:p-8 rounded-[24px] shadow-2xl relative border border-border-subtle z-10"
            >
              <button 
                onClick={() => setShowOrderConfirmModal(false)}
                disabled={isProcessingOrder}
                className="absolute top-5 right-5 text-text-muted hover:text-text-main bg-bg-app hover:bg-border-subtle p-2 rounded-full transition-colors z-20 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-6 mt-2">
                <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                   <ShoppingBag className="w-8 h-8 text-brand" />
                </div>
                <h2 className="m-0 mb-2 text-[22px] font-bold text-text-main">ยืนยันการสั่งซื้อ</h2>
                <p className="text-[14px] text-text-muted font-medium mb-4">โปรดตรวจสอบรายละเอียดสินค้าก่อนคลิกสั่งซื้อ</p>
                
                <div className="bg-bg-app border border-border-subtle p-4 rounded-[16px] text-left flex gap-4 mt-6">
                  <div className="w-16 h-16 rounded-[12px] overflow-hidden shrink-0 bg-card-bg border border-border-subtle">
                     <img src={selectedItem.imageUrl} alt="Product" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-text-main line-clamp-1">{getLocalized(selectedItem.title)}</h3>
                    <p className="text-[13px] text-text-muted mt-1">{selectedItem.category}</p>
                    <div className="text-[14px] font-bold text-brand mt-1">{selectedItem.price || 'Free'}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowOrderConfirmModal(false)}
                  disabled={isProcessingOrder}
                  className="flex-1 py-3.5 rounded-[16px] text-text-main font-semibold bg-bg-app border border-border-subtle hover:bg-border-subtle active:scale-95 transition-all outline-none"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handlePurchaseConfirm}
                  disabled={isProcessingOrder}
                  className="flex-1 py-3.5 flex items-center justify-center gap-2 font-semibold transition-all outline-none disabled:opacity-70 disabled:active:scale-100 rounded-xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]"
                >
                  {isProcessingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5 shrink-0" />}
                  <span className="truncate">{isProcessingOrder ? 'รอสักครู่...' : 'สั่งซื้อทันที'}</span>
                </button>
              </div>
            </motion.div>
          </div>
      )}

      {/* ========================================================================= */}
      {/* PURCHASE SUCCESS MODAL */}
      {/* ========================================================================= */}
      {showPurchaseSuccessModal && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPurchaseSuccessModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card-bg w-full max-w-[460px] p-6 sm:p-8 rounded-[24px] shadow-2xl relative border border-border-subtle z-10"
            >
              <button 
                onClick={() => setShowPurchaseSuccessModal(false)}
                className="absolute top-5 right-5 text-text-muted hover:text-text-main bg-bg-app hover:bg-border-subtle p-2 rounded-full transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 relative"
                >
                   <motion.div
                     initial={{ rotate: 0 }}
                     animate={{ rotate: 360 }}
                     transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                     className="absolute inset-[-2px] border-2 border-emerald-500/30 rounded-full border-t-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                   />
                   <motion.div
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                   >
                     <Check className="w-10 h-10 text-emerald-500 drop-shadow-md" />
                   </motion.div>
                </motion.div>
                <h2 className="m-0 mb-1 text-[24px] font-bold text-text-main">สั่งซื้อสำเร็จ!</h2>
                <p className="text-[15px] text-brand font-bold mb-4 line-clamp-1 px-4">{getLocalized(selectedItem.title)}</p>
                
                <div className="text-left bg-bg-app border border-border-subtle p-4 rounded-[16px] mt-6 relative group">
                  <div className="text-[12px] font-bold text-text-muted mb-2 uppercase tracking-wider">รายละเอียดสินค้า / ข้อมูล</div>
                  <pre className="whitespace-pre-wrap break-all overflow-x-auto font-sans text-[14px] text-text-main">{purchasedDetails || 'ไม่พบรายละเอียด'}</pre>
                  
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(purchasedDetails || 'ไม่พบรายละเอียด');
                        alert('คัดลอกรายละเอียดแล้ว');
                    }}
                    className="absolute top-4 right-4 p-2 bg-card-bg hover:bg-brand/10 text-text-muted hover:text-brand transition-colors rounded-lg border border-border-subtle shadow-sm opacity-0 group-hover:opacity-100"
                  >
                     <HardDriveDownload className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-4 text-[12px] text-text-muted bg-brand/5 border border-brand/10 p-3 rounded-[12px]">
                   <span className="font-semibold text-brand">หมายเหตุ:</span> ประวัติการสั่งซื้อและรายละเอียดจะถูกบันทึกไว้ในเมนู<span className="font-bold"> ประวัติการทำรายการ </span>ของคุณอัตโนมัติ
                </div>
              </div>

              <button 
                onClick={() => setShowPurchaseSuccessModal(false)}
                className="w-full py-3.5 flex items-center justify-center gap-2 rounded-[16px] text-text-main font-semibold bg-bg-app hover:bg-border-subtle active:scale-95 transition-all outline-none border border-border-subtle"
              >
                ปิดหน้าต่าง
              </button>
            </motion.div>
          </div>
      )}

      {/* ========================================================================= */}
      {/* reCAPTCHA VERIFICATION MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {/* ============================================================================ */}
      {/* 📌 หน้าต่าง Pop-up ยืนยันการรับสินค้า (Verification Modal) */}
      {/* ============================================================================ */}
      {showVerifyModal && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card-bg w-full max-w-[420px] p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative border border-border-subtle z-10 max-h-[90dvh] overflow-y-auto hide-scrollbar"
            >
              <button 
                onClick={() => setShowVerifyModal(false)}
                className="absolute top-5 right-5 bg-bg-app text-text-muted hover:text-text-main hover:bg-border-subtle p-2.5 rounded-full transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-8 mt-2">
                <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                   <ShieldAlert className="w-8 h-8 text-brand" />
                </div>
                <h2 className="m-0 mb-2 text-[22px] font-semibold text-text-main">{t('verifySafe')}</h2>
                <p className="text-[14px] text-text-muted font-normal mb-4">{t('verifyHuman')}</p>
                
                {/* Anti-VPN Warning Banner */}
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-[12px] text-left flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[13px] font-semibold text-red-500 mb-0.5">{t('verifyWarning')}</h3>
                    <p className="text-[12px] text-red-500/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('verifyWarningDesc') }}></p>
                  </div>
                </div>
              </div>

              {/* Steps Container */}
              <div className="flex flex-col gap-3 mb-6">
                
                {/* Step 1 */}
                <div className="bg-bg-app border border-border-subtle rounded-[16px] p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step1Status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : step1Status === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-rose-500/20 text-rose-500'}`}>
                        {step1Status === 'completed' ? <Check className="w-4 h-4" /> : <Youtube className="w-4 h-4" />}
                     </div>
                     <div className="flex flex-col">
                       <span className={`text-[15px] font-medium tracking-tight ${step1Status === 'completed' ? 'text-text-muted line-through' : 'text-text-main'}`}>
                         {t('verifyYT')}
                       </span>
                       {step1Status === 'checking' && <span className="text-[12px] text-brand font-medium">{t('verifyYTWait')}</span>}
                       {step1Status === 'error' && <span className="text-[12px] text-red-500 font-medium">{t('verifyYTErr')}</span>}
                     </div>
                  </div>
                  <button 
                    onClick={() => { window.open('https://youtube.com', '_blank'); step1OpenedAt.current = Date.now(); setStep1Status('checking'); }}
                    disabled={step1Status === 'completed'}
                    className={`px-4 py-2 rounded-[12px] text-[13px] font-medium transition-all flex-shrink-0 flex items-center gap-2 ${
                      step1Status === 'completed' ? 'bg-emerald-500 text-white opacity-70 cursor-not-allowed' : 
                      step1Status === 'checking' ? 'bg-amber-500 text-white cursor-pointer hover:bg-amber-600 animate-pulse' :
                      'bg-rose-600 text-white hover:bg-rose-700 shadow-sm cursor-pointer'
                    }`}
                  >
                    {step1Status === 'checking' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {step1Status === 'completed' ? t('verifyDone') : step1Status === 'checking' ? t('verifyCheck') : step1Status === 'error' ? t('verifyRetry') : t('verifyDo')}
                  </button>
                </div>

                {/* Step 2 */}
                <div className="bg-bg-app border border-border-subtle rounded-[16px] p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step2Status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : step2Status === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-[#5865F2]/20 text-[#5865F2]'}`}>
                        {step2Status === 'completed' ? <Check className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                     </div>
                     <div className="flex flex-col">
                       <span className={`text-[15px] font-medium tracking-tight ${step2Status === 'completed' ? 'text-text-muted line-through' : 'text-text-main'}`}>
                         {t('verifyTG')}
                       </span>
                       {step2Status === 'checking' && <span className="text-[12px] text-brand font-medium">{t('verifyTGWait')}</span>}
                       {step2Status === 'error' && <span className="text-[12px] text-red-500 font-medium">{t('verifyTGErr')}</span>}
                     </div>
                  </div>
                  <button 
                    onClick={() => { window.open('https://discord.gg/hSuBbnwWZY', '_blank'); step2OpenedAt.current = Date.now(); setStep2Status('checking'); }}
                    disabled={step2Status === 'completed'}
                    className={`px-4 py-2 rounded-[12px] text-[13px] font-medium transition-all flex-shrink-0 flex items-center gap-2 ${
                      step2Status === 'completed' ? 'bg-emerald-500 text-white opacity-70 cursor-not-allowed' : 
                      step2Status === 'checking' ? 'bg-amber-500 text-white cursor-pointer hover:bg-amber-600 animate-pulse' :
                      'bg-[#5865F2] text-white hover:bg-[#4752C4] shadow-sm cursor-pointer'
                    }`}
                  >
                    {step2Status === 'checking' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {step2Status === 'completed' ? t('verifyDone') : step2Status === 'checking' ? t('verifyCheck') : step2Status === 'error' ? t('verifyRetry') : t('verifyDo')}
                  </button>
                </div>

                {/* Step 3 (Verified Check Block) */}
                <div className={`flex justify-center transition-opacity duration-300 ${(step1Status !== 'completed' || step2Status !== 'completed') ? 'opacity-60 grayscale pointer-events-none' : 'opacity-100'}`}>
                  {isChecked ? (
                     <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[16px] p-4 text-emerald-500 flex items-center justify-center gap-3 w-full shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                       <Check className="w-5 h-5"/> {t('noRobot')} - Verified
                     </div>
                  ) : isNetworkChecking ? (
                     <div className="bg-bg-app border border-border-subtle rounded-[16px] p-4 text-brand flex items-center justify-center gap-3 w-full shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                       <Loader2 className="w-5 h-5 animate-spin"/> Verifying...
                     </div>
                  ) : (
                     <div className="mx-auto rounded-[8px] overflow-hidden shadow-sm inline-block relative">
                        <Turnstile
                          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAADFFAhm_1PRQij4M"}
                          onSuccess={handleVerifyRecaptcha}
                          options={{
                            theme: theme as any
                          }}
                        />
                        {(step1Status !== 'completed' || step2Status !== 'completed') && (
                          <div className="absolute inset-0 z-10" onClick={() => alert(t('alertSteps'))}></div>
                        )}
                     </div>
                  )}
                </div>

              </div>

              <AnimatePresence>
                {networkError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-red-500/10 text-red-500 text-[13px] font-medium p-3 rounded-[12px] border border-red-500/20 text-center mb-6">
                      {networkError}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timer & Confirmation block */}
              <div className="h-[90px] flex items-center justify-center mb-6">
                {isChecked && isCounting && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.9 }} 
                     animate={{ opacity: 1, scale: 1 }} 
                     className="w-full relative bg-brand/10 rounded-[20px] border border-brand/20 overflow-hidden h-full flex flex-col items-center justify-center"
                   >
                     <motion.div 
                       className="absolute top-0 left-0 bottom-0 bg-brand/20"
                       initial={{ width: 0 }}
                       animate={{ width: `${((15 - countdown) / 15) * 100}%` }}
                       transition={{ ease: "linear", duration: 1 }}
                     />
                     <div className="relative z-10 flex flex-col items-center justify-center">
                        <div className="flex items-end gap-1 text-brand mb-0.5">
                           <motion.div 
                             key={countdown}
                             initial={{ opacity: 0, y: -10 }}
                             animate={{ opacity: 1, y: 0 }}
                             className="text-[36px] font-semibold leading-none tracking-tighter"
                           >
                             {countdown}
                           </motion.div>
                           <span className="text-[16px] font-medium mb-1">s</span>
                        </div>
                        <div className="text-[12px] font-medium text-brand/70 uppercase tracking-widest flex items-center gap-1.5">
                          <RefreshCcw className="w-3 h-3 animate-spin"/> {t('generatingLink')}
                        </div>
                     </div>
                   </motion.div>
                )}
                
                {isChecked && !isCounting && countdown === 0 && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.9 }} 
                     animate={{ opacity: 1, scale: 1 }} 
                     className="w-full text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-center gap-3"
                   >
                     <div className="bg-emerald-500/20 p-1.5 rounded-full">
                       <Check className="w-5 h-5 text-emerald-500" strokeWidth={3} />
                     </div>
                     <span className="text-emerald-500 text-[15px] font-medium">
                       {t('readyDl')}
                     </span>
                   </motion.div>
                )}
              </div>

              {/* Final CTA Button */}
              <button 
                disabled={!(!isCounting && isChecked && countdown === 0)}
                onClick={handleFinalRedirect}
                className={`w-full py-4.5 rounded-[20px] text-[15px] font-bold text-center transition-all flex items-center justify-center gap-2 group ${
                  !isCounting && isChecked && countdown === 0 
                    ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] cursor-pointer' 
                    : 'bg-bg-app text-text-muted border border-border-subtle cursor-not-allowed'
                }`}
              >
                {!isChecked ? t('waitingVerify') : (countdown > 0 ? t('gettingLink') : (
                  <>
                    <ShoppingCart className="w-5 h-5 shrink-0 [transform:perspective(700px)_rotateY(0deg)] [transform-style:preserve-3d] transition-transform duration-700 group-hover:[transform:perspective(700px)_rotateY(360deg)]" />
                    {t('goDownload')}
                  </>
                ))}
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {/* ============================================================================ */}
      {/* 📌 หน้าต่าง Pop-up ล็อกอิน / สมัครสมาชิก (Auth Modal) */}
      {/* ============================================================================ */}
      {authModalType && (
          <AuthModal
            type={authModalType}
            onClose={() => setAuthModalType(null)}
            t={t}
            onSuccess={(user, token, rememberMe) => {
              // State update only; HttpOnly cookies handle auth persistence
              setCurrentUser({ id: user.id || user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, history: user.history });
              setAuthModalType(null);
            }}
          />
        )}
        
        {/* ============================================================================ */}
        {/* 📌 หน้าต่าง Pop-up โปรไฟล์ส่วนตัว (Profile Modal) */}
        {/* ============================================================================ */}
        {showProfileModal && currentUser && (
          <ProfileModal
            currentUser={currentUser}
            onClose={() => setShowProfileModal(false)}
            onUpdate={(updatedUser) => {
              setCurrentUser(prev => prev ? { ...prev, username: updatedUser.username, avatarUrl: updatedUser.avatarUrl } : null);
            }}
            t={t}
          />
        )}

        {/* ============================================================================ */}
        {/* 📌 หน้าต่างจัดการระบบแอดมินหลังบ้าน (Admin Dashboard Modal) */}
        {/* ============================================================================ */}
        {showAdminDashboard && (
          <AdminDashboardModal
            isOpen={showAdminDashboard}
            onClose={() => setShowAdminDashboard(false)}
            currentUser={currentUser}
            siteSettings={siteSettings}
            onSettingsUpdate={(newSettings) => {
              setSiteSettings(newSettings);
              fetchPublicCatalogAndSettings();
            }}
            onResourcesUpdate={() => {
              fetchPublicCatalogAndSettings();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
