import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import LoginScreen from "./components/LoginScreen";
import FarmerRegistration from "./components/FarmerRegistration";
import FarmerDashboard from "./components/FarmerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Chat from "./components/Chat";
import api from "./utils/api";
import { toast } from "sonner";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  nationalId?: string;
  farmerCardNumber?: string;
  role: "admin" | "farmer";
  password: string;
  approved?: boolean;
  phone?: string;
  email?: string;
  address?: string;
  landArea?: string;
  region?: string;
  crops?: string;
  status?: "pending" | "approved" | "rejected";
  registrationDate?: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const savedUser = localStorage.getItem("currentUser");
      const token = localStorage.getItem("token");
      if (savedUser && token) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem("currentUser");
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const handleLogin = (user: User, token: string) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  const handleRegister = async (newFarmer: any) => {
    try {
      await api.auth.register(newFarmer);
      toast.success("تم التسجيل بنجاح، يرجى انتظار موافقة المسؤول");
      setShowRegistration(false);
    } catch (error: any) {
      toast.error(error.message || "فشل التسجيل");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
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
        {showRegistration ? (
          <FarmerRegistration
            onRegister={handleRegister}
            onCancel={() => setShowRegistration(false)}
          />
        ) : (
          <LoginScreen
            onLogin={handleLogin}
            onRegisterClick={() => setShowRegistration(true)}
          />
        )}
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
      <Chat currentUser={currentUser} isAdmin={currentUser.role === "admin"} />
    </>
  );
}
