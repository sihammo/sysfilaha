import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, Sprout, TrendingUp, DollarSign, MapPin, Tractor } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

export default function AdminStatistics() {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalCrops: 0,
    totalRevenue: 0,
    totalLands: 0,
    totalArea: 0,
    totalEquipment: 0,
  });
  const [cropsByType, setCropsByType] = useState<any[]>([]);
  const [farmerPerformance, setFarmerPerformance] = useState<any[]>([]);
  const [revenueByFarmer, setRevenueByFarmer] = useState<any[]>([]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const farmers = users.filter((u: any) => u.role === "farmer");

    let totalCrops = 0;
    let totalRevenue = 0;
    let totalLands = 0;
    let totalArea = 0;
    let totalEquipment = 0;
    const cropTypesMap: any = {};
    const farmerData: any[] = [];
    const revenueData: any[] = [];

    farmers.forEach((farmer: any) => {
      const crops = JSON.parse(localStorage.getItem(`crops_${farmer.id}`) || "[]");
      const sales = JSON.parse(localStorage.getItem(`sales_${farmer.id}`) || "[]");
      const lands = JSON.parse(localStorage.getItem(`lands_${farmer.id}`) || "[]");
      const equipment = JSON.parse(localStorage.getItem(`equipment_${farmer.id}`) || "[]");

      totalCrops += crops.length;
      totalLands += lands.length;
      totalEquipment += equipment.length;

      const farmerRevenue = sales.reduce((sum: number, sale: any) => sum + sale.totalPrice, 0);
      totalRevenue += farmerRevenue;

      const farmerArea = lands.reduce((sum: number, land: any) => sum + land.area, 0);
      totalArea += farmerArea;

      // Count crops by type
      crops.forEach((crop: any) => {
        cropTypesMap[crop.type] = (cropTypesMap[crop.type] || 0) + 1;
      });

      // Farmer performance data
      farmerData.push({
        name: `${farmer.firstName} ${farmer.lastName}`,
        محاصيل: crops.length,
        مبيعات: sales.length,
        أراضي: lands.length,
      });

      // Revenue by farmer
      if (farmerRevenue > 0) {
        revenueData.push({
          name: `${farmer.firstName} ${farmer.lastName}`,
          إيرادات: farmerRevenue,
        });
      }
    });

    setStats({
      totalFarmers: farmers.length,
      totalCrops,
      totalRevenue,
      totalLands,
      totalArea,
      totalEquipment,
    });

    // Convert crop types to array
    const cropTypesArray = Object.entries(cropTypesMap).map(([type, count]) => ({
      name: type,
      value: count,
    }));
    setCropsByType(cropTypesArray);
    setFarmerPerformance(farmerData);
    setRevenueByFarmer(revenueData);
  };

  const COLORS = ["#16a34a", "#84cc16", "#eab308", "#f97316", "#ef4444", "#8b5cf6"];

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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crops by Type */}
        {cropsByType.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>المحاصيل حسب النوع</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cropsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} (${entry.value})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cropsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Revenue by Farmer */}
        {revenueByFarmer.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات حسب الفلاح</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByFarmer}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="إيرادات" fill="#eab308" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Farmer Performance */}
        {farmerPerformance.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>أداء الفلاحين</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={farmerPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="محاصيل" fill="#16a34a" />
                  <Bar dataKey="مبيعات" fill="#3b82f6" />
                  <Bar dataKey="أراضي" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* No Data Message */}
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
