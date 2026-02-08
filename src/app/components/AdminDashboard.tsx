import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminFarmersManagement from "./AdminFarmersManagement";
import AdminStatistics from "./AdminStatistics";
import AdminAIAnalysis from "./AdminAIAnalysis";
import FarmersLocationMap from "./FarmersLocationMap";
import BrandingLogo from "./BrandingLogo";
import {
  Users,
  BarChart3,
  Brain,
  Menu,
  X,
  LogOut,
  MapPin,
  ShieldAlert,
  Search,
  Bell,
  Settings,
  User,
  Activity,
  ChevronLeft
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../utils/cn";
import api from "../utils/api";

type View = "farmers" | "statistics" | "ai" | "locations";

interface AdminDashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export default function AdminDashboard({ currentUser, onLogout }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<View>("farmers");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalArea: 0,
    totalFarmers: 0,
    activeFarmers: 0,
    systemStatus: "connecting"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.admin.getDashboardStats();
        setStats({ ...data, systemStatus: "connected" }); // Assume connected if fetch is successful
      } catch (e) {
        setStats(prev => ({ ...prev, systemStatus: "disconnected" }));
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Live update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: "farmers" as View, label: "إدارة الفلاحين", icon: Users, color: "text-blue-500" },
    { id: "locations" as View, label: "الخارطة الوطنية", icon: MapPin, color: "text-rose-500" },
    { id: "statistics" as View, label: "الإحصائيات والنمو", icon: BarChart3, color: "text-emerald-500" },
    { id: "ai" as View, label: "تحليل البيانات الذكي", icon: Brain, color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex overflow-hidden font-sans" dir="rtl">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className={cn(
          "hidden lg:flex flex-col bg-slate-900 text-slate-300 z-40 transition-all shadow-2xl"
        )}
      >
        <div className="p-6 flex items-center gap-3 h-20 bg-slate-950/40">
          <BrandingLogo
            iconOnly={!isSidebarOpen}
            textColor="text-white"
          />
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col ml-1"
            >
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none">لوحة الإدارة</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  isActive ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "hover:bg-slate-800"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive ? "bg-white/20" : "bg-slate-800 group-hover:bg-slate-700"
                )}>
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : item.color)} />
                </div>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-bold text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full h-10 flex items-center justify-center hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
          >
            <ChevronLeft className={cn("w-5 h-5 transition-transform", !isSidebarOpen && "rotate-180")} />
          </button>
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full mt-2 text-slate-400 hover:text-white hover:bg-rose-500/10 flex items-center justify-center gap-2 group"
          >
            <LogOut className="w-5 h-5 group-hover:text-rose-500" />
            {isSidebarOpen && <span className="font-bold">تسجيل الخروج</span>}
          </Button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <Button variant="ghost" className="p-0 hover:bg-transparent">
              <BrandingLogo iconOnly />
            </Button>
          </div>

          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-2 md:gap-4 px-3 md:px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Activity className={cn("w-3 h-3 md:w-4 md:h-4", stats.systemStatus === 'connecting' ? 'text-amber-500' : 'text-emerald-500')} />
                  {stats.systemStatus === 'connected' && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-ping opacity-75" />
                  )}
                </div>
                <span className={cn("text-[10px] md:text-xs font-bold", stats.systemStatus === 'connecting' ? 'text-amber-500' : 'text-emerald-500')}>
                  {stats.systemStatus === 'connecting' ? 'اتصال...' : 'متصل'}
                </span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={stats.totalFarmers}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] md:text-xs font-bold text-slate-600 block tabular-nums"
                  >
                    {stats.totalFarmers} فلاح
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-slate-400 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400">
              <Settings className="w-5 h-5" />
            </Button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">مدير النظام</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                <User className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === "farmers" && <AdminFarmersManagement />}
              {currentView === "locations" && <FarmersLocationMap />}
              {currentView === "statistics" && <AdminStatistics />}
              {currentView === "ai" && <AdminAIAnalysis />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-slate-900 z-[60] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <BrandingLogo textColor="text-white" />
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all",
                      currentView === item.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-bold text-lg">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6 border-t border-slate-800">
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  className="w-full h-14 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold flex gap-2"
                >
                  <LogOut className="w-5 h-5" /> تسجيل الخروج
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
