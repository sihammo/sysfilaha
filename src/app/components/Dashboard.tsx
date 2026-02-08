import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sprout, TrendingUp, Tractor, Coins } from "lucide-react";
import FarmerLocationView from "./FarmerLocationView";
import api from "../utils/api";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface DashboardProps {
  userId: string;
  userRegion?: string;
  userLandArea?: string;
  userAddress?: string;
}

export default function Dashboard({ userId, userRegion, userLandArea, userAddress }: DashboardProps) {
  const [stats, setStats] = useState({
    totalCrops: 0,
    totalSales: 0,
    totalResources: 0,
    monthlyRevenue: 0,
    cropData: [] as { name: string, value: number }[],
    salesData: [] as { month: string, مبيعات: number }[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await api.farmer.getStats();
      setStats(data);
    } catch (error: any) {
      toast.error("فشل في تحميل الإحصائيات");
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ["#16a34a", "#84cc16", "#eab308", "#f97316", "#ef4444", "#8b5cf6"];

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2 text-green-800">لوحة التحكم</h2>
        <p className="text-gray-600">نظرة عامة على نشاطك الفلاحي</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">المحاصيل المسجلة</CardTitle>
            <Sprout className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-700">{stats.totalCrops}</div>
            <p className="text-xs text-gray-500 mt-1">محصول نشط</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">إجمالي المبيعات</CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-blue-700">{stats.totalSales}</div>
            <p className="text-xs text-gray-500 mt-1">عملية بيع</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">الموارد</CardTitle>
            <Tractor className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-orange-700">{stats.totalResources}</div>
            <p className="text-xs text-gray-500 mt-1">مورد مسجل</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-600">الإيرادات</CardTitle>
            <Coins className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-yellow-700">{stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">دينار جزائري</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>المبيعات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="مبيعات" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع المحاصيل</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.cropData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.cropData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {userRegion && (
        <FarmerLocationView
          region={userRegion}
          landArea={userLandArea || "غير محدد"}
          address={userAddress || "لم يتم تحديد العنوان"}
        />
      )}
    </div>
  );
}
