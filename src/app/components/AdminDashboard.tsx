import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminFarmersManagement from "./AdminFarmersManagement";
import AdminStatistics from "./AdminStatistics";
import AdminAIAnalysis from "./AdminAIAnalysis";
import FarmersLocationMap from "./FarmersLocationMap";
import {
  Users,
  BarChart3,
  Brain,
  Menu,
  X,
  LogOut,
  Sprout,
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

type View = "farmers" | "statistics" | "ai" | "locations";

interface AdminDashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export default function AdminDashboard({ currentUser, onLogout }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<View>("farmers");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
            <ShieldAlert className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="font-bold text-lg text-white leading-none">لوحة المدير</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">SysFilaha Admin</span>
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
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group relative",
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                    : "hover:bg-slate-800 text-slate-400 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : item.color)} />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start gap-3 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl h-12"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>خروج من النظام</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Modern Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <span className="font-bold text-lg">سيس فلاح</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Activity className="w-4 h-4" />
              <span>حالة النظام: <span className="text-emerald-500 font-bold">متصل</span></span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Users className="w-4 h-4" />
              <span>الفلاحين النشطين: <span className="text-slate-900 font-bold">12,402</span></span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-slate-500 relative bg-slate-50 border border-slate-100 rounded-xl">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
            </Button>

            <div className="flex items-center gap-3 pl-2">
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{currentUser.firstName}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">مشرف النظام المركزي</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center border border-emerald-200 cursor-pointer group shadow-sm transition-all hover:shadow-md">
                <User className="w-5 h-5 text-emerald-700" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1600px] mx-auto space-y-8">
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
          </div>
        </main>
      </div>

      {/* Mobile Drawer (Same as Farmer but emerald) */}
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
              className="fixed top-0 right-0 h-full w-80 bg-slate-900 z-[60] lg:hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xl text-emerald-400 flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6" /> الإدارة
                </span>
                <Button variant="ghost" size="icon" className="text-white" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex-1 p-6 space-y-3">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all",
                      currentView === item.id
                        ? "bg-emerald-600 text-white shadow-xl"
                        : "text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-bold text-lg">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-8 border-t border-slate-800">
                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="w-full h-14 border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-2xl"
                >
                  <LogOut className="w-5 h-5" /> خروج نهائي
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
