import { useState, useEffect } from "react";
import AdminFarmersManagement from "./AdminFarmersManagement";
import AdminStatistics from "./AdminStatistics";
import AdminAIAnalysis from "./AdminAIAnalysis";
import AdminFarmersMap from "./AdminFarmersMap";
import {
  Users,
  BarChart3,
  Brain,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  LayoutGrid,
  Bell,
  MessageCircle,
  MapPin
} from "lucide-react";
import SupportChat from "./SupportChat";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

type View = "farmers" | "statistics" | "ai" | "map" | "support";

interface AdminDashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export default function AdminDashboard({ currentUser, onLogout }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<View>("farmers");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updatePendingCount = () => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const pending = users.filter((u: any) => u.role === "farmer" && u.status === "pending").length;
      setPendingCount(pending);
    };

    updatePendingCount();
    // Refresh count when switching views or coming back to window
    window.addEventListener('storage', updatePendingCount);
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      window.removeEventListener('storage', updatePendingCount);
      clearInterval(interval);
    };
  }, []);

  const menuItems = [
    { id: "farmers" as View, label: "منظومة الفلاحين", icon: Users, hasNotification: pendingCount > 0 },
    { id: "map" as View, label: "خريطة الأراضي", icon: MapPin, hasNotification: false },
    { id: "statistics" as View, label: "التقارير التحليلية", icon: BarChart3, hasNotification: false },
    { id: "ai" as View, label: "مركز الذكاء الإداري", icon: Brain, hasNotification: false },
    { id: "support" as View, label: "مركز التواصل", icon: MessageCircle, hasNotification: false },
  ];

  return (
    <div className="min-h-screen bg-[var(--admin-gray-bg)] text-slate-800" dir="rtl">
      {/* Header */}
      <header className="bg-[var(--admin-green-trust)] text-white shadow-md sticky top-0 z-40 border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <ShieldCheck className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">مركز التحكم الإداري</h1>
              <p className="text-xs text-slate-300">
                المسؤول: {currentUser.firstName} {currentUser.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
              <Bell className="w-5 h-5 text-slate-200" />
              {pendingCount > 0 && (
                <span className="absolute top-1 left-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[var(--admin-green-trust)]">
                  {pendingCount}
                </span>
              )}
            </div>

            <Button
              onClick={onLogout}
              variant="outline"
              className="hidden lg:flex bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all border-none"
            >
              <LogOut className="w-4 h-4 ml-2" />
              إنهاء الجلسة
            </Button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-[73px] right-0 h-[calc(100vh-73px)] bg-white border-l border-[var(--admin-gray-border)] shadow-sm z-30
            transition-all duration-300 lg:translate-x-0
            ${menuOpen ? "translate-x-0" : "translate-x-full"}
            w-72 overflow-y-auto
          `}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8 text-slate-400">
              <LayoutGrid className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">القائمة الرئيسية</span>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setMenuOpen(false);
                    }}
                    className={`
                      w-full relative flex items-center gap-4 px-4 py-4 rounded-xl transition-all
                      ${isActive
                        ? "bg-[var(--admin-green-trust)] text-white shadow-lg shadow-green-900/20"
                        : "hover:bg-slate-50 text-slate-600 hover:text-[var(--admin-green-trust)]"
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-green-400" : "text-slate-400"}`} />
                    <span className="font-medium">{item.label}</span>
                    {item.hasNotification && (
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-6 border-t border-slate-100 mt-6">
                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="w-full lg:hidden text-rose-600 border-rose-100 hover:bg-rose-50 rounded-xl py-6"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </Button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10">
          <div className="max-w-[1600px] mx-auto">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === "farmers" && <AdminFarmersManagement />}
              {currentView === "map" && <AdminFarmersMap />}
              {currentView === "statistics" && <AdminStatistics />}
              {currentView === "ai" && <AdminAIAnalysis />}
              {currentView === "support" && <SupportChat currentUser={currentUser} />}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
