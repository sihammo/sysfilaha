import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dashboard from "./Dashboard";
import CropsManagement from "./CropsManagement";
import SalesManagement from "./SalesManagement";
import ResourcesManagement from "./ResourcesManagement";
import Reports from "./Reports";
import AIAnalysis from "./AIAnalysis";
import LivestockManagement from "./LivestockManagement";
import {
  LayoutDashboard,
  Sprout,
  ShoppingCart,
  Tractor,
  FileText,
  Menu,
  X,
  LogOut,
  Brain,
  Bell,
  Settings,
  ChevronLeft,
  Search,
  User,
  Coffee
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../utils/cn";
import api from "../utils/api";

type View = "dashboard" | "crops" | "sales" | "resources" | "reports" | "ai" | "livestock";

interface FarmerDashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export default function FarmerDashboard({ currentUser, onLogout }: FarmerDashboardProps) {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuStats, setMenuStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchMenuStats = async () => {
      try {
        const data = await api.farmer.getMenuStats();
        setMenuStats(data);
      } catch (error) {
        console.error("Failed to fetch menu stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchMenuStats();
    // Refresh stats every 2 minutes
    const interval = setInterval(fetchMenuStats, 120000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: "dashboard" as View, label: "لوحة التحكم", icon: LayoutDashboard, color: "text-blue-500" },
    { id: "crops" as View, label: "المحاصيل الزراعية", icon: Sprout, color: "text-green-500", count: menuStats?.cropsCount },
    { id: "livestock" as View, label: "إدارة المواشي", icon: Coffee, color: "text-amber-500", count: menuStats?.livestockCount },
    { id: "sales" as View, label: "المبيعات والتسويق", icon: ShoppingCart, color: "text-emerald-500", count: menuStats?.salesCount },
    { id: "resources" as View, label: "العتاد والموارد", icon: Tractor, color: "text-orange-500", count: (menuStats?.equipmentCount || 0) + (menuStats?.workersCount || 0) },
    { id: "reports" as View, label: "التقارير المالية", icon: FileText, color: "text-rose-500", count: menuStats?.reportsCount },
    { id: "ai" as View, label: "الاستشارات الذكية", icon: Brain, color: "text-white", isSpecial: true },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden font-sans" dir="rtl">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className={cn(
          "hidden lg:flex flex-col bg-white border-left border-slate-200 z-40 transition-all",
          "shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
        )}
      >
        <div className="p-6 flex items-center gap-3 h-20">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Sprout className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight text-slate-800"
            >
              سيس فلاح
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group relative",
                  isActive
                    ? "bg-primary text-white shadow-xl shadow-primary/30"
                    : item.isSpecial
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors shrink-0",
                  isActive || item.isSpecial ? "bg-white/20" : "bg-slate-50 group-hover:bg-white"
                )}>
                  <Icon className={cn("w-5 h-5", isActive || item.isSpecial ? "text-white" : item.color)} />
                </div>

                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 flex items-center justify-between"
                  >
                    <span className="font-bold text-sm tracking-wide">{item.label}</span>
                    {item.count !== undefined && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black min-w-[20px] text-center",
                        isActive ? "bg-white text-primary" : "bg-slate-100 text-slate-500"
                      )}>
                        {isLoadingStats ? "..." : item.count}
                      </span>
                    )}
                  </motion.div>
                )}

                {isActive && !item.isSpecial && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 w-1.5 h-6 bg-white rounded-l-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full h-10 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
          >
            <ChevronLeft className={cn("w-5 h-5 transition-transform", !isSidebarOpen && "rotate-180")} />
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Modern Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <span className="font-bold text-lg">سيس فلاح</span>
          </div>

          <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-3 py-2 w-96 border border-slate-200/50 group focus-within:ring-2 ring-primary/20 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن المحاصيل، الموارد، أو التقارير..."
              className="bg-transparent border-none outline-none px-3 w-full text-sm placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-amber-700">تنبيهات مائية</span>
            </div>

            <Button variant="ghost" size="icon" className="text-slate-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </Button>

            <div className="h-8 w-px bg-slate-200 mx-1" />

            <div className="flex items-center gap-3 pl-2">
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{currentUser.firstName} {currentUser.lastName}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">مكتب {currentUser.region || "وطني"}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer group">
                <User className="w-5 h-5 text-slate-600 transition-transform group-hover:scale-110" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {currentView === "dashboard" && (
                  <Dashboard
                    userId={currentUser.id}
                    userRegion={currentUser.region}
                    userLandArea={currentUser.landArea}
                    userAddress={currentUser.address}
                  />
                )}
                {currentView === "crops" && <CropsManagement userId={currentUser.id} />}
                {currentView === "livestock" && <LivestockManagement farmerId={currentUser.id} />}
                {currentView === "sales" && <SalesManagement userId={currentUser.id} />}
                {currentView === "resources" && <ResourcesManagement userId={currentUser.id} />}
                {currentView === "reports" && <Reports userId={currentUser.id} />}
                {currentView === "ai" && <AIAnalysis userId={currentUser.id} />}
              </motion.div>
            </AnimatePresence>
          </div>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white z-[60] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-xl text-primary flex items-center gap-2">
                  <Sprout className="w-6 h-6" /> سيس فلاح
                </span>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex-1 p-4 space-y-3">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all",
                      currentView === item.id
                        ? "bg-primary text-white shadow-xl shadow-primary/20"
                        : item.isSpecial
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="w-6 h-6" />
                      <span className="font-bold text-lg">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-black",
                        currentView === item.id ? "bg-white text-primary" : "bg-slate-100 text-slate-500"
                      )}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100">
                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="w-full h-14 border-rose-200 text-rose-500 hover:bg-rose-50 rounded-2xl font-bold flex gap-2"
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
