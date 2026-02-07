import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sprout, TrendingUp, Tractor, Coins } from "lucide-react";
import FarmerLocationView from "./FarmerLocationView";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface DashboardProps {
  userId: string;
  userRegion?: string;
  userLandArea?: string;
  userAddress?: string;
}

export default function Dashboard({ userId }: DashboardProps) {
  const [stats, setStats] = useState({
    totalCrops: 0,
    totalSales: 0,
    totalResources: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    // Load data from localStorage
    const crops = JSON.parse(localStorage.getItem(`crops_${userId}`) || "[]");
    const sales = JSON.parse(localStorage.getItem(`sales_${userId}`) || "[]");
    const lands = JSON.parse(localStorage.getItem(`lands_${userId}`) || "[]");
    const equipment = JSON.parse(localStorage.getItem(`equipment_${userId}`) || "[]");

    const totalSalesAmount = sales.reduce((sum: number, sale: any) => sum + (sale.totalPrice || 0), 0);

    setStats({
      totalCrops: crops.length,
      totalSales: sales.length,
      totalResources: lands.length + equipment.length,
      monthlyRevenue: totalSalesAmount,
    });
  }, [userId]);

  const cropData = [
    { name: "قمح", value: 35 },
    { name: "شعير", value: 25 },
    { name: "خضروات", value: 20 },
    { name: "فواكه", value: 20 },
  ];

  const salesData = [
    { month: "يناير", مبيعات: 45000 },
    { month: "فبراير", مبيعات: 52000 },
    { month: "مارس", مبيعات: 48000 },
    { month: "أبريل", مبيعات: 61000 },
    { month: "مايو", مبيعات: 55000 },
    { month: "يونيو", مبيعات: 67000 },
  ];

  const COLORS = ["#16a34a", "#84cc16", "#eab308", "#f97316"];

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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>المبيعات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
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
                  data={cropData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cropData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
              <Sprout className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm">تم إضافة محصول جديد</p>
                <p className="text-xs text-gray-500">منذ ساعتين</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm">تم تسجيل عملية بيع جديدة</p>
                <p className="text-xs text-gray-500">منذ 5 ساعات</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
              <Tractor className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm">تحديث معدات الفلاحة</p>
                <p className="text-xs text-gray-500">منذ يوم واحد</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farmer Location View */}
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