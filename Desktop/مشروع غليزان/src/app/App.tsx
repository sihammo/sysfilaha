import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import LoginScreen from "./components/LoginScreen";
import FarmerDashboard from "./components/FarmerDashboard";
import AdminDashboard from "./components/AdminDashboard";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  nationalId?: string;
  farmerCardNumber?: string;
  role: "admin" | "farmer";
  password: string;
  status: "approved" | "pending" | "rejected";
  createdAt?: string;
}

export interface Livestock {
  id: string;
  type: string;
  category: 'male' | 'female' | 'young';
  count: number;
  acquisitionDate: string;
  purpose: 'breeding' | 'selling' | 'consumption';
  customType?: string;
  costs: {
    feed: number;
    medicine: number;
    vaccination: number;
    labor: number;
  };
  production: {
    milk?: number;
    eggs?: number;
    weight?: number;
  };
}

export default function App() {

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize default users if not exists
    const users = localStorage.getItem("users");
    if (!users) {
      const defaultUsers: User[] = [
        {
          id: "admin-1",
          firstName: "المسؤول",
          lastName: "العام",
          role: "admin",
          password: "admin",
          status: "approved",
        },
        {
          id: "farmer-demo",
          firstName: "محمد",
          lastName: "بن عيسى",
          nationalId: "1234567890123",
          farmerCardNumber: "FC001234",
          role: "farmer",
          password: "demo123",
          status: "approved",
        },
      ];
      localStorage.setItem("users", JSON.stringify(defaultUsers));

      // Add demo data for demo farmer
      const demoCrops = [
        {
          id: "crop-1",
          name: "قمح",
          type: "حبوب",
          area: 10,
          plantingDate: "2025-10-15",
          harvestDate: "2026-06-15",
          status: "مزروع",
          expectedYield: 300,
        },
        {
          id: "crop-2",
          name: "طماطم",
          type: "خضروات",
          area: 3,
          plantingDate: "2025-11-01",
          harvestDate: "2026-02-28",
          status: "جاهز للحصاد",
          expectedYield: 150,
        },
      ];
      localStorage.setItem("crops_farmer-demo", JSON.stringify(demoCrops));

      const demoSales = [
        {
          id: "sale-1",
          cropName: "قمح",
          quantity: 50,
          pricePerUnit: 5000,
          totalPrice: 250000,
          buyerName: "شركة الحبوب الجزائرية",
          saleDate: "2025-12-01",
          paymentStatus: "مدفوع",
        },
        {
          id: "sale-2",
          cropName: "طماطم",
          quantity: 30,
          pricePerUnit: 3000,
          totalPrice: 90000,
          buyerName: "سوق الخضار المركزي",
          saleDate: "2025-12-15",
          paymentStatus: "معلق",
        },
      ];
      localStorage.setItem("sales_farmer-demo", JSON.stringify(demoSales));

      const demoLands = [
        {
          id: "land-1",
          name: "الحقل الشمالي",
          area: 15,
          location: "ولاية سطيف",
          soilType: "طينية",
          status: "مزروع",
        },
      ];
      localStorage.setItem("lands_farmer-demo", JSON.stringify(demoLands));

      const demoEquipment = [
        {
          id: "eq-1",
          name: "جرار فلاحي",
          type: "جرار",
          purchaseDate: "2024-03-15",
          condition: "جيد",
          maintenanceDate: "2025-11-01",
        },
      ];
      localStorage.setItem("equipment_farmer-demo", JSON.stringify(demoEquipment));

      const demoWorkers = [
        {
          id: "worker-1",
          name: "علي بن محمد",
          role: "عامل زراعي",
          phone: "0555123456",
          salary: 35000,
          startDate: "2025-01-15",
        },
        {
          id: "worker-2",
          name: "سعيد بن أحمد",
          role: "مشرف",
          phone: "0666234567",
          salary: 50000,
          startDate: "2024-09-01",
        },
      ];
      localStorage.setItem("workers_farmer-demo", JSON.stringify(demoWorkers));

      const demoLivestock: Livestock[] = [
        {
          id: "ls-1",
          type: "sheep",
          category: "female",
          count: 50,
          acquisitionDate: "2025-05-10",
          purpose: "breeding",
          costs: { feed: 150000, medicine: 20000, vaccination: 15000, labor: 30000 },
          production: { milk: 20, weight: 1500 }
        },
        {
          id: "ls-2",
          type: "cattle",
          category: "female",
          count: 10,
          acquisitionDate: "2025-06-15",
          purpose: "breeding",
          costs: { feed: 300000, medicine: 50000, vaccination: 25000, labor: 60000 },
          production: { milk: 150, weight: 4500 }
        }
      ];
      localStorage.setItem("livestock_farmer-demo", JSON.stringify(demoLivestock));
    }


    // Check for existing session
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Toaster />
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      <Toaster />
      {currentUser.role === "admin" ? (
        <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <FarmerDashboard currentUser={currentUser} onLogout={handleLogout} />
      )}
    </>
  );
}
