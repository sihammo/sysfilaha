import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, Sprout, TrendingUp, DollarSign, MapPin, Tractor } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import api from "../utils/api";
import { toast } from "sonner";

export default function AdminStatistics() {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalCrops: 0,
    totalRevenue: 0,
    totalLands: 0,
    totalArea: 0,
    totalEquipment: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const data = await api.admin.getStats();
      setStats(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ["#16a34a", "#84cc16", "#eab308", "#f97316", "#ef4444", "#8b5cf6"];

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">جاري تحميل الإحصائيات...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2 text-blue-800">الإحصائيات العامة</h2>
        <p className="text-gray-600">نظرة شاملة على جميع الفلاحين والنشاطات</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">إجمالي الفلاحين</CardTitle>
            <Users className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-blue-700">{stats.totalFarmers}</div>
            <p className="text-xs text-gray-500 mt-1">فلاح مسجل</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">إجمالي المحاصيل</CardTitle>
            <Sprout className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-700">{stats.totalCrops}</div>
            <p className="text-xs text-gray-500 mt-1">محصول نشط</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">إجمالي الإيرادات</CardTitle>
            <DollarSign className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-yellow-700">{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">دينار جزائري</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">إجمالي الأراضي</CardTitle>
            <MapPin className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-orange-700">{stats.totalLands}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.totalArea.toFixed(1)} هكتار</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">إجمالي المعدات</CardTitle>
            <Tractor className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-purple-700">{stats.totalEquipment}</div>
            <p className="text-xs text-gray-500 mt-1">معدة مسجلة</p>
          </CardContent>
        </Card>

        <Card className="border-teal-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">متوسط المحاصيل لكل فلاح</CardTitle>
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-teal-700">
              {stats.totalFarmers > 0 ? (stats.totalCrops / stats.totalFarmers).toFixed(1) : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">محصول/فلاح</p>
          </CardContent>
        </Card>
      </div>

      {stats.totalFarmers === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-20 h-20 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">لا توجد بيانات للعرض</p>
            <p className="text-gray-400 text-sm">ابدأ بتسجيل الفلاحين لرؤية الإحصائيات</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
