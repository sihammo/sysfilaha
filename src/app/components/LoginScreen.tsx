import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Sprout, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface LoginScreenProps {
  onLogin: (user: any) => void;
  onRegisterClick: () => void;
}

export default function LoginScreen({ onLogin, onRegisterClick }: LoginScreenProps) {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Try to login as admin first (if identifier is "admin" or looks like username)
    const admin = users.find(
      (u: any) =>
        u.role === "admin" &&
        u.password === formData.password &&
        (formData.identifier === "admin" || formData.identifier === u.firstName)
    );

    if (admin) {
      onLogin(admin);
      toast.success(`مرحباً ${admin.firstName} ${admin.lastName}`);
      return;
    }

    // Try to login as farmer (if identifier looks like national ID)
    const farmer = users.find(
      (u: any) =>
        u.role === "farmer" &&
        u.approved &&
        u.nationalId === formData.identifier &&
        u.password === formData.password
    );

    if (farmer) {
      onLogin(farmer);
      toast.success(`مرحباً ${farmer.firstName} ${farmer.lastName}`);
      return;
    }

    // Check if farmer exists but not approved
    const pendingFarmer = users.find(
      (u: any) =>
        u.role === "farmer" &&
        !u.approved &&
        u.nationalId === formData.identifier
    );

    if (pendingFarmer) {
      toast.error("حسابك قيد المراجعة من قبل الإدارة. يرجى الانتظار");
      return;
    }

    // No match found
    toast.error("بيانات الدخول غير صحيحة");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-amber-50 to-green-100 p-4"
      dir="rtl"
    >
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <Sprout className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl">نظام إدارة الفلاحة</CardTitle>
            <p className="text-green-100 mt-2">للفلاحين والمزارعين في الجزائر</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-8">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="identifier" className="text-gray-700 font-semibold">
                رقم بطاقة التعريف الوطنية أو اسم المستخدم
              </Label>
              <Input
                id="identifier"
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                required
                placeholder="أدخل رقم البطاقة أو 'admin'"
                className="text-lg border-green-300 focus:ring-green-600"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-semibold">
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="أدخل كلمة المرور"
                className="text-lg border-green-300 focus:ring-green-600"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 text-lg rounded-lg flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              دخول
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">أو</span>
            </div>
          </div>

          {/* Registration Info */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-green-800 text-center">فلاح جديد؟</h3>
            <p className="text-sm text-gray-700 text-center">
              اطلب من الإدارة إضافة حسابك أو قدم طلب تسجيل جديد ليتم مراجعته
            </p>
            <Button
              type="button"
              onClick={onRegisterClick}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 text-lg rounded-lg flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              طلب تسجيل جديد
            </Button>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <p className="font-semibold mb-1">بيانات تجريبية:</p>
            <p>اسم المستخدم (إدارة): admin</p>
            <p>كلمة المرور: admin</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}