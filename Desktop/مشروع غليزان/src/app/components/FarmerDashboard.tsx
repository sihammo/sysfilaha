import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import CropsManagement from "./CropsManagement";
import SalesManagement from "./SalesManagement";
import ResourcesManagement from "./ResourcesManagement";
import Reports from "./Reports";
import AIAnalysis from "./AIAnalysis";
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
  Leaf,
  Grid3X3,
  Bell,
  MessageCircle,
  MapPin
} from "lucide-react";
import FarmerReminders from "./FarmerReminders";
import { LivestockManagement } from "./LivestockManagement";
import SupportChat from "./SupportChat";
import FarmLocationMap from "./FarmLocationMap";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { Livestock } from "../App";
import { Dog } from "lucide-react";

type View = "dashboard" | "crops" | "livestock" | "sales" | "resources" | "reports" | "ai" | "reminders" | "support" | "map";

interface FarmerDashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export default function FarmerDashboard({ currentUser, onLogout }: FarmerDashboardProps) {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [livestock, setLivestock] = useState<Livestock[]>([]);

  useEffect(() => {
    const savedLivestock = localStorage.getItem(`livestock_${currentUser.id}`);
    if (savedLivestock) {
      setLivestock(JSON.parse(savedLivestock));
    }
  }, [currentUser.id]);

  const handleSetLivestock = (newLivestock: Livestock[]) => {
    setLivestock(newLivestock);
    localStorage.setItem(`livestock_${currentUser.id}`, JSON.stringify(newLivestock));
  };

  const menuItems = [
    { id: "dashboard" as View, label: "نظرة عامة", icon: LayoutDashboard },
    { id: "crops" as View, label: "بذور ومحاصيل", icon: Sprout },
    { id: "livestock" as View, label: "قسم المواشي", icon: Dog },
    { id: "sales" as View, label: "تجارة وحصاد", icon: ShoppingCart },
    { id: "map" as View, label: "موقع الأرض", icon: MapPin },
    { id: "resources" as View, label: "الأرض والعتاد", icon: Tractor },
    { id: "reports" as View, label: "السجلات", icon: FileText },
    { id: "ai" as View, label: "مرشد الفلاح", icon: Brain },
    { id: "reminders" as View, label: "التنبيهات", icon: Bell },
    { id: "support" as View, label: "الدعم الفني", icon: MessageCircle },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
    closed: { x: "100%", transition: { type: "spring" as const, stiffness: 300, damping: 30 } }
  };

  return (
    <div className="min-h-screen bg-[var(--agri-beige-warm)] text-[#3E2723]" dir="rtl">
      {/* Header */}
      <header className="bg-[var(--agri-green-growth)] text-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Leaf className="w-6 h-6 text-[var(--agri-green-soft)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">سند المزرعة</h1>
              <p className="text-xs text-green-100/80">
                مرحباً بك مجدداً، يا {currentUser.firstName}
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onLogout}
              variant="outline"
              className="hidden lg:flex bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full px-6"
            >
              <LogOut className="w-4 h-4 ml-2" />
              تأمين الخروج
            </Button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          variants={sidebarVariants}
          animate={(window.innerWidth >= 1024 || menuOpen) ? "open" : "closed"}
          className={`
            fixed lg:sticky top-[73px] right-0 h-[calc(100vh-73px)] bg-white/80 backdrop-blur-md border-l border-[var(--agri-green-soft)]/20 shadow-xl z-30
            w-64 overflow-y-auto
          `}
        >
          <nav className="p-4 space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-500
                    ${currentView === item.id
                      ? "bg-[var(--agri-green-growth)] text-white shadow-lg scale-[1.02]"
                      : "hover:bg-[var(--agri-green-soft)]/20 text-gray-700"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${currentView === item.id ? "text-[var(--agri-green-soft)]" : "text-gray-500"}`} />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}

            <div className="pt-6 border-t border-gray-100 mt-4">
              <Button
                onClick={onLogout}
                variant="outline"
                className="w-full lg:hidden text-[#8B4513] border-[#8B4513]/20 hover:bg-[#8B4513]/10 rounded-2xl py-6"
              >
                <LogOut className="w-4 h-4 ml-2" />
                خروج آمن
              </Button>
            </div>
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {currentView === "dashboard" && <Dashboard userId={currentUser.id} />}
                {currentView === "crops" && <CropsManagement userId={currentUser.id} />}
                {currentView === "livestock" && <LivestockManagement livestock={livestock} setLivestock={handleSetLivestock} />}
                {currentView === "sales" && <SalesManagement userId={currentUser.id} />}
                {currentView === "map" && <FarmLocationMap userId={currentUser.id} />}
                {currentView === "resources" && <ResourcesManagement userId={currentUser.id} />}
                {currentView === "reports" && <Reports userId={currentUser.id} />}
                {currentView === "ai" && <AIAnalysis userId={currentUser.id} />}
                {currentView === "reminders" && <FarmerReminders userId={currentUser.id} />}
                {currentView === "support" && <SupportChat currentUser={currentUser} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Overlay for mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
