import { useState } from "react";
import Dashboard from "./Dashboard";
import CropsManagement from "./CropsManagement";
import SalesManagement from "./SalesManagement";
import ResourcesManagement from "./ResourcesManagement";
import Reports from "./Reports";
import AIAnalysis from "./AIAnalysis";
import LivestockManagement from "./LivestockManagement";
import FarmerLocationView from "./FarmerLocationView";
import { 
  LayoutDashboard, 
  Sprout, 
  ShoppingCart, 
  Tractor,
  FileText,
  Menu,
  X,
  LogOut,
  Brain
} from "lucide-react";
import { Button } from "./ui/button";

type View = "dashboard" | "crops" | "sales" | "resources" | "reports" | "ai" | "livestock";

interface FarmerDashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export default function FarmerDashboard({ currentUser, onLogout }: FarmerDashboardProps) {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { id: "dashboard" as View, label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "crops" as View, label: "المحاصيل", icon: Sprout },
    { id: "livestock" as View, label: "المواشي", icon: Tractor },
    { id: "sales" as View, label: "المبيعات", icon: ShoppingCart },
    { id: "resources" as View, label: "الموارد", icon: Tractor },
    { id: "reports" as View, label: "التقارير", icon: FileText },
    { id: "ai" as View, label: "التوصيات الذكية", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100" dir="rtl">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sprout className="w-8 h-8" />
            <div>
              <h1 className="text-2xl">نظام إدارة الفلاحة</h1>
              <p className="text-sm text-green-100">
                مرحباً {currentUser.firstName} {currentUser.lastName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={onLogout}
              variant="outline"
              className="hidden lg:flex bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </Button>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 hover:bg-green-600 rounded-lg transition-colors"
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
            fixed lg:sticky top-[73px] right-0 h-[calc(100vh-73px)] bg-white shadow-xl z-30
            transition-transform duration-300 lg:translate-x-0
            ${menuOpen ? "translate-x-0" : "translate-x-full"}
            w-64
          `}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${
                      currentView === item.id
                        ? "bg-green-600 text-white shadow-md"
                        : "hover:bg-green-50 text-gray-700"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <div className="pt-4 border-t mt-4">
              <Button
                onClick={onLogout}
                variant="outline"
                className="w-full lg:hidden text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
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
          </div>
        </main>
      </div>

      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
